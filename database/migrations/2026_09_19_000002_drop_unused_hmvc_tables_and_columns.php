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
        // 1. Remove unused HMVC columns and foreign keys from lessons table
        if (Schema::hasTable('lessons')) {
            Schema::table('lessons', function (Blueprint $table) {
                if (Schema::hasColumn('lessons', 'course_category_id')) {
                    $table->dropForeign(['course_category_id']);
                    $table->dropColumn('course_category_id');
                }
                if (Schema::hasColumn('lessons', 'document_links')) {
                    $table->dropColumn('document_links');
                }
                if (Schema::hasColumn('lessons', 'video_links')) {
                    $table->dropColumn('video_links');
                }
            });
        }

        // 2. Drop unused HMVC tables
        Schema::dropIfExists('course_categories');
        Schema::dropIfExists('roles');

        // 3. Clean up migration records for old HMVC module migrations
        DB::table('migrations')->whereIn('migration', [
            '2026_09_15_163430_create_course_categories_table',
            '2026_09_15_163430_create_roles_table',
            '2026_09_15_163431_update_lessons_table',
        ])->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Retired HMVC schema does not need to be restored.
    }
};
