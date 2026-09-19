<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use App\Models\Course;
use App\Models\CourseClass;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MaterialCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $teacher;
    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Main Administrator',
            'email' => 'admin@vienkhongni.vn',
            'username' => 'admin',
            'phone' => '0901234567',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->teacher = User::create([
            'name' => 'Sayalay Teacher',
            'email' => 'teacher@vienkhongni.vn',
            'username' => 'teacher',
            'phone' => '0907654321',
            'password' => Hash::make('password'),
            'role' => 'teacher',
            'status' => 'active',
        ]);

        $this->student = User::create([
            'name' => 'Student Learner',
            'email' => 'student@vienkhongni.vn',
            'username' => 'student',
            'password' => Hash::make('password'),
            'role' => 'student',
            'status' => 'active',
        ]);
    }

    public function test_admin_can_view_courses_catalog_in_materials_page(): void
    {
        $parentCourse = Course::create([
            'title' => 'Theravada Dhamma',
            'slug' => 'theravada-dhamma',
            'category' => 'dhamma',
            'description' => 'Theravada canonical Dhamma studies.',
        ]);

        $childCourse = Course::create([
            'parent_id' => $parentCourse->id,
            'title' => 'Four Noble Truths',
            'slug' => 'four-noble-truths',
            'category' => 'dhamma',
            'description' => 'Cattari Ariyasaccani core teachings.',
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.materials.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) =>
            $page->component('Admin/Materials/Index')
                ->has('courses', 2)
                ->where('courses.0.title', 'Theravada Dhamma')
                ->where('courses.1.title', 'Four Noble Truths')
                ->where('courses.1.parent_id', $parentCourse->id)
                ->where('courses.1.parent.title', 'Theravada Dhamma')
        );
    }

    public function test_admin_can_create_a_root_course_catalog(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.materials.catalogs.store'), [
            'title' => 'Vinaya Pitaka Discipline',
            'slug' => 'vinaya-pitaka-discipline',
            'description' => 'Monastic rules and disciplinary codes.',
            'parent_id' => null,
            'category' => 'vinaya',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('courses', [
            'title' => 'Vinaya Pitaka Discipline',
            'slug' => 'vinaya-pitaka-discipline',
            'description' => 'Monastic rules and disciplinary codes.',
            'parent_id' => null,
            'category' => 'vinaya',
        ]);
    }

    public function test_admin_can_create_a_child_course_catalog_with_parent(): void
    {
        $parent = Course::create([
            'title' => 'Pali Language',
            'slug' => 'pali-language',
            'category' => 'pali',
            'description' => 'Pali canonical studies',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.materials.catalogs.store'), [
            'title' => 'Pali Grammar Primer',
            'slug' => '', // should auto-generate
            'description' => 'Beginner Pali grammatical declensions and sandhi.',
            'parent_id' => $parent->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('courses', [
            'title' => 'Pali Grammar Primer',
            'slug' => 'pali-grammar-primer',
            'parent_id' => $parent->id,
            'category' => 'pali', // inherited from parent
        ]);
    }

    public function test_admin_can_update_a_course_catalog(): void
    {
        $parent = Course::create([
            'title' => 'Abhidhamma Studies',
            'slug' => 'abhidhamma-studies',
            'category' => 'abhidhamma',
        ]);

        $course = Course::create([
            'title' => 'Original Title',
            'slug' => 'original-title',
            'category' => 'general',
            'description' => 'Old description',
        ]);

        $response = $this->actingAs($this->admin)->put(route('admin.materials.catalogs.update', $course->id), [
            'title' => 'Updated Catalog Title',
            'slug' => 'updated-catalog-title',
            'description' => 'Updated description content.',
            'parent_id' => $parent->id,
            'category' => 'abhidhamma',
        ]);

        $response->assertRedirect();
        $course->refresh();
        $this->assertEquals('Updated Catalog Title', $course->title);
        $this->assertEquals('updated-catalog-title', $course->slug);
        $this->assertEquals('Updated description content.', $course->description);
        $this->assertEquals($parent->id, $course->parent_id);
    }

    public function test_admin_cannot_set_catalog_as_its_own_parent(): void
    {
        $course = Course::create([
            'title' => 'Self Parent Test',
            'slug' => 'self-parent-test',
            'category' => 'dhamma',
        ]);

        $response = $this->actingAs($this->admin)->put(route('admin.materials.catalogs.update', $course->id), [
            'title' => 'Self Parent Test',
            'slug' => 'self-parent-test',
            'parent_id' => $course->id,
        ]);

        $response->assertSessionHasErrors('parent_id');
        $this->assertNull($course->fresh()->parent_id);
    }

    public function test_admin_cannot_set_descendant_as_parent(): void
    {
        $root = Course::create([
            'title' => 'Root Catalog',
            'slug' => 'root-catalog',
            'category' => 'dhamma',
        ]);

        $child = Course::create([
            'parent_id' => $root->id,
            'title' => 'Child Catalog',
            'slug' => 'child-catalog',
            'category' => 'dhamma',
        ]);

        $grandChild = Course::create([
            'parent_id' => $child->id,
            'title' => 'Grandchild Catalog',
            'slug' => 'grandchild-catalog',
            'category' => 'dhamma',
        ]);

        // Attempt to make $root's parent be $grandChild
        $response = $this->actingAs($this->admin)->put(route('admin.materials.catalogs.update', $root->id), [
            'title' => 'Root Catalog',
            'slug' => 'root-catalog',
            'parent_id' => $grandChild->id,
        ]);

        $response->assertSessionHasErrors('parent_id');
        $this->assertNull($root->fresh()->parent_id);
    }

    public function test_admin_can_delete_empty_course_catalog(): void
    {
        $course = Course::create([
            'title' => 'Empty Catalog To Delete',
            'slug' => 'empty-catalog-to-delete',
            'category' => 'dhamma',
        ]);

        $response = $this->actingAs($this->admin)->delete(route('admin.materials.catalogs.destroy', $course->id));

        $response->assertRedirect(route('admin.materials.index'));
        $this->assertDatabaseMissing('courses', [
            'id' => $course->id,
        ]);
    }

    public function test_admin_cannot_delete_course_catalog_with_lessons(): void
    {
        $course = Course::create([
            'title' => 'Catalog With Lesson',
            'slug' => 'catalog-with-lesson',
            'category' => 'dhamma',
        ]);

        Lesson::create([
            'course_id' => $course->id,
            'title' => 'Lesson 1',
            'slug' => 'lesson-1',
            'reading_content' => 'Some lesson text',
            'order' => 1,
        ]);

        $response = $this->actingAs($this->admin)->delete(route('admin.materials.catalogs.destroy', $course->id));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
        ]);
    }

    public function test_student_cannot_manage_course_catalogs(): void
    {
        $response = $this->actingAs($this->student)->post(route('admin.materials.catalogs.store'), [
            'title' => 'Unauthorized Catalog',
            'slug' => 'unauthorized-catalog',
        ]);

        $response->assertRedirect(route('student.dashboard'));
        $this->assertDatabaseMissing('courses', [
            'slug' => 'unauthorized-catalog',
        ]);
    }

    public function test_admin_can_delete_lesson(): void
    {
        $course = Course::create([
            'title' => 'Course For Lesson Delete',
            'slug' => 'course-for-lesson-delete',
            'category' => 'sutta',
        ]);

        $lesson = Lesson::create([
            'course_id' => $course->id,
            'title' => 'Lesson To Delete',
            'slug' => 'lesson-to-delete',
            'reading_content' => 'Content to delete',
            'order' => 1,
        ]);

        $response = $this->actingAs($this->admin)->delete(route('admin.materials.destroy', $lesson->id));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Lesson deleted successfully.');
        $this->assertDatabaseMissing('lessons', [
            'id' => $lesson->id,
        ]);
    }

    public function test_teacher_can_delete_lesson(): void
    {
        $course = Course::create([
            'title' => 'Teacher Lesson Course',
            'slug' => 'teacher-lesson-course',
            'category' => 'vinaya',
        ]);

        $lesson = Lesson::create([
            'course_id' => $course->id,
            'title' => 'Teacher Lesson To Delete',
            'slug' => 'teacher-lesson-to-delete',
            'reading_content' => 'Teacher lesson content',
            'order' => 1,
        ]);

        $response = $this->actingAs($this->teacher)->delete(route('admin.materials.destroy', $lesson->id));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Lesson deleted successfully.');
        $this->assertDatabaseMissing('lessons', [
            'id' => $lesson->id,
        ]);
    }

    public function test_student_cannot_delete_lesson(): void
    {
        $course = Course::create([
            'title' => 'Student Guarded Course',
            'slug' => 'student-guarded-course',
            'category' => 'abhidhamma',
        ]);

        $lesson = Lesson::create([
            'course_id' => $course->id,
            'title' => 'Guarded Lesson',
            'slug' => 'guarded-lesson',
            'reading_content' => 'Guarded content',
            'order' => 1,
        ]);

        $response = $this->actingAs($this->student)->delete(route('admin.materials.destroy', $lesson->id));

        $response->assertRedirect(route('student.dashboard'));
        $this->assertDatabaseHas('lessons', [
            'id' => $lesson->id,
        ]);
    }

    public function test_admin_can_save_and_normalize_catalog_with_rich_text(): void
    {
        // 1. Create catalog with rich HTML description
        $response = $this->actingAs($this->admin)->post(route('admin.materials.catalogs.store'), [
            'title' => 'Abhidhamma Advanced Studies',
            'description' => '<p>Welcome to <strong>Abhidhamma</strong>. Key points:</p><ul><li>Citta</li><li>Cetasika</li></ul>',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('courses', [
            'title' => 'Abhidhamma Advanced Studies',
            'description' => '<p>Welcome to <strong>Abhidhamma</strong>. Key points:</p><ul><li>Citta</li><li>Cetasika</li></ul>',
        ]);

        // 2. Create catalog with empty editor tags -> should be saved as null
        $responseEmpty = $this->actingAs($this->admin)->post(route('admin.materials.catalogs.store'), [
            'title' => 'Catalog With Empty Editor Tags',
            'description' => '<p><br></p>',
        ]);

        $responseEmpty->assertRedirect();
        $this->assertDatabaseHas('courses', [
            'title' => 'Catalog With Empty Editor Tags',
            'description' => null,
        ]);
    }

    public function test_admin_can_save_and_normalize_lesson_with_rich_text(): void
    {
        $course = Course::create([
            'title' => 'Lesson Rich Text Course',
            'slug' => 'lesson-rich-text-course',
            'category' => 'dhamma',
        ]);

        // 1. Create lesson with rich text HTML reading content
        $response = $this->actingAs($this->admin)->post(route('admin.materials.store'), [
            'course_id' => $course->id,
            'title' => 'Lesson With Rich Content',
            'reading_content' => '<h2>Introduction</h2><p>This is <em>rich text</em> content for students.</p>',
            'order' => 1,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('lessons', [
            'course_id' => $course->id,
            'title' => 'Lesson With Rich Content',
            'reading_content' => '<h2>Introduction</h2><p>This is <em>rich text</em> content for students.</p>',
        ]);

        // 2. Create lesson with empty editor tags -> should fail validation because reading_content is required
        $responseEmpty = $this->actingAs($this->admin)->post(route('admin.materials.store'), [
            'course_id' => $course->id,
            'title' => 'Lesson With Empty Editor',
            'reading_content' => '<p><br></p>',
            'order' => 2,
        ]);

        $responseEmpty->assertSessionHasErrors('reading_content');
    }

    public function test_admin_can_save_and_update_lesson_with_multiple_document_and_video_urls(): void
    {
        $course = Course::create([
            'title' => 'Multi Resource Course',
            'slug' => 'multi-resource-course',
            'category' => 'dhamma',
        ]);

        // 1. Create lesson with multiple documents & videos
        $docUrls = [
            ['title' => 'Document Part 1 PDF', 'url' => 'https://example.com/doc1.pdf'],
            ['title' => 'Document Part 2 PDF', 'url' => 'https://example.com/doc2.pdf'],
        ];
        $vidUrls = [
            ['title' => 'Video Lecture Part 1', 'url' => 'https://www.youtube.com/watch?v=vid1'],
            ['title' => 'Video Lecture Part 2', 'url' => 'https://www.youtube.com/watch?v=vid2'],
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.materials.store'), [
            'course_id' => $course->id,
            'title' => 'Lesson with Multiple Resources',
            'reading_content' => '<p>Complete lesson content.</p>',
            'document_urls' => $docUrls,
            'video_urls' => $vidUrls,
            'order' => 1,
        ]);

        $response->assertRedirect();
        $lesson = Lesson::where('course_id', $course->id)->first();
        $this->assertNotNull($lesson);
        $this->assertEquals($docUrls, $lesson->document_urls);
        $this->assertEquals($vidUrls, $lesson->video_urls);
        $this->assertEquals('https://example.com/doc1.pdf', $lesson->reading_file_url);
        $this->assertEquals('https://www.youtube.com/watch?v=vid1', $lesson->video_url);

        // 2. Update lesson with modified document and video lists
        $updatedDocUrls = [
            ['title' => 'Updated Doc 1', 'url' => 'https://example.com/updated_doc1.pdf'],
        ];
        $updatedVidUrls = [
            ['title' => 'Updated Vid 1', 'url' => 'https://www.youtube.com/watch?v=updated_vid1'],
            ['title' => 'Updated Vid 2', 'url' => 'https://www.youtube.com/watch?v=updated_vid2'],
            ['title' => 'Updated Vid 3', 'url' => 'https://www.youtube.com/watch?v=updated_vid3'],
        ];

        $updateResponse = $this->actingAs($this->admin)->put(route('admin.materials.update', $lesson->id), [
            'title' => 'Lesson with Multiple Resources Updated',
            'reading_content' => '<p>Updated reading content.</p>',
            'document_urls' => $updatedDocUrls,
            'video_urls' => $updatedVidUrls,
            'order' => 1,
        ]);

        $updateResponse->assertRedirect();
        $lesson->refresh();
        $this->assertEquals('Lesson with Multiple Resources Updated', $lesson->title);
        $this->assertEquals($updatedDocUrls, $lesson->document_urls);
        $this->assertEquals($updatedVidUrls, $lesson->video_urls);
        $this->assertEquals('https://example.com/updated_doc1.pdf', $lesson->reading_file_url);
        $this->assertEquals('https://www.youtube.com/watch?v=updated_vid1', $lesson->video_url);
    }
}
