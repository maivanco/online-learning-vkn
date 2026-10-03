<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Lesson;
use App\Models\Question;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class QuestionImportService
{
    /**
     * Generate pre-formatted Excel spreadsheet template for question import.
     */
    public function generateTemplate(): Spreadsheet
    {
        $spreadsheet = new Spreadsheet();

        // ----------------------------------------------------
        // Sheet 1: Questions Template
        // ----------------------------------------------------
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Questions');

        $headers = [
            'A1' => 'question_type',
            'B1' => 'question_text',
            'C1' => 'option_a',
            'D1' => 'option_b',
            'E1' => 'option_c',
            'F1' => 'option_d',
            'G1' => 'correct_option',
            'H1' => 'explanation',
            'I1' => 'type',
        ];

        foreach ($headers as $cell => $value) {
            $sheet->setCellValue($cell, $value);
        }

        // Header Styling (Amber theme matching app brand)
        $headerStyle = [
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'B45309'], // amber-700
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '78350F'],
                ],
            ],
        ];

        $sheet->getStyle('A1:I1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(30);

        // Sample Row 1: Quiz Question
        $sheet->setCellValue('A2', 'quiz');
        $sheet->setCellValue('B2', 'What is the First Noble Truth in Buddhism (Tứ Diệu Đế)?');
        $sheet->setCellValue('C2', 'Dukkha (The Truth of Suffering)');
        $sheet->setCellValue('D2', 'Samudaya (The Truth of the Cause of Suffering)');
        $sheet->setCellValue('E2', 'Nirodha (The Truth of the Cessation of Suffering)');
        $sheet->setCellValue('F2', 'Magga (The Truth of the Path to Cessation)');
        $sheet->setCellValue('G2', 'A');
        $sheet->setCellValue('H2', 'The First Noble Truth taught by the Buddha is Dukkha Sacca (The Noble Truth of Suffering).');
        $sheet->setCellValue('I2', 'both');

        // Sample Row 2: Essay Question
        $sheet->setCellValue('A3', 'essay');
        $sheet->setCellValue('B3', 'Explain the practical importance of Sila (Morality) as the foundation for Samadhi and Panna in daily Buddhist practice.');
        $sheet->setCellValue('C3', '');
        $sheet->setCellValue('D3', '');
        $sheet->setCellValue('E3', '');
        $sheet->setCellValue('F3', '');
        $sheet->setCellValue('G3', '');
        $sheet->setCellValue('H3', "Suggested outline:\n1. Sila purifies verbal and bodily actions.\n2. Non-remorse brings mental calm and joy.\n3. Concentrated mind leads to wisdom (Panna).");
        $sheet->setCellValue('I3', 'both');

        // Data rows style
        $dataStyle = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'E5E7EB'],
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_TOP,
                'wrapText' => true,
            ],
        ];
        $sheet->getStyle('A2:I3')->applyFromArray($dataStyle);

        // Specific alignments
        $sheet->getStyle('A2:A3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('G2:G3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('I2:I3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Column widths
        $columnWidths = [
            'A' => 16, // question_type
            'B' => 45, // question_text
            'C' => 25, // option_a
            'D' => 25, // option_b
            'E' => 25, // option_c
            'F' => 25, // option_d
            'G' => 16, // correct_option
            'H' => 40, // explanation
            'I' => 16, // type
        ];

        foreach ($columnWidths as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        // ----------------------------------------------------
        // Sheet 2: Guide & Instructions
        // ----------------------------------------------------
        $instructionSheet = $spreadsheet->createSheet();
        $instructionSheet->setTitle('Guide & Notes');

        $instructionSheet->setCellValue('A1', 'QUESTION IMPORT INSTRUCTIONS');
        $instructionSheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('B45309');

        $instructions = [
            ['Column Name', 'Required?', 'Allowed Values', 'Description & Rules'],
            ['question_type', 'YES', 'quiz, essay', '"quiz" for Multiple Choice questions. "essay" for Essay questions.'],
            ['question_text', 'YES', 'Text / HTML', 'The question content or prompt.'],
            ['option_a', 'Quiz only', 'Text', 'Required if question_type is "quiz". Leave empty for "essay".'],
            ['option_b', 'Quiz only', 'Text', 'Required if question_type is "quiz". Leave empty for "essay".'],
            ['option_c', 'Quiz only', 'Text', 'Required if question_type is "quiz". Leave empty for "essay".'],
            ['option_d', 'Quiz only', 'Text', 'Required if question_type is "quiz". Leave empty for "essay".'],
            ['correct_option', 'Quiz only', 'A, B, C, D', 'Required if question_type is "quiz". Must be A, B, C, or D. Leave empty for "essay".'],
            ['explanation', 'NO', 'Text', 'Explanation for the answer (Quiz) or sample answer / rubric guidelines (Essay).'],
            ['type', 'NO', 'both, practice, exam', 'Usage purpose: "both" (default), "practice" (Practice only), or "exam" (Final exam only).'],
        ];

        $rowNum = 3;
        foreach ($instructions as $row) {
            $instructionSheet->fromArray($row, null, "A{$rowNum}");
            $rowNum++;
        }

        $instructionSheet->getStyle('A3:D3')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4B5563'],
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $instructionSheet->getStyle('A3:D12')->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'D1D5DB'],
                ],
            ],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
        ]);

        $instructionSheet->getColumnDimension('A')->setWidth(18);
        $instructionSheet->getColumnDimension('B')->setWidth(15);
        $instructionSheet->getColumnDimension('C')->setWidth(25);
        $instructionSheet->getColumnDimension('D')->setWidth(75);

        // Switch back to Questions sheet as primary active tab
        $spreadsheet->setActiveSheetIndex(0);

        return $spreadsheet;
    }

    /**
     * Parse and import questions from uploaded Excel or CSV file into a specified lesson.
     *
     * @return array{success: bool, imported_count: int, errors: array<string>}
     */
    public function import(UploadedFile $file, int $courseId, int $lessonId): array
    {
        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'imported_count' => 0,
                'errors' => ['Failed to read Excel file: ' . $e->getMessage()],
            ];
        }

        // Verify lesson belongs to the selected course
        $lessonExists = Lesson::where('course_id', $courseId)->where('id', $lessonId)->exists();
        if (!$lessonExists) {
            return [
                'success' => false,
                'imported_count' => 0,
                'errors' => ['The selected lesson does not belong to the chosen course.'],
            ];
        }

        // Get questions worksheet (prefer sheet titled "Questions", otherwise active sheet)
        $sheet = $spreadsheet->getSheetByName('Questions') ?? $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray(null, true, true, false);

        if (empty($rows) || count($rows) < 2) {
            return [
                'success' => false,
                'imported_count' => 0,
                'errors' => ['The uploaded Excel file does not contain any data rows.'],
            ];
        }

        // Normalize header row
        $rawHeaders = array_map(function ($val) {
            return strtolower(trim((string) $val));
        }, $rows[0]);

        $headerMap = $this->buildHeaderMap($rawHeaders);

        if (!isset($headerMap['question_text'])) {
            return [
                'success' => false,
                'imported_count' => 0,
                'errors' => ['Required column "question_text" (or "cau_hoi") was not found in the header row.'],
            ];
        }

        $questionsToInsert = [];
        $errors = [];
        $now = now();

        for ($i = 1; $i < count($rows); $i++) {
            $rowNum = $i + 1; // 1-indexed Excel row
            $row = $rows[$i];

            // Check if entire row is empty
            $nonEmptyCells = array_filter($row, fn($val) => $val !== null && trim((string) $val) !== '');
            if (empty($nonEmptyCells)) {
                continue;
            }

            $questionText = $this->getCellString($row, $headerMap, 'question_text');
            if ($questionText === '') {
                $errors[] = "Row {$rowNum}: Question text is required.";
                continue;
            }

            // Determine question type (quiz or essay)
            $rawType = strtolower($this->getCellString($row, $headerMap, 'question_type'));
            $questionType = Question::TYPE_QUIZ;
            if (str_contains($rawType, 'essay') || str_contains($rawType, 'luan')) {
                $questionType = Question::TYPE_ESSAY;
            } elseif (str_contains($rawType, 'quiz') || str_contains($rawType, 'nghiem')) {
                $questionType = Question::TYPE_QUIZ;
            } elseif ($rawType === '') {
                // If type is empty, check if option_a is present to infer
                $optA = $this->getCellString($row, $headerMap, 'option_a');
                $questionType = $optA !== '' ? Question::TYPE_QUIZ : Question::TYPE_ESSAY;
            } else {
                $errors[] = "Row {$rowNum}: Invalid question_type '{$rawType}'. Must be 'quiz' or 'essay'.";
                continue;
            }

            // Resolve usage type (both, practice, exam)
            $rawUsage = strtolower($this->getCellString($row, $headerMap, 'type'));
            $usageType = 'both';
            if (str_contains($rawUsage, 'practice') || str_contains($rawUsage, 'luyen')) {
                $usageType = 'practice';
            } elseif (str_contains($rawUsage, 'exam') || str_contains($rawUsage, 'thi')) {
                $usageType = 'exam';
            } elseif ($rawUsage === 'both' || $rawUsage === '' || str_contains($rawUsage, 'ca')) {
                $usageType = 'both';
            } else {
                $errors[] = "Row {$rowNum}: Invalid usage type '{$rawUsage}'. Must be 'both', 'practice', or 'exam'.";
                continue;
            }

            $explanation = $this->getCellString($row, $headerMap, 'explanation');

            if ($questionType === Question::TYPE_QUIZ) {
                $optA = $this->getCellString($row, $headerMap, 'option_a');
                $optB = $this->getCellString($row, $headerMap, 'option_b');
                $optC = $this->getCellString($row, $headerMap, 'option_c');
                $optD = $this->getCellString($row, $headerMap, 'option_d');
                $rawCorrect = strtoupper(trim($this->getCellString($row, $headerMap, 'correct_option')));

                if ($optA === '' || $optB === '' || $optC === '' || $optD === '') {
                    $errors[] = "Row {$rowNum}: All options (A, B, C, D) are required for multiple choice questions.";
                    continue;
                }

                if (!in_array($rawCorrect, ['A', 'B', 'C', 'D'], true)) {
                    $errors[] = "Row {$rowNum}: Correct option must be A, B, C, or D (got '{$rawCorrect}').";
                    continue;
                }

                $questionsToInsert[] = [
                    'course_id' => $courseId,
                    'lesson_id' => $lessonId,
                    'question_type' => Question::TYPE_QUIZ,
                    'question_text' => $questionText,
                    'option_a' => $optA,
                    'option_b' => $optB,
                    'option_c' => $optC,
                    'option_d' => $optD,
                    'correct_option' => $rawCorrect,
                    'explanation' => $explanation !== '' ? $explanation : null,
                    'type' => $usageType,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            } else {
                // Essay Question
                $questionsToInsert[] = [
                    'course_id' => $courseId,
                    'lesson_id' => $lessonId,
                    'question_type' => Question::TYPE_ESSAY,
                    'question_text' => $questionText,
                    'option_a' => null,
                    'option_b' => null,
                    'option_c' => null,
                    'option_d' => null,
                    'correct_option' => null,
                    'explanation' => $explanation !== '' ? $explanation : null,
                    'type' => $usageType,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if (!empty($errors)) {
            return [
                'success' => false,
                'imported_count' => 0,
                'errors' => $errors,
            ];
        }

        if (empty($questionsToInsert)) {
            return [
                'success' => false,
                'imported_count' => 0,
                'errors' => ['No valid question records were found to import.'],
            ];
        }

        DB::transaction(function () use ($questionsToInsert) {
            foreach (array_chunk($questionsToInsert, 100) as $chunk) {
                Question::insert($chunk);
            }
        });

        return [
            'success' => true,
            'imported_count' => count($questionsToInsert),
            'errors' => [],
        ];
    }

    /**
     * Map column indexes based on header names and aliases.
     *
     * @param array<int, string> $rawHeaders
     * @return array<string, int>
     */
    protected function buildHeaderMap(array $rawHeaders): array
    {
        $map = [];

        foreach ($rawHeaders as $index => $header) {
            $header = strtolower(trim($header));

            if (in_array($header, ['question_type', 'loai_cau_hoi', 'loai'])) {
                $map['question_type'] = $index;
            } elseif (in_array($header, ['question_text', 'question', 'cau_hoi', 'noi_dung'])) {
                $map['question_text'] = $index;
            } elseif (in_array($header, ['option_a', 'phuong_an_a', 'dap_an_a', 'a'])) {
                $map['option_a'] = $index;
            } elseif (in_array($header, ['option_b', 'phuong_an_b', 'dap_an_b', 'b'])) {
                $map['option_b'] = $index;
            } elseif (in_array($header, ['option_c', 'phuong_an_c', 'dap_an_c', 'c'])) {
                $map['option_c'] = $index;
            } elseif (in_array($header, ['option_d', 'phuong_an_d', 'dap_an_d', 'd'])) {
                $map['option_d'] = $index;
            } elseif (in_array($header, ['correct_option', 'correct_answer', 'dap_an_dung', 'dap_an'])) {
                $map['correct_option'] = $index;
            } elseif (in_array($header, ['explanation', 'giai_thich', 'dap_an_mau', 'sample_answer', 'huong_dan_cham'])) {
                $map['explanation'] = $index;
            } elseif (in_array($header, ['type', 'usage_type', 'muc_dich', 'su_dung'])) {
                // Only assign if question_type didn't already claim this index
                if (!isset($map['question_type']) || $map['question_type'] !== $index) {
                    $map['type'] = $index;
                }
            }
        }

        return $map;
    }

    /**
     * Safely get trimmed string from row by mapped key.
     *
     * @param array<int, mixed> $row
     * @param array<string, int> $headerMap
     */
    protected function getCellString(array $row, array $headerMap, string $key): string
    {
        if (!isset($headerMap[$key])) {
            return '';
        }

        $index = $headerMap[$key];
        $val = $row[$index] ?? '';

        return trim((string) $val);
    }
}
