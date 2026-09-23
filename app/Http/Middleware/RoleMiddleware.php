<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if (! empty($roles) && ! in_array($user->role, $roles)) {
            if ($request->expectsJson()) {
                abort(403, 'Unauthorized access.');
            }

            // If student tries to access admin area, redirect to student dashboard
            if ($user->isStudent()) {
                return redirect()->route('student.dashboard')->with('error', 'Unauthorized access.');
            }

            // If teacher/admin tries to access other areas
            return redirect()->route('admin.dashboard')->with('error', 'Unauthorized access.');
        }

        return $next($request);
    }
}
