<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ClassComment;
use App\Models\Course;
use App\Models\CourseClass;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassCommentTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;
    private User $student1;
    private User $student2;
    private CourseClass $class;

    protected function setUp(): void
    {
        parent::setUp();

        $this->teacher = User::factory()->create(['role' => 'teacher']);
        $this->student1 = User::factory()->create(['role' => 'student']);
        $this->student2 = User::factory()->create(['role' => 'student']);

        $course = Course::create([
            'user_id' => $this->teacher->id,
            'title' => 'Buddhist Philosophy',
            'slug' => 'buddhist-philosophy',
            'category' => 'philosophy',
            'order' => 1,
        ]);

        $this->class = CourseClass::create([
            'course_id' => $course->id,
            'user_id' => $this->teacher->id,
            'name' => 'Philosophy 101',
            'is_locked' => false,
        ]);

        // Enroll student1
        $this->student1->enrolledClasses()->attach($this->class->id, [
            'enrolled_at' => now(),
            'status' => 'enrolled',
        ]);
    }

    public function test_enrolled_student_can_post_root_comment(): void
    {
        $response = $this->actingAs($this->student1)
            ->post(route('classes.comments.store', $this->class->id), [
                'content' => '<p>What is the meaning of non-attachment?</p>',
            ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('class_comments', [
            'class_id' => $this->class->id,
            'user_id' => $this->student1->id,
            'parent_id' => null,
            'reply_to_user_id' => null,
            'content' => '<p>What is the meaning of non-attachment?</p>',
        ]);
    }

    public function test_non_enrolled_student_cannot_post_comment(): void
    {
        $response = $this->actingAs($this->student2)
            ->post(route('classes.comments.store', $this->class->id), [
                'content' => '<p>Can I ask a question?</p>',
            ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('class_comments', [
            'user_id' => $this->student2->id,
        ]);
    }

    public function test_teacher_can_post_comment_without_enrollment(): void
    {
        $response = $this->actingAs($this->teacher)
            ->post(route('classes.comments.store', $this->class->id), [
                'content' => '<p>Welcome students to the discussion!</p>',
            ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('class_comments', [
            'user_id' => $this->teacher->id,
            'content' => '<p>Welcome students to the discussion!</p>',
        ]);
    }

    public function test_comment_hierarchy_strictly_flattens_to_two_levels(): void
    {
        // 1. Student1 posts a root comment (Level 1)
        $root = ClassComment::create([
            'class_id' => $this->class->id,
            'user_id' => $this->student1->id,
            'parent_id' => null,
            'reply_to_user_id' => null,
            'content' => '<p>First question</p>',
        ]);

        // 2. Teacher replies to Root (Level 2)
        $this->actingAs($this->teacher)
            ->post(route('classes.comments.store', $this->class->id), [
                'parent_id' => $root->id,
                'content' => '<p>Here is the teacher reply</p>',
            ]);

        $level2 = ClassComment::where('parent_id', $root->id)->first();
        $this->assertNotNull($level2);
        $this->assertEquals($root->id, $level2->parent_id);
        $this->assertEquals($this->student1->id, $level2->reply_to_user_id);

        // 3. Student1 replies to Teacher's reply (which is already Level 2)
        // Must be linked to Root ($root->id) instead of $level2->id,
        // and reply_to_user_id must be Teacher ($this->teacher->id)!
        $this->actingAs($this->student1)
            ->post(route('classes.comments.store', $this->class->id), [
                'parent_id' => $level2->id,
                'content' => '<p>Thank you teacher for the clarification</p>',
            ]);

        $level3AsReplyToRoot = ClassComment::where('class_id', $this->class->id)
            ->where('id', '!=', $level2->id)
            ->where('id', '!=', $root->id)
            ->first();

        $this->assertNotNull($level3AsReplyToRoot);
        // Assert it was linked to the root comment!
        $this->assertEquals($root->id, $level3AsReplyToRoot->parent_id);
        // Assert it tracked reply_to_user_id as the teacher
        $this->assertEquals($this->teacher->id, $level3AsReplyToRoot->reply_to_user_id);
    }

    public function test_insecure_tags_and_events_are_sanitized(): void
    {
        $dirtyPayload = '<p>Good question <script>alert("xss")</script><b onclick="alert(1)">Important</b><iframe src="evil.com"></iframe></p>';

        $this->actingAs($this->student1)
            ->post(route('classes.comments.store', $this->class->id), [
                'content' => $dirtyPayload,
            ]);

        $comment = ClassComment::latest('id')->first();
        $this->assertNotNull($comment);
        $this->assertStringNotContainsString('<script>', $comment->content);
        $this->assertStringNotContainsString('<iframe>', $comment->content);
        $this->assertStringNotContainsString('onclick', $comment->content);
        $this->assertStringContainsString('<b>Important</b>', $comment->content);
    }

    public function test_author_can_edit_own_comment_but_not_others(): void
    {
        $comment = ClassComment::create([
            'class_id' => $this->class->id,
            'user_id' => $this->student1->id,
            'content' => '<p>Original text</p>',
        ]);

        // Unauthorized edit attempt by student2
        $response = $this->actingAs($this->student2)
            ->put(route('classes.comments.update', [$this->class->id, $comment->id]), [
                'content' => '<p>Hacked text</p>',
            ]);
        $response->assertSessionHas('error');
        $this->assertEquals('<p>Original text</p>', $comment->fresh()->content);

        // Author edits own comment
        $response = $this->actingAs($this->student1)
            ->put(route('classes.comments.update', [$this->class->id, $comment->id]), [
                'content' => '<p>Updated text by author</p>',
            ]);
        $response->assertSessionHas('success');
        $this->assertEquals('<p>Updated text by author</p>', $comment->fresh()->content);
    }

    public function test_author_and_teacher_can_delete_comment(): void
    {
        $comment1 = ClassComment::create([
            'class_id' => $this->class->id,
            'user_id' => $this->student1->id,
            'content' => '<p>Comment 1</p>',
        ]);

        $comment2 = ClassComment::create([
            'class_id' => $this->class->id,
            'user_id' => $this->student1->id,
            'content' => '<p>Comment 2</p>',
        ]);

        // Student1 deletes own comment
        $this->actingAs($this->student1)
            ->delete(route('classes.comments.destroy', [$this->class->id, $comment1->id]))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('class_comments', ['id' => $comment1->id]);

        // Teacher moderates and deletes Student1's comment
        $this->actingAs($this->teacher)
            ->delete(route('classes.comments.destroy', [$this->class->id, $comment2->id]))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('class_comments', ['id' => $comment2->id]);
    }

    public function test_student_class_detail_page_loads_with_comments(): void
    {
        ClassComment::create([
            'class_id' => $this->class->id,
            'user_id' => $this->student1->id,
            'content' => '<p>Sample class question</p>',
        ]);

        $response = $this->actingAs($this->student1)
            ->get(route('student.classes.show', $this->class->id));

        $response->assertOk();
    }
}
