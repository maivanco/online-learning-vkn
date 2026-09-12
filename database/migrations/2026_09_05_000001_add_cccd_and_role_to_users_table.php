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
        Schema::table('users', function (Blueprint $table) {
            $table->string('cccd', 20)->nullable()->unique()->after('id');
            $table->string('role', 20)->default('student')->after('password'); // admin, teacher, student
            $table->string('phone', 20)->nullable()->after('role');
            $table->string('status', 20)->default('active')->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['cccd', 'role', 'phone', 'status']);
        });
    }
};
