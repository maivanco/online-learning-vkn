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
     * Seeds dummy/demo data including demo users, Buddhist curriculum courses,
     * classes, lessons, question banks, enrollments, and student progress.
     *
     * Automatically skipped in production environments.
     */
    public function run(): void
    {
        // 0. Safety Guard: Never import dummy data in production
        if (app()->isProduction()) {
            $this->command?->warn('Production environment detected: Skipping DemoUserSeeder.');
            return;
        }

        // 1. Create Demo Users (Admin, Teacher, Students)
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

        $creatorId = $teacher->id ?? $admin->id;

        // 2. Seed Courses across 4 Buddhist Disciplines
        $coursesData = [
            // Category: Dhamma
            [
                'title' => 'Essential Dhamma',
                'slug' => 'essential-dhamma',
                'category' => 'dhamma',
                'target_audience' => 'all',
                'description' => '<p>Fundamental Theravada teachings, covering the <strong>Four Noble Truths</strong>, the <strong>Noble Eightfold Path</strong>, and the law of <strong>Dependent Origination (Paṭiccasamuppāda)</strong>. Designed for monastics and lay practitioners seeking a solid foundation in the Buddha\'s wisdom.</p>',
                'exam_duration_minutes' => 45,
                'thumbnail' => '/images/courses/essential-dhamma.jpg',
                'order' => 1,
                'user_id' => $creatorId,
            ],
            [
                'title' => 'Sutta Piṭaka Dhamma',
                'slug' => 'sutta-pitaka-dhamma',
                'category' => 'dhamma',
                'target_audience' => 'all',
                'description' => '<p>Comprehensive discourse studies exploring primary discourses from the <em>Dīgha Nikāya</em>, <em>Majjhima Nikāya</em>, <em>Saṃyutta Nikāya</em>, and <em>Aṅguttara Nikāya</em>.</p>',
                'exam_duration_minutes' => 60,
                'thumbnail' => '/images/courses/sutta-pitaka.jpg',
                'order' => 2,
                'user_id' => $creatorId,
            ],

            // Category: Vinaya
            [
                'title' => 'Vinaya: Bhikkhunī Pātimokkha',
                'slug' => 'vinaya-bhikkhuni',
                'category' => 'vinaya',
                'target_audience' => 'monastics',
                'description' => '<p>The 311 monastic disciplinary rules, origins (nidāna), definitions, and legal procedures (kamma) governing fully ordained Buddhist nuns (Bhikkhunī).</p>',
                'exam_duration_minutes' => 60,
                'thumbnail' => '/images/courses/vinaya-bhikkhuni.jpg',
                'order' => 3,
                'user_id' => $creatorId,
            ],
            [
                'title' => 'Vinaya: Sāmaṇera & Sāmaṇerī',
                'slug' => 'vinaya-samanera',
                'category' => 'vinaya',
                'target_audience' => 'monastics',
                'description' => '<p>Monastic discipline, training precepts, and moral etiquette for novice monks and novice nuns according to classical Theravada traditions.</p>',
                'exam_duration_minutes' => 40,
                'thumbnail' => '/images/courses/vinaya-samanera.jpg',
                'order' => 4,
                'user_id' => $creatorId,
            ],
            [
                'title' => 'Vinaya: Lay Followers',
                'slug' => 'vinaya-lay',
                'category' => 'vinaya',
                'target_audience' => 'lay',
                'description' => '<p>The Five Precepts (Pañcasīla) and the Eight Uposatha Precepts (Aṭṭhaṅgasīla) for upright daily living, householder duty, and ethical livelihood.</p>',
                'exam_duration_minutes' => 30,
                'thumbnail' => '/images/courses/vinaya-lay.jpg',
                'order' => 5,
                'user_id' => $creatorId,
            ],

            // Category: Abhidhamma
            [
                'title' => 'Abhidhammattha-sangaha',
                'slug' => 'abhidhammattha-sangaha',
                'category' => 'abhidhamma',
                'target_audience' => 'all',
                'description' => '<p>In-depth study of ultimate realities (<strong>Paramattha Dhamma</strong>): Consciousness (<em>Citta</em>), Mental Factors (<em>Cetasika</em>), Matter (<em>Rūpa</em>), and Nibbāna based on the manual by Acariya Anuruddha.</p>',
                'exam_duration_minutes' => 60,
                'thumbnail' => '/images/courses/abhidhamma.jpg',
                'order' => 6,
                'user_id' => $creatorId,
            ],

            // Category: Pali
            [
                'title' => 'Pāḷi: Pronunciation & Chanting',
                'slug' => 'pali-pronunciation',
                'category' => 'pali',
                'target_audience' => 'all',
                'description' => '<p>Guide to correct Tipitaka pronunciation, phonetic cadences, conjunct consonants, chanting rhythms, and canonical preservation.</p>',
                'exam_duration_minutes' => 30,
                'thumbnail' => '/images/courses/pali-chanting.jpg',
                'order' => 7,
                'user_id' => $creatorId,
            ],
            [
                'title' => 'Pāḷi Grammar & Canonical Syntax',
                'slug' => 'pali-grammar',
                'category' => 'pali',
                'target_audience' => 'all',
                'description' => '<p>Systematic study of declensions, case endings (vibhatti), verb conjugations (ākhyāta), Sandhi, and compound words (samāsa) in classical Pāḷi.</p>',
                'exam_duration_minutes' => 60,
                'thumbnail' => '/images/courses/pali-grammar.jpg',
                'order' => 8,
                'user_id' => $creatorId,
            ],
        ];

        $courses = [];
        foreach ($coursesData as $data) {
            $courses[$data['slug']] = Course::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }

        // 3. Seed Classes
        $classesData = [
            [
                'course_slug' => 'abhidhammattha-sangaha',
                'name' => 'Abhidhammattha-sangaha Class 01',
                'user_id' => $creatorId,
                'is_locked' => false,
                'description' => 'Foundational cohort studying Paramattha Dhammas, Citta, and Cetasika with monastery instructors.',
            ],
            [
                'course_slug' => 'essential-dhamma',
                'name' => 'Essential Dhamma Class 04',
                'user_id' => $creatorId,
                'is_locked' => false,
                'description' => 'Active study class covering the Four Noble Truths and meditation foundations.',
            ],
            [
                'course_slug' => 'pali-grammar',
                'name' => 'Pali Grammar Class 02',
                'user_id' => $creatorId,
                'is_locked' => false,
                'description' => 'Intensive language module for reading Pali Suttas directly with vocabulary and parsing exercises.',
            ],
            [
                'course_slug' => 'sutta-pitaka-dhamma',
                'name' => 'Sutta Piṭaka Study Group 01',
                'user_id' => $creatorId,
                'is_locked' => false,
                'description' => 'Weekly discourse analysis and reflection on selected Majjhima Nikaya suttas.',
            ],
            [
                'course_slug' => 'vinaya-bhikkhuni',
                'name' => 'Vinaya Monastic Cohort 01',
                'user_id' => $creatorId,
                'is_locked' => true,
                'description' => 'Internal monastic training cohort restricted to ordained Bhikkhunīs and novices.',
            ],
        ];

        $createdClasses = [];
        foreach ($classesData as $cls) {
            $course = $courses[$cls['course_slug']] ?? null;
            if ($course) {
                $createdClasses[$cls['name']] = CourseClass::updateOrCreate(
                    ['name' => $cls['name']],
                    [
                        'course_id' => $course->id,
                        'user_id' => $cls['user_id'],
                        'is_locked' => $cls['is_locked'],
                        'description' => $cls['description'],
                    ]
                );
            }
        }

        // 4. Seed Lessons for Abhidhamma Course
        $abhidhamma = $courses['abhidhammattha-sangaha'] ?? null;
        $lesson1 = null;
        if ($abhidhamma) {
            $lesson1 = Lesson::updateOrCreate(
                ['course_id' => $abhidhamma->id, 'slug' => 'lesson-1-four-paramattha-dhammas'],
                [
                    'title' => 'Lesson 1: The Four Ultimate Realities (Cattāri Paramatthadhamma)',
                    'order' => 1,
                    'summary' => 'Introduction to the ultimate realities: Consciousness (Citta), Mental Factors (Cetasika), Matter (Rūpa), and Nibbāna.',
                    'reading_content' => "<h2>1. Tục Đế (Sammuti Sacca) và Chân Đế (Paramattha Sacca)</h2><p>Trong giáo lý Vi Diệu Pháp (Abhidhamma), Đức Phật phân biệt rõ ràng hai mức độ chân lý:</p><ul><li><strong>Tục đế (Sammuti Sacca)</strong>: Những khái niệm chế định theo ước định thế gian như con người, cái bàn, căn nhà, ngọn núi.</li><li><strong>Chân đế (Paramattha Sacca)</strong>: Những thực tại tối hậu không thể chia nhỏ hơn nữa, tồn tại theo tự tính pháp (svabhāva) chân thực.</li></ul><h2>2. Bốn Pháp Chân Đế</h2><ol><li><strong>Tâm (Citta)</strong>: Bản thể nhận biết đối tượng (cảnh). Có 89 hoặc 121 thứ tâm.</li><li><strong>Tâm sở (Cetasika)</strong>: Các trạng thái đồng sinh với tâm, phối hợp tạo nên suy nghĩ và tình cảm. Có 52 tâm sở.</li><li><strong>Sắc pháp (Rūpa)</strong>: Các hiện tượng vật lý sinh diệt do nghiệp, tâm, thời tiết, và vật thực. Có 28 sắc pháp.</li><li><strong>Niết-bàn (Nibbāna)</strong>: Pháp vô vi (Asaṅkhata Dhamma), tịch tịnh, dứt trừ mọi khổ não luân hồi.</li></ol>",
                    'reading_file_url' => 'https://example.com/materials/paramattha-dhamma-intro.pdf',
                    'document_urls' => [
                        ['title' => 'Bản tóm tắt 4 Chân Đế (PDF)', 'url' => 'https://example.com/materials/paramattha-dhamma-intro.pdf'],
                    ],
                    'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    'video_urls' => [
                        ['title' => 'Bài giảng 01: Giới thiệu 4 Pháp Chân Đế', 'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
                    ],
                ]
            );

            Lesson::updateOrCreate(
                ['course_id' => $abhidhamma->id, 'slug' => 'lesson-2-wholesome-consciousness'],
                [
                    'title' => 'Lesson 2: Wholesome Consciousness (Kāmāvacara Kusala Citta)',
                    'order' => 2,
                    'summary' => 'Study of 8 Wholesome Consciousnesses in the Sense Sphere accompanied by joy and equanimity.',
                    'reading_content' => "<h2>Tâm Thiện Dục Giới (Kāmāvacara Kusala Citta)</h2><p>Có 8 thứ tâm thiện dục giới xuất hiện khi hành giả làm việc phước thiện (bố thí, trì giới, tu tập thiền quán):</p><ol><li>Tâm câu hành hỷ, tương ưng tri thức, vô trợ (<em>Somanassasahagataṃ ñāṇasampayuttaṃ asaṅkhārikaṃ</em>).</li><li>Tâm câu hành hỷ, tương ưng tri thức, hữu trợ (<em>Somanassasahagataṃ ñāṇasampayuttaṃ sasaṅkhārikaṃ</em>).</li><li>Tâm câu hành hỷ, bất tương ưng tri thức, vô trợ.</li><li>Tâm câu hành hỷ, bất tương ưng tri thức, hữu trợ.</li><li>Bốn tâm thiện câu hành xả (Upekkhāsahagataṃ) tương ứng.</li></ol>",
                    'reading_file_url' => 'https://example.com/materials/kamavacara-kusala-citta.pdf',
                    'document_urls' => [
                        ['title' => 'Sơ đồ 8 Tâm Thiện Dục Giới', 'url' => 'https://example.com/materials/kamavacara-kusala-citta.pdf'],
                    ],
                    'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    'video_urls' => [
                        ['title' => 'Bài giảng 02: Phân tích 8 Tâm Thiện', 'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
                    ],
                ]
            );

            // 5. Seed Question Bank for Abhidhamma Lesson 1
            $questions = [
                [
                    'question_type' => Question::TYPE_QUIZ,
                    'question_text' => 'Bao nhiêu pháp chân đế (Paramattha Dhamma) được phân loại trong Thắng Pháp Tập Yếu Luận?',
                    'option_a' => '2 pháp: Sắc pháp và Tâm pháp',
                    'option_b' => '3 pháp: Tâm, Tâm sở, Sắc pháp',
                    'option_c' => '4 pháp: Tâm, Tâm sở, Sắc pháp, Niết-bàn',
                    'option_d' => '5 pháp: Sắc, Thọ, Tưởng, Hành, Thức',
                    'correct_option' => 'C',
                    'explanation' => 'Trong Abhidhammattha-sangaha, bốn pháp chân đế là Citta (Tâm), Cetasika (Tâm sở), Rūpa (Sắc), và Nibbāna (Niết-bàn).',
                    'type' => 'both',
                ],
                [
                    'question_type' => Question::TYPE_QUIZ,
                    'question_text' => 'Trong 4 pháp chân đế, pháp nào là pháp vô vi (Asaṅkhata Dhamma)?',
                    'option_a' => 'Tâm (Citta)',
                    'option_b' => 'Tâm sở (Cetasika)',
                    'option_c' => 'Sắc pháp (Rūpa)',
                    'option_d' => 'Niết-bàn (Nibbāna)',
                    'correct_option' => 'D',
                    'explanation' => 'Niết-bàn là pháp vô vi duy nhất, không do duyên tạo tác, không sinh diệt theo thời gian.',
                    'type' => 'both',
                ],
                [
                    'question_type' => Question::TYPE_QUIZ,
                    'question_text' => 'Có tất cả bao nhiêu tâm sở (Cetasika) đồng sinh cùng với tâm?',
                    'option_a' => '52 tâm sở',
                    'option_b' => '89 tâm sở',
                    'option_c' => '28 tâm sở',
                    'option_d' => '121 tâm sở',
                    'correct_option' => 'A',
                    'explanation' => 'Có 52 tâm sở phân loại thành: 7 biến hành, 6 biệt cảnh, 14 bất thiện, và 25 tịnh hảo.',
                    'type' => 'both',
                ],
                [
                    'question_type' => Question::TYPE_QUIZ,
                    'question_text' => 'Sắc pháp (Rūpa) bao gồm tổng cộng bao nhiêu yếu tố trong Vi Diệu Pháp?',
                    'option_a' => '18 sắc pháp',
                    'option_b' => '24 sắc pháp',
                    'option_c' => '28 sắc pháp',
                    'option_d' => '32 sắc pháp',
                    'correct_option' => 'C',
                    'explanation' => 'Sắc pháp gồm 4 sắc đại hiển (Đất, Nước, Lửa, Gió) và 24 sắc y sinh, tổng cộng 28 sắc pháp.',
                    'type' => 'both',
                ],
                [
                    'question_type' => Question::TYPE_QUIZ,
                    'question_text' => 'Đặc tính cốt lõi của Tâm (Citta) là gì?',
                    'option_a' => 'Nhận biết đối tượng/cảnh (Ārammaṇavijānana-lakkhaṇa)',
                    'option_b' => 'Cảm thọ hoan hỷ hay khổ ưu',
                    'option_c' => 'Ghi nhớ hình ảnh trong quá khứ',
                    'option_d' => 'Quyết định hành vi tạo nghiệp',
                    'correct_option' => 'A',
                    'explanation' => 'Tâm có trạng thái nhận biết đối tượng (cảnh), trong khi cảm thọ hay ghi nhớ là chức năng của các tâm sở đồng sinh.',
                    'type' => 'both',
                ],
                [
                    'question_type' => Question::TYPE_ESSAY,
                    'question_text' => 'Hãy giải thích sự khác biệt cốt yếu giữa Tục đế (Sammuti Sacca) và Chân đế (Paramattha Sacca) trong đời sống tu học hằng ngày.',
                    'option_a' => null,
                    'option_b' => null,
                    'option_c' => null,
                    'option_d' => null,
                    'correct_option' => null,
                    'explanation' => 'Bài tự luận nhằm đánh giá sự thấu hiểu về việc nhận biết danh sắc thực tại để không bám chấp vào khái niệm tôi, ta, người khác.',
                    'type' => 'exam',
                ],
            ];

            foreach ($questions as $q) {
                Question::updateOrCreate(
                    [
                        'course_id' => $abhidhamma->id,
                        'lesson_id' => $lesson1->id,
                        'question_text' => $q['question_text'],
                    ],
                    $q
                );
            }
        }

        // 6. Seed Lessons for Essential Dhamma Course
        $dhamma = $courses['essential-dhamma'] ?? null;
        if ($dhamma) {
            Lesson::updateOrCreate(
                ['course_id' => $dhamma->id, 'slug' => 'the-four-noble-truths'],
                [
                    'title' => 'Lesson 1: The Four Noble Truths (Cattāri Ariyasaccāni)',
                    'order' => 1,
                    'summary' => 'Direct understanding of Dukkha, Samudaya, Nirodha, and Magga as taught in Dhammacakkappavattana Sutta.',
                    'reading_content' => "<h2>Bốn Sự Thật Màu Nhiệm (Tứ Diệu Đế)</h2><p>Tứ Diệu Đế là giáo lý trung tâm bao trùm toàn bộ lời dạy của Đức Phật:</p><ol><li><strong>Khổ đế (Dukkha Sacca)</strong>: Thực trạng bất toại nguyện của thân tâm ngũ uẩn.</li><li><strong>Tập đế (Samudaya Sacca)</strong>: Nguyên nhân gốc rễ là ái dục (taṇhā).</li><li><strong>Diệt đế (Nirodha Sacca)</strong>: Sự chấm dứt hoàn toàn ái dục và khổ đau — Niết-bàn.</li><li><strong>Đạo đế (Magga Sacca)</strong>: Con đường dẫn đến chấm dứt khổ — Bát Chánh Đạo.</li></ol>",
                    'document_urls' => [
                        ['title' => 'Tứ Thánh Đế Giảng Giải', 'url' => 'https://example.com/materials/four-noble-truths.pdf'],
                    ],
                    'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                ]
            );

            Lesson::updateOrCreate(
                ['course_id' => $dhamma->id, 'slug' => 'the-noble-eightfold-path'],
                [
                    'title' => 'Lesson 2: The Noble Eightfold Path (Ariya Aṭṭhaṅgika Magga)',
                    'order' => 2,
                    'summary' => 'Right View, Right Thought, Right Speech, Right Action, Right Livelihood, Right Effort, Right Mindfulness, and Right Concentration.',
                    'reading_content' => "<h2>Con Đường Tám Chi Thánh (Bát Chánh Đạo)</h2><p>Con đường tám chi gồm ba nhóm tu tập Giới - Định - Tuệ:</p><ul><li><strong>Tuệ học (Paññā)</strong>: Chánh kiến (Sammā-diṭṭhi), Chánh tư duy (Sammā-saṅkappa).</li><li><strong>Giới học (Sīla)</strong>: Chánh ngữ (Sammā-vācā), Chánh nghiệp (Sammā-kammanta), Chánh mạng (Sammā-ājīva).</li><li><strong>Định học (Samādhi)</strong>: Chánh tinh tấn (Sammā-vāyāma), Chánh niệm (Sammā-sati), Chánh định (Sammā-samādhi).</li></ul>",
                    'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                ]
            );
        }

        // 7. Seed Lessons for Pali Grammar Course
        $paliGrammar = $courses['pali-grammar'] ?? null;
        if ($paliGrammar) {
            Lesson::updateOrCreate(
                ['course_id' => $paliGrammar->id, 'slug' => 'pali-alphabet-and-declension'],
                [
                    'title' => 'Lesson 1: The Pali Alphabet and Masculine Noun Declension',
                    'order' => 1,
                    'summary' => 'Introduction to the 41 Pali sounds and masculine nouns ending in -a (e.g. Buddha, Dhamma, Sangha).',
                    'reading_content' => "<h2>Bảng Mẫu Tự Pāḷi và Biến Cách Danh Từ Nam Tánh Tận Cùng -a</h2><p>Hệ thống ngữ âm Pāḷi gồm 41 âm: 8 nguyên âm (Sara) và 33 phụ âm (Vyañjana).</p><h3>Bảng biến cách danh từ 'Buddha' (Đức Phật):</h3><ul><li>Chủ cách (Nominative): Buddho (số ít), Buddhā (số nhiều)</li><li>Đối cách (Accusative): Buddhaṃ (số ít), Buddhe (số nhiều)</li><li>Sở dụng cách (Instrumental): Buddhena (số ít), Buddhehi / Buddhebhi (số nhiều)</li><li>Xuất xứ cách (Ablative): Buddhasmā / Buddhamhā / Buddhā (số ít), Buddhehi (số nhiều)</li><li>Sở hữu cách (Genitive): Buddhassa (số ít), Buddhānaṃ (số nhiều)</li><li>Định sở cách (Locative): Buddhasmiṃ / Buddhamhi / Buddhe (số ít), Buddhesu (số nhiều)</li><li>Hô cách (Vocative): Buddha / Buddhā (số ít), Buddhā (số nhiều)</li></ul>",
                    'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                ]
            );
        }

        // 8. Enroll Students in Classes
        $activeClass = $createdClasses['Abhidhammattha-sangaha Class 01'] ?? CourseClass::where('name', 'Abhidhammattha-sangaha Class 01')->first();
        $completedClass = $createdClasses['Essential Dhamma Class 04'] ?? CourseClass::where('name', 'Essential Dhamma Class 04')->first();
        $upcomingClass = $createdClasses['Pali Grammar Class 02'] ?? CourseClass::where('name', 'Pali Grammar Class 02')->first();

        if ($activeClass) {
            $activeClass->students()->syncWithoutDetaching([
                $student1->id => ['enrolled_at' => now()->subMonth(), 'status' => 'enrolled'],
                $student2->id => ['enrolled_at' => now()->subMonth(), 'status' => 'enrolled'],
                $student3->id => ['enrolled_at' => now()->subMonth(), 'status' => 'enrolled'],
            ]);
        }

        if ($completedClass) {
            $completedClass->students()->syncWithoutDetaching([
                $student1->id => ['enrolled_at' => now()->subMonths(4), 'status' => 'completed', 'final_grade' => 95.0, 'completed_at' => now()->subMonth()],
                $student2->id => ['enrolled_at' => now()->subMonths(4), 'status' => 'completed', 'final_grade' => 88.0, 'completed_at' => now()->subMonth()],
            ]);
        }

        if ($upcomingClass) {
            $upcomingClass->students()->syncWithoutDetaching([
                $student3->id => ['enrolled_at' => now()->subDays(3), 'status' => 'enrolled'],
            ]);
        }

        // 9. Seed Student Progress, Quizzes, Exam Attempts, and Feedbacks
        if ($lesson1 && $activeClass) {
            // Student 1 progress: completed lesson 1 and took exam
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

            // Student 1 incorrect question tracking
            $q4 = Question::where('course_id', $abhidhamma->id)->skip(3)->first();
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

            // Student 1 exam attempt record
            StudentExamAttempt::updateOrCreate(
                ['user_id' => $student1->id, 'class_id' => $activeClass->id, 'course_id' => $activeClass->course_id, 'attempt_type' => 'exam'],
                [
                    'total_questions' => 5,
                    'correct_count' => 4,
                    'incorrect_count' => 1,
                    'review_needed_count' => 1,
                    'score' => 80.0,
                    'answers_summary' => [
                        'quiz' => [
                            'q1' => ['question_type' => 'quiz', 'is_correct' => true],
                            'q2' => ['question_type' => 'quiz', 'is_correct' => true],
                            'q3' => ['question_type' => 'quiz', 'is_correct' => true],
                            'q4' => ['question_type' => 'quiz', 'is_correct' => false],
                            'q5' => ['question_type' => 'quiz', 'is_correct' => true],
                        ],
                        'essay' => [],
                    ],
                ]
            );

            // Student 2 progress: in progress, submitted feedback
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
