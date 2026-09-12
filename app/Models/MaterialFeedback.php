<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialFeedback extends Model
{
    use HasFactory;

    protected $table = 'material_feedbacks';

    protected $fillable = [
        'lesson_id',
        'user_id',
        'content',
        'status', // pending, reviewed, resolved
        'admin_notes',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
