<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentExamAttempt extends Model
{
    use HasFactory;

    protected $table = 'student_exam_attempts';

    protected $fillable = [
        'user_id',
        'class_id',
        'lesson_id',
        'attempt_type', // practice, exam
        'total_questions',
        'correct_count',
        'incorrect_count',
        'review_needed_count',
        'score',
        'answers_summary',
    ];

    protected $casts = [
        'answers_summary' => 'array',
        'score' => 'decimal:2',
        'total_questions' => 'integer',
        'correct_count' => 'integer',
        'incorrect_count' => 'integer',
        'review_needed_count' => 'integer',
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
