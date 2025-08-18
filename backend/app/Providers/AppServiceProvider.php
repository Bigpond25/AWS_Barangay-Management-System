<?php

namespace App\Providers;

use App\Contracts\StorageInterface;
use App\Services\SupabaseStorageService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind storage service based on configuration
        $this->app->bind(StorageInterface::class, function ($app) {
            $provider = config('app.storage_provider', 'local');
            
            switch ($provider) {
                case 'supabase':
                    return new SupabaseStorageService();
                default:
                    // Return a local storage service if needed
                    return new SupabaseStorageService(); // Default to Supabase for now
            }
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
