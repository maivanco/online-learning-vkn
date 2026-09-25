<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseClass;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\StudentExamAttempt;
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

    public function test_class_final_exam_with_quiz_and_essay_questions(): void
    {
        $this->actingAs($this->student);

        // Create an essay question for the course
        $essayQuestion = Question::create([
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson->id,
            'question_type' => Question::TYPE_ESSAY,
            'question_text' => 'Explain the four noble truths in the context of daily practice.',
            'explanation' => 'Dukkha, Samudaya, Nirodha, Magga reference criteria.',
            'type' => 'exam',
        ]);

        // Complete reading, video, practice to unlock exam
        $this->post(route('student.reading.complete', [$this->class->id, $this->lesson->id]));
        $this->post(route('student.video.complete', [$this->class->id, $this->lesson->id]));
        for ($i = 1; $i <= 10; $i++) {
            $this->post(route('student.practice.record', [$this->class->id, $this->lesson->id]));
        }

        // Access exam - total 2 questions (1 quiz + 1 essay)
        $examResponse = $this->get(route('student.class.exam', $this->class->id));
        $examResponse->assertStatus(200);
        $examResponse->assertInertia(fn ($page) =>
            $page->component('Student/ClassExam')
                ->where('classItem.id', $this->class->id)
                ->where('totalQuestions', 2)
        );

        // Submit quiz question
        $submitQuizResponse = $this->postJson(route('student.class.exam.question-submit', $this->class->id), [
            'question_id' => $this->question->id,
            'chosen_option' => 'C',
        ]);
        $submitQuizResponse->assertJson([
            'question_id' => $this->question->id,
            'question_type' => 'quiz',
            'is_correct' => true,
            'is_exam_completed' => false,
            'answered_count' => 1,
        ]);

        // Submit essay question
        $submitEssayResponse = $this->postJson(route('student.class.exam.question-submit', $this->class->id), [
            'question_id' => $essayQuestion->id,
            'essay_answer' => 'The four noble truths explain suffering, its origin in craving, its cessation in Nibbana, and the eightfold path.',
        ]);
        $submitEssayResponse->assertJson([
            'question_id' => $essayQuestion->id,
            'question_type' => 'essay',
            'is_correct' => true,
            'is_exam_completed' => true,
            'answered_count' => 2,
        ]);

        // Verify class status completed
        $this->assertDatabaseHas('class_user', [
            'class_id' => $this->class->id,
            'user_id' => $this->student->id,
            'status' => 'completed',
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

    public function test_teacher_can_view_student_exam_result_with_quizzes_and_essays(): void
    {
        $this->actingAs($this->teacher);

        // Create an essay question for the course
        $essayQuestion = Question::create([
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson->id,
            'question_type' => Question::TYPE_ESSAY,
            'question_text' => 'Describe the practice of mindfulness of breathing.',
            'explanation' => 'Anapanasati sutta reference criteria.',
            'type' => 'exam',
        ]);

        // Student submits exam attempt
        StudentExamAttempt::create([
            'user_id' => $this->student->id,
            'class_id' => $this->class->id,
            'attempt_type' => 'exam',
            'total_questions' => 2,
            'correct_count' => 1,
            'incorrect_count' => 1,
            'score' => 50.0,
            'answers_summary' => [
                $this->question->id => [
                    'question_type' => 'quiz',
                    'chosen' => 'C',
                    'correct' => 'C',
                    'is_correct' => true,
                    'explanation' => $this->question->explanation,
                ],
                $essayQuestion->id => [
                    'question_type' => 'essay',
                    'essay_answer' => 'Mindfulness of breathing involves observing in-and-out breaths with clear comprehension.',
                    'is_correct' => false,
                    'score' => null,
                ],
            ],
        ]);

        $response = $this->getJson(route('admin.classes.student-exam-result', [$this->class->id, $this->student->id]));
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'student' => ['id', 'name', 'username', 'email'],
            'exam_attempt' => ['id', 'score', 'total_questions', 'correct_count', 'incorrect_count'],
            'questions' => [
                '*' => ['id', 'question_type', 'question_text', 'is_answered', 'chosen_option', 'essay_answer'],
            ],
            'metrics' => ['total_questions', 'answered_count', 'quiz_count', 'essay_count', 'quizzes_correct', 'essays_pending'],
        ]);

        $response->assertJson([
            'metrics' => [
                'total_questions' => 2,
                'quiz_count' => 1,
                'essay_count' => 1,
                'quizzes_correct' => 1,
                'essays_pending' => 1,
            ],
        ]);
    }

    public function test_teacher_can_grade_student_essay_question_and_recalculate_score(): void
    {
        $this->actingAs($this->teacher);

        // Create an essay question for the course
        $essayQuestion = Question::create([
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson->id,
            'question_type' => Question::TYPE_ESSAY,
            'question_text' => 'Describe the practice of mindfulness of breathing.',
            'explanation' => 'Anapanasati sutta reference criteria.',
            'type' => 'exam',
        ]);

        // Student submits exam attempt with quiz correct and essay pending
        StudentExamAttempt::create([
            'user_id' => $this->student->id,
            'class_id' => $this->class->id,
            'attempt_type' => 'exam',
            'total_questions' => 2,
            'correct_count' => 1,
            'incorrect_count' => 1,
            'score' => 50.0,
            'answers_summary' => [
                $this->question->id => [
                    'question_type' => 'quiz',
                    'chosen' => 'C',
                    'correct' => 'C',
                    'is_correct' => true,
                    'explanation' => $this->question->explanation,
                ],
                $essayQuestion->id => [
                    'question_type' => 'essay',
                    'essay_answer' => 'Mindfulness of breathing calm bodily formations.',
                    'is_correct' => false,
                    'score' => null,
                ],
            ],
        ]);

        // Teacher grades essay with 90 points out of 100
        $gradeResponse = $this->postJson(route('admin.classes.grade-essay', [$this->class->id, $this->student->id]), [
            'question_id' => $essayQuestion->id,
            'score' => 90,
            'feedback' => 'Well expressed explanation of bodily formations.',
        ]);

        $gradeResponse->assertStatus(200);
        $gradeResponse->assertJson([
            'question_id' => $essayQuestion->id,
            'score' => 90.0,
            'teacher_feedback' => 'Well expressed explanation of bodily formations.',
            'overall_score' => 95.0, // (100 + 90) / 2 = 95.0%
        ]);

        // Verify StudentExamAttempt record updated
        $attempt = StudentExamAttempt::where('user_id', $this->student->id)->where('class_id', $this->class->id)->first();
        $this->assertEquals(95.0, (float) $attempt->score);
        $this->assertEquals(2, $attempt->correct_count);
        $this->assertEquals(90.0, (float) $attempt->answers_summary[$essayQuestion->id]['score']);

        // Verify class_user final_grade updated
        $this->assertDatabaseHas('class_user', [
            'class_id' => $this->class->id,
            'user_id' => $this->student->id,
            'final_grade' => 95.0,
        ]);
    }

    public function test_student_cannot_grade_essay_questions(): void
    {
        $this->actingAs($this->student);

        $response = $this->postJson(route('admin.classes.grade-essay', [$this->class->id, $this->student->id]), [
            'question_id' => $this->question->id,
            'score' => 100,
        ]);

        $response->assertStatus(403);
    }

    public function test_class_final_exam_with_duration_calculates_remaining_seconds_and_blocks_expired_attempt(): void
    {
        $this->actingAs($this->student);

        // Set course exam duration to 30 minutes
        $this->course->update(['exam_duration_minutes' => 30]);

        // Complete lesson progression to unlock exam
        StudentProgress::create([
            'user_id' => $this->student->id,
            'lesson_id' => $this->lesson->id,
            'class_id' => $this->class->id,
            'reading_completed' => true,
            'video_completed' => true,
            'practice_completed' => true,
            'is_completed' => true,
        ]);

        // 1. Visit exam page: attempt should be auto-created and remainingSeconds calculated
        $response = $this->get(route('student.class.exam', $this->class->id));
        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Student/ClassExam')
                ->where('examDurationMinutes', 30)
                ->where('isTimeExpired', false)
                ->where('remainingSeconds', fn ($sec) => $sec > 1750 && $sec <= 1800)
        );

        // 2. Fast-forward attempt created_at to 35 minutes ago (expired)
        $attempt = StudentExamAttempt::where('user_id', $this->student->id)
            ->where('class_id', $this->class->id)
            ->where('attempt_type', 'exam')
            ->first();
        $attempt->created_at = now()->subMinutes(35);
        $attempt->save();

        // 3. Visiting exam page now should show isTimeExpired true and 0 remainingSeconds
        $expiredResponse = $this->get(route('student.class.exam', $this->class->id));
        $expiredResponse->assertOk();
        $expiredResponse->assertInertia(fn ($page) =>
            $page->component('Student/ClassExam')
                ->where('isTimeExpired', true)
                ->where('remainingSeconds', 0)
        );

        // 4. Submitting an answer on expired exam should be rejected with 403
        $submitResponse = $this->postJson(route('student.class.exam.question-submit', $this->class->id), [
            'question_id' => $this->question->id,
            'chosen_option' => 'C',
        ]);
        $submitResponse->assertStatus(403);
        $submitResponse->assertJson(['time_expired' => true]);
    }
}


