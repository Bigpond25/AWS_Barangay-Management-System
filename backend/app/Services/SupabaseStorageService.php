<?php

namespace App\Services;

use App\Contracts\StorageInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Custom Supabase Storage Service using HTTP Client
 * No external dependencies required - uses Laravel's built-in HTTP client
 */
class SupabaseStorageService implements StorageInterface
{
    private string $supabaseUrl;
    private string $serviceKey;
    
    /** 
     * @phpstan-ignore-next-line property.onlyWritten
     */
    private string $anonKey;
    
    /**
     * Storage bucket configurations
     */
    private const BUCKET_CONFIG = [
        'residents-photos' => [
            'public' => true,
            'max_size' => 5 * 1024 * 1024, // 5MB
            'allowed_types' => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        ],
        'residents-documents' => [
            'public' => false,
            'max_size' => 10 * 1024 * 1024, // 10MB
            'allowed_types' => ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
        ],
        'supporting-documents' => [
            'public' => false,
            'max_size' => 10 * 1024 * 1024, // 10MB
            'allowed_types' => ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
        ],
        'public-assets' => [
            'public' => true,
            'max_size' => 2 * 1024 * 1024, // 2MB
            'allowed_types' => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        ]
    ];

    public function __construct()
    {
        $this->supabaseUrl = config('services.supabase.url');
        $this->serviceKey = config('services.supabase.service_key');
        $this->anonKey = config('services.supabase.anon_key');

        if (!$this->supabaseUrl || !$this->serviceKey) {
            throw new \Exception('Supabase configuration missing. Please check SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.');
        }
    }

    /**
     * Upload a file to Supabase Storage
     */
    public function uploadFile(
        UploadedFile $file, 
        string $bucket, 
        string $path, 
        bool $isPublic = false
    ): array {
        try {
            // Validate bucket exists in configuration
            if (!isset(self::BUCKET_CONFIG[$bucket])) {
                throw new \InvalidArgumentException("Invalid bucket: {$bucket}");
            }

            $bucketConfig = self::BUCKET_CONFIG[$bucket];
            
            // Validate file size
            if ($file->getSize() > $bucketConfig['max_size']) {
                throw new \InvalidArgumentException(
                    "File size exceeds maximum allowed size for bucket {$bucket}"
                );
            }

            // Validate file type
            if (!in_array($file->getMimeType(), $bucketConfig['allowed_types'])) {
                throw new \InvalidArgumentException(
                    "File type {$file->getMimeType()} not allowed for bucket {$bucket}"
                );
            }

            // Generate unique filename if not provided in path
            if (!pathinfo($path, PATHINFO_EXTENSION)) {
                $extension = $file->getClientOriginalExtension();
                $filename = Str::uuid() . '.' . $extension;
                $path = trim($path, '/') . '/' . $filename;
            }

            // Clean path
            $path = ltrim($path, '/');

            // Read file content
            $fileContent = file_get_contents($file->getPathname());
            
            // Upload to Supabase Storage using HTTP client
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
                'timeout' => 30,
            ])->withHeaders([
                'Authorization' => 'Bearer ' . $this->serviceKey,
                'Content-Type' => $file->getMimeType(),
                'x-upsert' => 'true', // Allow overwriting
            ])->withBody($fileContent, $file->getMimeType())
              ->post("{$this->supabaseUrl}/storage/v1/object/{$bucket}/{$path}");

            if (!$response->successful()) {
                $error = $response->json('message') ?? 'Upload failed';
                throw new \Exception("Supabase upload failed: {$error}");
            }

            // Generate appropriate URL
            $url = $bucketConfig['public'] || $isPublic 
                ? $this->getFileUrl($bucket, $path, false)
                : $this->getFileUrl($bucket, $path, true);

            Log::info('File uploaded to Supabase successfully', [
                'bucket' => $bucket,
                'path' => $path,
                'size' => $file->getSize(),
                'type' => $file->getMimeType()
            ]);

