<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use App\Models\Course;
use App\Models\CourseClass;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserManagerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $teacher;
    protected User $student;
    protected CourseClass $class;

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
            'name' => 'Bhikkhuni Vien Tue',
            'email' => 'student@vienkhongni.vn',
            'username' => 'student',
            'phone' => '0912345678',
            'password' => Hash::make('password'),
            'role' => 'student',
            'status' => 'active',
        ]);

        $course = Course::create([
            'title' => 'Abhidhammattha Sangaha',
            'slug' => 'abhidhamma',
            'category' => 'Abhidhamma',
        ]);

        $this->class = CourseClass::create([
            'course_id' => $course->id,
            'name' => 'Abhidhamma Sangaha 2026',
            'code' => 'VNK-ADH-2601',
            'status' => 'active',
        ]);
    }

    public function test_admin_can_view_users_list(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.users.index'));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Users/Index')
                ->has('users.data', 3)
                ->where('counts.all', 3)
                ->where('counts.admin', 1)
                ->where('counts.teacher', 1)
                ->where('counts.student', 1)
            );
    }

    public function test_admin_can_filter_users_by_role(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.users.index', ['role' => 'teacher']));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Users/Index')
                ->has('users.data', 1)
                ->where('users.data.0.role', 'teacher')
            );
    }

    public function test_admin_can_search_users(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.users.index', ['search' => 'Vien Tue']));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Users/Index')
                ->has('users.data', 1)
                ->where('users.data.0.name', 'Bhikkhuni Vien Tue')
            );
    }

    public function test_admin_can_create_new_administrator(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('admin.users.store'), [
                'name' => 'Second Admin',
                'email' => 'admin2@vienkhongni.vn',
                'password' => 'secret123',
                'role' => 'admin',
                'phone' => '0988776655',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'name' => 'Second Admin',
            'email' => 'admin2@vienkhongni.vn',
            'role' => 'admin',
            'phone' => '0988776655',
        ]);
    }

    public function test_admin_can_create_new_teacher(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('admin.users.store'), [
                'name' => 'Dhammananda Bhikkhu',
                'email' => 'dhammananda@vienkhongni.vn',
                'password' => 'teacherpass',
                'role' => 'teacher',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'name' => 'Dhammananda Bhikkhu',
            'email' => 'dhammananda@vienkhongni.vn',
            'role' => 'teacher',
        ]);
    }

    public function test_admin_can_create_student_and_enroll_in_class(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('admin.users.store'), [
                'name' => 'New Student Devotee',
                'email' => 'newstudent@vienkhongni.vn',
                'password' => 'studentpass',
                'role' => 'student',
                'initial_class_id' => $this->class->id,
            ]);

        $response->assertRedirect();
        
        $newUser = User::where('email', 'newstudent@vienkhongni.vn')->first();
        $this->assertNotNull($newUser);
        $this->assertEquals('student', $newUser->role);
        $this->assertTrue($newUser->enrolledClasses()->where('classes.id', $this->class->id)->exists());
    }

    public function test_admin_can_update_user_details(): void
    {
        $response = $this->actingAs($this->admin)
            ->put(route('admin.users.update', $this->student->id), [
                'name' => 'Updated Student Name',
                'email' => 'updated_student@vienkhongni.vn',
                'role' => 'student',
                'phone' => '0999999999',
                'username' => 'updated_student',
                'status' => 'active',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $this->student->id,
            'name' => 'Updated Student Name',
            'email' => 'updated_student@vienkhongni.vn',
            'phone' => '0999999999',
            'username' => 'updated_student',
        ]);
    }

    public function test_cannot_demote_only_administrator(): void
    {
        $this->assertEquals(1, User::where('role', 'admin')->count());

        $response = $this->actingAs($this->admin)
            ->put(route('admin.users.update', $this->admin->id), [
                'name' => $this->admin->name,
                'email' => $this->admin->email,
                'role' => 'teacher', // Try demoting
                'status' => 'active',
            ]);

        $response->assertSessionHas('error');
        $this->assertEquals('admin', $this->admin->fresh()->role);
    }

    public function test_admin_can_update_user_password(): void
    {
        $response = $this->actingAs($this->admin)
            ->put(route('admin.users.password', $this->student->id), [
                'password' => 'newsecretpassword',
            ]);

        $response->assertRedirect();
        $this->assertTrue(Hash::check('newsecretpassword', $this->student->fresh()->password));
    }

    public function test_admin_cannot_delete_self(): void
    {
        $response = $this->actingAs($this->admin)
            ->delete(route('admin.users.destroy', $this->admin->id));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    }

    public function test_admin_cannot_delete_the_only_administrator(): void
    {
        // Even if another teacher acts or tries
        $response = $this->actingAs($this->teacher)
            ->delete(route('admin.users.destroy', $this->admin->id));

        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    }

    public function test_admin_can_delete_another_user(): void
    {
        $response = $this->actingAs($this->admin)
            ->delete(route('admin.users.destroy', $this->student->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('users', ['id' => $this->student->id]);
    }

    public function test_legacy_student_routes_backward_compatible(): void
    {
        // GET /admin/students redirects to /admin/users?role=student
        $response = $this->actingAs($this->admin)
            ->get(route('admin.students.index'));

        $response->assertRedirect(route('admin.users.index', ['role' => 'student']));

        // POST /admin/students stores new student
        $postResponse = $this->actingAs($this->admin)
            ->post(route('admin.students.store'), [
                'name' => 'Legacy Student',
                'email' => 'legacy@vienkhongni.vn',
                'password' => 'password123',
                'role' => 'student',
            ]);

        $postResponse->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'legacy@vienkhongni.vn']);
    }

    public function test_student_cannot_access_user_manager(): void
    {
        $response = $this->actingAs($this->student)
            ->get(route('admin.users.index'));

        $response->assertRedirect(route('student.dashboard'));
    }
}
