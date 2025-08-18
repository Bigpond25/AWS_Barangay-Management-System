<?php

namespace App\Http\Controllers\Api;

use App\Contracts\StorageInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Storage API Controller
 * Handles file upload, delete, and URL generation operations
 */
class StorageController extends Controller
{
    private StorageInterface $storageService;

    public function __construct(StorageInterface $storageService)
    {
        $this->storageService = $storageService;
    }

    /**
     * Upload a file to storage
     */
    public function upload(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'file' => 'required|file|max:10240', // 10MB max
                'bucket' => 'required|string|in:residents-photos,residents-documents,supporting-documents,public-assets',
                'path_prefix' => 'required|string|max:255',
                'public' => 'boolean'
            ]);

            $file = $request->file('file');
            $bucket = $request->bucket;
            $pathPrefix = $request->path_prefix;
            $isPublic = $request->boolean('public', true);

            $result = $this->storageService->uploadFile(
                $file,
                $bucket,
                $pathPrefix,
                $isPublic
            );

            if ($result['success']) {
                Log::info('File uploaded successfully via API', [
                    'bucket' => $bucket,
                    'path' => $result['path'],
                    'user_id' => auth('sanctum')->id()
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'File uploaded successfully',
                    'data' => [
                        'url' => $result['url'],
                        'path' => $result['path'],
                        'bucket' => $result['bucket'],
                        'size' => $result['size'],
                        'type' => $result['type'],
                        'filename' => $result['filename']
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Upload failed',
                    'error' => $result['error']
                ], 400);
            }

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Storage upload error', [
                'error' => $e->getMessage(),
                'user_id' => auth('sanctum')->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Upload failed',
                'error' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Delete a file from storage
     */
    public function delete(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'bucket' => 'required|string|in:residents-photos,residents-documents,supporting-documents,public-assets',
                'path' => 'required|string|max:500'
            ]);

            $bucket = $request->bucket;
            $path = $request->path;

            $success = $this->storageService->deleteFile($bucket, $path);

            if ($success) {
                Log::info('File deleted successfully via API', [
                    'bucket' => $bucket,
                    'path' => $path,
                    'user_id' => auth('sanctum')->id()
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'File deleted successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Delete failed',
                    'error' => 'File not found or delete operation failed'
                ], 404);
            }

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Storage delete error', [
                'error' => $e->getMessage(),
                'user_id' => auth('sanctum')->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Delete failed',
                'error' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get file URL (public or signed)
     */
    public function getUrl(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'bucket' => 'required|string|in:residents-photos,residents-documents,supporting-documents,public-assets',
                'path' => 'required|string|max:500',
                'signed' => 'boolean',
                'expires_in' => 'integer|min:1|max:86400' // Max 24 hours
            ]);

            $bucket = $request->bucket;
            $path = $request->path;
            $signed = $request->boolean('signed', false);
            $expiresIn = $request->integer('expires_in', 3600);

            $url = $this->storageService->getFileUrl($bucket, $path, $signed, $expiresIn);

            if ($url) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'url' => $url,
                        'signed' => $signed,
                        'expires_at' => $signed ? now()->addSeconds($expiresIn)->toISOString() : null
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to generate URL',
                    'error' => 'File not found or URL generation failed'
                ], 404);
            }

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Storage URL error', [
                'error' => $e->getMessage(),
                'user_id' => auth('sanctum')->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'URL generation failed',
                'error' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get file metadata
     */
    public function getMetadata(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'bucket' => 'required|string|in:residents-photos,residents-documents,supporting-documents,public-assets',
                'path' => 'required|string|max:500'
            ]);

            $bucket = $request->bucket;
            $path = $request->path;

            $metadata = $this->storageService->getFileMetadata($bucket, $path);

            if ($metadata) {
                return response()->json([
                    'success' => true,
                    'data' => $metadata
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found',
                    'error' => 'Metadata not available'
                ], 404);
            }

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Storage metadata error', [
                'error' => $e->getMessage(),
                'user_id' => auth('sanctum')->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Metadata retrieval failed',
                'error' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Test storage connection
     */
    public function testConnection(): JsonResponse
    {
        try {
            $connected = $this->storageService->testConnection();

            return response()->json([
                'success' => $connected,
                'message' => $connected ? 'Storage connection successful' : 'Storage connection failed',
                'provider' => config('app.storage_provider', 'local'),
                'buckets' => $this->storageService->getAvailableBuckets()
            ]);

        } catch (\Exception $e) {
            Log::error('Storage connection test error', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Connection test failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get signed upload URL for direct client uploads
     */
    public function getSignedUploadUrl(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'bucket' => 'required|string|in:residents-photos,residents-documents,supporting-documents,public-assets',
                'path' => 'required|string|max:500',
                'expires_in' => 'integer|min:1|max:3600' // Max 1 hour for uploads
            ]);

            $bucket = $request->bucket;
            $path = $request->path;
            $expiresIn = $request->integer('expires_in', 3600);

            $uploadData = $this->storageService->getSignedUploadUrl($bucket, $path, $expiresIn);

            if ($uploadData) {
                return response()->json([
                    'success' => true,
                    'data' => $uploadData
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to generate upload URL',
                    'error' => 'Upload URL generation failed'
                ], 400);
            }

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Storage signed upload URL error', [
                'error' => $e->getMessage(),
                'user_id' => auth('sanctum')->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Upload URL generation failed',
                'error' => 'Internal server error'
            ], 500);
        }
    }
}
