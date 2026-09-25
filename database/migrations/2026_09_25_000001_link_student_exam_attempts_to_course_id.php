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
        Schema::table('student_exam_attempts', function (Blueprint $table) {
            $table->foreignId('course_id')->nullable()->after('class_id')->constrained('courses')->cascadeOnDelete();
        });

        // Backfill course_id from associated class if existing attempts exist
        if (DB::table('student_exam_attempts')->exists()) {
            $attempts = DB::table('student_exam_attempts')
                ->join('classes', 'student_exam_attempts.class_id', '=', 'classes.id')
                ->select('student_exam_attempts.id', 'classes.course_id')
                ->get();

            foreach ($attempts as $attempt) {
                DB::table('student_exam_attempts')
                    ->where('id', $attempt->id)
                    ->update(['course_id' => $attempt->course_id]);
            }
        }

        // Drop lesson_id on MySQL/production environments. SQLite maintains table-level FK constraints
        // on column drop, so we conditionally drop foreign key and column when supported.
        if (DB::getDriverName() !== 'sqlite') {
            Schema::table('student_exam_attempts', function (Blueprint $table) {
                if (Schema::hasColumn('student_exam_attempts', 'lesson_id')) {
                    $table->dropForeign(['lesson_id']);
                    $table->dropColumn('lesson_id');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_exam_attempts', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->foreignId('lesson_id')->nullable()->after('class_id')->constrained('lessons')->cascadeOnDelete();
                $table->dropForeign(['course_id']);
            }
            $table->dropColumn('course_id');
        });
    }
};
