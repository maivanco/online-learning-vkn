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

class BuddhistCurriculumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Core Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@vienkhongni.vn'],
            [
                'name' => 'Vien Khong Ni Abbot (Vien Chu)',
                'cccd' => '001099000001',
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
                'cccd' => '001099000002',
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
                'cccd' => '079199000001',
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
                'cccd' => '079199000002',
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
                'cccd' => '079199000003',
                'password' => Hash::make('password'),
                'role' => 'student',
                'phone' => '0934567890',
                'status' => 'active',
            ]
        );

        // 2. Pre-seed Curriculum Courses from PDF Specification
        $coursesData = [
            // Category 1: Dhamma (Pháp)
            [
                'title' => 'Essential Dhamma (Pháp học tinh yếu)',
                'slug' => 'essential-dhamma',
                'category' => 'dhamma',
                'target_audience' => 'all',
                'description' => 'Fundamental Theravada teachings, Four Noble Truths, Noble Eightfold Path, and Dependent Origination (Paticcasamuppada).',
                'order' => 1,
            ],
            [
                'title' => 'Sutta Pitaka Dhamma (Pháp học theo kinh tạng)',
                'slug' => 'sutta-pitaka-dhamma',
                'category' => 'dhamma',
                'target_audience' => 'all',
                'description' => 'In-depth discourse studies from Digha Nikaya, Majjhima Nikaya, Samyutta Nikaya, and Anguttara Nikaya.',
                'order' => 2,
            ],

            // Category 2: Vinaya (Luật)
            [
                'title' => 'Vinaya: Bhikkhuni Patimokkha (Luật Tỳ Kheo Ni)',
                'slug' => 'vinaya-bhikkhuni',
                'category' => 'vinaya',
                'target_audience' => 'monastics',
                'description' => 'The 311 monastic disciplinary rules and procedures governing fully ordained Buddhist nuns (Bhikkhuni).',
                'order' => 3,
            ],
            [
                'title' => 'Vinaya: Samanera & Samaneri (Luật Sa-di & Sa-di-ni)',
                'slug' => 'vinaya-samanera',
                'category' => 'vinaya',
                'target_audience' => 'monastics',
                'description' => 'Discipline and protocol for novice monks and novice nuns (10 Precepts and Sekhiya protocols).',
                'order' => 4,
            ],
            [
                'title' => 'Vinaya: Female Renunciants (Luật Tu nữ)',
                'slug' => 'vinaya-nun',
                'category' => 'vinaya',
                'target_audience' => 'monastics',
                'description' => 'Eight precepts, conduct, and monastic life principles for dedicated female renunciants living in the monastery.',
                'order' => 5,
            ],
            [
                'title' => 'Vinaya: Lay Followers (Luật Cư sĩ)',
                'slug' => 'vinaya-lay',
                'category' => 'vinaya',
                'target_audience' => 'lay',
                'description' => 'Five Precepts and Eight Uposatha Precepts for Buddhist lay followers, householders, and ethical livelihood.',
                'order' => 6,
            ],

            // Category 3: Abhidhamma (Vi Diệu Pháp)
            [
                'title' => 'Abhidhammattha-sangaha (Thắng pháp tập yếu luận)',
                'slug' => 'abhidhammattha-sangaha',
                'category' => 'abhidhamma',
                'target_audience' => 'all',
                'description' => 'Systematic analysis of ultimate realities (Paramattha Dhamma): Citta (Consciousness), Cetasika (Mental Factors), Rupa (Matter), and Nibbana.',
                'order' => 7,
            ],

            // Category 4: Pali (Pali)
            [
                'title' => 'Pali: Pronunciation & Phonetics (Pali: Cách phát âm)',
                'slug' => 'pali-pronunciation',
                'category' => 'pali',
                'target_audience' => 'all',
                'description' => 'Orthography, vowels, consonants, retroflex sounds, chanting cadences, and accurate recitation of the Tipitaka.',
                'order' => 8,
            ],
            [
                'title' => 'Pali: Grammar (Pali: Văn phạm)',
                'slug' => 'pali-grammar',
                'category' => 'pali',
                'target_audience' => 'all',
                'description' => 'Declensions, conjugations, case endings, sandhi, compounds (samasa), and prefixes in canonical Pali.',
                'order' => 9,
            ],
            [
                'title' => 'Pali: Sutta Analysis (Pali: Phân tích qua kinh văn)',
                'slug' => 'pali-sutta-analysis',
                'category' => 'pali',
                'target_audience' => 'all',
                'description' => 'Word-by-word grammatical and doctrinal breakdown of fundamental suttas such as Mangala Sutta, Ratana Sutta, and Metta Sutta.',
                'order' => 10,
            ],
        ];

        foreach ($coursesData as $c) {
            Course::updateOrCreate(['slug' => $c['slug']], $c);
        }

        // 3. Create Sample Classes (Active, Completed, Upcoming)
        $abhidhammaCourse = Course::where('slug', 'abhidhammattha-sangaha')->first();
        $paliGrammarCourse = Course::where('slug', 'pali-grammar')->first();
        $dhammaCourse = Course::where('slug', 'essential-dhamma')->first();

        // Active Class (3 months duration)
        $activeClass = CourseClass::updateOrCreate(
            ['code' => 'VNK-ADH-2601'],
            [
                'course_id' => $abhidhammaCourse->id,
                'name' => 'Abhidhammattha-sangaha Cohort 01 (Lớp Vi Diệu Pháp K01)',
                'duration_months' => 3,
                'start_date' => now()->subMonth(),
                'end_date' => now()->addMonths(2),
                'status' => 'active',
                'is_locked' => false,
                'description' => '3-month foundational course exploring Citta and Cetasika for monastery students.',
            ]
        );

        // Completed Class
        $completedClass = CourseClass::updateOrCreate(
            ['code' => 'VNK-DHM-2504'],
            [
                'course_id' => $dhammaCourse->id,
                'name' => 'Essential Dhamma Cohort 04 (Lớp Pháp Học Tinh Yếu K04)',
                'duration_months' => 3,
                'start_date' => now()->subMonths(4),
                'end_date' => now()->subMonth(),
                'status' => 'completed',
                'is_locked' => true,
                'description' => 'Completed cohort on the Four Noble Truths and Dependent Origination.',
            ]
        );

        // Upcoming Class
        $upcomingClass = CourseClass::updateOrCreate(
            ['code' => 'VNK-PAL-2602'],
            [
                'course_id' => $paliGrammarCourse->id,
                'name' => 'Pali Grammar Cohort 02 (Lớp Văn Phạm Pali K02)',
                'duration_months' => 3,
                'start_date' => now()->addMonth(),
                'end_date' => now()->addMonths(4),
                'status' => 'upcoming',
                'is_locked' => false,
                'description' => 'Upcoming intensive Pali language module opening next month.',
            ]
        );

        // Enroll Students into Active Class
        $activeClass->students()->syncWithoutDetaching([
            $student1->id => ['enrolled_at' => now()->subMonth(), 'status' => 'enrolled'],
            $student2->id => ['enrolled_at' => now()->subMonth(), 'status' => 'enrolled'],
            $student3->id => ['enrolled_at' => now()->subMonth(), 'status' => 'enrolled'],
        ]);

        // Enroll Students into Completed Class
        $completedClass->students()->syncWithoutDetaching([
            $student1->id => ['enrolled_at' => now()->subMonths(4), 'status' => 'completed', 'final_grade' => 95.0, 'completed_at' => now()->subMonth()],
            $student2->id => ['enrolled_at' => now()->subMonths(4), 'status' => 'completed', 'final_grade' => 88.0, 'completed_at' => now()->subMonth()],
        ]);

        // Register Student for Upcoming Class
        $upcomingClass->students()->syncWithoutDetaching([
            $student3->id => ['enrolled_at' => now()->subDays(3), 'status' => 'enrolled'],
        ]);

        // 4. Create Lessons for Abhidhamma Course
        $lesson1 = Lesson::updateOrCreate(
            ['course_id' => $abhidhammaCourse->id, 'slug' => 'lesson-1-four-paramattha-dhammas'],
            [
                'title' => 'Lesson 1: The Four Ultimate Realities (Bốn Pháp Chân Đế)',
                'order' => 1,
                'summary' => 'Introduction to Paramattha Dhamma: Citta (Consciousness), Cetasika (Mental Factors), Rupa (Matter), and Nibbana.',
                'reading_content' => "# Bốn Pháp Chân Đế (Cattāri Paramatthadhamma)\n\nTrong Vi Diệu Pháp (Abhidhamma), Đức Phật phân tích toàn bộ thực tại hiện hữu thành bốn pháp chân đế vô thượng:\n\n1. **Tâm (Citta)**: Thực tính biết cảnh. Có 89 hoặc 121 thứ tâm tuỳ theo phân loại.\n2. **Tâm sở (Cetasika)**: Những yếu tố đồng sinh cùng tâm, phối hợp để tạo nên trạng thái cảm thọ, tư niệm. Có 52 tâm sở.\n3. **Sắc pháp (Rūpa)**: Những hiện tượng vật lý, hình tướng sinh diệt do duyên. Có 28 sắc pháp.\n4. **Niết-bàn (Nibbāna)**: Thực tại vô vi, tịch tịnh, dứt trừ phiền não và khổ đau luân hồi.\n\nNgười tu học cần phân biệt rõ giữa Chân đế (Paramattha Sacca) và Tục đế (Sammuti Sacca) để thoát khỏi sự chấp ngã sai lầm.",
                'reading_file_url' => 'https://example.com/documents/vien-khong-ni-abhidhamma-bai-1.pdf',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Embedded video clip
            ]
        );

        $lesson2 = Lesson::updateOrCreate(
            ['course_id' => $abhidhammaCourse->id, 'slug' => 'lesson-2-wholesome-consciousness'],
            [
                'title' => 'Lesson 2: Wholesome Consciousness (Tâm Thiện Dục Giới)',
                'order' => 2,
                'summary' => 'Study of Kusala Citta in Kamavacara, accompanied by Joy and Equanimity, prompted and unprompted.',
                'reading_content' => "# Tâm Thiện Dục Giới (Kāmāvacara Kusala Citta)\n\nCó 8 thứ tâm thiện dục giới sinh khởi khi hành giả thực hiện thiện sự như bố thí (dāna), trì giới (sīla), hoặc tu tập thiền định (bhāvanā):\n\n- Tâm câu hành hỷ, tương ưng tri thức, vô trợ.\n- Tâm câu hành hỷ, tương ưng tri thức, hữu trợ.\n- Tâm câu hành hỷ, bất tương ưng tri thức, vô trợ.\n- Tâm câu hành hỷ, bất tương ưng tri thức, hữu trợ.\n- Bốn thứ tâm câu hành xả tương ứng.",
                'reading_file_url' => 'https://example.com/documents/vien-khong-ni-abhidhamma-bai-2.pdf',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            ]
        );

        // 5. Question Bank for Lesson 1
        $questions = [
            [
                'question_text' => 'Bao nhiêu pháp chân đế (Paramattha Dhamma) được giảng trong Thắng Pháp Tập Yếu Luận?',
                'option_a' => '2 pháp: Sắc pháp và Tâm pháp',
                'option_b' => '3 pháp: Tâm, Tâm sở, Sắc pháp',
                'option_c' => '4 pháp: Tâm, Tâm sở, Sắc pháp, Niết-bàn',
                'option_d' => '5 pháp: Sắc, Thọ, Tưởng, Hành, Thức',
                'correct_option' => 'C',
                'explanation' => 'Trong Abhidhammattha-sangaha, bốn pháp chân đế là Citta (Tâm), Cetasika (Tâm sở), Rūpa (Sắc), và Nibbāna (Niết-bàn).',
                'type' => 'both',
            ],
            [
                'question_text' => 'Trong 4 pháp chân đế, pháp nào là pháp vô vi (Asaṅkhata Dhamma)?',
                'option_a' => 'Tâm (Citta)',
                'option_b' => 'Tâm sở (Cetasika)',
                'option_c' => 'Sắc pháp (Rūpa)',
                'option_d' => 'Niết-bàn (Nibbāna)',
                'correct_option' => 'D',
                'explanation' => 'Niết-bàn là pháp vô vi duy nhất, không do duyên tạo tác, không sinh diệt trong thời gian.',
                'type' => 'both',
            ],
            [
                'question_text' => 'Có tất cả bao nhiêu tâm sở (Cetasika) đồng sinh cùng tâm?',
                'option_a' => '52 tâm sở',
                'option_b' => '89 tâm sở',
                'option_c' => '28 tâm sở',
                'option_d' => '121 tâm sở',
                'correct_option' => 'A',
                'explanation' => 'Có 52 tâm sở chia thành: 7 biến hành, 6 biệt cảnh, 14 bất thiện, và 25 tịnh hảo.',
                'type' => 'both',
            ],
            [
                'question_text' => 'Sắc pháp (Rūpa) bao gồm bao nhiêu thứ trong thực tại Vi Diệu Pháp?',
                'option_a' => '18 sắc pháp',
                'option_b' => '24 sắc pháp',
                'option_c' => '28 sắc pháp',
                'option_d' => '32 sắc pháp',
                'correct_option' => 'C',
                'explanation' => 'Sắc pháp gồm 4 sắc đại hiển (Đất, Nước, Lửa, Gió) và 24 sắc y sinh, tổng cộng 28 sắc pháp.',
                'type' => 'both',
            ],
            [
                'question_text' => 'Đặc tính cốt lõi của Tâm (Citta) là gì?',
                'option_a' => 'Biết cảnh (Ārammaṇavijānana-lakkhaṇa)',
                'option_b' => 'Cảm thọ sướng khổ',
                'option_c' => 'Ghi nhớ hình ảnh quá khứ',
                'option_d' => 'Tạo tác nghiệp báo',
                'correct_option' => 'A',
                'explanation' => 'Tâm có trạng thái nhận biết đối tượng (cảnh), trong khi cảm thọ là chức năng của thọ tâm sở.',
                'type' => 'both',
            ],
        ];

        foreach ($questions as $q) {
            Question::updateOrCreate(
                [
                    'course_id' => $abhidhammaCourse->id,
                    'lesson_id' => $lesson1->id,
                    'question_text' => $q['question_text'],
                ],
                $q
            );
        }

        // 6. Student Progress Samples
        // Student 1 (Bhikkhuni Vien Tue) has completed reading, video, and finished 10 practice repetitions!
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
                'is_completed' => false, // has 1 incorrect question left to review!
            ]
        );

        // Student 1 missed Question 4 during exam -> stored in incorrect questions log
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

        // Record Exam Attempt for Student 1
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

        // Student 2 has completed reading and video, practice count is at 4 / 10
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

        // Student 3 has only completed reading
        StudentProgress::updateOrCreate(
            ['user_id' => $student3->id, 'class_id' => $activeClass->id, 'lesson_id' => $lesson1->id],
            [
                'reading_completed' => true,
                'reading_completed_at' => now()->subDay(),
                'video_completed' => false,
                'practice_count' => 0,
                'practice_completed' => false,
                'exam_completed' => false,
                'is_completed' => false,
            ]
        );

        // 7. Sample Material Feedback from Student
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
