<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Question extends Model
{
    use HasFactory;

    public const TYPE_QUIZ = 'quiz';
    public const TYPE_ESSAY = 'essay';

    protected $fillable = [
        'course_id',
        'lesson_id',
        'question_type', // quiz, essay
        'question_text',
        'option_a',
        'option_b',
        'option_c',
        'option_d',
        'correct_option', // A, B, C, D (for quiz)
        'explanation',
        'type', // practice, exam, both
    ];

    public function isQuiz(): bool
    {
        return ($this->question_type ?? self::TYPE_QUIZ) === self::TYPE_QUIZ;
    }

    public function isEssay(): bool
    {
        return $this->question_type === self::TYPE_ESSAY;
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }
}
