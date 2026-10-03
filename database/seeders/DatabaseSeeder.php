<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Skip dummy data completely in production
        if (app()->isProduction()) {
            $this->command?->info('Production environment detected: Skipping dummy data import.');
            return;
        }

        $this->call([
            DemoUserSeeder::class,
        ]);
    }
}
