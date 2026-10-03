<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        User::factory()->create(['role' => 'admin']);

        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_layperson_student_registers_with_pending_status_and_requires_admin_approval(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);

        // 1. Student registers
        $response = $this->post('/register', [
            'full_name' => 'Nguyen Van A',
            'date_of_birth' => '1995-05-15',
            'gender' => 'male',
            'phone' => '0912345678',
            'email' => 'student1@example.com',
            'refuge_in_triple_gem' => true,
            'dharma_name' => 'Tam An',
            'student_type' => 'layperson',
            'study_purposes' => ['basic_buddhist_studies', 'pali_canon_studies'],
            'buddhist_study_level' => 'beginner',
            'previous_buddhist_programs' => 'Khoa tu mua he',
            'username' => 'student1',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'confirm_information' => true,
            'agree_to_rules' => true,
        ]);

        // Registration redirects to login with pending notification
        $response->assertRedirect(route('login'));
        $this->assertGuest();

        $user = User::where('email', 'student1@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('Nguyen Van A', $user->name);
        $this->assertEquals('student1', $user->username);
        $this->assertEquals('student', $user->role);
        $this->assertEquals('pending', $user->status);

        $this->assertNotNull($user->studentProfile);
        $this->assertEquals('layperson', $user->studentProfile->student_type);
        $this->assertEquals('1995-05-15', $user->studentProfile->date_of_birth->format('Y-m-d'));
        $this->assertTrue($user->studentProfile->refuge_in_triple_gem);
        $this->assertEquals(['basic_buddhist_studies', 'pali_canon_studies'], $user->studentProfile->study_purposes);

        // 2. Pending student tries to login -> Should be blocked with pending message
        $loginResponse = $this->post('/login', [
            'login' => 'student1',
            'password' => 'Password123!',
        ]);

        $this->assertGuest();
        $loginResponse->assertSessionHasErrors(['login']);

        // 3. Admin reviews and approves the account
        $approveResponse = $this->actingAs($admin)->patch(route('admin.users.approve', $user->id));
        $approveResponse->assertSessionHas('success');

        $this->assertEquals('active', $user->fresh()->status);

        // 4. Once approved, student can log in and access dashboard
        $this->post('/logout');
        $approvedLoginResponse = $this->post('/login', [
            'login' => 'student1',
            'password' => 'Password123!',
        ]);

        $this->assertAuthenticatedAs($user);
        $approvedLoginResponse->assertRedirect(RouteServiceProvider::HOME);
    }

    public function test_new_monastic_student_can_register_with_pending_status(): void
    {
        User::factory()->create(['role' => 'admin']);

        $response = $this->post('/register', [
            'full_name' => 'Thich Nu Nhu Tam',
            'date_of_birth' => '1990-01-01',
            'gender' => 'female',
            'phone' => '0987654321',
            'email' => 'monastic@example.com',
            'refuge_in_triple_gem' => true,
            'dharma_name' => 'Nhu Tam',
            'student_type' => 'monastic',
            'ordination_status' => 'bhikkhuni',
            'ordination_date' => '2015-06-01',
            'ordination_place' => 'Dai Gioi Dan Hue Dang',
            'preceptor_teacher' => 'Ni truong Thich Nu Nhu Hai',
            'current_residence' => 'Chua Tu Nghiem',
            'study_purposes' => ['pali_canon_studies', 'other'],
            'other_study_purpose' => 'Nghien cuu phat phap chuyen sau',
            'buddhist_study_level' => 'previously_studied',
            'username' => 'nhutam_bhikkhuni',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'confirm_information' => true,
            'agree_to_rules' => true,
        ]);

        $response->assertRedirect(route('login'));
        $this->assertGuest();

        $user = User::where('email', 'monastic@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('pending', $user->status);
        $this->assertNotNull($user->studentProfile);
        $this->assertEquals('monastic', $user->studentProfile->student_type);
        $this->assertEquals('bhikkhuni', $user->studentProfile->ordination_status);
        $this->assertEquals('Chua Tu Nghiem', $user->studentProfile->current_residence);
        $this->assertEquals('Nghien cuu phat phap chuyen sau', $user->studentProfile->other_study_purpose);
    }

    public function test_registration_requires_confirmations_and_validations(): void
    {
        User::factory()->create(['role' => 'admin']);

        $response = $this->post('/register', [
            'full_name' => 'A',
            'email' => 'invalid-email',
            'student_type' => 'monastic',
        ]);

        $response->assertSessionHasErrors([
            'full_name',
            'date_of_birth',
            'gender',
            'phone',
            'email',
            'refuge_in_triple_gem',
            'ordination_status',
            'ordination_date',
            'ordination_place',
            'preceptor_teacher',
            'current_residence',
            'study_purposes',
            'buddhist_study_level',
            'username',
            'password',
            'confirm_information',
            'agree_to_rules',
        ]);
    }
}
