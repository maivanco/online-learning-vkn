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
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()->unique();
            $table->date('date_of_birth');
            $table->string('gender', 20); // male, female, other
            $table->boolean('refuge_in_triple_gem')->default(false);
            $table->string('dharma_name', 255)->nullable();
            
            // Buddhist studies info
            $table->string('student_type', 20); // layperson, monastic
            
            // Monastic specific fields
            $table->string('ordination_status', 50)->nullable();
            $table->date('ordination_date')->nullable();
            $table->string('ordination_place', 255)->nullable();
            $table->string('preceptor_teacher', 255)->nullable();
            $table->string('current_residence', 255)->nullable();
            
            // Academic info
            $table->json('study_purposes');
            $table->string('other_study_purpose', 500)->nullable();
            $table->string('buddhist_study_level', 50);
            $table->text('previous_buddhist_programs')->nullable();
            
            // Confirmations
            $table->timestamp('confirmed_information_at')->nullable();
            $table->timestamp('agreed_to_rules_at')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
