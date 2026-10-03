<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentProfile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'date_of_birth',
        'gender',
        'refuge_in_triple_gem',
        'dharma_name',
        'student_type',
        'ordination_status',
        'ordination_date',
        'ordination_place',
        'preceptor_teacher',
        'current_residence',
        'study_purposes',
        'other_study_purpose',
        'buddhist_study_level',
        'previous_buddhist_programs',
        'confirmed_information_at',
        'agreed_to_rules_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'ordination_date' => 'date',
            'refuge_in_triple_gem' => 'boolean',
            'study_purposes' => 'array',
            'confirmed_information_at' => 'datetime',
            'agreed_to_rules_at' => 'datetime',
        ];
    }

    /**
     * The user account this profile belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
