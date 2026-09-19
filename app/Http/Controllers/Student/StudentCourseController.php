<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CourseClass;
use App\Models\Lesson;
use App\Models\MaterialFeedback;
use App\Models\Question;
use App\Models\StudentExamAttempt;
use App\Models\StudentIncorrectQuestion;
use App\Models\StudentProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentCourseController extends Controller
{
    /**
     * Student dashboard displaying enrolled classes and progression.
     */
    public function dashboard(Request $request): Response
    {
        $user = $request->user();

        // All monastery classes with progression for this student
        $classes = CourseClass::with(['course.lessons', 'user', 'students'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($cls) use ($user) {
                $lessons = $cls->course?->lessons ?? collect();
                $progressRecords = StudentProgress::where('user_id', $user->id)
                    ->where('class_id', $cls->id)
                    ->get()
                    ->keyBy('lesson_id');

                $completedLessonsCount = 0;
                $lessonsData = $lessons->map(function ($l) use ($progressRecords, &$completedLessonsCount) {
                    $p = $progressRecords->get($l->id);
                    $isCompleted = (bool) ($p?->is_completed ?? false);
                    if ($isCompleted) {
                        $completedLessonsCount++;
                    }

                    return [
                        'id' => $l->id,
                        'title' => $l->title,
                        'order' => $l->order,
                        'reading_completed' => (bool) ($p?->reading_completed ?? false),
                        'video_completed' => (bool) ($p?->video_completed ?? false),
                        'practice_count' => (int) ($p?->practice_count ?? 0),
                        'practice_completed' => (bool) ($p?->practice_completed ?? false),
                        'exam_completed' => (bool) ($p?->exam_completed ?? false),
                        'is_completed' => $isCompleted,
                    ];
                });

                $totalLessons = $lessons->count();
                $percentage = $totalLessons > 0 ? round(($completedLessonsCount / $totalLessons) * 100) : 0;
                $studentPivot = $cls->students->firstWhere('id', $user->id)?->pivot;
                $enrollmentStatus = $studentPivot?->status ?? ($percentage === 100 && $totalLessons > 0 ? 'completed' : 'studying');

                return [
                    'id' => $cls->id,
                    'name' => $cls->name,
                    'course_title' => $cls->course?->title ?? '',
                    'category' => $cls->course?->category ?? '',
                    'instructor' => $cls->user ? [
                        'id' => $cls->user->id,
                        'name' => $cls->user->name,
                        'username' => $cls->user->username,
                    ] : null,
                    'is_locked' => (bool) $cls->is_locked,
                    'enrollment_status' => $enrollmentStatus,
                    'progress_percentage' => $percentage,
                    'completed_lessons' => $completedLessonsCount,
                    'total_lessons' => $totalLessons,
                    'lessons' => $lessonsData,
                ];
            });

        return Inertia::render('Student/Dashboard', [
            'enrolledClasses' => $classes,
            'upcomingClasses' => [],
            'user' => [
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Show lesson player with strictly sequential 5-step flow.
     */
    public function showLesson(Request $request, int $classId, int $lessonId): Response|RedirectResponse
    {
        $user = $request->user();

        $class = CourseClass::with('course')->findOrFail($classId);

        // Auto-enroll student into this class if not already enrolled
        if (! $user->enrolledClasses()->where('classes.id', $classId)->exists()) {
            $user->enrolledClasses()->attach($classId, [
                'enrolled_at' => now(),
                'status' => 'enrolled',
            ]);
        }

        // Check if class is locked
        if ($class->is_locked) {
            return redirect()->route('student.dashboard')->with('error', 'This class has been locked by the instructor.');
        }

        $lesson = Lesson::where('course_id', $class->course_id)->findOrFail($lessonId);

        // Retrieve or initialize student progress
        $progress = StudentProgress::firstOrCreate(
            ['user_id' => $user->id, 'class_id' => $classId, 'lesson_id' => $lessonId],
            [
                'reading_completed' => false,
                'video_completed' => false,
                'practice_count' => 0,
                'practice_completed' => false,
                'exam_completed' => false,
                'is_completed' => false,
            ]
        );

        // All questions for this lesson/course
        $questions = Question::where('course_id', $class->course_id)
            ->where(function ($q) use ($lessonId) {
                $q->where('lesson_id', $lessonId)->orWhereNull('lesson_id');
            })
            ->get();

        // Shuffled practice questions (omit correct_option from initial payload so student can't cheat)
        $shuffledQuestions = $questions->shuffle()->values()->map(fn($q) => [
            'id' => $q->id,
            'question_text' => $q->question_text,
            'option_a' => $q->option_a,
            'option_b' => $q->option_b,
            'option_c' => $q->option_c,
            'option_d' => $q->option_d,
        ]);

        // Unresolved incorrect questions for step 5
        $unresolvedIncorrect = StudentIncorrectQuestion::where('user_id', $user->id)
            ->where('class_id', $classId)
            ->where('lesson_id', $lessonId)
            ->where('is_resolved', false)
            ->with('question')
            ->get()
            ->map(fn($iq) => [
                'id' => $iq->id,
                'question_id' => $iq->question_id,
                'last_chosen_option' => $iq->last_chosen_option,
                'question_text' => $iq->question->question_text,
                'option_a' => $iq->question->option_a,
                'option_b' => $iq->question->option_b,
                'option_c' => $iq->question->option_c,
                'option_d' => $iq->question->option_d,
            ]);

        // Prior exam attempt if any
        $latestExamAttempt = StudentExamAttempt::where('user_id', $user->id)
            ->where('class_id', $classId)
            ->where('lesson_id', $lessonId)
            ->where('attempt_type', 'exam')
            ->latest()
            ->first();

        // Feedbacks submitted by this student on this lesson
        $userFeedbacks = MaterialFeedback::where('user_id', $user->id)
            ->where('lesson_id', $lessonId)
            ->orderBy('created_at', 'desc')
            ->get();

        // Sibling lessons for navigation
        $allLessons = Lesson::where('course_id', $class->course_id)->orderBy('order')->get(['id', 'title', 'order']);

        return Inertia::render('Student/LessonPlayer', [
            'classItem' => [
                'id' => $class->id,
                'name' => $class->name,
                'course' => [
                    'id' => $class->course->id,
                    'title' => $class->course->title,
                    'category' => $class->course->category,
                ],
            ],
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'summary' => $lesson->summary,
                'reading_content' => $lesson->reading_content,
                'reading_file_url' => $lesson->reading_file_url,
                'document_urls' => $lesson->document_urls ?: (!empty($lesson->reading_file_url) ? [['title' => 'Tài liệu / Document', 'url' => $lesson->reading_file_url]] : []),
                'video_url' => $lesson->video_url,
                'video_urls' => $lesson->video_urls ?: (!empty($lesson->video_url) ? [['title' => 'Video bài giảng / Lecture Video', 'url' => $lesson->video_url]] : []),
                'order' => $lesson->order,
            ],
            'allLessons' => $allLessons,
            'progress' => [
                'reading_completed' => (bool) $progress->reading_completed,
                'reading_completed_at' => $progress->reading_completed_at?->format('Y-m-d H:i'),
                'video_completed' => (bool) $progress->video_completed,
                'video_completed_at' => $progress->video_completed_at?->format('Y-m-d H:i'),
                'practice_count' => (int) $progress->practice_count,
                'practice_completed' => (bool) $progress->practice_completed,
                'practice_completed_at' => $progress->practice_completed_at?->format('Y-m-d H:i'),
                'exam_completed' => (bool) $progress->exam_completed,
                'exam_completed_at' => $progress->exam_completed_at?->format('Y-m-d H:i'),
                'exam_score' => $progress->exam_score,
                'is_completed' => (bool) $progress->is_completed,
            ],
            'questions' => $shuffledQuestions,
            'unresolvedIncorrect' => $unresolvedIncorrect,
            'latestExamAttempt' => $latestExamAttempt,
            'userFeedbacks' => $userFeedbacks,
        ]);
    }

    /**
     * Step 1: Complete Self-Study Reading Material.
     */
    public function completeReading(Request $request, int $classId, int $lessonId): RedirectResponse
    {
        $user = $request->user();

        $progress = StudentProgress::firstOrCreate(
            ['user_id' => $user->id, 'class_id' => $classId, 'lesson_id' => $lessonId]
        );

        $progress->reading_completed = true;
        $progress->reading_completed_at = now();
        $progress->save();

        return back()->with('success', 'Self-study reading marked as completed. Video lecture unlocked!');
    }

    /**
     * Step 2: Complete Video Lecture Clip.
     */
    public function completeVideo(Request $request, int $classId, int $lessonId): RedirectResponse
    {
        $user = $request->user();

        $progress = StudentProgress::firstOrCreate(
            ['user_id' => $user->id, 'class_id' => $classId, 'lesson_id' => $lessonId]
        );

        if (! $progress->reading_completed) {
            return back()->with('error', 'You must complete the self-study reading material first.');
        }

        $progress->video_completed = true;
        $progress->video_completed_at = now();
        $progress->save();

        return back()->with('success', 'Lecture video completed. Practice review session unlocked!');
    }

    /**
     * Submit feedback/error report for reading material.
     */
    public function submitFeedback(Request $request, int $classId, int $lessonId): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'content' => 'required|string|min:5|max:2000',
        ]);

        MaterialFeedback::create([
            'lesson_id' => $lessonId,
            'user_id' => $user->id,
            'content' => $validated['content'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Feedback submitted to the monastery instructor. Thank you!');
    }

    /**
     * Step 3: Check single practice question answer (instant feedback with explanation).
     */
    public function checkPracticeAnswer(Request $request, int $classId, int $lessonId): JsonResponse
    {
        $validated = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'chosen_option' => 'required|in:A,B,C,D',
        ]);

        $question = Question::findOrFail($validated['question_id']);
        $isCorrect = ($question->correct_option === $validated['chosen_option']);

        return response()->json([
            'question_id' => $question->id,
            'is_correct' => $isCorrect,
            'correct_option' => $question->correct_option,
            'chosen_option' => $validated['chosen_option'],
            'explanation' => $question->explanation,
        ]);
    }

    /**
     * Step 3: Record a completed practice repetition (increment up to 10).
     */
    public function recordPracticeAttempt(Request $request, int $classId, int $lessonId): RedirectResponse
    {
        $user = $request->user();

        $progress = StudentProgress::firstOrCreate(
            ['user_id' => $user->id, 'class_id' => $classId, 'lesson_id' => $lessonId]
        );

        if (! $progress->video_completed) {
            return back()->with('error', 'You must watch the lecture video before doing practice reviews.');
        }

        $newCount = min(10, $progress->practice_count + 1);
        $progress->practice_count = $newCount;

        if ($newCount >= 10) {
            $progress->practice_completed = true;
            $progress->practice_completed_at = now();
        }

        $progress->save();

        $msg = $newCount >= 10
            ? 'Congratulations! You have completed 10 review sessions. Final Exam is now unlocked!'
            : "Review session completed ({$newCount}/10). Keep practicing to reach 10 sessions!";

        return back()->with('success', $msg);
    }

    /**
     * Step 4: Submit Final Examination.
     * Evaluates answers, displays summary, records incorrect answers for Step 5.
     */
    public function submitExam(Request $request, int $classId, int $lessonId): RedirectResponse
    {
        $user = $request->user();

        $progress = StudentProgress::firstOrCreate(
            ['user_id' => $user->id, 'class_id' => $classId, 'lesson_id' => $lessonId]
        );

        if (! $progress->practice_completed || $progress->practice_count < 10) {
            return back()->with('error', 'You must complete 10 practice review sessions before taking the exam.');
        }

        $answers = $request->input('answers', []); // [question_id => chosen_option]

        $class = CourseClass::findOrFail($classId);
        $questions = Question::where('course_id', $class->course_id)
            ->where(function ($q) use ($lessonId) {
                $q->where('lesson_id', $lessonId)->orWhereNull('lesson_id');
            })
            ->get();

        $totalCount = $questions->count();
        $correctCount = 0;
        $incorrectCount = 0;
        $resultsSummary = [];

        foreach ($questions as $q) {
            $chosen = $answers[$q->id] ?? null;
            $isCorrect = ($chosen !== null && $chosen === $q->correct_option);

            if ($isCorrect) {
                $correctCount++;
                // If previously marked incorrect, mark resolved
                StudentIncorrectQuestion::where('user_id', $user->id)
                    ->where('class_id', $classId)
                    ->where('lesson_id', $lessonId)
                    ->where('question_id', $q->id)
                    ->update(['is_resolved' => true, 'resolved_at' => now()]);
            } else {
                $incorrectCount++;
                // Record into incorrect questions log for Step 5
                StudentIncorrectQuestion::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'class_id' => $classId,
                        'lesson_id' => $lessonId,
                        'question_id' => $q->id,
                    ],
                    [
                        'last_chosen_option' => $chosen,
                        'is_resolved' => false,
                        'resolved_at' => null,
                    ]
                );
            }

            $resultsSummary[$q->id] = [
                'chosen' => $chosen,
                'correct' => $q->correct_option,
                'is_correct' => $isCorrect,
                'explanation' => $q->explanation,
            ];
        }

        $score = $totalCount > 0 ? round(($correctCount / $totalCount) * 100, 1) : 0;
        $reviewNeededCount = $incorrectCount;

        // Record Exam Attempt
        StudentExamAttempt::create([
            'user_id' => $user->id,
            'class_id' => $classId,
            'lesson_id' => $lessonId,
            'attempt_type' => 'exam',
            'total_questions' => $totalCount,
            'correct_count' => $correctCount,
            'incorrect_count' => $incorrectCount,
            'review_needed_count' => $reviewNeededCount,
            'score' => $score,
            'answers_summary' => $resultsSummary,
        ]);

        $progress->exam_completed = true;
        $progress->exam_completed_at = now();
        $progress->exam_score = $score;

        // Check if there are no incorrect questions remaining
        $unresolvedCount = StudentIncorrectQuestion::where('user_id', $user->id)
            ->where('class_id', $classId)
            ->where('lesson_id', $lessonId)
            ->where('is_resolved', false)
            ->count();

        if ($unresolvedCount === 0) {
            $progress->is_completed = true;
            $progress->completed_at = now();
        }

        $progress->save();

        // Check if all lessons in class are completed to complete the entire class for this student
        $allLessonsCount = Lesson::where('course_id', $class->course_id)->count();
        $completedLessonsCount = StudentProgress::where('user_id', $user->id)
            ->where('class_id', $classId)
            ->where('is_completed', true)
            ->count();

        if ($allLessonsCount > 0 && $completedLessonsCount >= $allLessonsCount) {
            $user->enrolledClasses()->updateExistingPivot($classId, [
                'status' => 'completed',
                'completed_at' => now(),
                'final_grade' => $score,
            ]);
        }

        return back()->with('success', "Exam completed: {$correctCount} Correct, {$incorrectCount} Incorrect, {$reviewNeededCount} Need Review.");
    }

    /**
     * Step 5: Retest single incorrect question until 0 wrong remain.
     */
    public function retryIncorrectQuestion(Request $request, int $classId, int $lessonId): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'chosen_option' => 'required|in:A,B,C,D',
        ]);

        $question = Question::findOrFail($validated['question_id']);
        $isCorrect = ($question->correct_option === $validated['chosen_option']);

        $incorrectRecord = StudentIncorrectQuestion::where('user_id', $user->id)
            ->where('class_id', $classId)
            ->where('lesson_id', $lessonId)
            ->where('question_id', $question->id)
            ->first();

        if ($isCorrect) {
            if ($incorrectRecord) {
                $incorrectRecord->is_resolved = true;
                $incorrectRecord->resolved_at = now();
                $incorrectRecord->save();
            }

            // Check if all incorrect questions for this lesson are now resolved
            $unresolvedCount = StudentIncorrectQuestion::where('user_id', $user->id)
                ->where('class_id', $classId)
                ->where('lesson_id', $lessonId)
                ->where('is_resolved', false)
                ->count();

            if ($unresolvedCount === 0) {
                $progress = StudentProgress::where('user_id', $user->id)
                    ->where('class_id', $classId)
                    ->where('lesson_id', $lessonId)
                    ->first();

                if ($progress && $progress->exam_completed) {
                    $progress->is_completed = true;
                    $progress->completed_at = now();
                    $progress->save();
                }

                // Check class completion
                $class = CourseClass::findOrFail($classId);
                $allLessonsCount = Lesson::where('course_id', $class->course_id)->count();
                $completedLessonsCount = StudentProgress::where('user_id', $user->id)
                    ->where('class_id', $classId)
                    ->where('is_completed', true)
                    ->count();

                if ($allLessonsCount > 0 && $completedLessonsCount >= $allLessonsCount) {
                    $user->enrolledClasses()->updateExistingPivot($classId, [
                        'status' => 'completed',
                        'completed_at' => now(),
                    ]);
                }
            }

            return response()->json([
                'is_correct' => true,
                'explanation' => $question->explanation,
                'unresolved_remaining' => $unresolvedCount ?? 0,
                'all_cleared' => ($unresolvedCount ?? 0) === 0,
                'message' => ($unresolvedCount ?? 0) === 0 ? 'All incorrect questions resolved! Subject program completed.' : 'Correct! Moving to next question.',
            ]);
        }

        if ($incorrectRecord) {
            $incorrectRecord->last_chosen_option = $validated['chosen_option'];
            $incorrectRecord->save();
        }

        return response()->json([
            'is_correct' => false,
            'explanation' => $question->explanation,
            'message' => 'Still incorrect. Review the explanation and try again.',
        ]);
    }
}
