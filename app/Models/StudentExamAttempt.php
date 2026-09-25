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
        'course_id',
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

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    /**
     * Get answers summary normalized to the structured format:
     * ['quiz' => [...], 'essay' => [...]]
     */
    public function getNormalizedSummary(): array
    {
        $summary = $this->answers_summary ?? [];
        if (! is_array($summary)) {
            return ['quiz' => [], 'essay' => []];
        }

        if (! isset($summary['quiz']) && ! isset($summary['essay'])) {
            $normalized = ['quiz' => [], 'essay' => []];
            foreach ($summary as $qid => $val) {
                if (is_array($val)) {
                    $type = ($val['question_type'] ?? 'quiz') === 'essay' ? 'essay' : 'quiz';
                    $normalized[$type][$qid] = $val;
                }
            }
            return $normalized;
        }

        return [
            'quiz' => (array) ($summary['quiz'] ?? []),
            'essay' => (array) ($summary['essay'] ?? []),
        ];
    }

    /**
     * Get total number of answered questions across quiz and essay.
     */
    public function getAnsweredCountAttribute(): int
    {
        $norm = $this->getNormalizedSummary();
        return count($norm['quiz']) + count($norm['essay']);
    }

    /**
     * Retrieve answered record for a given question ID regardless of type.
     */
    public function getAnswerRecord(int $questionId): ?array
    {
        $norm = $this->getNormalizedSummary();
        return $norm['quiz'][$questionId] ?? $norm['essay'][$questionId] ?? null;
    }
}
