<?php

namespace Tests\Feature;

use App\Contracts\StorageInterface;
use App\Services\SupabaseStorageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SupabaseStorageTest extends TestCase
{
    use RefreshDatabase;

    protected SupabaseStorageService $storageService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Skip if Supabase is not configured
        if (!config('services.supabase.url') || !config('services.supabase.service_key')) {
            $this->markTestSkipped('Supabase not configured');
        }
        
        $this->storageService = app(StorageInterface::class);
    }

    public function test_storage_service_is_bound()
    {
        $this->assertInstanceOf(SupabaseStorageService::class, $this->storageService);
    }

    public function test_can_connect_to_supabase()
    {
        $connected = $this->storageService->testConnection();
        $this->assertTrue($connected);
    }

    public function test_can_get_available_buckets()
    {
        $buckets = $this->storageService->getAvailableBuckets();
        
        $this->assertIsArray($buckets);
        $this->assertContains('residents-photos', $buckets);
        $this->assertContains('residents-documents', $buckets);
        $this->assertContains('supporting-documents', $buckets);
        $this->assertContains('public-assets', $buckets);
    }

    public function test_can_get_bucket_config()
    {
        $config = $this->storageService->getBucketConfig('residents-photos');
        
        $this->assertIsArray($config);
        $this->assertArrayHasKey('public', $config);
        $this->assertArrayHasKey('max_size', $config);
        $this->assertArrayHasKey('allowed_types', $config);
        $this->assertTrue($config['public']);
    }

    public function test_can_upload_image_to_residents_photos()
    {
        // Create a fake image file
        $file = UploadedFile::fake()->image('test.jpg', 100, 100);
        
        $result = $this->storageService->uploadFile(
            $file,
            'residents-photos',
            'test/test-image.jpg',
            true
        );
        
        $this->assertTrue($result['success']);
        $this->assertEquals('residents-photos', $result['bucket']);
        $this->assertStringContainsString('test-image.jpg', $result['path']);
        $this->assertArrayHasKey('url', $result);
        
        // Clean up - delete the test file
        $this->storageService->deleteFile($result['bucket'], $result['path']);
    }

    public function test_rejects_oversized_file()
    {
        // Create a file larger than allowed for residents-photos (5MB)
        $file = UploadedFile::fake()->create('large.jpg', 6000); // 6MB
        
        $result = $this->storageService->uploadFile(
            $file,
            'residents-photos',
            'test/large-image.jpg',
            true
        );
        
        $this->assertFalse($result['success']);
        $this->assertStringContainsString('exceeds maximum', $result['error']);
    }

    public function test_rejects_invalid_file_type()
    {
        // Create a file with invalid type
        $file = UploadedFile::fake()->create('document.txt', 100);
        
        $result = $this->storageService->uploadFile(
            $file,
            'residents-photos',
            'test/document.txt',
            true
        );
        
        $this->assertFalse($result['success']);
        $this->assertStringContainsString('not allowed', $result['error']);
    }

    public function test_can_generate_public_url()
    {
        $url = $this->storageService->getFileUrl(
            'residents-photos',
            'test/example.jpg',
            false // public URL
        );
        
        $this->assertStringContainsString('supabase', $url);
        $this->assertStringContainsString('residents-photos', $url);
        $this->assertStringContainsString('test/example.jpg', $url);
    }

    public function test_can_generate_signed_url()
    {
        $url = $this->storageService->getFileUrl(
            'residents-documents',
            'test/private-doc.pdf',
            true, // signed URL
            3600
        );
        
        // Signed URLs should contain the supabase domain
        $this->assertStringContainsString('supabase', $url);
    }

    public function test_file_exists_check()
    {
        // Test with a non-existent file
        $exists = $this->storageService->fileExists('residents-photos', 'non-existent.jpg');
        $this->assertFalse($exists);
    }

    public function test_can_get_signed_upload_url()
    {
        $uploadData = $this->storageService->getSignedUploadUrl(
            'residents-photos',
            'test/upload-test.jpg',
            3600
        );
        
        $this->assertIsArray($uploadData);
        $this->assertArrayHasKey('upload_url', $uploadData);
        $this->assertArrayHasKey('token', $uploadData);
        $this->assertArrayHasKey('headers', $uploadData);
    }
}
