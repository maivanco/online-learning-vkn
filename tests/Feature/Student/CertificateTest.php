<?php

namespace Tests\Feature\Student;

use App\Models\Course;
use App\Models\CourseClass;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CertificateTest extends TestCase
{
    use RefreshDatabase;

    public function test_graduated_student_can_view_certificate(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student', 'status' => 'active']);

        $course = Course::create([
            'title' => 'Kinh Trung Bộ Căn Bản',
            'slug' => 'kinh-trung-bo-can-ban',
            'category' => 'dhamma',
            'description' => 'Khóa học kinh văn Trung Bộ',
            'user_id' => $teacher->id,
        ]);

        $class = CourseClass::create([
            'course_id' => $course->id,
            'user_id' => $teacher->id,
            'name' => 'Lớp Trung Bộ K01',
        ]);

        // Enroll and mark as completed
        $student->enrolledClasses()->attach($class->id, [
            'status' => 'completed',
            'enrolled_at' => now()->subMonths(2),
            'completed_at' => now(),
            'final_grade' => 95.5,
        ]);

        $response = $this->actingAs($student)->get(route('student.class.certificate', $class->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Student/Certificate')
            ->has('classItem')
            ->has('student')
            ->has('certificate')
            ->where('student.id', $student->id)
            ->where('classItem.id', $class->id)
            ->where('certificate.final_grade', 95.5)
            ->where('certificate.classification', 'distinction')
        );
    }

    public function test_non_graduated_student_cannot_view_certificate(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student', 'status' => 'active']);

        $course = Course::create([
            'title' => 'Luật Tạng Căn Bản',
            'slug' => 'luat-tang-can-ban',
            'category' => 'vinaya',
            'description' => 'Giới luật tu viện',
            'user_id' => $teacher->id,
        ]);

        $class = CourseClass::create([
            'course_id' => $course->id,
            'user_id' => $teacher->id,
            'name' => 'Lớp Tỳ Kheo Ni K01',
        ]);

        // Student still studying (not completed)
        $student->enrolledClasses()->attach($class->id, [
            'status' => 'enrolled',
            'enrolled_at' => now()->subDays(10),
        ]);

        $response = $this->actingAs($student)->get(route('student.class.certificate', $class->id));

        $response->assertRedirect(route('student.dashboard'));
        $response->assertSessionHas('error');
    }

    public function test_admin_can_inspect_student_certificate(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student', 'status' => 'active']);

        $course = Course::create([
            'title' => 'Vi Diệu Pháp Căn Bản',
            'slug' => 'vi-dieu-phap-can-ban',
            'category' => 'abhidhamma',
            'description' => 'Tâm và Tâm sở',
            'user_id' => $teacher->id,
        ]);

        $class = CourseClass::create([
            'course_id' => $course->id,
            'user_id' => $teacher->id,
            'name' => 'Lớp Abhidhamma K01',
        ]);

        $student->enrolledClasses()->attach($class->id, [
            'status' => 'completed',
            'enrolled_at' => now()->subMonths(3),
            'completed_at' => now()->subDay(),
            'final_grade' => 88.0,
        ]);

        $response = $this->actingAs($admin)->get(route('student.class.certificate', [
            'classId' => $class->id,
            'student_id' => $student->id,
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Student/Certificate')
            ->where('student.id', $student->id)
            ->where('certificate.classification', 'merit')
        );
    }
}
