<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LocalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_shares_english_translations_by_default(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->where('locale', 'en')
            ->where('translations.classes.open_new_class', 'Open New Class')
            ->where('translations.classes.active_classes', 'Active Classes')
            ->where('translations.classes.create_modal_title', 'Open New Class')
            ->where('translations.classes.subject_curriculum', 'Subject & Curriculum')
            ->where('translations.classes.enrollment_status', 'Enrollment & Status')
            ->where('translations.student.learning_path_title', 'Buddhist Learning Path')
            ->where('translations.setup.heading', 'Setup Administrator Account')
            ->where('translations.home.system_title', 'Buddhist Courses')
            ->where('translations.materials.page_title', 'Materials Management - Buddhist Courses')
            ->where('translations.materials.header_title', 'Materials & Lecture Videos')
            ->where('translations.auth.sign_in_title', 'Sign In - Buddhist Courses')
            ->where('translations.profile.title', 'Profile')
            ->where('translations.nav.dashboard', 'Dashboard')
            ->where('translations.nav.profile', 'Profile')
            ->where('translations.nav.log_out', 'Log Out')
            ->where('translations.nav.home', 'Home')
            ->where('translations.nav.login_register', 'Sign In / Register')
            ->where('translations.nav.buddhist_courses', 'Buddhist Courses')
        );
    }

    public function test_dashboard_shares_vietnamese_translations_when_session_locale_is_vi(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)
            ->withSession(['locale' => 'vi'])
            ->get(route('admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->where('locale', 'vi')
            ->where('translations.classes.open_new_class', 'Mở lớp mới')
            ->where('translations.classes.active_classes', 'Đang học')
            ->where('translations.classes.create_modal_title', 'Mở Lớp Học Mới')
            ->where('translations.classes.subject_curriculum', 'Môn học & Chương trình')
            ->where('translations.classes.enrollment_status', 'Ghi danh & Trạng thái')
            ->where('translations.student.learning_path_title', 'Lộ Trình Tu Học')
            ->where('translations.setup.heading', 'Thiết Lập Tài Khoản Quản Trị Viên')
            ->where('translations.home.system_title', 'Buddhist Courses')
            ->where('translations.materials.page_title', 'Quản lý Học liệu - Khóa học Phật pháp')
            ->where('translations.materials.header_title', 'Học liệu & Video Bài giảng')
            ->where('translations.auth.sign_in_title', 'Đăng Nhập - Khóa học Phật pháp')
            ->where('translations.profile.title', 'Hồ sơ cá nhân')
            ->where('translations.nav.dashboard', 'Bảng điều khiển')
            ->where('translations.nav.profile', 'Hồ sơ cá nhân')
            ->where('translations.nav.log_out', 'Đăng xuất')
            ->where('translations.nav.home', 'Trang chủ')
            ->where('translations.nav.login_register', 'Đăng nhập / Đăng ký')
            ->where('translations.nav.buddhist_courses', 'Khóa Học Phật Pháp')
        );
    }
}
