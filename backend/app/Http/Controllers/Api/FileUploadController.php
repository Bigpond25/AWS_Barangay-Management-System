<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Contracts\StorageInterface;

class FileUploadController extends Controller
{
    private StorageInterface $storageService;

    public function __construct(StorageInterface $storageService)
    {
        $this->storageService = $storageService;
    }

    /**
     * Handle file upload for resident profile photos.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function upload(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'file' => 'required|file|image|max:2048', // max 2MB
            ]);

            $file = $request->file('file');
            
            // Generate unique filename with extension
            $extension = $file->getClientOriginalExtension();
            $filename = Str::uuid() . '.' . $extension;
            
            // Use Supabase storage service instead of local storage
            $result = $this->storageService->uploadFile(
                $file,
                'residents-photos', // Use residents-photos bucket
                'profile-photos/' . $filename, // Generate unique path with filename
                true // Public access
            );

            if ($result['success']) {
                Log::info('Profile photo uploaded to Supabase', [
                    'path' => $result['path'],
                    'url' => $result['url']
                ]);

                return response()->json([
                    'success' => true,
                    'filename' => basename($result['path']),
                    'path' => $result['path'],
                    'url' => $result['url'],
                    'bucket' => $result['bucket']
                ]);
            } else {
                Log::error('Supabase upload failed', ['error' => $result['error']]);
                return response()->json([
                    'error' => 'File upload failed',
                    'message' => $result['error'],
                ], 500);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('File upload error: ' . $e->getMessage());
            return response()->json([
                'error' => 'File upload failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
