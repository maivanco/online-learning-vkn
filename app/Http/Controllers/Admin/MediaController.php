<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MediaFile;
use App\Services\MediaUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function __construct(
        protected MediaUploadService $uploadService
    ) {}

    /**
     * List paginated media files.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MediaFile::with('user:id,name,username')->latest();

        if ($type = $request->input('type')) {
            if (in_array($type, ['image', 'document'])) {
                $query->where('media_type', $type);
            }
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('original_name', 'like', "%{$search}%")
                  ->orWhere('alt_text', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 24);
        $media = $query->paginate($perPage);

        return response()->json($media);
    }

    /**
     * Upload one or multiple media files.
     */
    public function store(Request $request): JsonResponse
    {
        $allowedExtensions = 'jpg,jpeg,png,webp,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,txt';

        $request->validate([
            'file' => "nullable|file|mimes:{$allowedExtensions}|max:20480",
            'files' => 'nullable|array',
            'files.*' => "file|mimes:{$allowedExtensions}|max:20480",
            'alt_text' => 'nullable|string|max:255',
        ]);

        $userId = auth()->id();
        $uploaded = [];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $uploaded[] = $this->uploadService->upload($file, $userId);
            }
        } elseif ($request->hasFile('file')) {
            $uploaded[] = $this->uploadService->upload(
                $request->file('file'),
                $userId,
                $request->input('alt_text')
            );
        } else {
            return response()->json(['message' => 'No files were provided.'], 422);
        }

        return response()->json([
            'message' => 'Uploaded successfully',
            'data' => count($uploaded) === 1 ? $uploaded[0] : $uploaded,
        ], 201);
    }

    /**
     * Update media file metadata (e.g. alt text or original name).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $media = MediaFile::findOrFail($id);

        $validated = $request->validate([
            'alt_text' => 'nullable|string|max:255',
            'original_name' => 'nullable|string|max:255',
        ]);

        $media->update($validated);

        return response()->json([
            'message' => 'Media updated successfully',
            'data' => $media,
        ]);
    }

    /**
     * Delete a media file.
     */
    public function destroy(int $id): JsonResponse
    {
        $media = MediaFile::findOrFail($id);

        // Delete from storage
        Storage::disk($media->disk)->delete($media->file_path);

        $media->delete();

        return response()->json([
            'message' => 'Media file deleted successfully',
        ]);
    }
}
