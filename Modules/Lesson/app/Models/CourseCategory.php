<?php

namespace Modules\Lesson\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Lesson\Database\Factories\CourseCategoryFactory;

class CourseCategory extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [];

    // protected static function newFactory(): CourseCategoryFactory
    // {
    //     // return CourseCategoryFactory::new();
    // }
}
