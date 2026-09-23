<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CourseClass;
use App\Models\Lesson;
use App\Models\MaterialFeedback;
use App\Models\Question;
use App\Models\StudentExamAttempt;
use App\Models\StudentProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentCourseController extends Controller
{
    /**
     * Student dashboard displaying enrolled classes, lesson progressions, and class final exam eligibility.
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
                        'is_completed' => $isCompleted,
                    ];
                });

                $totalLessons = $lessons->count();
                $percentage = $totalLessons > 0 ? round(($completedLessonsCount / $totalLessons) * 100) : 0;
                $isAllLessonsCompleted = ($totalLessons > 0 && $completedLessonsCount >= $totalLessons);

                // Class Final Exam Attempt
                $examAttempt = StudentExamAttempt::where('user_id', $user->id)
                    ->where('class_id', $cls->id)
                    ->where('attempt_type', 'exam')
                    ->latest()
                    ->first();

                $studentPivot = $cls->students->firstWhere('id', $user->id)?->pivot;
                $isGraduated = ($studentPivot?->status === 'completed' || ($examAttempt && $examAttempt->total_questions > 0 && count($examAttempt->answers_summary ?? []) >= $examAttempt->total_questions));

                $enrollmentStatus = $isGraduated
                    ? 'completed'
                    : ($isAllLessonsCompleted ? 'ready_for_exam' : 'studying');

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
                    'is_graduated' => $isGraduated,
                    'is_all_lessons_completed' => $isAllLessonsCompleted,
                    'progress_percentage' => $percentage,
                    'completed_lessons' => $completedLessonsCount,
                    'total_lessons' => $totalLessons,
                    'final_grade' => $studentPivot?->final_grade ?? $examAttempt?->score,
                    'exam_attempt' => $examAttempt ? [
                        'id' => $examAttempt->id,
                        'score' => $examAttempt->score,
                        'total_questions' => $examAttempt->total_questions,
                        'correct_count' => $examAttempt->correct_count,
                        'incorrect_count' => $examAttempt->incorrect_count,
                        'is_completed' => $examAttempt->total_questions > 0 && count($examAttempt->answers_summary ?? []) >= $examAttempt->total_questions,
                    ] : null,
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
     * Show lesson player with 3-step learning flow:
     * 1. Self-Study Reading -> 2. Video Lecture -> 3. 10x Practice Quizzes.
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

        // Retrieve or initialize student progress for this lesson
        $progress = StudentProgress::firstOrCreate(
            ['user_id' => $user->id, 'class_id' => $classId, 'lesson_id' => $lessonId],
            [
                'reading_completed' => false,
                'video_completed' => false,
                'practice_count' => 0,
                'practice_completed' => false,
                'is_completed' => false,
            ]
        );

        // All questions for this lesson/course practice
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

        // Feedbacks submitted by this student on this lesson
        $userFeedbacks = MaterialFeedback::where('user_id', $user->id)
            ->where('lesson_id', $lessonId)
            ->orderBy('created_at', 'desc')
            ->get();

        // Sibling lessons for navigation
        $allLessons = Lesson::where('course_id', $class->course_id)->orderBy('order')->get(['id', 'title', 'order']);

        // Check if all lessons in class are completed
        $completedLessonsCount = StudentProgress::where('user_id', $user->id)
            ->where('class_id', $classId)
            ->where('is_completed', true)
            ->count();
        $isAllLessonsCompleted = ($allLessons->count() > 0 && $completedLessonsCount >= $allLessons->count());

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
                'is_completed' => (bool) $progress->is_completed,
            ],
            'questions' => $shuffledQuestions,
            'userFeedbacks' => $userFeedbacks,
            'isAllLessonsCompleted' => $isAllLessonsCompleted,
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
     * Completing 10 practice repetitions completes the lesson.
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
            $progress->is_completed = true;
            $progress->completed_at = now();
        }

        $progress->save();

        $msg = $newCount >= 10
            ? 'Congratulations! You have completed 10 review sessions and successfully finished this lesson!'
            : "Review session completed ({$newCount}/10). Keep practicing to reach 10 sessions!";

        return back()->with('success', $msg);
    }

    /**
     * Show Class Final Exam.
     * Allowed only after the student has completed ALL lessons in this class.
     */
    public function showClassExam(Request $request, int $classId): Response|RedirectResponse
    {
        $user = $request->user();
        $class = CourseClass::with(['course.lessons', 'students'])->findOrFail($classId);

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

        $allLessons = $class->course?->lessons ?? collect();
        $totalLessons = $allLessons->count();

        $completedLessonsCount = StudentProgress::where('user_id', $user->id)
            ->where('class_id', $classId)
            ->where('is_completed', true)
            ->count();

        // Enforce prerequisite: All lessons must be completed
        if ($totalLessons === 0 || $completedLessonsCount < $totalLessons) {
            return redirect()->route('student.dashboard')->with(
                'error',
                "You must complete all {$totalLessons} lessons before taking the Class Final Exam ({$completedLessonsCount}/{$totalLessons} completed)."
            );
        }

        // All questions for the course
        $questions = Question::where('course_id', $class->course_id)->orderBy('id')->get();
        $totalQuestions = $questions->count();

        // Retrieve existing exam attempt if any
        $examAttempt = StudentExamAttempt::where('user_id', $user->id)
            ->where('class_id', $classId)
            ->where('attempt_type', 'exam')
            ->latest()
            ->first();

        $answersSummary = $examAttempt?->answers_summary ?? [];
        $answeredCount = count($answersSummary);
        $isCompleted = ($totalQuestions > 0 && $answeredCount >= $totalQuestions);

        // Questions payload with answered states locked
        $questionsPayload = $questions->map(function ($q) use ($answersSummary, $isCompleted) {
            $answerRecord = $answersSummary[$q->id] ?? null;
            $hasAnswered = ($answerRecord !== null);

            $payload = [
                'id' => $q->id,
                'question_type' => $q->question_type ?? Question::TYPE_QUIZ,
                'question_text' => $q->question_text,
                'option_a' => $q->option_a,
                'option_b' => $q->option_b,
                'option_c' => $q->option_c,
                'option_d' => $q->option_d,
                'is_answered' => $hasAnswered,
                'chosen_option' => $answerRecord['chosen'] ?? null,
                'essay_answer' => $answerRecord['essay_answer'] ?? null,
            ];

            // If question has been submitted or exam is completed, include correct option & explanation
            if ($hasAnswered || $isCompleted) {
                $payload['is_correct'] = (bool) ($answerRecord['is_correct'] ?? false);
                $payload['correct_option'] = $q->correct_option;
                $payload['explanation'] = $q->explanation;
            }

            return $payload;
        });

        $studentPivot = $class->students->firstWhere('id', $user->id)?->pivot;

        return Inertia::render('Student/ClassExam', [
            'classItem' => [
                'id' => $class->id,
                'name' => $class->name,
                'course' => [
                    'id' => $class->course->id,
                    'title' => $class->course->title,
                    'category' => $class->course->category,
                ],
            ],
            'questions' => $questionsPayload,
            'totalQuestions' => $totalQuestions,
            'answeredCount' => $answeredCount,
            'isCompleted' => $isCompleted,
            'examAttempt' => $examAttempt ? [
                'id' => $examAttempt->id,
                'score' => $examAttempt->score,
                'correct_count' => $examAttempt->correct_count,
                'incorrect_count' => $examAttempt->incorrect_count,
                'total_questions' => $examAttempt->total_questions,
            ] : null,
            'finalGrade' => $studentPivot?->final_grade ?? $examAttempt?->score,
        ]);
    }

    /**
     * Submit an answer for a single question (Quiz or Essay) in the Class Final Exam.
     * Once submitted, the answer for this question is permanently locked and cannot be changed.
     */
    public function submitClassExamQuestion(Request $request, int $classId): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'question_id' => 'required|exists:questions,id',
        ]);

        $class = CourseClass::with('course.lessons')->findOrFail($classId);

        // Verify all lessons completed
        $totalLessons = $class->course?->lessons?->count() ?? 0;
        $completedLessonsCount = StudentProgress::where('user_id', $user->id)
            ->where('class_id', $classId)
            ->where('is_completed', true)
            ->count();

        if ($totalLessons === 0 || $completedLessonsCount < $totalLessons) {
            return response()->json([
                'error' => 'All lessons must be completed before submitting exam questions.',
            ], 422);
        }

        $question = Question::where('course_id', $class->course_id)->findOrFail((int) $request->input('question_id'));
        $totalQuestions = Question::where('course_id', $class->course_id)->count();

        if ($question->isEssay()) {
            $validated = $request->validate([
                'question_id' => 'required|exists:questions,id',
                'essay_answer' => 'required|string|min:1',
            ]);
        } else {
            $validated = $request->validate([
                'question_id' => 'required|exists:questions,id',
                'chosen_option' => 'required|in:A,B,C,D',
            ]);
        }

        // Get or create active exam attempt
        $examAttempt = StudentExamAttempt::firstOrCreate(
            ['user_id' => $user->id, 'class_id' => $classId, 'attempt_type' => 'exam'],
            [
                'total_questions' => $totalQuestions,
                'correct_count' => 0,
                'incorrect_count' => 0,
                'review_needed_count' => 0,
                'score' => 0,
                'answers_summary' => [],
            ]
        );

        $summary = $examAttempt->answers_summary ?? [];

        // Check if already submitted (Permanent lock: cannot re-submit answer for a question)
        if (isset($summary[$question->id])) {
            return response()->json([
                'error' => 'This question has already been submitted and locked.',
                'question_id' => $question->id,
                'chosen_option' => $summary[$question->id]['chosen'] ?? null,
                'essay_answer' => $summary[$question->id]['essay_answer'] ?? null,
                'is_correct' => $summary[$question->id]['is_correct'] ?? false,
                'correct_option' => $question->correct_option,
                'explanation' => $question->explanation,
            ], 400);
        }

        if ($question->isEssay()) {
            $isCorrect = true;
            $summary[$question->id] = [
                'question_type' => Question::TYPE_ESSAY,
                'essay_answer' => $validated['essay_answer'],
                'is_correct' => $isCorrect,
                'explanation' => $question->explanation,
            ];
        } else {
            $isCorrect = ($question->correct_option === $validated['chosen_option']);
            $summary[$question->id] = [
                'question_type' => Question::TYPE_QUIZ,
                'chosen' => $validated['chosen_option'],
                'correct' => $question->correct_option,
                'is_correct' => $isCorrect,
                'explanation' => $question->explanation,
            ];
        }

        $answeredCount = count($summary);
        $correctCount = collect($summary)->where('is_correct', true)->count();
        $incorrectCount = collect($summary)->where('is_correct', false)->count();
        $score = $totalQuestions > 0 ? round(($correctCount / $totalQuestions) * 100, 1) : 0;
        $isExamCompleted = ($answeredCount >= $totalQuestions);

        $examAttempt->total_questions = $totalQuestions;
        $examAttempt->correct_count = $correctCount;
        $examAttempt->incorrect_count = $incorrectCount;
        $examAttempt->review_needed_count = $incorrectCount;
        $examAttempt->score = $score;
        $examAttempt->answers_summary = $summary;
        $examAttempt->save();

        // If all questions are answered, finalize graduation
        if ($isExamCompleted) {
            $user->enrolledClasses()->updateExistingPivot($classId, [
                'status' => 'completed',
                'completed_at' => now(),
                'final_grade' => $score,
            ]);
        }

        return response()->json([
            'question_id' => $question->id,
            'question_type' => $question->question_type ?? Question::TYPE_QUIZ,
            'chosen_option' => $validated['chosen_option'] ?? null,
            'essay_answer' => $validated['essay_answer'] ?? null,
            'is_correct' => $isCorrect,
            'correct_option' => $question->correct_option,
            'explanation' => $question->explanation,
            'answered_count' => $answeredCount,
            'total_questions' => $totalQuestions,
            'correct_count' => $correctCount,
            'incorrect_count' => $incorrectCount,
            'score' => $score,
            'is_exam_completed' => $isExamCompleted,
        ]);
    }

    /**
     * Submit multiple/all answers for the Class Final Exam at once.
     */
    public function submitClassExam(Request $request, int $classId): RedirectResponse
    {
        $user = $request->user();
        $class = CourseClass::with('course.lessons')->findOrFail($classId);

        // Verify all lessons completed
        $totalLessons = $class->course?->lessons?->count() ?? 0;
        $completedLessonsCount = StudentProgress::where('user_id', $user->id)
            ->where('class_id', $classId)
            ->where('is_completed', true)
            ->count();

        if ($totalLessons === 0 || $completedLessonsCount < $totalLessons) {
            return back()->with('error', 'You must complete all lessons before taking the final exam.');
        }

        $submittedAnswers = $request->input('answers', []); // [question_id => chosen_option or essay_answer]
        $questions = Question::where('course_id', $class->course_id)->get();
        $totalQuestions = $questions->count();

        $examAttempt = StudentExamAttempt::firstOrCreate(
            ['user_id' => $user->id, 'class_id' => $classId, 'attempt_type' => 'exam'],
            [
                'total_questions' => $totalQuestions,
                'correct_count' => 0,
                'incorrect_count' => 0,
                'review_needed_count' => 0,
                'score' => 0,
                'answers_summary' => [],
            ]
        );

        $summary = $examAttempt->answers_summary ?? [];

        foreach ($questions as $q) {
            // Only set if not already locked
            if (! isset($summary[$q->id]) && isset($submittedAnswers[$q->id])) {
                if ($q->isEssay()) {
                    $essayText = is_string($submittedAnswers[$q->id])
                        ? $submittedAnswers[$q->id]
                        : ($submittedAnswers[$q->id]['essay_answer'] ?? '');

                    $summary[$q->id] = [
                        'question_type' => Question::TYPE_ESSAY,
                        'essay_answer' => $essayText,
                        'is_correct' => true,
                        'explanation' => $q->explanation,
                    ];
                } else {
                    $chosen = is_string($submittedAnswers[$q->id])
                        ? $submittedAnswers[$q->id]
                        : ($submittedAnswers[$q->id]['chosen'] ?? null);

                    if ($chosen) {
                        $isCorrect = ($chosen === $q->correct_option);
                        $summary[$q->id] = [
                            'question_type' => Question::TYPE_QUIZ,
                            'chosen' => $chosen,
                            'correct' => $q->correct_option,
                            'is_correct' => $isCorrect,
                            'explanation' => $q->explanation,
                        ];
                    }
                }
            }
        }

        $answeredCount = count($summary);
        $correctCount = collect($summary)->where('is_correct', true)->count();
        $incorrectCount = collect($summary)->where('is_correct', false)->count();
        $score = $totalQuestions > 0 ? round(($correctCount / $totalQuestions) * 100, 1) : 0;
        $isExamCompleted = ($answeredCount >= $totalQuestions);

        $examAttempt->total_questions = $totalQuestions;
        $examAttempt->correct_count = $correctCount;
        $examAttempt->incorrect_count = $incorrectCount;
        $examAttempt->review_needed_count = $incorrectCount;
        $examAttempt->score = $score;
        $examAttempt->answers_summary = $summary;
        $examAttempt->save();

        if ($isExamCompleted) {
            $user->enrolledClasses()->updateExistingPivot($classId, [
                'status' => 'completed',
                'completed_at' => now(),
                'final_grade' => $score,
            ]);
        }

        return back()->with('success', "Exam submission saved. Answered: {$answeredCount}/{$totalQuestions}. Score: {$score}%.");
    }
}
