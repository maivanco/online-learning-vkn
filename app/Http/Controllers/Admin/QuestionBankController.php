<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Question;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuestionBankController extends Controller
{
    /**
     * Display question bank per course and lesson.
     */
    public function index(Request $request): Response
    {
        $courses = Course::with('lessons')->get();
        $selectedCourseId = $request->query('course_id') ?? $courses->first()?->id;

        $questionsQuery = Question::with(['course', 'lesson']);
        if ($selectedCourseId) {
            $questionsQuery->where('course_id', $selectedCourseId);
        }

        $questions = $questionsQuery->orderBy('id', 'desc')->get()->map(fn($q) => [
            'id' => $q->id,
            'course_id' => $q->course_id,
            'lesson_id' => $q->lesson_id,
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
        ]);
    }

    /**
     * Store newly created multiple-choice question.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'lesson_id' => 'nullable|exists:lessons,id',
            'question_text' => 'required|string',
            'option_a' => 'required|string',
            'option_b' => 'required|string',
            'option_c' => 'required|string',
            'option_d' => 'required|string',
            'correct_option' => 'required|in:A,B,C,D',
            'explanation' => 'required|string',
            'type' => 'required|in:practice,exam,both',
        ]);

        Question::create($validated);

        return back()->with('success', 'Question added to question bank successfully.');
    }

    /**
     * Update existing question.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $question = Question::findOrFail($id);

        $validated = $request->validate([
            'lesson_id' => 'nullable|exists:lessons,id',
            'question_text' => 'required|string',
            'option_a' => 'required|string',
            'option_b' => 'required|string',
            'option_c' => 'required|string',
            'option_d' => 'required|string',
            'correct_option' => 'required|in:A,B,C,D',
            'explanation' => 'required|string',
            'type' => 'required|in:practice,exam,both',
        ]);

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
