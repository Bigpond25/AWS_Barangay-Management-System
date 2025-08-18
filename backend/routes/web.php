<?php

use App\Contracts\StorageInterface;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Test Supabase Storage connection
Route::get('/test-supabase', function () {
    try {
        // Test if storage service is properly bound
        if (!app()->bound(StorageInterface::class)) {
            return response()->json([
                'success' => false,
                'error' => 'Storage service not bound'
            ]);
        }

        $storageService = app(StorageInterface::class);
        
        // Test connection
        $connected = $storageService->testConnection();
        
        // Get available buckets
        $buckets = $storageService->getAvailableBuckets();
        
        return response()->json([
            'success' => true,
            'connected' => $connected,
            'buckets' => $buckets,
            'service_type' => get_class($storageService)
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
});
