<?php

namespace App\Console\Commands;

use App\Contracts\StorageInterface;
use App\Models\Resident;
use Illuminate\Console\Command;
use Illuminate\Http\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Migrate local files to Supabase storage
 */
class MigrateFilesToSupabase extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'storage:migrate-to-supabase 
                            {--dry-run : Show what would be migrated without actually doing it}
                            {--chunk=50 : Number of records to process at once}
                            {--only-photos : Only migrate profile photos}';

    /**
     * The console command description.
     */
    protected $description = 'Migrate existing local files to Supabase storage';

    private StorageInterface $storageService;

    public function __construct(StorageInterface $storageService)
    {
        parent::__construct();
        $this->storageService = $storageService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');
        $chunkSize = (int) $this->option('chunk');
        $onlyPhotos = $this->option('only-photos');

        $this->info('Starting file migration to Supabase...');
        
        if ($isDryRun) {
            $this->warn('DRY RUN MODE - No files will actually be migrated');
        }

        // Test connection first
        if (!$this->testSupabaseConnection()) {
            $this->error('Cannot connect to Supabase. Please check your configuration.');
            return 1;
        }

        // Migrate resident profile photos
        $this->migrateResidentPhotos($isDryRun, $chunkSize);

        if (!$onlyPhotos) {
            // Add other file migrations here
            $this->info('Other file migrations can be added here...');
        }

        $this->info('Migration completed!');
        return 0;
    }

    /**
     * Test Supabase connection
     */
    private function testSupabaseConnection(): bool
    {
        try {
            return $this->storageService->testConnection();
        } catch (\Exception $e) {
            $this->error('Connection test failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Migrate resident profile photos
     */
    private function migrateResidentPhotos(bool $isDryRun, int $chunkSize): void
    {
        $this->info('Migrating resident profile photos...');

        // Get residents with local photos that haven't been migrated
        $query = Resident::whereNotNull('profile_photo_url')
            ->where('photo_migrated_to_supabase', false)
            ->orWhereNull('photo_migrated_to_supabase');

        $totalCount = $query->count();
        $this->info("Found {$totalCount} residents with photos to migrate");

        if ($totalCount === 0) {
            $this->info('No photos to migrate');
            return;
        }

        $bar = $this->output->createProgressBar($totalCount);
        $bar->start();

        $successCount = 0;
        $errorCount = 0;

        $query->chunk($chunkSize, function ($residents) use ($isDryRun, &$successCount, &$errorCount, $bar) {
            foreach ($residents as $resident) {
                $result = $this->migrateResidentPhoto($resident, $isDryRun);
                
                if ($result) {
                    $successCount++;
                } else {
                    $errorCount++;
                }
                
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();

        $this->info("Migration summary:");
        $this->info("- Successfully migrated: {$successCount}");
        
        if ($errorCount > 0) {
            $this->warn("- Failed to migrate: {$errorCount}");
        }
    }

    /**
     * Migrate a single resident's photo
     */
    private function migrateResidentPhoto(Resident $resident, bool $isDryRun): bool
    {
        try {
            $photoPath = $resident->profile_photo_url;
            
            if (!$photoPath) {
                return true; // No photo to migrate
            }

            // Check if file exists in local storage
            if (!Storage::disk('public')->exists($photoPath)) {
                $this->warn("Local file not found: {$photoPath} for resident {$resident->id}");
                
                // Mark as migrated to avoid repeated attempts
                if (!$isDryRun) {
                    $resident->update([
                        'photo_migrated_to_supabase' => true,
                        'photo_storage_provider' => 'local_missing'
                    ]);
                }
                
                return false;
            }

            if ($isDryRun) {
                $this->line("Would migrate: {$photoPath} for resident {$resident->id}");
                return true;
            }

            // Get the actual file
            $localFilePath = Storage::disk('public')->path($photoPath);
            $file = new File($localFilePath);

            // Upload to Supabase
            $result = $this->storageService->uploadFile(
                new \Illuminate\Http\UploadedFile(
                    $localFilePath,
                    basename($photoPath),
                    $file->getMimeType(),
                    null,
                    true
                ),
                'residents-photos',
                "migrated/{$resident->id}/profile",
                true
            );

            if ($result['success']) {
                // Update resident record
                $resident->update([
                    'profile_photo_url' => $result['path'],
                    'photo_bucket' => $result['bucket'],
                    'photo_path' => $result['path'],
                    'photo_storage_provider' => 'supabase',
                    'photo_migrated_to_supabase' => true,
                    'updated_by' => 1 // System user
                ]);

                // Optionally delete local file after successful migration
                // Storage::disk('public')->delete($photoPath);

                Log::info('Migrated resident photo to Supabase', [
                    'resident_id' => $resident->id,
                    'old_path' => $photoPath,
                    'new_path' => $result['path']
                ]);

                return true;
            } else {
                $this->error("Failed to upload photo for resident {$resident->id}: " . $result['error']);
                return false;
            }

        } catch (\Exception $e) {
            $this->error("Error migrating photo for resident {$resident->id}: " . $e->getMessage());
            
            Log::error('Photo migration error', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }
}
