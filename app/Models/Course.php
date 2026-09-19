<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'title',
        'slug',
        'category', // dhamma, vinaya, abhidhamma, pali, general
        'target_audience', // all, monastics, lay
        'description',
        'thumbnail',
        'order',
    ];

    /**
     * Parent course catalog.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'parent_id');
    }

    /**
     * Sub-course catalogs.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Course::class, 'parent_id')->orderBy('order', 'asc');
    }

    /**
     * Recursively retrieve all descendant IDs to prevent cyclic hierarchy.
     *
     * @return array<int>
     */
    public function allDescendantIds(): array
    {
        $descendantIds = [];
        $children = Course::where('parent_id', $this->id)->get();
        foreach ($children as $child) {
            $descendantIds[] = $child->id;
            $descendantIds = array_merge($descendantIds, $child->allDescendantIds());
        }

        return $descendantIds;
    }

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
