<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    public const DEFAULT_PRACTICE_TARGET = 10;
    public const DEFAULT_MAX_CLASSES_PER_STUDENT = 5;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Retrieve a setting value by key with optional fallback.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever("app_setting_{$key}", function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            return $setting?->value ?? $default;
        });
    }

    /**
     * Store or update a setting value by key.
     */
    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => is_null($value) ? null : (string) $value]
        );

        Cache::forget("app_setting_{$key}");
    }

    /**
     * Get the configured number of practice homework repetitions required to complete a lesson.
     */
    public static function getPracticeTarget(): int
    {
        $value = static::get('practice_repetition_target', self::DEFAULT_PRACTICE_TARGET);
        $intVal = (int) $value;

        return $intVal > 0 ? $intVal : self::DEFAULT_PRACTICE_TARGET;
    }

    /**
     * Get the configured maximum number of classes a student can participate in concurrently.
     * A value of 0 means unlimited.
     */
    public static function getMaxClassesPerStudent(): int
    {
        $value = static::get('max_classes_per_student', self::DEFAULT_MAX_CLASSES_PER_STUDENT);

        return max(0, (int) $value);
    }
}
