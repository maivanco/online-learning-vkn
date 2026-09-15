<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->foreignId('course_category_id')->nullable()->after('id')->constrained('course_categories')->nullOnDelete();
            $table->json('document_links')->nullable()->after('reading_file_url');
            $table->json('video_links')->nullable()->after('video_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropForeign(['course_category_id']);
            $table->dropColumn(['course_category_id', 'document_links', 'video_links']);
        });
    }
};
