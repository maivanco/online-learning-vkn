<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreClassCommentRequest;
use App\Http\Requests\UpdateClassCommentRequest;
use App\Models\ClassComment;
use App\Models\CourseClass;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ClassCommentController extends Controller
{
    /**
     * Store a new class comment or reply with strict 2-level nesting.
     */
    public function store(StoreClassCommentRequest $request, int $classId): RedirectResponse
    {
        $user = $request->user();
        $class = CourseClass::findOrFail($classId);

        // Authorization check:
        // Teachers and Admins can comment in any class.
        // Students must be enrolled in this class.
        if (! $user->isTeacherOrAdmin()) {
            $isEnrolled = $user->enrolledClasses()
                ->where('classes.id', $classId)
                ->wherePivot('status', '!=', 'dropped')
                ->exists();

            if (! $isEnrolled) {
                return back()->with('error', __('comments.unauthorized_not_enrolled'));
            }
        }

        $sanitizedContent = ClassComment::sanitizeContent($request->input('content'));
        if (trim(strip_tags($sanitizedContent)) === '') {
            return back()->with('error', __('comments.validation_content_required'));
        }

        $parentIdInput = $request->input('parent_id');
        $actualParentId = null;
        $replyToUserId = null;

        if ($parentIdInput) {
            $targetComment = ClassComment::where('class_id', $classId)->findOrFail((int) $parentIdInput);

            // Strict 2-level hierarchy:
            // If the target comment is already a reply (has parent_id),
            // link new reply directly to the root comment instead.
            if ($targetComment->parent_id !== null) {
                $actualParentId = $targetComment->parent_id;
                $replyToUserId = $targetComment->user_id;
            } else {
                $actualParentId = $targetComment->id;
                $replyToUserId = $targetComment->user_id;
            }
        }

        ClassComment::create([
            'class_id' => $classId,
            'user_id' => $user->id,
            'parent_id' => $actualParentId,
            'reply_to_user_id' => $replyToUserId,
            'content' => $sanitizedContent,
        ]);

        return back()->with('success', __('comments.created_success'));
    }

    /**
     * Update an existing comment (author only).
     */
    public function update(UpdateClassCommentRequest $request, int $classId, int $commentId): RedirectResponse
    {
        $user = $request->user();
        $comment = ClassComment::where('class_id', $classId)->findOrFail($commentId);

        if ($comment->user_id !== $user->id) {
            return back()->with('error', __('comments.unauthorized_edit'));
        }

        $sanitizedContent = ClassComment::sanitizeContent($request->input('content'));
        if (trim(strip_tags($sanitizedContent)) === '') {
            return back()->with('error', __('comments.validation_content_required'));
        }

        $comment->update([
            'content' => $sanitizedContent,
        ]);

        return back()->with('success', __('comments.updated_success'));
    }

    /**
     * Delete a comment (author or teacher/admin).
     */
    public function destroy(Request $request, int $classId, int $commentId): RedirectResponse
    {
        $user = $request->user();
        $comment = ClassComment::where('class_id', $classId)->findOrFail($commentId);

        // Author or teacher/admin can delete
        if ($comment->user_id !== $user->id && ! $user->isTeacherOrAdmin()) {
            return back()->with('error', __('comments.unauthorized_delete'));
        }

        $comment->delete();

        return back()->with('success', __('comments.deleted_success'));
    }
}
