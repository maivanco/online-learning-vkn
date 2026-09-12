<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourseClass;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class StudentManagerController extends Controller
{
    /**
     * Display student roster list.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $studentsQuery = User::where('role', 'student')
            ->with(['enrolledClasses.course'])
            ->withCount('enrolledClasses');

        if ($search) {
            $studentsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('cccd', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $students = $studentsQuery->orderBy('id', 'desc')->paginate(15)->through(fn($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'cccd' => $s->cccd,
            'email' => $s->email,
            'phone' => $s->phone,
            'status' => $s->status,
            'created_at' => $s->created_at->format('Y-m-d'),
            'classes_count' => $s->enrolled_classes_count,
            'classes' => $s->enrolledClasses->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'status' => $c->pivot->status,
            ]),
        ]);

        $availableClasses = CourseClass::where('status', '!=', 'completed')->get(['id', 'name', 'code']);

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'availableClasses' => $availableClasses,
            'search' => $search,
        ]);
    }

    /**
     * Create a new student with Citizen ID (CCCD) and initial password.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'cccd' => 'required|string|max:20|unique:users,cccd',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => ['required', 'string', 'min:6'],
            'initial_class_id' => 'nullable|exists:classes,id',
        ]);

        $student = User::create([
            'name' => $validated['name'],
            'cccd' => $validated['cccd'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => 'student',
            'status' => 'active',
        ]);

        if (! empty($validated['initial_class_id'])) {
            $student->enrolledClasses()->attach($validated['initial_class_id'], [
                'enrolled_at' => now(),
                'status' => 'enrolled',
            ]);
        }

        return back()->with('success', "Student {$student->name} (CCCD: {$student->cccd}) registered with provided password.");
    }

    /**
     * Reset a student's password or change own website password.
     */
    public function updatePassword(Request $request, int $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', "Password updated successfully for {$user->name}.");
    }
}
