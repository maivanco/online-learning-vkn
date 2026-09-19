<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AdminSetupController extends Controller
{
    /**
     * Show the initial administrator setup screen.
     * If an administrator already exists, redirect to login.
     */
    public function create(): Response|RedirectResponse
    {
        if (User::where('role', 'admin')->exists()) {
            return redirect()->route('login')->with('status', 'Tài khoản Quản trị viên đã tồn tại. Vui lòng đăng nhập.');
        }

        return Inertia::render('Auth/SetupAdmin');
    }

    /**
     * Store the first administrator account and log in.
     */
    public function store(Request $request): RedirectResponse
    {
        if (User::where('role', 'admin')->exists()) {
            return redirect()->route('login')->with('status', 'Tài khoản Quản trị viên đã tồn tại. Vui lòng đăng nhập.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'username' => ['nullable', 'string', 'max:50', 'unique:users,username'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ], [
            'name.required' => 'Vui lòng nhập họ và tên quản trị viên.',
            'email.required' => 'Vui lòng nhập địa chỉ email.',
            'email.email' => 'Địa chỉ email không hợp lệ.',
            'email.unique' => 'Địa chỉ email này đã được sử dụng.',
            'username.unique' => 'Tên đăng nhập này đã được sử dụng.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.confirmed' => 'Xác nhận mật khẩu không trùng khớp.',
        ]);

        $admin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => ! empty($validated['username']) ? $validated['username'] : null,
            'phone' => ! empty($validated['phone']) ? $validated['phone'] : null,
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
            'status' => 'active',
        ]);

        event(new Registered($admin));

        Auth::login($admin);

        return redirect()->route('admin.dashboard')->with('success', 'Admin setup completed successfully!');
    }
}
