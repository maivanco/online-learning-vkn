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
            'cccd' => '001099000001',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $this->teacher = User::create([
            'name' => 'Sayalay Teacher',
            'email' => 'teacher@vienkhongni.vn',
            'cccd' => '001099000002',
            'password' => Hash::make('password'),
            'role' => 'teacher',
        ]);

        $this->student = User::create([
            'name' => 'Bhikkhuni Vien Tue',
            'email' => 'student@vienkhongni.vn',
            'cccd' => '079199000001',
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
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    public function test_user_can_login_using_cccd(): void
    {
        $response = $this->post('/login', [
            'login' => '079199000001',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($this->student);
        $response->assertRedirect(route('dashboard'));
    }

    public function test_manager_can_login_using_cccd_and_redirects_to_dashboard(): void
    {
        $response = $this->post('/login', [
            'login' => '001099000001',
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

    public function test_strict_learning_pipeline_progression(): void
    {
        $this->actingAs($this->student);

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

        // 4. Submit Exam with wrong answer
        $response = $this->post(route('student.exam.submit', [$this->class->id, $this->lesson->id]), [
            'answers' => [
                $this->question->id => 'A', // wrong answer
            ],
        ]);
        $response->assertRedirect();

        $this->assertTrue($progress->fresh()->exam_completed);
        $this->assertFalse($progress->fresh()->is_completed); // Not completed because of wrong answer!

        // Assert recorded in student_incorrect_questions
        $this->assertDatabaseHas('student_incorrect_questions', [
            'user_id' => $this->student->id,
            'question_id' => $this->question->id,
            'is_resolved' => false,
        ]);

        // 5. Retest incorrect question with correct answer 'C'
        $retryResponse = $this->postJson(route('student.incorrect.retry', [$this->class->id, $this->lesson->id]), [
            'question_id' => $this->question->id,
            'chosen_option' => 'C',
        ]);
        $retryResponse->assertJson([
            'is_correct' => true,
            'all_cleared' => true,
        ]);

        // Now program is officially completed!
        $this->assertTrue($progress->fresh()->is_completed);
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
}

