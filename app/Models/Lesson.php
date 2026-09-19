<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'slug',
        'order',
        'summary',
        'reading_content',
        'reading_file_url',
        'document_urls',
        'video_url',
        'video_urls',
    ];

    protected $casts = [
        'document_urls' => 'array',
        'video_urls' => 'array',
    ];

    /**
     * Parent course.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    /**
     * Questions associated with this lesson.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'lesson_id');
    }

    /**
     * Material feedback submitted by students.
     */
    public function feedbacks(): HasMany
    {
        return $this->hasMany(MaterialFeedback::class, 'lesson_id');
    }

    /**
     * Student progress on this lesson.
     */
    public function progress(): HasMany
    {
        return $this->hasMany(StudentProgress::class, 'lesson_id');
    }
}
