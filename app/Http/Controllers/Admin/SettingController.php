<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Display the General Settings configuration page.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => [
                'practice_repetition_target' => Setting::getPracticeTarget(),
                'max_classes_per_student' => Setting::getMaxClassesPerStudent(),
            ],
        ]);
    }

    /**
     * Update the General Settings.
     */
    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Setting::set('practice_repetition_target', (string) $validated['practice_repetition_target']);
        Setting::set('max_classes_per_student', (string) $validated['max_classes_per_student']);

        return back()->with('success', __('settings.saved_successfully'));
    }
}
