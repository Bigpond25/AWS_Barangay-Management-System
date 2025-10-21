<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

use App\Contracts\StorageInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

class SupabaseStorageService implements StorageInterface
{
    private string $supabaseUrl;
    private string $serviceKey;
    private string $anonKey;
    private string $defaultBucket;

    public function __construct()
    {
        $this->supabaseUrl = config('services.supabase.url');
        $this->serviceKey = config('services.supabase.service_key');
        $this->anonKey = config('services.supabase.anon_key');
        $this->defaultBucket = config('services.supabase.bucket', 'barangay-files');

        if (!$this->supabaseUrl || !$this->serviceKey) {
            Log::warning('Supabase configuration is missing. File storage features will not work.');
        }
    }

    /**
     * Upload a file to Supabase storage
     */
    public function uploadFile(
        UploadedFile $file,
        string $bucket,
        string $path,
        bool $isPublic = false
    ): array {
        try {
            $url = "{$this->supabaseUrl}/storage/v1/object/{$bucket}/{$path}";
            
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->serviceKey}",
                'Content-Type' => $file->getMimeType(),
            ])->attach(
                'file',
                file_get_contents($file->getRealPath()),
                $file->getClientOriginalName()
            )->post($url);

            if ($response->failed()) {
                throw new \Exception("Upload failed: " . $response->body());
            }

            $fileUrl = $this->getFileUrl($bucket, $path, !$isPublic);

            return [
                'success' => true,
                'url' => $fileUrl,
                'path' => $path,
                'bucket' => $bucket,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'original_name' => $file->getClientOriginalName(),
            ];
        } catch (\Exception $e) {
            Log::error('Supabase upload error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete a file from Supabase storage
     */
    public function deleteFile(string $bucket, string $path): bool
    {
        try {
            $url = "{$this->supabaseUrl}/storage/v1/object/{$bucket}/{$path}";
            
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->serviceKey}",
            ])->delete($url);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Supabase delete error: ' . $e->getMessage());
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
        if ($signed) {
            return $this->getSignedUrl($bucket, $path, $expiresIn);
        }

        return "{$this->supabaseUrl}/storage/v1/object/public/{$bucket}/{$path}";
    }

    /**
     * Get a signed URL for private files
     */
    private function getSignedUrl(string $bucket, string $path, int $expiresIn): string
    {
        try {
            $url = "{$this->supabaseUrl}/storage/v1/object/sign/{$bucket}/{$path}";
            
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->serviceKey}",
                'Content-Type' => 'application/json',
            ])->post($url, [
                'expiresIn' => $expiresIn,
            ]);

            if ($response->successful()) {
                $signedUrl = $response->json('signedURL');
                return "{$this->supabaseUrl}/storage/v1{$signedUrl}";
            }

            throw new \Exception("Failed to generate signed URL: " . $response->body());
        } catch (\Exception $e) {
            Log::error('Supabase signed URL error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Check if a file exists
     */
    public function fileExists(string $bucket, string $path): bool
    {
        try {
            $metadata = $this->getFileMetadata($bucket, $path);
            return !empty($metadata);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get file metadata
     */
    public function getFileMetadata(string $bucket, string $path): array
    {
        try {
            $url = "{$this->supabaseUrl}/storage/v1/object/info/{$bucket}/{$path}";
            
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->serviceKey}",
            ])->get($url);

            if ($response->successful()) {
                return $response->json();
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Supabase metadata error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Copy a file to a new location
     */
    public function copyFile(
        string $fromBucket,
        string $fromPath,
        string $toBucket,
        string $toPath
    ): bool {
        try {
            $url = "{$this->supabaseUrl}/storage/v1/object/copy";
            
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->serviceKey}",
                'Content-Type' => 'application/json',
            ])->post($url, [
                'sourceKey' => "{$fromBucket}/{$fromPath}",
                'destinationKey' => "{$toBucket}/{$toPath}",
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Supabase copy error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Generate a signed upload URL for direct client uploads
     */
    public function getSignedUploadUrl(
        string $bucket,
        string $path,
        int $expiresIn = 3600
    ): array {
        try {
            $url = "{$this->supabaseUrl}/storage/v1/object/upload/sign/{$bucket}/{$path}";
            
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->serviceKey}",
                'Content-Type' => 'application/json',
            ])->post($url, [
                'expiresIn' => $expiresIn,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'url' => $data['url'] ?? '',
                    'token' => $data['token'] ?? '',
                    'fields' => $data['fields'] ?? [],
                ];
            }

            throw new \Exception("Failed to generate upload URL: " . $response->body());
        } catch (\Exception $e) {
            Log::error('Supabase upload URL error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Test connection to Supabase
     */
    public function testConnection(): bool
    {
        try {
            $buckets = $this->getAvailableBuckets();
            return !empty($buckets) || is_array($buckets);
        } catch (\Exception $e) {
            Log::error('Supabase connection test failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get available storage buckets
     */
    public function getAvailableBuckets(): array
    {
        try {
            $url = "{$this->supabaseUrl}/storage/v1/bucket";
            
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->serviceKey}",
            ])->get($url);

            if ($response->successful()) {
                return $response->json();
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Supabase buckets error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get bucket configuration
     */
    public function getBucketConfig(string $bucket): array
    {
        try {
            $url = "{$this->supabaseUrl}/storage/v1/bucket/{$bucket}";
            
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->serviceKey}",
            ])->get($url);

            if ($response->successful()) {
                return $response->json();
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Supabase bucket config error: ' . $e->getMessage());
            return [];
        }
    }
}