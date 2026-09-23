<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseClass;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\StudentIncorrectQuestion;
use App\Models\StudentProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class BuddhistCoursesTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $teacher;
    protected User $student;
    protected Course $course;
    protected CourseClass $class;
    protected Lesson $lesson;
    protected Question $question;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Abbot Admin',
            'email' => 'admin@vienkhongni.vn',
            'username' => 'admin',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $this->teacher = User::create([
            'name' => 'Sayalay Teacher',
            'email' => 'teacher@vienkhongni.vn',
            'username' => 'teacher',
            'password' => Hash::make('password'),
            'role' => 'teacher',
        ]);

        $this->student = User::create([
            'name' => 'Bhikkhuni Vien Tue',
            'email' => 'student@vienkhongni.vn',
            'username' => 'student',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);

        $this->course = Course::create([
            'title' => 'Abhidhammattha-sangaha (Thắng pháp tập yếu luận)',
            'slug' => 'abhidhammattha-sangaha',
            'category' => 'abhidhamma',
            'target_audience' => 'all',
            'description' => 'Four Paramattha Dhammas',
        ]);

        $this->class = CourseClass::create([
            'course_id' => $this->course->id,
            'name' => 'Abhidhamma Cohort 01',
            'code' => 'VNK-ADH-01',
            'duration_months' => 3,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonths(3)->toDateString(),
            'status' => 'active',
            'is_locked' => false,
        ]);

        $this->class->students()->attach($this->student->id, ['enrolled_at' => now()]);

        $this->lesson = Lesson::create([
            'course_id' => $this->course->id,
            'title' => 'Lesson 1: Paramattha Dhamma',
            'slug' => 'lesson-1',
            'order' => 1,
            'reading_content' => 'The four ultimate realities are Citta, Cetasika, Rupa, Nibbana.',
            'video_url' => 'https://www.youtube.com/watch?v=sample',
        ]);

        $this->question = Question::create([
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson->id,
            'question_text' => 'How many Paramattha Dhammas are there?',
            'option_a' => '2',
            'option_b' => '3',
            'option_c' => '4',
            'option_d' => '5',
            'correct_option' => 'C',
            'explanation' => 'They are Citta, Cetasika, Rupa, and Nibbana.',
            'type' => 'both',
        ]);
    }

    public function test_landing_page_renders_with_monastery_info(): void
    {
        $childCourse = Course::create([
            'parent_id' => $this->course->id,
            'title' => 'Cetasika Paramattha',
            'slug' => 'cetasika-paramattha',
            'category' => 'abhidhamma',
        ]);

        Lesson::create([
            'course_id' => $childCourse->id,
            'title' => 'Lesson 1: Cetasika Overview',
            'slug' => 'lesson-1-cetasika',
            'order' => 1,
            'reading_content' => 'Content for cetasika.',
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->component('Home/Index')
            ->has('courses', 1)
            ->where('courses.0.title', $this->course->title)
            ->has('courses.0.lessons', 1)
            ->where('courses.0.lessons.0.title', $this->lesson->title)
            ->has('courses.0.children', 1)
            ->where('courses.0.children.0.title', 'Cetasika Paramattha')
            ->has('courses.0.children.0.lessons', 1)
            ->where('courses.0.children.0.lessons.0.title', 'Lesson 1: Cetasika Overview')
            ->has('monastery')
        );
    }

    public function test_user_can_login_using_username(): void
    {
        $response = $this->post('/login', [
            'login' => 'student',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($this->student);
        $response->assertRedirect(route('dashboard'));
    }

    public function test_manager_can_login_using_username_and_redirects_to_dashboard(): void
    {
        $response = $this->post('/login', [
            'login' => 'admin',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($this->admin);
        $response->assertRedirect(route('dashboard'));
    }

    public function test_manager_can_toggle_lock_class(): void
    {
        $this->actingAs($this->admin);

        $this->assertFalse($this->class->fresh()->is_locked);

        $response = $this->post(route('admin.classes.toggle-lock', $this->class->id));
        $response->assertRedirect();

        $this->assertTrue($this->class->fresh()->is_locked);
    }

    public function test_manager_can_delete_class(): void
    {
        $this->actingAs($this->admin);

        $response = $this->delete(route('admin.classes.destroy', $this->class->id));
        $response->assertRedirect(route('admin.dashboard'));

        $this->assertDatabaseMissing('classes', [
            'id' => $this->class->id,
        ]);
    }

    public function test_student_feedback_submission_and_teacher_review(): void
    {
        $this->actingAs($this->student);

        // Submit feedback on reading material
        $response = $this->post(route('student.feedback.submit', [$this->class->id, $this->lesson->id]), [
            'content' => 'Typo in section 2 regarding 52 mental factors.',
        ]);
        $response->assertRedirect();

        $this->assertDatabaseHas('material_feedbacks', [
            'lesson_id' => $this->lesson->id,
            'user_id' => $this->student->id,
            'content' => 'Typo in section 2 regarding 52 mental factors.',
            'status' => 'pending',
        ]);
    }

    public function test_strict_learning_pipeline_progression_and_class_final_exam(): void
    {
        $this->actingAs($this->student);

        // Before completing lessons, class final exam is locked
        $examLockedResponse = $this->get(route('student.class.exam', $this->class->id));
        $examLockedResponse->assertRedirect(route('student.dashboard'));

        // 1. Complete Reading
        $response = $this->post(route('student.reading.complete', [$this->class->id, $this->lesson->id]));
        $response->assertRedirect();

        $progress = StudentProgress::where('user_id', $this->student->id)->where('lesson_id', $this->lesson->id)->first();
        $this->assertTrue($progress->reading_completed);

        // 2. Complete Video
        $response = $this->post(route('student.video.complete', [$this->class->id, $this->lesson->id]));
        $response->assertRedirect();
        $this->assertTrue($progress->fresh()->video_completed);

        // 3. Practice Repetitions (simulate 10 repetitions)
        for ($i = 1; $i <= 10; $i++) {
            $this->post(route('student.practice.record', [$this->class->id, $this->lesson->id]));
        }
        $this->assertEquals(10, $progress->fresh()->practice_count);
        $this->assertTrue($progress->fresh()->practice_completed);
        // Lesson is now completed!
        $this->assertTrue($progress->fresh()->is_completed);

        // 4. Now that all lessons are completed, student can access the Class Final Exam
        $examResponse = $this->get(route('student.class.exam', $this->class->id));
        $examResponse->assertStatus(200);
        $examResponse->assertInertia(fn ($page) =>
            $page->component('Student/ClassExam')
                ->where('classItem.id', $this->class->id)
                ->where('totalQuestions', 1)
        );

        // 5. Submit single question on the class final exam
        $submitQResponse = $this->postJson(route('student.class.exam.question-submit', $this->class->id), [
            'question_id' => $this->question->id,
            'chosen_option' => 'C', // Correct answer
        ]);

        $submitQResponse->assertJson([
            'question_id' => $this->question->id,
            'is_correct' => true,
            'correct_option' => 'C',
            'score' => 100,
            'is_exam_completed' => true,
        ]);

        // 6. Attempting to re-submit same question is rejected (permanent lock)
        $reSubmitResponse = $this->postJson(route('student.class.exam.question-submit', $this->class->id), [
            'question_id' => $this->question->id,
            'chosen_option' => 'A',
        ]);
        $reSubmitResponse->assertStatus(400);

        // 7. Verify class enrollment is graduated with final grade
        $this->assertDatabaseHas('class_user', [
            'class_id' => $this->class->id,
            'user_id' => $this->student->id,
            'status' => 'completed',
            'final_grade' => 100.0,
        ]);
    }

    public function test_admin_can_view_class_details_with_completed_students(): void
    {
        $this->actingAs($this->admin);

        $this->class->students()->updateExistingPivot($this->student->id, [
            'status' => 'completed',
            'final_grade' => 95.0,
            'completed_at' => now(),
        ]);

        $response = $this->get(route('admin.classes.show', $this->class->id));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Classes/Show')
                ->where('students.0.completed_at', now()->format('Y-m-d'))
        );
    }

    public function test_creating_new_class_stores_user_id(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post(route('admin.classes.store'), [
            'course_id' => $this->course->id,
            'name' => 'Abhidhamma Master Class',
            'description' => 'Advanced cohort taught by Abbot Admin',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('classes', [
            'course_id' => $this->course->id,
            'name' => 'Abhidhamma Master Class',
            'user_id' => $this->admin->id,
        ]);
    }

    public function test_creating_new_course_catalog_stores_user_id(): void
    {
        $this->actingAs($this->teacher);

        $response = $this->post(route('admin.materials.catalogs.store'), [
            'title' => 'Pali Chanting Course',
            'slug' => 'pali-chanting-course',
            'description' => 'Daily Paritta chants and protective sutras.',
            'category' => 'pali',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('courses', [
            'title' => 'Pali Chanting Course',
            'slug' => 'pali-chanting-course',
            'user_id' => $this->teacher->id,
        ]);
    }

    public function test_student_dashboard_displays_all_classes(): void
    {
        $this->actingAs($this->student);

        // Create a second class without explicit enrollment
        $otherClass = CourseClass::create([
            'course_id' => $this->course->id,
            'name' => 'Abhidhamma Open Class',
            'is_locked' => false,
        ]);

        $response = $this->get(route('student.dashboard'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Student/Dashboard')
                ->has('enrolledClasses', 2)
        );
    }

    public function test_student_can_enter_lesson_with_auto_enrollment(): void
    {
        $newStudent = User::create([
            'name' => 'New Student',
            'email' => 'newstudent@vienkhongni.vn',
            'username' => 'newstudent',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);

        $this->actingAs($newStudent);

        // Access lesson without prior enrollment
        $response = $this->get(route('student.lesson', [$this->class->id, $this->lesson->id]));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Student/LessonPlayer')
                ->where('lesson.id', $this->lesson->id)
        );

        $this->assertDatabaseHas('class_user', [
            'class_id' => $this->class->id,
            'user_id' => $newStudent->id,
        ]);
    }
}

