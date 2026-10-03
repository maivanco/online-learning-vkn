<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportQuestionsRequest;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Question;
use App\Services\QuestionImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class QuestionBankController extends Controller
{
    public function __construct(
        private readonly QuestionImportService $importService,
    ) {}

    /**
     * Display question bank per course and lesson.
     */
    public function index(Request $request): Response
    {
        $courses = Course::with('lessons')->get();
        $selectedCourseId = $request->query('course_id') ?? $courses->first()?->id;
        $selectedLessonId = $request->query('lesson_id');
        $selectedQuestionType = $request->query('question_type', 'all');

        $baseQuery = Question::query();
        if ($selectedCourseId) {
            $baseQuery->where('course_id', $selectedCourseId);
        }

        if ($selectedLessonId) {
            $baseQuery->where('lesson_id', $selectedLessonId);
        }

        $counts = [
            'all' => (clone $baseQuery)->count(),
            'quiz' => (clone $baseQuery)->where(function ($q) {
                $q->where('question_type', Question::TYPE_QUIZ)->orWhereNull('question_type');
            })->count(),
            'essay' => (clone $baseQuery)->where('question_type', Question::TYPE_ESSAY)->count(),
        ];

        $questionsQuery = (clone $baseQuery)->with(['course', 'lesson']);
        if ($selectedQuestionType && in_array($selectedQuestionType, [Question::TYPE_QUIZ, Question::TYPE_ESSAY])) {
            if ($selectedQuestionType === Question::TYPE_QUIZ) {
                $questionsQuery->where(function ($q) {
                    $q->where('question_type', Question::TYPE_QUIZ)->orWhereNull('question_type');
                });
            } else {
                $questionsQuery->where('question_type', Question::TYPE_ESSAY);
            }
        }

        $questions = $questionsQuery->orderBy('id', 'desc')->get()->map(fn($q) => [
            'id' => $q->id,
            'course_id' => $q->course_id,
            'lesson_id' => $q->lesson_id,
            'question_type' => $q->question_type ?? Question::TYPE_QUIZ,
            'course_title' => $q->course?->title,
            'lesson_title' => $q->lesson?->title,
            'question_text' => $q->question_text,
            'option_a' => $q->option_a,
            'option_b' => $q->option_b,
            'option_c' => $q->option_c,
            'option_d' => $q->option_d,
            'correct_option' => $q->correct_option,
            'explanation' => $q->explanation,
            'type' => $q->type,
        ]);

        return Inertia::render('Admin/Questions/Index', [
            'questions' => $questions,
            'courses' => $courses,
            'selectedCourseId' => (int) $selectedCourseId,
            'selectedLessonId' => $selectedLessonId ? (int) $selectedLessonId : null,
            'selectedQuestionType' => $selectedQuestionType,
            'counts' => $counts,
        ]);
    }

    /**
     * Display dedicated Question Import page.
     */
    public function importView(Request $request): Response
    {
        $courses = Course::with('lessons')->get();
        $selectedCourseId = (int) ($request->query('course_id') ?? $courses->first()?->id);
        $selectedLessonId = $request->query('lesson_id') ? (int) $request->query('lesson_id') : null;

        return Inertia::render('Admin/Questions/Import', [
            'courses' => $courses,
            'selectedCourseId' => $selectedCourseId,
            'selectedLessonId' => $selectedLessonId,
        ]);
    }

    /**
     * Download sample Excel template for question import.
     */
    public function downloadTemplate(): StreamedResponse
    {
        $spreadsheet = $this->importService->generateTemplate();

        $response = new StreamedResponse(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        });

        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', 'attachment;filename="question_import_template.xlsx"');
        $response->headers->set('Cache-Control', 'max-age=0');

        return $response;
    }

    /**
     * Import questions from uploaded Excel spreadsheet into a selected lesson.
     */
    public function import(ImportQuestionsRequest $request): RedirectResponse
    {
        $courseId = (int) $request->validated('course_id');
        $lessonId = (int) $request->validated('lesson_id');
        $file = $request->file('file');

        $result = $this->importService->import($file, $courseId, $lessonId);

        if (!$result['success']) {
            return back()
                ->with('error', __('questions.import_failed_msg', ['count' => count($result['errors'])]))
                ->with('import_errors', $result['errors']);
        }

        return redirect()
            ->route('admin.questions.index', [
                'course_id' => $courseId,
                'lesson_id' => $lessonId,
            ])
            ->with('success', __('questions.import_success', ['count' => $result['imported_count']]));
    }

    /**
     * Store newly created question (quiz or essay).
     */
    public function store(Request $request): RedirectResponse
    {
        $questionType = $request->input('question_type', Question::TYPE_QUIZ);

        $rules = [
            'course_id' => 'required|exists:courses,id',
            'lesson_id' => 'nullable|exists:lessons,id',
            'question_type' => 'required|in:quiz,essay',
            'question_text' => 'required|string',
            'type' => 'required|in:practice,exam,both',
            'explanation' => 'nullable|string'
        ];

        if ($questionType === Question::TYPE_ESSAY) {
            $rules['option_a'] = 'nullable|string';
            $rules['option_b'] = 'nullable|string';
            $rules['option_c'] = 'nullable|string';
            $rules['option_d'] = 'nullable|string';
            $rules['correct_option'] = 'nullable|string';
        } else {
            $rules['option_a'] = 'required|string';
            $rules['option_b'] = 'required|string';
            $rules['option_c'] = 'required|string';
            $rules['option_d'] = 'required|string';
            $rules['correct_option'] = 'required|in:A,B,C,D';
        }

        $validated = $request->validate($rules);

        if ($questionType === Question::TYPE_ESSAY) {
            $validated['option_a'] = null;
            $validated['option_b'] = null;
            $validated['option_c'] = null;
            $validated['option_d'] = null;
            $validated['correct_option'] = null;
        }

        Question::create($validated);

        $successMsg = $questionType === Question::TYPE_ESSAY
            ? 'Essay question added to question bank successfully.'
            : 'Multiple choice question added to question bank successfully.';

        return back()->with('success', $successMsg);
    }

    /**
     * Update existing question.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $question = Question::findOrFail($id);
        $questionType = $request->input('question_type', $question->question_type ?? Question::TYPE_QUIZ);

        $rules = [
            'lesson_id' => 'nullable|exists:lessons,id',
            'question_type' => 'nullable|in:quiz,essay',
            'question_text' => 'required|string',
            'type' => 'required|in:practice,exam,both',
        ];

        if ($questionType === Question::TYPE_ESSAY) {
            $rules['option_a'] = 'nullable|string';
            $rules['option_b'] = 'nullable|string';
            $rules['option_c'] = 'nullable|string';
            $rules['option_d'] = 'nullable|string';
            $rules['correct_option'] = 'nullable|string';
            $rules['explanation'] = 'nullable|string';
        } else {
            $rules['option_a'] = 'required|string';
            $rules['option_b'] = 'required|string';
            $rules['option_c'] = 'required|string';
            $rules['option_d'] = 'required|string';
            $rules['correct_option'] = 'required|in:A,B,C,D';
            $rules['explanation'] = 'required|string';
        }

        $validated = $request->validate($rules);

        if ($questionType === Question::TYPE_ESSAY) {
            $validated['option_a'] = null;
            $validated['option_b'] = null;
            $validated['option_c'] = null;
            $validated['option_d'] = null;
            $validated['correct_option'] = null;
        }

        $question->update($validated);

        return back()->with('success', 'Question updated successfully.');
    }

    /**
     * Delete question.
     */
    public function destroy(int $id): RedirectResponse
    {
        $question = Question::findOrFail($id);
        $question->delete();

        return back()->with('success', 'Question deleted successfully.');
    }
}
