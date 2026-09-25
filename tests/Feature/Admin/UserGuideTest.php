<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserGuideTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get(route('admin.user-guides.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_student_cannot_access_admin_user_guides(): void
    {
        $student = User::factory()->create([
            'role' => 'student',
        ]);

        $response = $this->actingAs($student)->get(route('admin.user-guides.index'));

        $response->assertRedirect(route('student.dashboard'));
    }

    public function test_admin_can_view_user_guides_page(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.user-guides.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/UserGuides/Index')
            ->has('documents')
            ->has('activeSlug')
            ->has('activeTitle')
            ->has('contentHtml')
            ->has('toc')
            ->has('readingTime')
        );
    }

    public function test_teacher_can_view_user_guides_page(): void
    {
        $teacher = User::factory()->create([
            'role' => 'teacher',
        ]);

        $response = $this->actingAs($teacher)->get(route('admin.user-guides.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/UserGuides/Index')
            ->where('activeSlug', '01-overview')
        );
    }

    public function test_user_can_switch_documents_via_query_param(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.user-guides.index', ['doc' => '02-teacher-guide']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/UserGuides/Index')
            ->where('activeSlug', '02-teacher-guide')
        );
    }
}
