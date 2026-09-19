<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseClass extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = [
        'course_id',
        'name',
        'is_locked',
        'description',
    ];

    protected $casts = [
        'is_locked' => 'boolean',
    ];

    /**
     * Parent course.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    /**
     * Students enrolled in this class.
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'class_user', 'class_id', 'user_id')
            ->withPivot(['enrolled_at', 'status', 'final_grade', 'completed_at'])
            ->withTimestamps();
    }

    /**
     * Student progress records for this class.
     */
    public function studentProgress(): HasMany
    {
        return $this->hasMany(StudentProgress::class, 'class_id');
    }
}
