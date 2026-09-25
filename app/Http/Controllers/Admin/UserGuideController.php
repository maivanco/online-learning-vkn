<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserGuideController extends Controller
{
    /**
     * Display the Project Documentation & User Guides page.
     */
    public function index(Request $request): Response
    {
        $locale = (string) ($request->session()->get('locale') ?? app()->getLocale() ?? 'vi');
        if (! in_array($locale, ['vi', 'en'], true)) {
            $locale = 'vi';
        }

        $docsPath = resource_path("docs/{$locale}");
        if (! File::isDirectory($docsPath)) {
            $docsPath = resource_path('docs/vi');
        }

        // Available documents list
        $files = File::glob($docsPath . '/*.md') ?: [];
        sort($files);

        $documents = [];
        foreach ($files as $filePath) {
            $slug = basename($filePath, '.md');
            $rawContent = File::get($filePath);
            
            // Extract the first H1 as document title
            $title = $slug;
            if (preg_match('/^#\s+(.+)$/m', $rawContent, $titleMatch)) {
                $title = trim($titleMatch[1]);
            }

            $documents[] = [
                'slug' => $slug,
                'title' => $title,
            ];
        }

        // Active document
        $activeSlug = (string) $request->query('doc', $documents[0]['slug'] ?? '01-overview');
        $activeSlug = preg_replace('/[^a-zA-Z0-9_\-]/', '', $activeSlug);

        $targetFile = "{$docsPath}/{$activeSlug}.md";
        if (! File::exists($targetFile) && ! empty($files)) {
            $targetFile = $files[0];
            $activeSlug = basename($targetFile, '.md');
        }

        $rawMarkdown = File::exists($targetFile) ? File::get($targetFile) : '';

        // Extract TOC (H2 and H3 headings)
        $toc = [];
        if (preg_match_all('/^(#{2,3})\s+(.+)$/m', $rawMarkdown, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $level = strlen($match[1]);
                $headingText = trim(strip_tags($match[2]));
                $toc[] = [
                    'id' => Str::slug($headingText),
                    'text' => $headingText,
                    'level' => $level,
                ];
            }
        }

        // Convert Markdown to HTML
        $renderedHtml = Str::markdown($rawMarkdown);

        // Inject IDs into <h2> and <h3> tags for TOC navigation
        $renderedHtml = preg_replace_callback('/<h([2-3])>(.*?)<\/h\1>/i', function ($match) {
            $level = $match[1];
            $cleanText = trim(strip_tags($match[2]));
            $id = Str::slug($cleanText);
            return "<h{$level} id=\"{$id}\" class=\"scroll-mt-24 group flex items-center justify-between\">"
                . $match[2]
                . "<a href=\"#{$id}\" class=\"opacity-0 group-hover:opacity-100 text-stone-400 hover:text-amber-600 transition-opacity ml-2 text-sm\">#</a>"
                . "</h{$level}>";
        }, $renderedHtml);

        // Estimated reading time
        $wordCount = str_word_count(strip_tags($rawMarkdown));
        $readingTime = max(1, (int) ceil($wordCount / 180));

        // Get active title
        $activeTitle = '';
        foreach ($documents as $doc) {
            if ($doc['slug'] === $activeSlug) {
                $activeTitle = $doc['title'];
                break;
            }
        }

        return Inertia::render('Admin/UserGuides/Index', [
            'documents' => $documents,
            'activeSlug' => $activeSlug,
            'activeTitle' => $activeTitle,
            'contentHtml' => $renderedHtml,
            'toc' => $toc,
            'readingTime' => $readingTime,
            'currentLocale' => $locale,
        ]);
    }
}
