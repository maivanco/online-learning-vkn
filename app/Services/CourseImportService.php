<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class CourseImportService
{
    /**
     * Parse an uploaded spreadsheet file and extract sheet names, headers, sample rows, and suggested mappings.
     *
     * @return array{
     *     success: bool,
     *     error?: string,
     *     headers: array<string>,
     *     preview_rows: array<int, array<string, string|null>>,
     *     total_rows: int,
     *     suggested_mappings: array<string, string>,
     *     suggested_course_title: string|null,
     * }
     */
    public function preview(UploadedFile $file): array
    {
        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'error' => 'Failed to read file: '.$e->getMessage(),
                'headers' => [],
                'preview_rows' => [],
                'total_rows' => 0,
                'suggested_mappings' => [],
                'suggested_course_title' => null,
            ];
        }

        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray(null, true, true, false);

        if (empty($rows) || count($rows) < 2) {
            return [
                'success' => false,
                'error' => 'The uploaded file contains no data rows.',
                'headers' => [],
                'preview_rows' => [],
                'total_rows' => 0,
                'suggested_mappings' => [],
                'suggested_course_title' => null,
            ];
        }

        // Row 0 is headers
        $rawHeaders = $rows[0];
        $headers = [];
        foreach ($rawHeaders as $idx => $h) {
            $trimmed = trim((string) ($h ?? ''));
            $headers[] = $trimmed !== '' ? $trimmed : 'Column_'.($idx + 1);
        }

        // Preview up to 5 data rows
        $previewRows = [];
        $dataRowCount = count($rows) - 1;
        $maxPreview = min(5, $dataRowCount);

        for ($i = 1; $i <= $maxPreview; $i++) {
            $rowObj = [];
            foreach ($headers as $colIdx => $headerName) {
                $val = $rows[$i][$colIdx] ?? null;
                $rowObj[$headerName] = $val !== null ? (string) $val : null;
            }
            $previewRows[] = $rowObj;
        }

        // Detect suggested mappings
        $suggestedMappings = [];
        $suggestedCourseTitle = null;

        foreach ($headers as $colIdx => $headerName) {
            $norm = mb_strtolower($headerName, 'UTF-8');

            if ($norm === 'title' || $this->matchesKeyword($norm, ['noi dung', 'nội dung', 'lesson', 'bai hoc', 'bài học', 'title', 'tieu de', 'tiêu đề'])) {
                $suggestedMappings[$headerName] = 'title';
            } elseif ($norm === 'course' || $norm === 'course_id' || $this->matchesKeyword($norm, ['mon hoc', 'môn học', 'course', 'khoa hoc', 'khóa học'])) {
                $suggestedMappings[$headerName] = 'ignore';
                // Look for first non-empty course name in data rows
                for ($r = 1; $r <= min(10, $dataRowCount); $r++) {
                    $cVal = trim((string) ($rows[$r][$colIdx] ?? ''));
                    if ($cVal !== '') {
                        $suggestedCourseTitle = $cVal;
                        break;
                    }
                }
            } elseif ($norm === 'video_urls' || $norm === 'video_url' || $this->matchesKeyword($norm, ['video', 'youtube', 'clip', 'lecture'])) {
                $suggestedMappings[$headerName] = 'video_urls';
            } elseif ($norm === 'document_urls' || $norm === 'reading_file_url' || $this->matchesKeyword($norm, ['document', 'tai lieu', 'tài liệu', 'pdf', 'slide', 'doc', 'link', 'tham khao', 'tham khảo'])) {
                $suggestedMappings[$headerName] = 'document_urls';
            } elseif ($norm === 'reading_content' || $this->matchesKeyword($norm, ['reading_content', 'content', 'noi dung bai doc', 'nội dung bài đọc'])) {
                $suggestedMappings[$headerName] = 'reading_content';
            } elseif ($norm === 'summary' || $this->matchesKeyword($norm, ['tom tat', 'tóm tắt', 'summary', 'desc', 'mo ta', 'mô tả'])) {
                $suggestedMappings[$headerName] = 'summary';
            } elseif ($norm === 'order' || $this->matchesKeyword($norm, ['thu tu', 'thứ tự', 'order', 'buoi', 'buổi', 'session', 'stt'])) {
                $suggestedMappings[$headerName] = 'order';
            } else {
                $suggestedMappings[$headerName] = 'ignore';
            }
        }

        return [
            'success' => true,
            'headers' => $headers,
            'preview_rows' => $previewRows,
            'total_rows' => $dataRowCount,
            'suggested_mappings' => $suggestedMappings,
            'suggested_course_title' => $suggestedCourseTitle,
        ];
    }

    /**
     * Import rows into the target course using the field mappings provided.
     *
     * @param  array<string, string>  $fieldMappings  Map of HeaderName => targetField ('title', 'order', 'summary', 'reading_content', 'video_urls', 'document_urls', 'ignore')
     * @return array{
     *     success: bool,
     *     imported_count: int,
     *     skipped_count: int,
     *     course_id: int,
     *     errors: array<string>,
     * }
     */
    public function import(UploadedFile $file, int $courseId, array $fieldMappings): array
    {
        $course = Course::find($courseId);
        if (! $course) {
            return [
                'success' => false,
                'imported_count' => 0,
                'skipped_count' => 0,
                'course_id' => $courseId,
                'errors' => ['Target course does not exist.'],
            ];
        }

        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'imported_count' => 0,
                'skipped_count' => 0,
                'course_id' => $courseId,
                'errors' => ['Failed to read Excel file: '.$e->getMessage()],
            ];
        }

        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray(null, true, true, false);

        if (empty($rows) || count($rows) < 2) {
            return [
                'success' => false,
                'imported_count' => 0,
                'skipped_count' => 0,
                'course_id' => $courseId,
                'errors' => ['No data rows found in the spreadsheet.'],
            ];
        }

        $rawHeaders = $rows[0];
        $headers = [];
        foreach ($rawHeaders as $idx => $h) {
            $trimmed = trim((string) ($h ?? ''));
            $headers[] = $trimmed !== '' ? $trimmed : 'Column_'.($idx + 1);
        }

        // Build index lookup
        // $colNameToIndex[headerName] = colIndex
        $colNameToIndex = [];
        foreach ($headers as $colIdx => $hName) {
            $colNameToIndex[$hName] = $colIdx;
        }

        // Identify which columns map to what
        $titleCols = [];
        $orderCols = [];
        $summaryCols = [];
        $contentCols = [];
        $videoCols = [];
        $docCols = [];

        foreach ($fieldMappings as $hName => $target) {
            if (! isset($colNameToIndex[$hName])) {
                continue;
            }
            $idx = $colNameToIndex[$hName];
            match ($target) {
                'title' => $titleCols[] = ['index' => $idx, 'header' => $hName],
                'order' => $orderCols[] = ['index' => $idx, 'header' => $hName],
                'summary' => $summaryCols[] = ['index' => $idx, 'header' => $hName],
                'reading_content' => $contentCols[] = ['index' => $idx, 'header' => $hName],
                'video_urls' => $videoCols[] = ['index' => $idx, 'header' => $hName],
                'document_urls' => $docCols[] = ['index' => $idx, 'header' => $hName],
                default => null,
            };
        }

        if (empty($titleCols)) {
            return [
                'success' => false,
                'imported_count' => 0,
                'skipped_count' => 0,
                'course_id' => $courseId,
                'errors' => ['No column mapped to "Lesson Title" (title).'],
            ];
        }

        $currentMaxOrder = (int) (Lesson::where('course_id', $courseId)->max('order') ?? 0);
        $importedCount = 0;
        $skippedCount = 0;
        $errors = [];

        for ($r = 1; $r < count($rows); $r++) {
            $row = $rows[$r];
            $rowNum = $r + 1;

            // Extract and clean Title (Remove all linebreaks, condense multiple spaces)
            $titleRaw = '';
            foreach ($titleCols as $tCol) {
                $val = trim((string) ($row[$tCol['index']] ?? ''));
                if ($val !== '') {
                    $titleRaw .= ($titleRaw !== '' ? ' - ' : '').$val;
                }
            }

            $title = $this->cleanSingleLine($titleRaw);
            if ($title === '') {
                $skippedCount++;

                continue;
            }

            // Extract Order
            $order = null;
            foreach ($orderCols as $oCol) {
                $val = trim((string) ($row[$oCol['index']] ?? ''));
                if ($val !== '' && is_numeric($val)) {
                    $order = (int) $val;
                    break;
                }
            }
            if ($order === null) {
                // Try to extract from title if has "Buổi X" or "Lesson X"
                if (preg_match('/(?:buổi|buoi|lesson|unit)\s*(\d+)/i', $title, $matches)) {
                    $order = (int) $matches[1];
                } else {
                    $currentMaxOrder++;
                    $order = $currentMaxOrder;
                }
            }

            // Extract Summary
            $summaryParts = [];
            foreach ($summaryCols as $sCol) {
                $val = trim((string) ($row[$sCol['index']] ?? ''));
                if ($val !== '') {
                    $summaryParts[] = $val;
                }
            }
            $summary = ! empty($summaryParts) ? implode("\n\n", $summaryParts) : null;

            // Extract reading_content
            $contentParts = [];
            foreach ($contentCols as $cCol) {
                $val = trim((string) ($row[$cCol['index']] ?? ''));
                if ($val !== '') {
                    $contentParts[] = $val;
                }
            }

            // Extract Videos
            $videoUrls = [];
            foreach ($videoCols as $vCol) {
                $rawVal = (string) ($row[$vCol['index']] ?? '');
                $extracted = $this->parseLabeledUrls($rawVal, $vCol['header'], true);
                foreach ($extracted as $item) {
                    $videoUrls[] = $item;
                }
            }

            // Extract Documents
            $documentUrls = [];
            foreach ($docCols as $dCol) {
                $rawVal = (string) ($row[$dCol['index']] ?? '');
                // Also parse if it contains mixed links (some lines video, some lines doc)
                $extracted = $this->parseLabeledUrls($rawVal, $dCol['header'], false);
                foreach ($extracted as $item) {
                    // If an item in document column is distinctly a video URL (youtube, youtu.be), route to videos
                    if ($this->isYoutubeUrl($item['url'])) {
                        $videoUrls[] = $item;
                    } else {
                        $documentUrls[] = $item;
                    }
                }
            }

            // If reading_content is empty, build a sensible HTML placeholder with title & materials
            if (empty($contentParts)) {
                $readingContent = '<p><strong>'.e($title).'</strong></p>';
                if ($summary) {
                    $readingContent .= '<p>'.nl2br(e($summary)).'</p>';
                } else {
                    $readingContent .= '<p>Nội dung bài học và tài liệu nghiên cứu.</p>';
                }
            } else {
                $readingContent = implode("\n\n", array_map(fn ($p) => '<p>'.nl2br(e($p)).'</p>', $contentParts));
            }

            // De-duplicate URLs
            $videoUrls = $this->deduplicateByUrl($videoUrls);
            $documentUrls = $this->deduplicateByUrl($documentUrls);

            // Primary fallback single URLs
            $primaryVideo = ! empty($videoUrls) ? $videoUrls[0]['url'] : null;
            $primaryDoc = ! empty($documentUrls) ? $documentUrls[0]['url'] : null;

            try {
                $slug = Str::slug($title).'-'.rand(100, 999);

                Lesson::create([
                    'course_id' => $courseId,
                    'title' => $title,
                    'slug' => $slug,
                    'order' => $order,
                    'summary' => $summary,
                    'reading_content' => $readingContent,
                    'reading_file_url' => $primaryDoc,
                    'document_urls' => ! empty($documentUrls) ? $documentUrls : null,
                    'video_url' => $primaryVideo,
                    'video_urls' => ! empty($videoUrls) ? $videoUrls : null,
                ]);

                $importedCount++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum} (\"{$title}\"): ".$e->getMessage();
            }
        }

        return [
            'success' => $importedCount > 0,
            'imported_count' => $importedCount,
            'skipped_count' => $skippedCount,
            'course_id' => $courseId,
            'errors' => $errors,
        ];
    }

    /**
     * Clean text into a clean single-line string with normalized spaces.
     */
    private function cleanSingleLine(string $text): string
    {
        // Replace all newline/tab characters with spaces
        $cleaned = preg_replace('/[\r\n\t]+/', ' ', $text);
        // Replace multiple whitespace with a single space
        $cleaned = preg_replace('/\s{2,}/', ' ', (string) $cleaned);

        return trim((string) $cleaned);
    }

    /**
     * Parse cell containing URLs separated by commas or linebreaks (with optional label prefixes).
     *
     * @return array<int, array{title: string, url: string}>
     */
    private function parseLabeledUrls(string $cellContent, string $fallbackHeaderLabel, bool $isVideoContext): array
    {
        $results = [];
        // Split by newlines or commas
        $tokens = preg_split('/[\r\n,]+/', trim($cellContent)) ?: [];
        $defaultTitle = $isVideoContext ? 'Lecture Video' : 'Document';

        foreach ($tokens as $token) {
            $token = trim($token);
            if ($token === '') {
                continue;
            }

            // Find URL in token
            if (preg_match('/(https?:\/\/[^\s"\'>]+)/i', $token, $urlMatches)) {
                $url = trim($urlMatches[1]);

                // Extract label before the URL if present
                $beforeUrl = substr($token, 0, strpos($token, $url));
                $label = trim(rtrim(trim($beforeUrl), ':'));

                // If label is empty, numeric, or simply "Video", provide an appropriate title
                if ($label === '' || mb_strtolower($label) === 'video') {
                    $label = (! in_array($fallbackHeaderLabel, ['video_urls', 'document_urls', 'video_url', 'reading_file_url', ''], true))
                        ? $fallbackHeaderLabel
                        : $defaultTitle;
                }

                $results[] = [
                    'title' => $label,
                    'url' => $url,
                ];
            }
        }

        return $results;
    }

    /**
     * Generate pre-formatted Excel template for course & lesson import.
     * Follows the exact lessons database table columns:
     * - order: integer
     * - title: string
     * - summary: text
     * - reading_content: longText / HTML
     * - video_urls: Title: URL (one per line)
     * - document_urls: Title: URL (one per line)
     */
    public function generateTemplate(): Spreadsheet
    {
        $spreadsheet = new Spreadsheet;

        // ----------------------------------------------------
        // Sheet 1: Lessons Table Template
        // ----------------------------------------------------
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('lessons');

        $headers = [
            'A1' => 'order',
            'B1' => 'title',
            'C1' => 'summary',
            'D1' => 'reading_content',
            'E1' => 'video_urls',
            'F1' => 'document_urls',
        ];

        foreach ($headers as $cell => $value) {
            $sheet->setCellValue($cell, $value);
        }

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

        $sheet->getStyle('A1:F1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(30);

        // Sample Data Rows matching exact lessons table columns (clean comma-separated URLs)
        $sampleData = [
            [
                1,
                'Buổi 1: Preface - Lời Giới Thiệu',
                'Giới thiệu tổng quan về môn học Vi Diệu Pháp (Abhidhammattha Sangaha).',
                '<p><strong>Vi Diệu Pháp Giảng Giải</strong></p><p>Học phần mở đầu về các pháp Chân đế (Paramattha Dhammā), phân biệt Tục đế và Chân đế.</p>',
                'https://youtu.be/SRDO9zCX4eA, https://youtu.be/SRDO9zCX4eB',
                'https://docs.google.com/presentation/d/sample-slide-1, https://drive.google.com/file/d/sample-pdf-1/view, https://www.budsas.org/uni/u-vdp-gg/vdpgg-00.htm',
            ],
            [
                2,
                'Buổi 2: Preface (tiếp theo)',
                'Tìm hiểu tiếp phần nhập môn và từ vựng thuật ngữ Pali cơ bản.',
                '<p><strong>Nội dung tự học</strong></p><p>Nghiên cứu các thuật ngữ căn bản trong A-tì-đàm và sơ đồ tổng quan 4 pháp Chân đế: Tâm, Tâm sở, Sắc pháp, Niết-bàn.</p>',
                'https://youtu.be/o3k-aMSrItw',
                'https://docs.google.com/presentation/d/sample-slide-1, https://drive.google.com/file/d/sample-pdf-2/view',
            ],
            [
                3,
                'Buổi 3: Chapter 1 - Citta-Saṅgaha-Vibhāgo (Phân loại Tâm)',
                'Chương 1: Khái niệm về Citta (Tâm) và 89 / 121 thứ Tâm trong Phật giáo.',
                '<p><strong>Chương 1: Phân loại Tâm (Citta)</strong></p><p>Tìm hiểu định nghĩa Tâm, đặc tính, nhiệm vụ, hiện hành và nhân cận của Tâm.</p>',
                'https://youtu.be/tU3BvdsD_IE',
                'https://docs.google.com/presentation/d/sample-slide-2, https://drive.google.com/file/d/sample-pdf-3/view',
            ],
        ];

        $rowNum = 2;
        foreach ($sampleData as $rowData) {
            $sheet->fromArray($rowData, null, "A{$rowNum}");
            $sheet->getRowDimension($rowNum)->setRowHeight(55);
            $rowNum++;
        }

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
        $sheet->getStyle('A2:F4')->applyFromArray($dataStyle);
        $sheet->getStyle('A2:A4')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Set column widths matching table fields
        $columnWidths = [
            'A' => 12, // order
            'B' => 42, // title
            'C' => 38, // summary
            'D' => 45, // reading_content
            'E' => 50, // video_urls
            'F' => 65, // document_urls
        ];
        foreach ($columnWidths as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        // ----------------------------------------------------
        // Sheet 2: Guide & Instructions
        // ----------------------------------------------------
        $instructionSheet = $spreadsheet->createSheet();
        $instructionSheet->setTitle('Guide & Database Schema');

        $instructionSheet->setCellValue('A1', 'DATABASE SCHEMA & FIELD SPECIFICATIONS FOR LESSONS / QUY CÁCH DỮ LIỆU BẢNG LESSONS');
        $instructionSheet->getStyle('A1')->getFont()->setBold(true)->setSize(12)->getColor()->setRGB('B45309');

        $instructions = [
            ['Column / Field', 'Type in Database', 'Required?', 'Format & Description / Hướng dẫn định dạng'],
            ['order', 'integer', 'NO', 'Order index of lesson (STT bài học, ví dụ: 1, 2, 3...). Tự động tăng dần nếu để trống.'],
            ['title', 'string(255)', 'YES (Bắt buộc)', 'Lesson title. Mọi ký tự xuống dòng sẽ được tự động dồn thành 1 dòng duy nhất.'],
            ['summary', 'text', 'NO', 'Short description or learning objective of the lesson unit.'],
            ['reading_content', 'longText / HTML', 'NO', 'Lesson notes, reading materials, or HTML formatted text.'],
            ['video_urls', 'json [{"title":"...","url":"..."}]', 'NO', 'Comma-separated URLs (e.g. https://youtu.be/video1, https://youtu.be/video2)'],
            ['document_urls', 'json [{"title":"...","url":"..."}]', 'NO', 'Comma-separated URLs (e.g. https://.../slide1, https://.../guide.pdf, https://.../reference)'],
        ];

        $insRowNum = 3;
        foreach ($instructions as $row) {
            $instructionSheet->fromArray($row, null, "A{$insRowNum}");
            $instructionSheet->getRowDimension($insRowNum)->setRowHeight(32);
            $insRowNum++;
        }

        $instructionSheet->getStyle('A3:D3')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4B5563'],
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $instructionSheet->getStyle('A3:D9')->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'D1D5DB'],
                ],
            ],
            'alignment' => ['vertical' => Alignment::VERTICAL_TOP, 'wrapText' => true],
        ]);

        $instructionSheet->getColumnDimension('A')->setWidth(18);
        $instructionSheet->getColumnDimension('B')->setWidth(26);
        $instructionSheet->getColumnDimension('C')->setWidth(18);
        $instructionSheet->getColumnDimension('D')->setWidth(75);

        // Reset to first sheet as default
        $spreadsheet->setActiveSheetIndex(0);

        return $spreadsheet;
    }

    /**
     * Check if a URL points to YouTube.
     */
    private function isYoutubeUrl(string $url): bool
    {
        return (bool) preg_match('/(?:youtube\.com|youtu\.be)/i', $url);
    }

    /**
     * De-duplicate URL items preserving first occurrence.
     *
     * @param  array<int, array{title: string, url: string}>  $items
     * @return array<int, array{title: string, url: string}>
     */
    private function deduplicateByUrl(array $items): array
    {
        $seen = [];
        $unique = [];
        foreach ($items as $item) {
            $url = $item['url'];
            if (! isset($seen[$url])) {
                $seen[$url] = true;
                $unique[] = $item;
            }
        }

        return array_values($unique);
    }

    /**
     * Helper to match normalized string against keywords.
     *
     * @param  array<string>  $keywords
     */
    private function matchesKeyword(string $text, array $keywords): bool
    {
        foreach ($keywords as $kw) {
            if (str_contains($text, $kw)) {
                return true;
            }
        }

        return false;
    }
}
