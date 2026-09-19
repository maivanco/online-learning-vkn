<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseClass;
use App\Models\Lesson;
use App\Models\MaterialFeedback;
use App\Models\Question;
use App\Models\StudentExamAttempt;
use App\Models\StudentIncorrectQuestion;
use App\Models\StudentProgress;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    /**
     * Optional seeder for demo/testing purposes only.
     */
    public function run(): void
    {
        // 1. Create Sample Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@vienkhongni.vn'],
            [
                'name' => 'Vien Khong Ni Abbot (Vien Chu)',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '0901234567',
                'status' => 'active',
            ]
        );

        $teacher = User::firstOrCreate(
            ['email' => 'teacher@vienkhongni.vn'],
            [
                'name' => 'Sayalay Teacher Dhammananda',
                'username' => 'teacher',
                'password' => Hash::make('password'),
                'role' => 'teacher',
                'phone' => '0907654321',
                'status' => 'active',
            ]
        );

        $student1 = User::firstOrCreate(
            ['email' => 'vientue@vienkhongni.vn'],
            [
                'name' => 'Bhikkhuni Vien Tue',
                'username' => 'vientue',
                'password' => Hash::make('password'),
                'role' => 'student',
                'phone' => '0912345678',
                'status' => 'active',
            ]
        );

        $student2 = User::firstOrCreate(
            ['email' => 'tinhnhu@vienkhongni.vn'],
            [
                'name' => 'Samaneri Tinh Nhu',
                'username' => 'tinhnhu',
                'password' => Hash::make('password'),
                'role' => 'student',
                'phone' => '0923456789',
                'status' => 'active',
            ]
        );

        $student3 = User::firstOrCreate(
            ['email' => 'nguyenvanan@gmail.com'],
            [
                'name' => 'Lay Devotee Nguyen Van An',
                'username' => 'nguyenvanan',
                'password' => Hash::make('password'),
                'role' => 'student',
                'phone' => '0934567890',
                'status' => 'active',
            ]
        );

        $activeClass = CourseClass::where('code', 'VNK-ADH-2601')->first();
        $completedClass = CourseClass::where('code', 'VNK-DHM-2504')->first();
        $upcomingClass = CourseClass::where('code', 'VNK-PAL-2602')->first();
        $abhidhammaCourse = Course::where('slug', 'abhidhammattha-sangaha')->first();
        $lesson1 = $abhidhammaCourse ? Lesson::where('course_id', $abhidhammaCourse->id)->first() : null;

        if ($activeClass && $student1 && $student2 && $student3) {
            $activeClass->students()->syncWithoutDetaching([
                $student1->id => ['enrolled_at' => now()->subMonth(), 'status' => 'enrolled'],
                $student2->id => ['enrolled_at' => now()->subMonth(), 'status' => 'enrolled'],
                $student3->id => ['enrolled_at' => now()->subMonth(), 'status' => 'enrolled'],
            ]);
        }

        if ($completedClass && $student1 && $student2) {
            $completedClass->students()->syncWithoutDetaching([
                $student1->id => ['enrolled_at' => now()->subMonths(4), 'status' => 'completed', 'final_grade' => 95.0, 'completed_at' => now()->subMonth()],
                $student2->id => ['enrolled_at' => now()->subMonths(4), 'status' => 'completed', 'final_grade' => 88.0, 'completed_at' => now()->subMonth()],
            ]);
        }

        if ($upcomingClass && $student3) {
            $upcomingClass->students()->syncWithoutDetaching([
                $student3->id => ['enrolled_at' => now()->subDays(3), 'status' => 'enrolled'],
            ]);
        }

        if ($lesson1 && $activeClass && $student1) {
            StudentProgress::updateOrCreate(
                ['user_id' => $student1->id, 'class_id' => $activeClass->id, 'lesson_id' => $lesson1->id],
                [
                    'reading_completed' => true,
                    'reading_completed_at' => now()->subDays(5),
                    'video_completed' => true,
                    'video_completed_at' => now()->subDays(4),
                    'practice_count' => 10,
                    'practice_completed' => true,
                    'practice_completed_at' => now()->subDays(2),
                    'exam_completed' => true,
                    'exam_completed_at' => now()->subDay(),
                    'exam_score' => 80.0,
                    'is_completed' => false,
                ]
            );

            $q4 = Question::where('course_id', $abhidhammaCourse->id)->skip(3)->first();
            if ($q4) {
                StudentIncorrectQuestion::updateOrCreate(
                    [
                        'user_id' => $student1->id,
                        'class_id' => $activeClass->id,
                        'lesson_id' => $lesson1->id,
                        'question_id' => $q4->id,
                    ],
                    [
                        'last_chosen_option' => 'B',
                        'is_resolved' => false,
                    ]
                );
            }

            StudentExamAttempt::updateOrCreate(
                ['user_id' => $student1->id, 'class_id' => $activeClass->id, 'lesson_id' => $lesson1->id, 'attempt_type' => 'exam'],
                [
                    'total_questions' => 5,
                    'correct_count' => 4,
                    'incorrect_count' => 1,
                    'review_needed_count' => 1,
                    'score' => 80.0,
                    'answers_summary' => [
                        'q1' => 'correct',
                        'q2' => 'correct',
                        'q3' => 'correct',
                        'q4' => 'incorrect',
                        'q5' => 'correct',
                    ],
                ]
            );
        }

        if ($lesson1 && $activeClass && $student2) {
            StudentProgress::updateOrCreate(
                ['user_id' => $student2->id, 'class_id' => $activeClass->id, 'lesson_id' => $lesson1->id],
                [
                    'reading_completed' => true,
                    'reading_completed_at' => now()->subDays(3),
                    'video_completed' => true,
                    'video_completed_at' => now()->subDays(2),
                    'practice_count' => 4,
                    'practice_completed' => false,
                    'exam_completed' => false,
                    'is_completed' => false,
                ]
            );

            MaterialFeedback::updateOrCreate(
                ['lesson_id' => $lesson1->id, 'user_id' => $student2->id],
                [
                    'content' => 'In section 3 regarding Mental Factors, the note mentions 52 cetasikas, could the monastery please clarify the list of 14 akusala cetasikas in the next reading update?',
                    'status' => 'pending',
                    'admin_notes' => null,
                ]
            );
        }
    }
}
