<?php

namespace App\Providers;

use Illuminate\Support\Facades\Log;

use App\Contracts\StorageInterface;
use App\Services\SupabaseStorageService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Http\UploadedFile;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Conditionally bind storage service only if properly configured
        if ($this->isSupabaseConfigured()) {
            $this->app->bind(StorageInterface::class, function ($app) {
                $provider = config('app.storage_provider', 'supabase');
                
                switch ($provider) {
                    case 'supabase':
                        return new SupabaseStorageService();
                        
                    case 'local':
                        // TODO: Implement local storage service
                        Log::info('Local storage provider not yet implemented, falling back to Supabase');
                        return new SupabaseStorageService();
                        
                    default:
                        return new SupabaseStorageService();
                }
            });
        } else {
            Log::warning('Supabase is not configured. Storage features will be disabled. Please configure Supabase in your .env file.');
            
            // Bind a dummy storage service that prevents errors during boot
            $this->app->bind(StorageInterface::class, function ($app) {
                return new class implements StorageInterface {
                    private function throwError(): void
                    {
                        Log::error('Storage service called but not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
                        throw new \RuntimeException('Storage service is not configured. Please check your .env file and set SUPABASE_URL and SUPABASE_SERVICE_KEY.');
                    }

                    public function uploadFile(
                        UploadedFile $file,
                        string $bucket,
                        string $path,
                        bool $isPublic = false
                    ): array {
                        $this->throwError();
                    }

                    public function deleteFile(string $bucket, string $path): bool
                    {
                        $this->throwError();
                    }

                    public function getFileUrl(
                        string $bucket,
                        string $path,
                        bool $signed = false,
                        int $expiresIn = 3600
                    ): string {
                        $this->throwError();
                    }

                    public function fileExists(string $bucket, string $path): bool
                    {
                        return false;
                    }

                    public function getFileMetadata(string $bucket, string $path): array
                    {
                        $this->throwError();
                    }

                    public function copyFile(
                        string $fromBucket,
                        string $fromPath,
                        string $toBucket,
                        string $toPath
                    ): bool {
                        $this->throwError();
                    }

                    public function getSignedUploadUrl(
                        string $bucket,
                        string $path,
                        int $expiresIn = 3600
                    ): array {
                        $this->throwError();
                    }

                    public function testConnection(): bool
                    {
                        return false;
                    }

                    public function getAvailableBuckets(): array
                    {
                        return [];
                    }

                    public function getBucketConfig(string $bucket): array
                    {
                        return [];
                    }
                };
            });
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
    
    /**
     * Check if Supabase is properly configured
     *
     * @return bool
     */
    private function isSupabaseConfigured(): bool
    {
        try {
            return !empty(config('services.supabase.url')) && 
                   !empty(config('services.supabase.service_key'));
        } catch (\Exception $e) {
            // During early boot, config might not be available
            return false;
        }
    }
}