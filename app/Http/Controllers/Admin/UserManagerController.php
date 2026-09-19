<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserPasswordRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\CourseClass;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserManagerController extends Controller
{
    /**
     * Display users list with role filtering and search.
     */
    public function index(Request $request): Response
    {
        $role = (string) $request->query('role', 'all');
        $search = $request->query('search');

        $usersQuery = User::with(['enrolledClasses.course'])
            ->withCount('enrolledClasses');

        if ($role !== 'all' && in_array($role, ['admin', 'teacher', 'student'], true)) {
            $usersQuery->where('role', $role);
        }

        if (! empty($search)) {
            $usersQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $usersQuery->orderBy('id', 'desc')->paginate(15)->through(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'username' => $user->username,
            'phone' => $user->phone,
            'status' => $user->status,
            'created_at' => $user->created_at?->format('Y-m-d') ?? '',
            'classes_count' => $user->enrolled_classes_count,
            'classes' => $user->enrolledClasses->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'status' => $c->pivot->status,
            ]),
        ]);

        $counts = [
            'all' => User::count(),
            'admin' => User::where('role', 'admin')->count(),
            'teacher' => User::where('role', 'teacher')->count(),
            'student' => User::where('role', 'student')->count(),
        ];

        $availableClasses = CourseClass::where('status', '!=', 'completed')->get(['id', 'name', 'code']);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'availableClasses' => $availableClasses,
            'counts' => $counts,
            'filters' => [
                'role' => $role,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Create a new user with a specified role.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'username' => $validated['username'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ]);

        if ($user->role === 'student' && ! empty($validated['initial_class_id'])) {
            $user->enrolledClasses()->attach($validated['initial_class_id'], [
                'enrolled_at' => now(),
                'status' => 'enrolled',
            ]);
        }

        $roleLabel = match ($user->role) {
            'admin' => 'Quản trị viên (Administrator)',
            'teacher' => 'Giáo thọ (Teacher)',
            default => 'Học viên (Student)',
        };

        return back()->with('success', "Tạo {$roleLabel} {$user->name} thành công.");
    }

    /**
     * Update user details and role.
     */
    public function update(UpdateUserRequest $request, int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $validated = $request->validated();

        // Safeguard: Prevent demoting the only remaining administrator
        if ($user->isAdmin() && $validated['role'] !== 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return back()->with('error', 'Không thể đổi vai trò của quản trị viên duy nhất còn lại.');
            }
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'username' => $validated['username'] ?? null,
            'status' => $validated['status'],
        ]);

        return back()->with('success', "Cập nhật thông tin {$user->name} thành công.");
    }

    /**
     * Reset a user's password.
     */
    public function updatePassword(UpdateUserPasswordRequest $request, int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $validated = $request->validated();

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', "Đổi mật khẩu thành công cho {$user->name}.");
    }

    /**
     * Delete a user account with safety checks.
     */
    public function destroy(Request $request, int $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        // Safeguard: Cannot delete self
        if ($request->user()?->id === $user->id) {
            return back()->with('error', 'Bạn không thể xóa tài khoản của chính mình.');
        }

        // Safeguard: Cannot delete the only remaining administrator
        if ($user->isAdmin()) {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return back()->with('error', 'Không thể xóa quản trị viên duy nhất còn lại trong hệ thống.');
            }
        }

        $name = $user->name;
        $user->enrolledClasses()->detach();
        $user->delete();

        return back()->with('success', "Đã xóa người dùng {$name} thành công.");
    }
}
