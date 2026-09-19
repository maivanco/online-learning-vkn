<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseClass;
use App\Models\Lesson;
use App\Models\Question;
use Illuminate\Database\Seeder;

class BuddhistCurriculumSeeder extends Seeder
{
    /**
     * Seed core Buddhist Curriculum (Courses, Classes, Lessons, and Questions).
     * Does not seed sample users; admin account is created during initial setup.
     */
    public function run(): void
    {
        // 1. Pre-seed Curriculum Courses from Specification
        $coursesData = [
            // Category 1: Dhamma
            [
                'title' => 'Essential Dhamma',
                'slug' => 'essential-dhamma',
                'category' => 'dhamma',
                'target_audience' => 'all',
                'description' => 'Fundamental Theravada teachings, Four Noble Truths, Noble Eightfold Path, and Dependent Origination (Paticcasamuppada).',
                'order' => 1,
            ],
            [
                'title' => 'Sutta Pitaka Dhamma',
                'slug' => 'sutta-pitaka-dhamma',
                'category' => 'dhamma',
                'target_audience' => 'all',
                'description' => 'In-depth discourse studies from Digha Nikaya, Majjhima Nikaya, Samyutta Nikaya, and Anguttara Nikaya.',
                'order' => 2,
            ],

            // Category 2: Vinaya
            [
                'title' => 'Vinaya: Bhikkhuni Patimokkha',
                'slug' => 'vinaya-bhikkhuni',
                'category' => 'vinaya',
                'target_audience' => 'monastics',
                'description' => 'The 311 monastic disciplinary rules and procedures governing fully ordained Buddhist nuns (Bhikkhuni).',
                'order' => 3,
            ],
            [
                'title' => 'Vinaya: Samanera & Samaneri',
                'slug' => 'vinaya-samanera',
                'category' => 'vinaya',
                'target_audience' => 'monastics',
                'description' => 'Discipline and protocol for novice monks and novice nuns (10 Precepts and Sekhiya protocols).',
                'order' => 4,
            ],
            [
                'title' => 'Vinaya: Female Renunciants',
                'slug' => 'vinaya-nun',
                'category' => 'vinaya',
                'target_audience' => 'monastics',
                'description' => 'Eight precepts, conduct, and monastic life principles for dedicated female renunciants living in the monastery.',
                'order' => 5,
            ],
            [
                'title' => 'Vinaya: Lay Followers',
                'slug' => 'vinaya-lay',
                'category' => 'vinaya',
                'target_audience' => 'lay',
                'description' => 'Five Precepts and Eight Uposatha Precepts for Buddhist lay followers, householders, and ethical livelihood.',
                'order' => 6,
            ],

            // Category 3: Abhidhamma
            [
                'title' => 'Abhidhammattha-sangaha',
                'slug' => 'abhidhammattha-sangaha',
                'category' => 'abhidhamma',
                'target_audience' => 'all',
                'description' => 'Systematic analysis of ultimate realities (Paramattha Dhamma): Citta (Consciousness), Cetasika (Mental Factors), Rupa (Matter), and Nibbana.',
                'order' => 7,
            ],

            // Category 4: Pali
            [
                'title' => 'Pali: Pronunciation & Phonetics',
                'slug' => 'pali-pronunciation',
                'category' => 'pali',
                'target_audience' => 'all',
                'description' => 'Orthography, vowels, consonants, retroflex sounds, chanting cadences, and accurate recitation of the Tipitaka.',
                'order' => 8,
            ],
            [
                'title' => 'Pali: Grammar',
                'slug' => 'pali-grammar',
                'category' => 'pali',
                'target_audience' => 'all',
                'description' => 'Declensions, conjugations, case endings, sandhi, compounds (samasa), and prefixes in canonical Pali.',
                'order' => 9,
            ],
            [
                'title' => 'Pali: Sutta Analysis',
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

        // 2. Create Sample Classes (Active, Completed, Upcoming)
        $abhidhammaCourse = Course::where('slug', 'abhidhammattha-sangaha')->first();
        $paliGrammarCourse = Course::where('slug', 'pali-grammar')->first();
        $dhammaCourse = Course::where('slug', 'essential-dhamma')->first();

        // Classes
        $activeClass = CourseClass::updateOrCreate(
            ['name' => 'Abhidhammattha-sangaha Class 01'],
            [
                'course_id' => $abhidhammaCourse->id,
                'is_locked' => false,
                'description' => 'Foundational class exploring Citta and Cetasika for monastery students.',
            ]
        );

        CourseClass::updateOrCreate(
            ['name' => 'Essential Dhamma Class 04'],
            [
                'course_id' => $dhammaCourse->id,
                'is_locked' => false,
                'description' => 'Class on the Four Noble Truths and Dependent Origination.',
            ]
        );

        CourseClass::updateOrCreate(
            ['name' => 'Pali Grammar Class 02'],
            [
                'course_id' => $paliGrammarCourse->id,
                'is_locked' => false,
                'description' => 'Intensive Pali language module.',
            ]
        );

        // 3. Create Lessons for Abhidhamma Course
        $lesson1 = Lesson::updateOrCreate(
            ['course_id' => $abhidhammaCourse->id, 'slug' => 'lesson-1-four-paramattha-dhammas'],
            [
                'title' => 'Lesson 1: The Four Ultimate Realities',
                'order' => 1,
                'summary' => 'Introduction to Paramattha Dhamma: Citta (Consciousness), Cetasika (Mental Factors), Rupa (Matter), and Nibbana.',
                'reading_content' => "# Bốn Pháp Chân Đế (Cattāri Paramatthadhamma)\n\nTrong Vi Diệu Pháp (Abhidhamma), Đức Phật phân tích toàn bộ thực tại hiện hữu thành bốn pháp chân đế vô thượng:\n\n1. **Tâm (Citta)**: Thực tính biết cảnh. Có 89 hoặc 121 thứ tâm tuỳ theo phân loại.\n2. **Tâm sở (Cetasika)**: Những yếu tố đồng sinh cùng tâm, phối hợp để tạo nên trạng thái cảm thọ, tư niệm. Có 52 tâm sở.\n3. **Sắc pháp (Rūpa)**: Những hiện tượng vật lý, hình tướng sinh diệt do duyên. Có 28 sắc pháp.\n4. **Niết-bàn (Nibbāna)**: Thực tại vô vi, tịch tịnh, dứt trừ phiền não và khổ đau luân hồi.\n\nNgười tu học cần phân biệt rõ giữa Chân đế (Paramattha Sacca) và Tục đế (Sammuti Sacca) để thoát khỏi sự chấp ngã sai lầm.",
                'reading_file_url' => 'https://example.com/documents/vien-khong-ni-abhidhamma-bai-1.pdf',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            ]
        );

        Lesson::updateOrCreate(
            ['course_id' => $abhidhammaCourse->id, 'slug' => 'lesson-2-wholesome-consciousness'],
            [
                'title' => 'Lesson 2: Wholesome Consciousness',
                'order' => 2,
                'summary' => 'Study of Kusala Citta in Kamavacara, accompanied by Joy and Equanimity, prompted and unprompted.',
                'reading_content' => "# Tâm Thiện Dục Giới (Kāmāvacara Kusala Citta)\n\nCó 8 thứ tâm thiện dục giới sinh khởi khi hành giả thực hiện thiện sự như bố thí (dāna), trì giới (sīla), hoặc tu tập thiền định (bhāvanā):\n\n- Tâm câu hành hỷ, tương ưng tri thức, vô trợ.\n- Tâm câu hành hỷ, tương ưng tri thức, hữu trợ.\n- Tâm câu hành hỷ, bất tương ưng tri thức, vô trợ.\n- Tâm câu hành hỷ, bất tương ưng tri thức, hữu trợ.\n- Bốn thứ tâm câu hành xả tương ứng.",
                'reading_file_url' => 'https://example.com/documents/vien-khong-ni-abhidhamma-bai-2.pdf',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            ]
        );

        // 4. Question Bank for Lesson 1
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
    }
}
