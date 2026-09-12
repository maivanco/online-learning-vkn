<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'cccd',
        'email',
        'password',
        'role',
        'phone',
        'status',
        'google_id',
        'github_id',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if user is administrator.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is teacher or admin (manager).
     */
    public function isTeacherOrAdmin(): bool
    {
        return in_array($this->role, ['admin', 'teacher']);
    }

    /**
     * Check if user is student.
     */
    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    /**
     * Enrolled classes relationship.
     */
    public function enrolledClasses(): BelongsToMany
    {
        return $this->belongsToMany(CourseClass::class, 'class_user', 'user_id', 'class_id')
            ->withPivot(['enrolled_at', 'status', 'final_grade', 'completed_at'])
            ->withTimestamps();
    }

    /**
     * Student progress entries.
     */
    public function progress(): HasMany
    {
        return $this->hasMany(StudentProgress::class, 'user_id');
    }

    /**
     * Student exam attempts.
     */
    public function examAttempts(): HasMany
    {
        return $this->hasMany(StudentExamAttempt::class, 'user_id');
    }

    /**
     * Material feedback submissions.
     */
    public function feedbacks(): HasMany
    {
        return $this->hasMany(MaterialFeedback::class, 'user_id');
    }

    /**
     * Incorrect questions tracked for student.
     */
    public function incorrectQuestions(): HasMany
    {
        return $this->hasMany(StudentIncorrectQuestion::class, 'user_id');
    }
}
