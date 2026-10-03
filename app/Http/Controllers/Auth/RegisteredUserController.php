<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response|RedirectResponse
    {
        if (User::where('role', 'admin')->doesntExist()) {
            return redirect()->route('setup');
        }

        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(RegisterRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['full_name'],
                'username' => $validated['username'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'role' => 'student',
                'status' => 'pending',
            ]);

            $isMonastic = $validated['student_type'] === 'monastic';
            $hasOtherPurpose = in_array('other', $validated['study_purposes'], true);

            $user->studentProfile()->create([
                'date_of_birth' => $validated['date_of_birth'],
                'gender' => $validated['gender'],
                'refuge_in_triple_gem' => (bool) $validated['refuge_in_triple_gem'],
                'dharma_name' => $validated['dharma_name'] ?? null,
                'student_type' => $validated['student_type'],
                'ordination_status' => $isMonastic ? ($validated['ordination_status'] ?? null) : null,
                'ordination_date' => $isMonastic ? ($validated['ordination_date'] ?? null) : null,
                'ordination_place' => $isMonastic ? ($validated['ordination_place'] ?? null) : null,
                'preceptor_teacher' => $isMonastic ? ($validated['preceptor_teacher'] ?? null) : null,
                'current_residence' => $isMonastic ? ($validated['current_residence'] ?? null) : null,
                'study_purposes' => $validated['study_purposes'],
                'other_study_purpose' => $hasOtherPurpose ? ($validated['other_study_purpose'] ?? null) : null,
                'buddhist_study_level' => $validated['buddhist_study_level'],
                'previous_buddhist_programs' => $validated['previous_buddhist_programs'] ?? null,
                'confirmed_information_at' => now(),
                'agreed_to_rules_at' => now(),
            ]);

            return $user;
        });

        event(new Registered($user));

        return redirect()->route('login')
            ->with('status', __('auth.registration_success_pending_approval'))
            ->with('success', __('auth.registration_success_pending_approval'));
    }
}
