<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentProgress extends Model
{
    use HasFactory;

    protected $table = 'student_progress';

    protected $fillable = [
        'user_id',
        'class_id',
        'lesson_id',
        'reading_completed',
        'reading_completed_at',
        'video_completed',
        'video_completed_at',
        'practice_count',
        'practice_completed',
        'practice_completed_at',
        'exam_completed',
        'exam_completed_at',
        'exam_score',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'reading_completed' => 'boolean',
        'reading_completed_at' => 'datetime',
        'video_completed' => 'boolean',
        'video_completed_at' => 'datetime',
        'practice_count' => 'integer',
        'practice_completed' => 'boolean',
        'practice_completed_at' => 'datetime',
        'exam_completed' => 'boolean',
        'exam_completed_at' => 'datetime',
        'exam_score' => 'decimal:2',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function courseClass(): BelongsTo
    {
        return $this->belongsTo(CourseClass::class, 'class_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }
}
