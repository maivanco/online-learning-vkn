<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminSetupTest extends TestCase
{
    use RefreshDatabase;

    public function test_setup_screen_can_be_rendered_when_no_admin_exists(): void
    {
        $response = $this->get('/setup');

        $response->assertStatus(200);
    }

    public function test_first_user_can_setup_admin_account(): void
    {
        $response = $this->post('/setup', [
            'name' => 'Initial Abbot Admin',
            'email' => 'admin@vienkhongni.vn',
            'username' => 'admin',
            'phone' => '0901234567',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('admin.dashboard'));

        $this->assertDatabaseHas('users', [
            'name' => 'Initial Abbot Admin',
            'email' => 'admin@vienkhongni.vn',
            'role' => 'admin',
            'status' => 'active',
        ]);
    }

    public function test_setup_screen_redirects_to_login_when_admin_already_exists(): void
    {
        User::create([
            'name' => 'Existing Admin',
            'email' => 'existing@vienkhongni.vn',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $response = $this->get('/setup');

        $response->assertRedirect(route('login'));
    }

    public function test_setup_submission_rejected_when_admin_already_exists(): void
    {
        User::create([
            'name' => 'Existing Admin',
            'email' => 'existing@vienkhongni.vn',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $response = $this->post('/setup', [
            'name' => 'Intruder Admin',
            'email' => 'intruder@vienkhongni.vn',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertRedirect(route('login'));

        $this->assertDatabaseMissing('users', [
            'email' => 'intruder@vienkhongni.vn',
        ]);
    }

    public function test_login_screen_redirects_to_setup_when_no_admin_exists(): void
    {
        $response = $this->get('/login');

        $response->assertRedirect(route('setup'));
    }

    public function test_login_screen_renders_when_admin_exists(): void
    {
        User::create([
            'name' => 'Existing Admin',
            'email' => 'existing@vienkhongni.vn',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $response = $this->get('/login');

        $response->assertStatus(200);
    }
}
