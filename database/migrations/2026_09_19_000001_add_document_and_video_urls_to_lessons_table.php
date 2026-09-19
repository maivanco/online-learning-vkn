<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->json('document_urls')->nullable()->after('reading_file_url');
            $table->json('video_urls')->nullable()->after('video_url');
        });

        // Backfill existing single reading_file_url and video_url into the new JSON array structure
        $lessons = DB::table('lessons')->get();
        foreach ($lessons as $lesson) {
            $updates = [];
            if (!empty($lesson->reading_file_url)) {
                $updates['document_urls'] = json_encode([
                    ['title' => 'Tài liệu / Document', 'url' => $lesson->reading_file_url],
                ]);
            }
            if (!empty($lesson->video_url)) {
                $updates['video_urls'] = json_encode([
                    ['title' => 'Video bài giảng / Lecture Video', 'url' => $lesson->video_url],
                ]);
            }
            if (!empty($updates)) {
                DB::table('lessons')->where('id', $lesson->id)->update($updates);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['document_urls', 'video_urls']);
        });
    }
};
