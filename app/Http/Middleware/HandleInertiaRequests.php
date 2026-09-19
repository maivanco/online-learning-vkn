<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $locale = $request->hasSession() ? $request->session()->get('locale', config('app.locale', 'en')) : config('app.locale', 'en');
        app()->setLocale($locale);

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
            'ziggy' => function () use ($request) {
                return array_merge((new Ziggy)->toArray(), [
                    'location' => $request->url(),
                ]);
            },
            'locale' => fn() => app()->getLocale(),
            'translations' => function () {
                $locale = app()->getLocale();
                $fallback = config('app.fallback_locale', 'en');

                $loadTranslations = function (string $loc): array {
                    $translations = [];
                    $dir = lang_path($loc);
                    if (is_dir($dir)) {
                        $files = glob($dir . '/*.php') ?: [];
                        foreach ($files as $file) {
                            $key = basename($file, '.php');
                            $translations[$key] = require $file;
                        }
                    }
                    $jsonFile = lang_path($loc . '.json');
                    if (file_exists($jsonFile)) {
                        $json = json_decode((string) file_get_contents($jsonFile), true);
                        if (is_array($json)) {
                            $translations = array_merge($translations, $json);
                        }
                    }
                    return $translations;
                };

                $fallbackData = $loadTranslations($fallback);
                if ($locale !== $fallback) {
                    $localeData = $loadTranslations($locale);
                    return array_replace_recursive($fallbackData, $localeData);
                }

                return $fallbackData;
            },
        ]);
    }
}
