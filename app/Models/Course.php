<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'category', // dhamma, vinaya, abhidhamma, pali
        'target_audience', // all, monastics, lay
        'description',
        'thumbnail',
        'order',
    ];

    /**
     * Classes associated with this course.
     */
    public function classes(): HasMany
    {
        return $this->hasMany(CourseClass::class, 'course_id');
    }

    /**
     * Lessons / study units under this course.
     */
    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class, 'course_id')->orderBy('order', 'asc');
    }

    /**
     * Question bank for this course.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'course_id');
    }
}
