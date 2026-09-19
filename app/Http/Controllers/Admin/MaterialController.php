<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\MaterialFeedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MaterialController extends Controller
{
    /**
     * Display list of courses, lessons, and reading materials.
     */
    public function index(Request $request): Response
    {
        $selectedCourseId = $request->query('course_id');

        $courses = Course::withCount('lessons')->orderBy('order')->get();
        $activeCourse = $selectedCourseId ? Course::find($selectedCourseId) : $courses->first();

        $lessons = [];
        if ($activeCourse) {
            $lessons = Lesson::where('course_id', $activeCourse->id)
                ->withCount(['feedbacks', 'questions'])
                ->orderBy('order')
                ->get()
                ->map(fn($l) => [
                    'id' => $l->id,
                    'course_id' => $l->course_id,
                    'title' => $l->title,
                    'slug' => $l->slug,
                    'order' => $l->order,
                    'summary' => $l->summary,
                    'reading_content' => $l->reading_content,
                    'reading_file_url' => $l->reading_file_url,
                    'video_url' => $l->video_url,
                    'feedbacks_count' => $l->feedbacks_count,
                    'questions_count' => $l->questions_count,
                    'updated_at' => $l->updated_at->format('Y-m-d H:i'),
                ]);
        }

        // Feedbacks list across all materials
        $feedbacks = MaterialFeedback::with(['lesson.course', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(fn($fb) => [
                'id' => $fb->id,
                'content' => $fb->content,
                'status' => $fb->status,
                'admin_notes' => $fb->admin_notes,
                'created_at' => $fb->created_at->format('Y-m-d H:i'),
                'user' => [
                    'id' => $fb->user->id,
                    'name' => $fb->user->name,
                    'username' => $fb->user->username,
                ],
                'lesson' => [
                    'id' => $fb->lesson->id,
                    'title' => $fb->lesson->title,
                    'course_title' => $fb->lesson->course->title,
                ],
            ]);

        return Inertia::render('Admin/Materials/Index', [
            'courses' => $courses,
            'activeCourse' => $activeCourse,
            'lessons' => $lessons,
            'feedbacks' => $feedbacks,
        ]);
    }

    /**
     * Store newly created lesson/material.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'reading_content' => 'required|string',
            'reading_file_url' => 'nullable|url',
            'video_url' => 'nullable|url',
            'order' => 'nullable|integer|min:1',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . rand(100, 999);
        $validated['order'] = $validated['order'] ?? (Lesson::where('course_id', $validated['course_id'])->max('order') + 1);

        Lesson::create($validated);

        return back()->with('success', 'Study material and lecture video created successfully.');
    }

    /**
     * Update existing lesson/material.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $lesson = Lesson::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'reading_content' => 'required|string',
            'reading_file_url' => 'nullable|url',
            'video_url' => 'nullable|url',
            'order' => 'required|integer|min:1',
        ]);

        $lesson->update($validated);

        return back()->with('success', 'Study material updated successfully.');
    }

    /**
     * Update feedback status from learner.
     */
    public function updateFeedback(Request $request, int $id): RedirectResponse
    {
        $feedback = MaterialFeedback::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,reviewed,resolved',
            'admin_notes' => 'nullable|string',
        ]);

        $feedback->update($validated);

        return back()->with('success', 'Material feedback status updated.');
    }
}