            return [
                'success' => true,
                'bucket' => $bucket,
                'path' => $path,
                'url' => $url,
                'public_url' => $bucketConfig['public'] ? $url : null,
                'size' => $file->getSize(),
                'type' => $file->getMimeType(),
                'filename' => $file->getClientOriginalName()
            ];

        } catch (\Exception $e) {
            Log::error('Failed to upload file to Supabase', [
                'bucket' => $bucket,
                'path' => $path,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Delete a file from Supabase Storage
     */
    public function deleteFile(string $bucket, string $path): bool
    {
        try {
            $path = ltrim($path, '/');
            
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
                'timeout' => 30,
            ])->withHeaders([
                'Authorization' => 'Bearer ' . $this->serviceKey,
            ])->delete("{$this->supabaseUrl}/storage/v1/object/{$bucket}/{$path}");

            if ($response->successful()) {
                Log::info('File deleted from Supabase', [
                    'bucket' => $bucket,
                    'path' => $path
                ]);
                return true;
            }

            Log::warning('Failed to delete file from Supabase', [
                'bucket' => $bucket,
                'path' => $path,
                'status' => $response->status(),
                'error' => $response->body()
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error('Failed to delete file from Supabase', [
                'bucket' => $bucket,
                'path' => $path,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Get file URL (public or signed)
     */
    public function getFileUrl(
        string $bucket, 
        string $path, 
        bool $signed = false, 
        int $expiresIn = 3600
    ): string {
        try {
            $path = ltrim($path, '/');

            if ($signed) {
                // Generate signed URL for private access
                $response = Http::withOptions([
                    'verify' => false, // Disable SSL verification for development
                    'timeout' => 30,
                ])->withHeaders([
                    'Authorization' => 'Bearer ' . $this->serviceKey,
                ])->post("{$this->supabaseUrl}/storage/v1/object/sign/{$bucket}/{$path}", [
                    'expiresIn' => $expiresIn
                ]);
                
                if ($response->successful()) {
                    $data = $response->json();
                    return $this->supabaseUrl . '/storage/v1' . $data['signedURL'];
                }
                
                Log::error('Failed to generate signed URL', [
                    'bucket' => $bucket,
                    'path' => $path,
                    'error' => $response->body()
                ]);
                return '';
            } else {
                // Generate public URL
                return "{$this->supabaseUrl}/storage/v1/object/public/{$bucket}/{$path}";
            }

        } catch (\Exception $e) {
            Log::error('Failed to generate file URL', [
                'bucket' => $bucket,
                'path' => $path,
                'signed' => $signed,
                'error' => $e->getMessage()
            ]);

            return '';
        }
    }

    /**
     * Check if file exists
     */
    public function fileExists(string $bucket, string $path): bool
    {
        try {
            $path = ltrim($path, '/');
            
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
                'timeout' => 30,
            ])->withHeaders([
                'Authorization' => 'Bearer ' . $this->serviceKey,
            ])->head("{$this->supabaseUrl}/storage/v1/object/{$bucket}/{$path}");

            return $response->successful();

        } catch (\Exception $e) {
            Log::error('Failed to check file existence', [
                'bucket' => $bucket,
                'path' => $path,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Get file metadata
     */
    public function getFileMetadata(string $bucket, string $path): array
    {
        try {
            $path = ltrim($path, '/');
            
            // Get file info from Supabase
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
                'timeout' => 30,
            ])->withHeaders([
                'Authorization' => 'Bearer ' . $this->serviceKey,
            ])->get("{$this->supabaseUrl}/storage/v1/object/info/{$bucket}/{$path}");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'name' => basename($path),
                    'size' => $data['metadata']['size'] ?? 0,
                    'type' => $data['metadata']['mimetype'] ?? '',
                    'last_modified' => $data['updated_at'] ?? '',
                    'created_at' => $data['created_at'] ?? ''
                ];
            }

            return [];

        } catch (\Exception $e) {
            Log::error('Failed to get file metadata', [
                'bucket' => $bucket,
                'path' => $path,
                'error' => $e->getMessage()
            ]);

            return [];
        }
    }

    /**
     * Copy file to new location
     */
    public function copyFile(
        string $fromBucket, 
        string $fromPath, 
        string $toBucket, 
        string $toPath
    ): bool {
        try {
            $fromPath = ltrim($fromPath, '/');
            $toPath = ltrim($toPath, '/');
            
            // Download file content
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
                'timeout' => 30,
            ])->withHeaders([
                'Authorization' => 'Bearer ' . $this->serviceKey,
            ])->get("{$this->supabaseUrl}/storage/v1/object/{$fromBucket}/{$fromPath}");

            if (!$response->successful()) {
                return false;
            }

            $fileContent = $response->body();
            $contentType = $response->header('Content-Type');
            if (empty($contentType)) {
                $contentType = 'application/octet-stream';
            }

            // Upload to new location
            $uploadResponse = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
                'timeout' => 30,
            ])->withHeaders([
                'Authorization' => 'Bearer ' . $this->serviceKey,
                'Content-Type' => $contentType,
                'x-upsert' => 'true',
            ])->withBody($fileContent, $contentType)
              ->post("{$this->supabaseUrl}/storage/v1/object/{$toBucket}/{$toPath}");

            return $uploadResponse->successful();

        } catch (\Exception $e) {
            Log::error('Failed to copy file', [
                'from_bucket' => $fromBucket,
                'from_path' => $fromPath,
                'to_bucket' => $toBucket,
                'to_path' => $toPath,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Generate signed upload URL for direct client uploads
     */
    public function getSignedUploadUrl(
        string $bucket, 
        string $path, 
        int $expiresIn = 3600
    ): array {
        try {
            $path = ltrim($path, '/');
            
            // For Supabase, we'll provide the upload endpoint and token
            // Client will need to use this for direct uploads
            $uploadUrl = "{$this->supabaseUrl}/storage/v1/object/{$bucket}/{$path}";
            
            // Generate a temporary token for upload (simplified approach)
            // In production, you might want to create a more sophisticated token system
            $token = base64_encode(json_encode([
                'bucket' => $bucket,
                'path' => $path,
                'expires_at' => now()->addSeconds($expiresIn)->timestamp
            ]));

            return [
                'upload_url' => $uploadUrl,
                'token' => $this->serviceKey, // Use service key for uploads
                'expires_in' => $expiresIn,
                'path' => $path,
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->serviceKey,
                    'x-upsert' => 'true'
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Failed to generate signed upload URL', [
                'bucket' => $bucket,
                'path' => $path,
                'error' => $e->getMessage()
            ]);

            return [];
        }
    }

    /**
     * Test connection to Supabase
     */
    public function testConnection(): bool
    {
        try {
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
                'timeout' => 30,
            ])->withHeaders([
                'Authorization' => 'Bearer ' . $this->serviceKey,
            ])->get("{$this->supabaseUrl}/storage/v1/bucket");

            return $response->successful();

        } catch (\Exception $e) {
            Log::error('Supabase connection test failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get bucket configuration
     */
    public function getBucketConfig(string $bucket): array
    {
        return self::BUCKET_CONFIG[$bucket] ?? [];
    }

    /**
     * List all configured buckets
     */
    public function getAvailableBuckets(): array
    {
        return array_keys(self::BUCKET_CONFIG);
    }

    /**
     * Validate bucket and path combination
     */
    public function validateBucketPath(string $bucket, string $path): bool
    {
        if (!isset(self::BUCKET_CONFIG[$bucket])) {
            return false;
        }

        // Add any path validation logic here
        return !empty($path) && !str_contains($path, '..');
    }
}
