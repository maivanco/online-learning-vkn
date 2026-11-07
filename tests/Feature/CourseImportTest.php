<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use App\Services\CourseImportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class CourseImportTest extends TestCase
{
    use RefreshDatabase;

    private function createSampleSpreadsheet(): UploadedFile
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        // Row 1: Headers
        $sheet->setCellValue('A1', 'MÔN HỌC');
        $sheet->setCellValue('B1', 'NỘI DUNG');
        $sheet->setCellValue('C1', 'LINK TÀI LIỆU ĐÍNH KÈM');

        // Row 2: Lesson 1
        $sheet->setCellValue('A2', 'Vi Diệu Pháp');
        $sheet->setCellValue('B2', "Buổi 1:\n\nPreface");
        $sheet->setCellValue('C2', "Video: https://youtu.be/sample1\nSlide (Từ trang 1-6): https://docs.google.com/presentation/d/sample1\nPreface with Vocab (PDF): https://drive.google.com/file/d/sample1/view");

        // Row 3: Lesson 2
        $sheet->setCellValue('A3', '');
        $sheet->setCellValue('B3', "Buổi 2:\n\nChapter 1: Types of Consciousness");
        $sheet->setCellValue('C3', "Video: https://youtu.be/sample2\nPDF Verse 01: https://drive.google.com/file/d/sample2/view");

        $tempPath = tempnam(sys_get_temp_dir(), 'test_course_').'.xlsx';
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        return new UploadedFile($tempPath, 'course_sample.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);
    }

    public function test_admin_can_preview_course_import(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $file = $this->createSampleSpreadsheet();

        $response = $this->actingAs($admin)
            ->postJson(route('admin.materials.import-preview'), [
                'file' => $file,
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('suggested_course_title', 'Vi Diệu Pháp')
            ->assertJsonPath('total_rows', 2);
    }

    public function test_admin_can_import_lessons_into_existing_course_with_field_mapping(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $course = Course::create([
            'title' => 'Abhidhamma',
            'slug' => 'abhidhamma-test',
            'category' => 'abhidhamma',
            'user_id' => $admin->id,
            'order' => 1,
        ]);
        $file = $this->createSampleSpreadsheet();

        $response = $this->actingAs($admin)
            ->post(route('admin.materials.import'), [
                'file' => $file,
                'course_mode' => 'existing',
                'course_id' => $course->id,
                'mappings' => [
                    'MÔN HỌC' => 'ignore',
                    'NỘI DUNG' => 'title',
                    'LINK TÀI LIỆU ĐÍNH KÈM' => 'document_urls',
                ],
            ]);

        $response->assertRedirect(route('admin.materials.index', ['course_id' => $course->id]));
        $response->assertSessionHas('success');

        $this->assertEquals(2, Lesson::where('course_id', $course->id)->count());

        $lesson1 = Lesson::where('course_id', $course->id)->where('order', 1)->first();
        $this->assertNotNull($lesson1);
        $this->assertEquals('Buổi 1: Preface', $lesson1->title);
        $this->assertEquals('https://youtu.be/sample1', $lesson1->video_url);
        $this->assertCount(2, $lesson1->document_urls);

        $lesson2 = Lesson::where('course_id', $course->id)->where('order', 2)->first();
        $this->assertNotNull($lesson2);
        $this->assertEquals('Buổi 2: Chapter 1: Types of Consciousness', $lesson2->title);
        $this->assertEquals('https://youtu.be/sample2', $lesson2->video_url);
        $this->assertCount(1, $lesson2->document_urls);
    }

    public function test_admin_can_import_lessons_and_create_new_course(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $file = $this->createSampleSpreadsheet();

        $response = $this->actingAs($admin)
            ->post(route('admin.materials.import'), [
                'file' => $file,
                'course_mode' => 'new',
                'new_course_title' => 'Vi Diệu Pháp Cơ Bản',
                'new_course_category' => 'abhidhamma',
                'new_course_description' => 'Khóa học Vi Diệu Pháp',
                'mappings' => [
                    'NỘI DUNG' => 'title',
                    'LINK TÀI LIỆU ĐÍNH KÈM' => 'document_urls',
                ],
            ]);

        $createdCourse = Course::where('title', 'Vi Diệu Pháp Cơ Bản')->first();
        $this->assertNotNull($createdCourse);
        $this->assertEquals('abhidhamma', $createdCourse->category);

        $response->assertRedirect(route('admin.materials.index', ['course_id' => $createdCourse->id]));
        $this->assertEquals(2, Lesson::where('course_id', $createdCourse->id)->count());
    }

    public function test_admin_can_download_sample_excel_template(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->get(route('admin.materials.template'));

        $response->assertOk();
        $response->assertHeader('Content-Disposition', 'attachment;filename="course_lessons_import_template.xlsx"');
    }

    public function test_admin_can_import_using_downloaded_template_with_comma_separated_urls(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $service = new CourseImportService;
        $spreadsheet = $service->generateTemplate();

        $tempPath = tempnam(sys_get_temp_dir(), 'test_tpl_').'.xlsx';
        (new Xlsx($spreadsheet))->save($tempPath);
        $file = new UploadedFile($tempPath, 'template.xlsx', null, null, true);

        $course = Course::create([
            'title' => 'Template Course Test',
            'slug' => 'template-course-test',
            'category' => 'abhidhamma',
            'user_id' => $admin->id,
            'order' => 1,
        ]);

        $response = $this->actingAs($admin)
            ->post(route('admin.materials.import'), [
                'file' => $file,
                'course_mode' => 'existing',
                'course_id' => $course->id,
                'mappings' => [
                    'order' => 'order',
                    'title' => 'title',
                    'summary' => 'summary',
                    'reading_content' => 'reading_content',
                    'video_urls' => 'video_urls',
                    'document_urls' => 'document_urls',
                ],
            ]);

        $response->assertRedirect(route('admin.materials.index', ['course_id' => $course->id]));
        $this->assertEquals(3, Lesson::where('course_id', $course->id)->count());

        $lesson1 = Lesson::where('course_id', $course->id)->where('order', 1)->first();
        $this->assertNotNull($lesson1);
        $this->assertEquals('Buổi 1: Preface - Lời Giới Thiệu', $lesson1->title);
        $this->assertCount(2, $lesson1->video_urls);
        $this->assertEquals('https://youtu.be/SRDO9zCX4eA', $lesson1->video_urls[0]['url']);
        $this->assertEquals('https://youtu.be/SRDO9zCX4eB', $lesson1->video_urls[1]['url']);

        $this->assertCount(3, $lesson1->document_urls);
        $this->assertEquals('https://docs.google.com/presentation/d/sample-slide-1', $lesson1->document_urls[0]['url']);
    }
}
