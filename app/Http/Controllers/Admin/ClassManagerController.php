<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseClass;
use App\Models\Lesson;
use App\Models\MaterialFeedback;
use App\Models\Question;
use App\Models\StudentProgress;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassManagerController extends Controller
{
    /**
     * Dashboard overview with statistics and class tabs.
     */
    public function index(Request $request): Response
    {
        $statusFilter = $request->query('status', 'all'); // 'all', 'active', 'completed', 'upcoming'

        $classesQuery = CourseClass::with(['course', 'students'])
            ->withCount('students');

        if (in_array($statusFilter, ['active', 'completed', 'upcoming'])) {
            $classesQuery->where('status', $statusFilter);
        }

        $classes = $classesQuery->orderBy('start_date', 'desc')->get()->map(function ($cls) {
            // Calculate completion stats
            $totalStudents = $cls->students_count;
            $completedStudents = $cls->students->filter(fn($s) => $s->pivot->status === 'completed')->count();
            
            // Calculate avg progress across enrolled students
            $lessonsCount = Lesson::where('course_id', $cls->course_id)->count();
            $progressCount = StudentProgress::where('class_id', $cls->id)->where('is_completed', true)->count();
            $expectedTotal = ($totalStudents * max(1, $lessonsCount));
            $completionRate = $expectedTotal > 0 ? round(($progressCount / $expectedTotal) * 100) : 0;

            return [
                'id' => $cls->id,
                'name' => $cls->name,
                'code' => $cls->code,
                'course' => [
                    'id' => $cls->course->id,
                    'title' => $cls->course->title,
                    'category' => $cls->course->category,
                ],
                'duration_months' => $cls->duration_months,
                'start_date' => $cls->start_date?->format('Y-m-d'),
                'end_date' => $cls->end_date?->format('Y-m-d'),
                'status' => $cls->status,
                'is_locked' => $cls->is_locked,
                'students_count' => $totalStudents,
                'completed_count' => $completedStudents,
                'completion_rate' => $completionRate,
                'registered_students' => $cls->students->map(fn($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'cccd' => $s->cccd,
                    'email' => $s->email,
                    'status' => $s->pivot->status,
                ]),
            ];
        });

        // Statistics
        $stats = [
            'total_classes' => CourseClass::count(),
            'active_classes' => CourseClass::where('status', 'active')->count(),
            'completed_classes' => CourseClass::where('status', 'completed')->count(),
            'upcoming_classes' => CourseClass::where('status', 'upcoming')->count(),
            'total_students' => User::where('role', 'student')->count(),
            'pending_feedbacks' => MaterialFeedback::where('status', 'pending')->count(),
            'total_questions' => Question::count(),
        ];

        $courses = Course::select('id', 'title', 'category')->get();

        return Inertia::render('Admin/Dashboard', [
            'classes' => $classes,
            'stats' => $stats,
            'courses' => $courses,
            'currentFilter' => $statusFilter,
        ]);
    }

    /**
     * Show detailed class with student progress and roster.
     */
    public function show(int $id): Response
    {
        $class = CourseClass::with(['course.lessons.questions', 'students'])->findOrFail($id);

        $lessons = $class->course->lessons;

        // Map enrolled students with granular progress metrics
        $studentsProgress = $class->students->map(function ($student) use ($class, $lessons) {
            $studentProgressRecords = StudentProgress::where('class_id', $class->id)
                ->where('user_id', $student->id)
                ->get()
                ->keyBy('lesson_id');

            $lessonProgressList = $lessons->map(function ($lesson) use ($studentProgressRecords) {
                $record = $studentProgressRecords->get($lesson->id);
                return [
                    'lesson_id' => $lesson->id,
                    'title' => $lesson->title,
                    'reading_completed' => (bool) ($record?->reading_completed ?? false),
                    'video_completed' => (bool) ($record?->video_completed ?? false),
                    'practice_count' => (int) ($record?->practice_count ?? 0),
                    'practice_completed' => (bool) ($record?->practice_completed ?? false),
                    'exam_completed' => (bool) ($record?->exam_completed ?? false),
                    'exam_score' => $record?->exam_score,
                    'is_completed' => (bool) ($record?->is_completed ?? false),
                ];
            });

            $completedLessonsCount = $lessonProgressList->where('is_completed', true)->count();
            $incompleteLessons = $lessons->count() - $completedLessonsCount;

            return [
                'id' => $student->id,
                'name' => $student->name,
                'cccd' => $student->cccd,
                'email' => $student->email,
                'phone' => $student->phone,
                'enrollment_status' => $student->pivot->status,
                'final_grade' => $student->pivot->final_grade,
                'completed_at' => !empty($student->pivot->completed_at) ? Carbon::parse($student->pivot->completed_at)->format('Y-m-d') : null,
                'progress_percentage' => $lessons->count() > 0 ? round(($completedLessonsCount / $lessons->count()) * 100) : 0,
                'completed_lessons_count' => $completedLessonsCount,
                'incomplete_lessons_count' => $incompleteLessons,
                'lessons_progress' => $lessonProgressList,
            ];
        });

        // Available students that can be added to this class
        $enrolledIds = $class->students->pluck('id')->toArray();
        $availableStudents = User::where('role', 'student')
            ->whereNotIn('id', $enrolledIds)
            ->select('id', 'name', 'cccd', 'email')
            ->get();

        return Inertia::render('Admin/Classes/Show', [
            'classItem' => [
                'id' => $class->id,
                'name' => $class->name,
                'code' => $class->code,
                'description' => $class->description,
                'duration_months' => $class->duration_months,
                'start_date' => $class->start_date?->format('Y-m-d'),
                'end_date' => $class->end_date?->format('Y-m-d'),
                'status' => $class->status,
                'is_locked' => $class->is_locked,
                'course' => [
                    'id' => $class->course->id,
                    'title' => $class->course->title,
                    'category' => $class->course->category,
                ],
                'lessons' => $lessons->map(fn($l) => [
                    'id' => $l->id,
                    'title' => $l->title,
                    'order' => $l->order,
                    'questions_count' => $l->questions->count(),
                ]),
            ],
            'students' => $studentsProgress,
            'availableStudents' => $availableStudents,
        ]);
    }

    /**
     * Create a new class.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:classes,code',
            'duration_months' => 'required|integer|min:1|max:24',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:upcoming,active,completed',
            'description' => 'nullable|string',
        ]);

        CourseClass::create($validated);

        return back()->with('success', 'Class created successfully.');
    }

    /**
     * Update class information.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $class = CourseClass::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'duration_months' => 'required|integer|min:1|max:24',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'required|in:upcoming,active,completed',
            'description' => 'nullable|string',
        ]);

        $class->update($validated);

        return back()->with('success', 'Class updated successfully.');
    }

    /**
     * Lock or unlock a class (e.g. after 3-month course period).
     */
    public function toggleLock(int $id): RedirectResponse
    {
        $class = CourseClass::findOrFail($id);
        $class->is_locked = ! $class->is_locked;
        $class->save();

        $statusMessage = $class->is_locked ? 'Class has been locked.' : 'Class has been unlocked.';
        return back()->with('success', $statusMessage);
    }

    /**
     * Add student to class roster.
     */
    public function addStudent(Request $request, int $id): RedirectResponse
    {
        $class = CourseClass::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $class->students()->syncWithoutDetaching([
            $validated['user_id'] => [
                'enrolled_at' => now(),
                'status' => 'enrolled',
            ],
        ]);

        return back()->with('success', 'Student enrolled into class successfully.');
    }

    /**
     * Remove student from class roster.
     */
    public function removeStudent(int $classId, int $userId): RedirectResponse
    {
        $class = CourseClass::findOrFail($classId);
        $class->students()->detach($userId);

        return back()->with('success', 'Student removed from class.');
    }

    /**
     * Delete / remove a class.
     */
    public function destroy(int $id): RedirectResponse
    {
        $class = CourseClass::findOrFail($id);
        $className = $class->name;
        $class->delete();

        return redirect()->route('admin.dashboard')->with('success', "Class '{$className}' has been removed successfully (Đã xóa lớp học thành công).");
    }
}
