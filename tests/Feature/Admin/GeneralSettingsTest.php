<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use App\Models\Course;
use App\Models\CourseClass;
use App\Models\Lesson;
use App\Models\Setting;
use App\Models\StudentProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GeneralSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get(route('admin.settings.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_student_cannot_access_general_settings(): void
    {
        $student = User::factory()->create([
            'role' => 'student',
        ]);

        $response = $this->actingAs($student)->get(route('admin.settings.index'));

        $response->assertRedirect(route('student.dashboard'));
    }

    public function test_teacher_cannot_access_general_settings(): void
    {
        $teacher = User::factory()->create([
            'role' => 'teacher',
        ]);

        $response = $this->actingAs($teacher)->get(route('admin.settings.index'));

        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_admin_can_view_general_settings_page(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.settings.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Settings/Index')
            ->has('settings.practice_repetition_target')
            ->has('settings.max_classes_per_student')
        );
    }

    public function test_admin_can_update_general_settings(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.settings.update'), [
            'practice_repetition_target' => 7,
            'max_classes_per_student' => 3,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals(7, Setting::getPracticeTarget());
        $this->assertEquals(3, Setting::getMaxClassesPerStudent());
    }

    public function test_settings_validation_rejects_invalid_values(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.settings.update'), [
            'practice_repetition_target' => 0, // must be at least 1
            'max_classes_per_student' => -1, // must be >= 0
        ]);

        $response->assertSessionHasErrors(['practice_repetition_target', 'max_classes_per_student']);
    }

    public function test_configured_practice_target_is_enforced_when_recording_practice_attempt(): void
    {
        // Set practice target to 3 repetitions
        Setting::set('practice_repetition_target', 3);

        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);

        $course = Course::create([
            'title' => 'Sample Dhamma Course',
            'slug' => 'sample-dhamma-course',
            'category' => 'Buddhism',
            'user_id' => $teacher->id,
        ]);

        $class = CourseClass::create([
            'course_id' => $course->id,
            'name' => 'Cohort 2026',
            'user_id' => $teacher->id,
        ]);

        $lesson = Lesson::create([
            'course_id' => $course->id,
            'title' => 'Lesson 1',
            'slug' => 'lesson-1',
            'order' => 1,
        ]);

        // Student completes reading & video
        $progress = StudentProgress::create([
            'user_id' => $student->id,
            'class_id' => $class->id,
            'lesson_id' => $lesson->id,
            'reading_completed' => true,
            'video_completed' => true,
            'practice_count' => 0,
            'practice_completed' => false,
            'is_completed' => false,
        ]);

        // Record 1st practice
        $this->actingAs($student)->post(route('student.practice.record', [$class->id, $lesson->id]));
        $this->assertEquals(1, $progress->fresh()->practice_count);
        $this->assertFalse($progress->fresh()->is_completed);

        // Record 2nd practice
        $this->actingAs($student)->post(route('student.practice.record', [$class->id, $lesson->id]));
        $this->assertEquals(2, $progress->fresh()->practice_count);
        $this->assertFalse($progress->fresh()->is_completed);

        // Record 3rd practice (meets target of 3!)
        $this->actingAs($student)->post(route('student.practice.record', [$class->id, $lesson->id]));
        $this->assertEquals(3, $progress->fresh()->practice_count);
        $this->assertTrue($progress->fresh()->practice_completed);
        $this->assertTrue($progress->fresh()->is_completed);
    }

    public function test_configured_max_classes_per_student_prevents_enrolling_excessive_classes(): void
    {
        // Limit student to max 2 classes
        Setting::set('max_classes_per_student', 2);

        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create(['role' => 'student']);

        $course = Course::create([
            'title' => 'Dhamma Studies',
            'slug' => 'dhamma-studies',
            'category' => 'Buddhism',
            'user_id' => $admin->id,
        ]);

        $class1 = CourseClass::create(['course_id' => $course->id, 'name' => 'Class A', 'user_id' => $admin->id]);
        $class2 = CourseClass::create(['course_id' => $course->id, 'name' => 'Class B', 'user_id' => $admin->id]);
        $class3 = CourseClass::create(['course_id' => $course->id, 'name' => 'Class C', 'user_id' => $admin->id]);

        // Enroll in class 1
        $res1 = $this->actingAs($admin)->post(route('admin.classes.add-student', $class1->id), [
            'user_id' => $student->id,
        ]);
        $res1->assertSessionHas('success');
        $this->assertEquals(1, $student->enrolledClasses()->count());

        // Enroll in class 2
        $res2 = $this->actingAs($admin)->post(route('admin.classes.add-student', $class2->id), [
            'user_id' => $student->id,
        ]);
        $res2->assertSessionHas('success');
        $this->assertEquals(2, $student->enrolledClasses()->count());

        // Attempt to enroll in class 3 (should be blocked by limit)
        $res3 = $this->actingAs($admin)->post(route('admin.classes.add-student', $class3->id), [
            'user_id' => $student->id,
        ]);
        $res3->assertSessionHas('error');
        $this->assertEquals(2, $student->enrolledClasses()->count());
    }
}
