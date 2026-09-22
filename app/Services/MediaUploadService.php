<?php

namespace App\Services;

use App\Models\MediaFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaUploadService
{
    protected const MAX_WIDTH = 1920;
    protected const MAX_HEIGHT = 1080;
    protected const WEBP_QUALITY = 85;

    /**
     * Process and store an uploaded file.
     */
    public function upload(UploadedFile $file, int $userId, ?string $altText = null): MediaFile
    {
        $originalName = $file->getClientOriginalName();
        $extension = strtolower($file->getClientOriginalExtension());
        $mimeType = $file->getMimeType() ?: 'application/octet-stream';

        $isImage = str_starts_with($mimeType, 'image/');
        $yearMonth = date('Y/m');
        $directory = "media/{$yearMonth}";

        $width = null;
        $height = null;
        $mediaType = 'document';

        if ($isImage) {
            $mediaType = 'image';
            if ($extension === 'gif') {
                // Keep gif intact (preserves potential animation)
                $filename = Str::random(24) . '.gif';
                $filePath = $file->storeAs($directory, $filename, 'public');
                $fileSize = $file->getSize();

                $imageSize = @getimagesize($file->getRealPath());
                if ($imageSize) {
                    $width = $imageSize[0];
                    $height = $imageSize[1];
                }
            } else {
                // Convert raster image (jpeg, png, webp, etc.) to WebP and scale to max 1920x1080
                $result = $this->processAndConvertToWebp($file, $directory);
                $filename = $result['filename'];
                $filePath = $result['file_path'];
                $fileSize = $result['file_size'];
                $width = $result['width'];
                $height = $result['height'];
                $mimeType = 'image/webp';
            }
        } else {
            // Document / PDF
            $safeExt = $extension ?: 'bin';
            $filename = Str::random(24) . '.' . $safeExt;
            $filePath = $file->storeAs($directory, $filename, 'public');
            $fileSize = $file->getSize();
        }

        return MediaFile::create([
            'user_id' => $userId,
            'filename' => $filename,
            'original_name' => $originalName,
            'file_path' => $filePath,
            'disk' => 'public',
            'mime_type' => $mimeType,
            'file_size' => $fileSize,
            'width' => $width,
            'height' => $height,
            'alt_text' => $altText ?: pathinfo($originalName, PATHINFO_FILENAME),
            'media_type' => $mediaType,
        ]);
    }

    /**
     * Process, resize, and convert image to WebP using GD.
     */
    protected function processAndConvertToWebp(UploadedFile $file, string $directory): array
    {
        $realPath = $file->getRealPath();
        $imageInfo = @getimagesize($realPath);
        
        $srcImage = null;
        if ($imageInfo) {
            switch ($imageInfo[2]) {
                case IMAGETYPE_JPEG:
                    $srcImage = @imagecreatefromjpeg($realPath);
                    break;
                case IMAGETYPE_PNG:
                    $srcImage = @imagecreatefrompng($realPath);
                    break;
                case IMAGETYPE_WEBP:
                    $srcImage = function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($realPath) : null;
                    break;
            }
        }

        // Fallback if GD could not create image resource
        if (!$srcImage) {
            $filename = Str::random(24) . '.' . ($file->getClientOriginalExtension() ?: 'webp');
            $filePath = $file->storeAs($directory, $filename, 'public');
            return [
                'filename' => $filename,
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'width' => $imageInfo ? $imageInfo[0] : null,
                'height' => $imageInfo ? $imageInfo[1] : null,
            ];
        }

        $origWidth = imagesx($srcImage);
        $origHeight = imagesy($srcImage);

        // Calculate aspect ratio fit within 1920x1080
        $ratio = min(self::MAX_WIDTH / $origWidth, self::MAX_HEIGHT / $origHeight, 1.0);
        $newWidth = (int) round($origWidth * $ratio);
        $newHeight = (int) round($origHeight * $ratio);

        $dstImage = imagecreatetruecolor($newWidth, $newHeight);

        // Preserve alpha transparency
        imagealphablending($dstImage, false);
        imagesavealpha($dstImage, true);
        $transparent = imagecolorallocatealpha($dstImage, 255, 255, 255, 127);
        imagefilledrectangle($dstImage, 0, 0, $newWidth, $newHeight, $transparent);

        // Resample image
        imagecopyresampled($dstImage, $srcImage, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

        $filename = Str::random(24) . '.webp';
        $relativeFilePath = "{$directory}/{$filename}";

        // Ensure directory exists in public storage
        Storage::disk('public')->makeDirectory($directory);
        $absolutePath = Storage::disk('public')->path($relativeFilePath);

        imagewebp($dstImage, $absolutePath, self::WEBP_QUALITY);

        imagedestroy($srcImage);
        imagedestroy($dstImage);

        $fileSize = file_exists($absolutePath) ? filesize($absolutePath) : $file->getSize();

        return [
            'filename' => $filename,
            'file_path' => $relativeFilePath,
            'file_size' => $fileSize,
            'width' => $newWidth,
            'height' => $newHeight,
        ];
    }
}
