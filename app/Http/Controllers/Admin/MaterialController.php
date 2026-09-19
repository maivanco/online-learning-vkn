<?php

declare(strict_types=1);

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

        $courses = Course::with('parent')
            ->withCount('lessons')
            ->orderBy('order')
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'title' => $c->title,
                'slug' => $c->slug,
                'category' => $c->category,
                'description' => $c->description,
                'parent_id' => $c->parent_id,
                'parent' => $c->parent ? [
                    'id' => $c->parent->id,
                    'title' => $c->parent->title,
                ] : null,
                'lessons_count' => $c->lessons_count,
                'order' => $c->order,
            ]);

        $activeCourse = $selectedCourseId ? Course::with('parent')->find($selectedCourseId) : Course::with('parent')->orderBy('order')->first();

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

        if (trim(strip_tags($validated['reading_content'])) === '') {
            return back()->withErrors(['reading_content' => 'The reading content field cannot be empty.']);
        }

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

        if (trim(strip_tags($validated['reading_content'])) === '') {
            return back()->withErrors(['reading_content' => 'The reading content field cannot be empty.']);
        }

        $lesson->update($validated);

        return back()->with('success', 'Study material updated successfully.');
    }

    /**
     * Delete existing lesson/material.
     */
    public function destroy(int $id): RedirectResponse
    {
        $lesson = Lesson::findOrFail($id);
        $lesson->delete();

        return back()->with('success', 'Lesson deleted successfully.');
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

    /**
     * Store newly created course catalog.
     */
    public function storeCatalog(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:courses,slug',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:courses,id',
            'category' => 'nullable|string|max:50',
        ]);

        if (isset($validated['description']) && trim(strip_tags($validated['description'])) === '') {
            $validated['description'] = null;
        }

        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);
        $originalSlug = $slug;
        $counter = 1;
        while (Course::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }
        $validated['slug'] = $slug;

        if (empty($validated['category'])) {
            if (!empty($validated['parent_id'])) {
                $parent = Course::find($validated['parent_id']);
                $validated['category'] = $parent?->category ?? 'general';
            } else {
                $validated['category'] = 'general';
            }
        }

        $validated['order'] = (Course::max('order') ?? 0) + 1;

        $catalog = Course::create($validated);

        return redirect()->route('admin.materials.index', ['course_id' => $catalog->id])
            ->with('success', 'Courses Catalog created successfully.');
    }

    /**
     * Update existing course catalog.
     */
    public function updateCatalog(Request $request, int $id): RedirectResponse
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:courses,slug,' . $id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:courses,id',
            'category' => 'nullable|string|max:50',
        ]);

        if (isset($validated['description']) && trim(strip_tags($validated['description'])) === '') {
            $validated['description'] = null;
        }

        if (!empty($validated['parent_id']) && (int) $validated['parent_id'] === $id) {
            return back()->withErrors(['parent_id' => 'A course catalog cannot be its own parent.']);
        }

        if (!empty($validated['parent_id'])) {
            $descendants = $course->allDescendantIds();
            if (in_array((int) $validated['parent_id'], $descendants, true)) {
                return back()->withErrors(['parent_id' => 'Cannot set a descendant catalog as the parent.']);
            }
        }

        $course->update($validated);

        return back()->with('success', 'Courses Catalog updated successfully.');
    }

    /**
     * Delete course catalog.
     */
    public function destroyCatalog(int $id): RedirectResponse
    {
        $course = Course::findOrFail($id);

        if ($course->lessons()->exists()) {
            return back()->with('error', 'Cannot delete this catalog because it contains study materials / lessons.');
        }

        if ($course->classes()->exists()) {
            return back()->with('error', 'Cannot delete this catalog because it is linked to existing classes.');
        }

        if ($course->questions()->exists()) {
            return back()->with('error', 'Cannot delete this catalog because it contains question bank items.');
        }

        Course::where('parent_id', $id)->update(['parent_id' => null]);

        $course->delete();

        return redirect()->route('admin.materials.index')->with('success', 'Courses Catalog deleted successfully.');
    }
}

