<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassComment extends Model
{
    use HasFactory;

    protected $table = 'class_comments';

    protected $fillable = [
        'class_id',
        'user_id',
        'parent_id',
        'reply_to_user_id',
        'content',
    ];

    /**
     * Parent class this comment belongs to.
     */
    public function class(): BelongsTo
    {
        return $this->belongsTo(CourseClass::class, 'class_id');
    }

    /**
     * Author of the comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Parent comment (if this is a level 2 reply).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * Direct replies under this root comment (level 2).
     */
    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('created_at', 'asc');
    }

    /**
     * User being specifically replied to (for @mentions in nested replies).
     */
    public function replyToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reply_to_user_id');
    }

    /**
     * Sanitize HTML content to only retain safe formatting tags
     * (bold, italic, underline, strike, lists, quotes, paragraphs)
     * and strip any script, style, event attributes, or dangerous markup.
     */
    public static function sanitizeContent(string $rawContent): string
    {
        // Allowed tags for basic comment formatting
        $allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'ul', 'ol', 'li', 'blockquote'];
        $clean = strip_tags($rawContent, $allowedTags);

        // Strip dangerous inline attributes like on* (e.g. onclick, onerror, onload)
        $clean = (string) preg_replace('/\s*on\w+\s*=\s*(["\'][^"\']*["\']|[^\s>]+)/i', '', $clean);

        // Strip inline style attributes
        $clean = (string) preg_replace('/\s*style\s*=\s*(["\'][^"\']*["\']|[^\s>]+)/i', '', $clean);

        // Strip javascript: pseudo-protocols if any
        $clean = (string) preg_replace('/javascript\s*:/i', '', $clean);

        return trim($clean);
    }
}
