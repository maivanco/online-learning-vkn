<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseClass;
use App\Models\Lesson;
use App\Models\MaterialFeedback;
use App\Models\Question;
use App\Models\Setting;
use App\Models\StudentExamAttempt;
use App\Models\StudentProgress;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
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
        $classes = CourseClass::with(['course', 'students', 'user'])
            ->withCount('students')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($cls) {
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
                    'course' => [
                        'id' => $cls->course->id,
                        'title' => $cls->course->title,
                        'category' => $cls->course->category,
                    ],
                    'user' => $cls->user ? [
                        'id' => $cls->user->id,
                        'name' => $cls->user->name,
                        'username' => $cls->user->username,
                    ] : null,
                    'is_locked' => $cls->is_locked,
                    'students_count' => $totalStudents,
                    'completed_count' => $completedStudents,
                    'completion_rate' => $completionRate,
                    'registered_students' => $cls->students->map(fn($s) => [
                        'id' => $s->id,
                        'name' => $s->name,
                        'username' => $s->username,
                        'email' => $s->email,
                        'status' => $s->pivot->status,
                    ]),
                ];
            });

        // Statistics
        $stats = [
            'total_classes' => CourseClass::count(),
            'total_students' => User::where('role', 'student')->count(),
            'pending_feedbacks' => MaterialFeedback::where('status', 'pending')->count(),
            'total_questions' => Question::count(),
        ];

        $courses = Course::select('id', 'title', 'category')->get();

        return Inertia::render('Admin/Dashboard', [
            'classes' => $classes,
            'stats' => $stats,
            'courses' => $courses,
        ]);
    }

    /**
     * Show detailed class with student progress and roster.
     */
    public function show(int $id): Response
    {
        $class = CourseClass::with(['course.lessons.questions', 'students', 'user'])->findOrFail($id);

        $lessons = $class->course->lessons;

        // Preload exam attempts for all enrolled students in this class
        $examAttempts = StudentExamAttempt::where('class_id', $class->id)
            ->where('attempt_type', 'exam')
            ->get()
            ->keyBy('user_id');

        // Map enrolled students with granular progress metrics
        $studentsProgress = $class->students->map(function ($student) use ($class, $lessons, $examAttempts) {
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
            $examAttempt = $examAttempts->get($student->id);

            return [
                'id' => $student->id,
                'name' => $student->name,
                'username' => $student->username,
                'email' => $student->email,
                'phone' => $student->phone,
                'enrollment_status' => $student->pivot->status,
                'final_grade' => $student->pivot->final_grade ?? $examAttempt?->score,
                'completed_at' => !empty($student->pivot->completed_at) ? Carbon::parse($student->pivot->completed_at)->format('Y-m-d') : null,
                'progress_percentage' => $lessons->count() > 0 ? round(($completedLessonsCount / $lessons->count()) * 100) : 0,
                'completed_lessons_count' => $completedLessonsCount,
                'incomplete_lessons_count' => $incompleteLessons,
                'lessons_progress' => $lessonProgressList,
                'exam_attempt' => $examAttempt ? [
                    'id' => $examAttempt->id,
                    'score' => (float) $examAttempt->score,
                    'total_questions' => $examAttempt->total_questions,
                    'correct_count' => $examAttempt->correct_count,
                    'incorrect_count' => $examAttempt->incorrect_count,
                    'is_completed' => $examAttempt->total_questions > 0 && $examAttempt->answered_count >= $examAttempt->total_questions,
                ] : null,
            ];
        });

        $practiceTarget = Setting::getPracticeTarget();
        $maxClasses = Setting::getMaxClassesPerStudent();

        // Available students that can be added to this class
        $enrolledIds = $class->students->pluck('id')->toArray();
        $availableStudents = User::where('role', 'student')
            ->whereNotIn('id', $enrolledIds)
            ->withCount(['enrolledClasses' => function ($q) {
                $q->wherePivot('status', '!=', 'dropped');
            }])
            ->select('id', 'name', 'username', 'email')
            ->get();

        return Inertia::render('Admin/Classes/Show', [
            'classItem' => [
                'id' => $class->id,
                'name' => $class->name,
                'description' => $class->description,
                'is_locked' => $class->is_locked,
                'practice_target' => $practiceTarget,
                'max_classes_per_student' => $maxClasses,
                'user' => $class->user ? [
                    'id' => $class->user->id,
                    'name' => $class->user->name,
                    'username' => $class->user->username,
                ] : null,
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
            'description' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()?->id;

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

        $maxClasses = Setting::getMaxClassesPerStudent();
        if ($maxClasses > 0) {
            $student = User::findOrFail($validated['user_id']);
            $alreadyInThisClass = $class->students()->where('users.id', $student->id)->exists();
            if (! $alreadyInThisClass) {
                $activeCount = $student->enrolledClasses()
                    ->wherePivot('status', '!=', 'dropped')
                    ->count();

                if ($activeCount >= $maxClasses) {
                    return back()->with('error', __('settings.error_max_classes_reached', [
                        'name' => $student->name,
                        'max' => $maxClasses,
                    ]));
                }
            }
        }

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
     * Get detailed exam results (quizzes and essays) for a specific student in a class.
     */
    public function getStudentExamResult(Request $request, int $id, int $userId): JsonResponse
    {
        $class = CourseClass::with(['course.lessons'])->findOrFail($id);
        $student = User::where('role', 'student')->findOrFail($userId);

        $studentPivot = $class->students()->where('users.id', $userId)->first()?->pivot;

        // Retrieve all questions for the course
        $questions = Question::with('lesson:id,title')
            ->where('course_id', $class->course_id)
            ->orderBy('id')
            ->get();

        // Partition questions so quizzes are displayed first, then essays later
        $quizQuestions = $questions->filter(fn($q) => $q->isQuiz())->values();
        $essayQuestions = $questions->filter(fn($q) => $q->isEssay())->values();
        $orderedQuestions = $quizQuestions->concat($essayQuestions);

        $examAttempt = StudentExamAttempt::where('user_id', $userId)
            ->where('class_id', $id)
            ->where('attempt_type', 'exam')
            ->latest()
            ->first();

        $normSummary = $examAttempt?->getNormalizedSummary() ?? ['quiz' => [], 'essay' => []];
        $totalQuestions = $questions->count();
        $answeredCount = $examAttempt ? $examAttempt->answered_count : 0;

        $questionsPayload = $orderedQuestions->map(function ($q) use ($normSummary) {
            $typeKey = $q->isEssay() ? 'essay' : 'quiz';
            $answerRecord = $normSummary[$typeKey][$q->id] ?? null;
            $hasAnswered = ($answerRecord !== null);

            $score = null;
            if (isset($answerRecord['score'])) {
                $score = (float) $answerRecord['score'];
            } elseif (isset($answerRecord['teacher_score'])) {
                $score = (float) $answerRecord['teacher_score'];
            }

            return [
                'id' => $q->id,
                'lesson_id' => $q->lesson_id,
                'lesson_title' => $q->lesson?->title,
                'question_type' => $q->question_type ?? Question::TYPE_QUIZ,
                'question_text' => $q->question_text,
                'option_a' => $q->option_a,
                'option_b' => $q->option_b,
                'option_c' => $q->option_c,
                'option_d' => $q->option_d,
                'correct_option' => $q->correct_option,
                'explanation' => $q->explanation,
                'is_answered' => $hasAnswered,
                'chosen_option' => $answerRecord['chosen'] ?? null,
                'essay_answer' => $answerRecord['essay_answer'] ?? null,
                'is_correct' => isset($answerRecord['is_correct']) ? (bool) $answerRecord['is_correct'] : null,
                'score' => $score,
                'teacher_score' => $score,
                'teacher_feedback' => $answerRecord['teacher_feedback'] ?? null,
                'graded_at' => $answerRecord['graded_at'] ?? null,
                'graded_by' => $answerRecord['graded_by'] ?? null,
                'graded_by_name' => $answerRecord['graded_by_name'] ?? null,
            ];
        });

        $quizzesCorrect = $quizQuestions->filter(function ($q) use ($normSummary) {
            return isset($normSummary['quiz'][$q->id]) && !empty($normSummary['quiz'][$q->id]['is_correct']);
        })->count();

        $essaysGraded = $essayQuestions->filter(function ($q) use ($normSummary) {
            return isset($normSummary['essay'][$q->id]) && (isset($normSummary['essay'][$q->id]['score']) || isset($normSummary['essay'][$q->id]['teacher_score']));
        })->count();

        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'username' => $student->username,
                'email' => $student->email,
                'enrollment_status' => $studentPivot?->status ?? 'enrolled',
                'final_grade' => $studentPivot?->final_grade ?? $examAttempt?->score,
            ],
            'exam_attempt' => $examAttempt ? [
                'id' => $examAttempt->id,
                'score' => (float) $examAttempt->score,
                'total_questions' => $examAttempt->total_questions,
                'correct_count' => $examAttempt->correct_count,
                'incorrect_count' => $examAttempt->incorrect_count,
                'is_completed' => ($totalQuestions > 0 && $answeredCount >= $totalQuestions),
                'created_at' => $examAttempt->created_at?->format('Y-m-d H:i'),
                'updated_at' => $examAttempt->updated_at?->format('Y-m-d H:i'),
            ] : null,
            'questions' => $questionsPayload,
            'metrics' => [
                'total_questions' => $totalQuestions,
                'answered_count' => $answeredCount,
                'quiz_count' => $quizQuestions->count(),
                'essay_count' => $essayQuestions->count(),
                'quizzes_correct' => $quizzesCorrect,
                'essays_graded' => $essaysGraded,
                'essays_pending' => $essayQuestions->count() - $essaysGraded,
                'is_completed' => ($totalQuestions > 0 && $answeredCount >= $totalQuestions),
            ],
        ]);
    }

    /**
     * Grade a submitted essay question for a student and recalculate overall score.
     */
    public function gradeEssayQuestion(Request $request, int $id, int $userId): JsonResponse
    {
        $validated = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'score' => 'required|numeric|min:0|max:100',
            'feedback' => 'nullable|string',
        ]);

        $class = CourseClass::findOrFail($id);
        $student = User::where('role', 'student')->findOrFail($userId);
        $question = Question::where('course_id', $class->course_id)->findOrFail((int) $validated['question_id']);

        if (! $question->isEssay()) {
            return response()->json(['error' => 'Only essay questions can be graded manually by teacher.'], 422);
        }

        $allQuestions = Question::where('course_id', $class->course_id)->get();
        $totalQuestionsCount = $allQuestions->count();

        $examAttempt = StudentExamAttempt::firstOrCreate(
            ['user_id' => $userId, 'class_id' => $id, 'attempt_type' => 'exam'],
            [
                'course_id' => $class->course_id,
                'total_questions' => $totalQuestionsCount,
                'correct_count' => 0,
                'incorrect_count' => 0,
                'review_needed_count' => 0,
                'score' => 0,
                'answers_summary' => ['quiz' => [], 'essay' => []],
            ]
        );

        if (! $examAttempt->course_id) {
            $examAttempt->course_id = $class->course_id;
        }

        $summary = $examAttempt->getNormalizedSummary();
        $existing = $summary['essay'][$question->id] ?? [];
        $scoreVal = round((float) $validated['score'], 1);

        $summary['essay'][$question->id] = array_merge($existing, [
            'question_type' => Question::TYPE_ESSAY,
            'essay_answer' => $existing['essay_answer'] ?? '',
            'score' => $scoreVal,
            'teacher_score' => $scoreVal,
            'teacher_feedback' => $validated['feedback'] ?? null,
            'is_correct' => ($scoreVal >= 50.0),
            'graded_at' => now()->toDateTimeString(),
            'graded_by' => $request->user()?->id,
            'graded_by_name' => $request->user()?->name,
        ]);

        // Recalculate total score and counts
        $totalScoreSum = 0;
        $correctCount = 0;
        $incorrectCount = 0;

        foreach ($allQuestions as $q) {
            if ($q->isEssay()) {
                $ans = $summary['essay'][$q->id] ?? null;
                if ($ans && (isset($ans['score']) || isset($ans['teacher_score']))) {
                    $qScore = (float) ($ans['score'] ?? $ans['teacher_score']);
                    $totalScoreSum += $qScore;
                    if ($qScore >= 50.0) {
                        $correctCount++;
                    } else {
                        $incorrectCount++;
                    }
                } else {
                    $incorrectCount++;
                }
            } else {
                $ans = $summary['quiz'][$q->id] ?? null;
                if ($ans && isset($ans['is_correct']) && $ans['is_correct']) {
                    $totalScoreSum += 100;
                    $correctCount++;
                } else {
                    $incorrectCount++;
                }
            }
        }

        $finalScore = $totalQuestionsCount > 0 ? round($totalScoreSum / $totalQuestionsCount, 1) : 0;

        $examAttempt->course_id = $class->course_id;
        $examAttempt->total_questions = $totalQuestionsCount;
        $examAttempt->correct_count = $correctCount;
        $examAttempt->incorrect_count = $incorrectCount;
        $examAttempt->review_needed_count = $incorrectCount;
        $examAttempt->score = $finalScore;
        $examAttempt->answers_summary = $summary;
        $examAttempt->save();

        // Update student final_grade in class pivot
        $class->students()->updateExistingPivot($userId, [
            'final_grade' => $finalScore,
        ]);

        return response()->json([
            'message' => 'Essay score and feedback updated successfully.',
            'question_id' => $question->id,
            'score' => $scoreVal,
            'teacher_score' => $scoreVal,
            'teacher_feedback' => $validated['feedback'] ?? null,
            'is_correct' => ($scoreVal >= 50.0),
            'graded_at' => now()->toDateTimeString(),
            'graded_by_name' => $request->user()?->name,
            'overall_score' => $finalScore,
            'exam_attempt' => [
                'id' => $examAttempt->id,
                'score' => $finalScore,
                'correct_count' => $correctCount,
                'incorrect_count' => $incorrectCount,
                'total_questions' => $totalQuestionsCount,
            ],
        ]);
    }

    /**
     * Delete / remove a class.
     */
    public function destroy(int $id): RedirectResponse
    {
        $class = CourseClass::findOrFail($id);
        $className = $class->name;
        $class->delete();

        return redirect()->route('admin.dashboard')->with('success', "Class '{$className}' has been removed successfully.");
    }
}
