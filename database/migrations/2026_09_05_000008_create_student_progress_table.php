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
        Schema::create('student_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            
            // Step 1: Self study reading
            $table->boolean('reading_completed')->default(false);
            $table->timestamp('reading_completed_at')->nullable();

            // Step 2: Watch video lecture clip
            $table->boolean('video_completed')->default(false);
            $table->timestamp('video_completed_at')->nullable();

            // Step 3: Practice 10 times
            $table->integer('practice_count')->default(0);
            $table->boolean('practice_completed')->default(false);
            $table->timestamp('practice_completed_at')->nullable();

            // Step 4: Final Exam
            $table->boolean('exam_completed')->default(false);
            $table->timestamp('exam_completed_at')->nullable();
            $table->decimal('exam_score', 5, 2)->nullable();

            // Step 5: Full subject completion (requires 0 incorrect questions remaining)
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'class_id', 'lesson_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_progress');
    }
};
