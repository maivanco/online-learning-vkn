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
            if (Schema::hasColumn('users', 'cccd') && ! Schema::hasColumn('users', 'username')) {
                $table->renameColumn('cccd', 'username');
            } elseif (! Schema::hasColumn('users', 'username')) {
                $table->string('username', 50)->nullable()->unique()->after('id');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'username')) {
                $table->string('username', 50)->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'username') && ! Schema::hasColumn('users', 'cccd')) {
                $table->renameColumn('username', 'cccd');
            }
        });
    }
};
