<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class QuestionBankTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $teacher;
    protected User $student;
    protected Course $course;
    protected Lesson $lesson1;
    protected Lesson $lesson2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Main Administrator',
            'email' => 'admin@vienkhongni.vn',
            'username' => 'admin',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->teacher = User::create([
            'name' => 'Sayalay Teacher',
            'email' => 'teacher@vienkhongni.vn',
            'username' => 'teacher',
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

        $this->course = Course::create([
            'title' => 'Suttanta Pitaka (Kinh Tạng)',
            'slug' => 'suttanta-pitaka',
            'category' => 'sutta',
        ]);

        $this->lesson1 = Lesson::create([
            'course_id' => $this->course->id,
            'title' => 'Lesson 1: Mangala Sutta (Kinh Điềm Lành)',
            'slug' => 'lesson-1-mangala-sutta',
            'order' => 1,
        ]);

        $this->lesson2 = Lesson::create([
            'course_id' => $this->course->id,
            'title' => 'Lesson 2: Ratana Sutta (Kinh Châu Báu)',
            'slug' => 'lesson-2-ratana-sutta',
            'order' => 2,
        ]);
    }

    public function test_admin_can_view_questions_list_and_filter_by_type(): void
    {
        Question::create([
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson1->id,
            'question_type' => Question::TYPE_QUIZ,
            'question_text' => 'What is the highest protection according to Mangala Sutta?',
            'option_a' => 'Not associating with fools',
            'option_b' => 'Sleeping well',
            'option_c' => 'Trading goods',
            'option_d' => 'Traveling far',
            'correct_option' => 'A',
            'explanation' => 'Asevana ca balanam panditanan ca sevana.',
            'type' => 'both',
        ]);

        Question::create([
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson1->id,
            'question_type' => Question::TYPE_ESSAY,
            'question_text' => 'Explain the practical application of the 38 Blessings in daily life.',
            'explanation' => 'Students should present how spiritual ethics transform mental disposition.',
            'type' => 'both',
        ]);

        $this->actingAs($this->admin);

        $response = $this->get(route('admin.questions.index', [
            'course_id' => $this->course->id,
            'question_type' => 'all',
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Questions/Index')
            ->has('questions', 2)
            ->where('questions.0.question_type', Question::TYPE_ESSAY)
            ->where('questions.1.question_type', Question::TYPE_QUIZ)
            ->where('counts.all', 2)
            ->where('counts.quiz', 1)
            ->where('counts.essay', 1)
        );

        // Filter essay only - counts should still reflect total 2 (1 quiz, 1 essay)
        $essayResponse = $this->get(route('admin.questions.index', [
            'course_id' => $this->course->id,
            'question_type' => 'essay',
        ]));

        $essayResponse->assertStatus(200);
        $essayResponse->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Questions/Index')
            ->has('questions', 1)
            ->where('questions.0.question_type', Question::TYPE_ESSAY)
            ->where('counts.all', 2)
            ->where('counts.quiz', 1)
            ->where('counts.essay', 1)
        );
    }

    public function test_admin_can_create_multiple_choice_quiz_question(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post(route('admin.questions.store'), [
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson1->id,
            'question_type' => 'quiz',
            'question_text' => 'How many verses are in Mangala Sutta?',
            'option_a' => '10',
            'option_b' => '12',
            'option_c' => '15',
            'option_d' => '20',
            'correct_option' => 'B',
            'explanation' => 'Mangala Sutta contains 12 gathas.',
            'type' => 'both',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('questions', [
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson1->id,
            'question_type' => 'quiz',
            'question_text' => 'How many verses are in Mangala Sutta?',
            'correct_option' => 'B',
        ]);
    }

    public function test_admin_can_create_essay_question_into_lesson(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post(route('admin.questions.store'), [
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson1->id,
            'question_type' => 'essay',
            'question_text' => 'Analyze the sequential structure of the 38 Blessings from mundane to supramundane.',
            'explanation' => 'Key aspects: Basic morality -> Domestic peace -> Higher mental development -> Realization of Nibbana.',
            'type' => 'both',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('questions', [
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson1->id,
            'question_type' => 'essay',
            'question_text' => 'Analyze the sequential structure of the 38 Blessings from mundane to supramundane.',
            'option_a' => null,
            'option_b' => null,
            'option_c' => null,
            'option_d' => null,
            'correct_option' => null,
        ]);
    }

    public function test_admin_can_update_essay_question(): void
    {
        $question = Question::create([
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson1->id,
            'question_type' => Question::TYPE_ESSAY,
            'question_text' => 'Original essay prompt',
            'explanation' => 'Original answer guide',
            'type' => 'practice',
        ]);

        $this->actingAs($this->admin);

        $response = $this->put(route('admin.questions.update', $question->id), [
            'lesson_id' => $this->lesson2->id,
            'question_type' => 'essay',
            'question_text' => 'Updated essay prompt for Ratana Sutta',
            'explanation' => 'Updated answer guide with gem virtues',
            'type' => 'both',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('questions', [
            'id' => $question->id,
            'lesson_id' => $this->lesson2->id,
            'question_type' => 'essay',
            'question_text' => 'Updated essay prompt for Ratana Sutta',
            'explanation' => 'Updated answer guide with gem virtues',
            'type' => 'both',
        ]);
    }

    public function test_admin_can_delete_question(): void
    {
        $question = Question::create([
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson1->id,
            'question_type' => Question::TYPE_ESSAY,
            'question_text' => 'Essay to delete',
            'type' => 'both',
        ]);

        $this->actingAs($this->admin);

        $response = $this->delete(route('admin.questions.destroy', $question->id));
        $response->assertRedirect();

        $this->assertDatabaseMissing('questions', [
            'id' => $question->id,
        ]);
    }

    public function test_quiz_question_validation_requires_options(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post(route('admin.questions.store'), [
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson1->id,
            'question_type' => 'quiz',
            'question_text' => 'Quiz without options',
            'type' => 'both',
        ]);

        $response->assertSessionHasErrors(['option_a', 'option_b', 'option_c', 'option_d', 'correct_option']);
    }

    public function test_admin_and_teacher_can_view_import_questions_page(): void
    {
        $this->actingAs($this->admin);

        $response = $this->get(route('admin.questions.import-view'));
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Questions/Import')
            ->has('courses')
            ->has('selectedCourseId')
        );

        $this->actingAs($this->teacher);
        $teacherResponse = $this->get(route('admin.questions.import-view'));
        $teacherResponse->assertStatus(200);
    }

    public function test_admin_and_teacher_can_download_question_import_template_excel(): void
    {
        $this->actingAs($this->admin);

        $response = $this->get(route('admin.questions.template'));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $this->assertStringContainsString('question_import_template.xlsx', (string) $response->headers->get('content-disposition'));

        // Teacher can also download
        $this->actingAs($this->teacher);
        $teacherResponse = $this->get(route('admin.questions.template'));
        $teacherResponse->assertStatus(200);
    }

    public function test_student_cannot_download_question_import_template(): void
    {
        $this->actingAs($this->student);

        $response = $this->get(route('admin.questions.template'));
        $response->assertRedirect(route('student.dashboard'));
    }

    public function test_admin_can_import_quiz_and_essay_questions_from_excel_into_lesson(): void
    {
        $this->actingAs($this->admin);

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Questions');

        // Headers (without lesson_id)
        $sheet->fromArray([
            'question_type', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'explanation', 'type'
        ], null, 'A1');

        // Row 2: Quiz Question
        $sheet->fromArray([
            'quiz', 'What is the First Noble Truth?', 'Suffering', 'Origin', 'Cessation', 'Path', 'A', 'Dukkha Sacca', 'both'
        ], null, 'A2');

        // Row 3: Essay Question
        $sheet->fromArray([
            'essay', 'Explain the significance of the Four Noble Truths.', '', '', '', '', '', 'Rubric: Understand suffering, origin, cessation, path.', 'exam'
        ], null, 'A3');

        $tempPath = tempnam(sys_get_temp_dir(), 'test_import_') . '.xlsx';
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $writer->save($tempPath);

        $uploadedFile = new \Illuminate\Http\UploadedFile(
            $tempPath,
            'questions.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $response = $this->post(route('admin.questions.import'), [
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson1->id,
            'file' => $uploadedFile,
        ]);

        $response->assertRedirect(route('admin.questions.index', [
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson1->id,
        ]));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('questions', [
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson1->id,
            'question_type' => 'quiz',
            'question_text' => 'What is the First Noble Truth?',
            'correct_option' => 'A',
            'type' => 'both',
        ]);

        $this->assertDatabaseHas('questions', [
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson1->id,
            'question_type' => 'essay',
            'question_text' => 'Explain the significance of the Four Noble Truths.',
            'type' => 'exam',
        ]);

        if (file_exists($tempPath)) {
            unlink($tempPath);
        }
    }

    public function test_import_validation_requires_mandatory_lesson_id(): void
    {
        $this->actingAs($this->admin);

        $tempPath = tempnam(sys_get_temp_dir(), 'test_import_') . '.xlsx';
        file_put_contents($tempPath, 'dummy');

        $uploadedFile = new \Illuminate\Http\UploadedFile(
            $tempPath,
            'questions.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $response = $this->post(route('admin.questions.import'), [
            'course_id' => $this->course->id,
            // 'lesson_id' is missing
            'file' => $uploadedFile,
        ]);

        $response->assertSessionHasErrors(['lesson_id']);

        if (file_exists($tempPath)) {
            unlink($tempPath);
        }
    }

    public function test_import_validation_fails_for_invalid_quiz_options(): void
    {
        $this->actingAs($this->admin);

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Questions');

        $sheet->fromArray([
            'question_type', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'explanation', 'type'
        ], null, 'A1');

        // Row 2: Quiz with missing Option C and invalid correct option 'Z'
        $sheet->fromArray([
            'quiz', 'Incomplete quiz question', 'A text', 'B text', '', 'D text', 'Z', 'Explanation', 'both'
        ], null, 'A2');

        $tempPath = tempnam(sys_get_temp_dir(), 'test_import_invalid_') . '.xlsx';
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $writer->save($tempPath);

        $uploadedFile = new \Illuminate\Http\UploadedFile(
            $tempPath,
            'questions.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $response = $this->post(route('admin.questions.import'), [
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson1->id,
            'file' => $uploadedFile,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $response->assertSessionHas('import_errors');

        $this->assertDatabaseMissing('questions', [
            'question_text' => 'Incomplete quiz question',
        ]);

        if (file_exists($tempPath)) {
            unlink($tempPath);
        }
    }
}

