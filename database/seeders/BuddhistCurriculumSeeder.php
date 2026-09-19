<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;

class BuddhistCurriculumSeeder extends Seeder
{
    /**
     * Seed core Buddhist Curriculum (Courses catalog).
     * Classes, lessons, and questions will be added dynamically or via production data.
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
    }
}

