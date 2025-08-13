<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Resident;
use App\Models\Household;
use App\Services\EncryptionService;
use Illuminate\Support\Facades\DB;

class EncryptExistingData extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'encrypt:existing-data {--model=} {--dry-run} {--force}';

    /**
     * The console command description.
     */
    protected $description = 'Encrypt existing sensitive data in the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $model = $this->option('model');
        $dryRun = $this->option('dry-run');
        $force = $this->option('force');

        if (!$force && !$this->confirm('This will encrypt sensitive data in your database. Are you sure you want to continue?')) {
            $this->info('Operation cancelled.');
            return 0;
        }

        if ($dryRun) {
            $this->info('🔍 DRY RUN MODE - No data will be modified');
        }

        // Validate model option
        $availableModels = ['residents', 'households', 'all'];
        if ($model && !in_array($model, $availableModels)) {
            $this->error("Invalid model. Available options: " . implode(', ', $availableModels));
            return 1;
        }

        try {
            DB::beginTransaction();

            if (!$model || $model === 'all' || $model === 'residents') {
                $this->encryptResidents($dryRun);
            }

            if (!$model || $model === 'all' || $model === 'households') {
                $this->encryptHouseholds($dryRun);
            }

            if (!$dryRun) {
                DB::commit();
                $this->info('✅ Data encryption completed successfully!');
            } else {
                DB::rollback();
                $this->info('✅ Dry run completed - no data was modified');
            }

        } catch (\Exception $e) {
            DB::rollback();
            $this->error('❌ Error during encryption: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }

    /**
     * Encrypt residents data
     */
    private function encryptResidents(bool $dryRun): void
    {
        $this->info('🔒 Processing Residents...');

        // Get residents with unencrypted data
        $residents = Resident::whereNotNull('first_name')
            ->orWhereNotNull('last_name')
            ->orWhereNotNull('mobile_number')
            ->orWhereNotNull('email_address')
            ->orWhereNotNull('complete_address')
            ->get();

        $bar = $this->output->createProgressBar($residents->count());
        $encryptedCount = 0;

        foreach ($residents as $resident) {
            $needsEncryption = false;
            $updates = [];
            $hashUpdates = [];

            // Check and encrypt first_name
            if ($resident->first_name && !EncryptionService::isEncrypted($resident->first_name)) {
                $updates['first_name'] = EncryptionService::encrypt($resident->first_name);
                $hashUpdates['first_name_hash'] = EncryptionService::searchHash($resident->first_name);
                $needsEncryption = true;
            }

            // Check and encrypt last_name
            if ($resident->last_name && !EncryptionService::isEncrypted($resident->last_name)) {
                $updates['last_name'] = EncryptionService::encrypt($resident->last_name);
                $hashUpdates['last_name_hash'] = EncryptionService::searchHash($resident->last_name);
                $needsEncryption = true;
            }

            // Check and encrypt mobile_number
            if ($resident->mobile_number && !EncryptionService::isEncrypted($resident->mobile_number)) {
                $updates['mobile_number'] = EncryptionService::encrypt($resident->mobile_number);
                $hashUpdates['mobile_number_hash'] = EncryptionService::searchHash($resident->mobile_number);
                $needsEncryption = true;
            }

            // Check and encrypt email_address
            if ($resident->email_address && !EncryptionService::isEncrypted($resident->email_address)) {
                $updates['email_address'] = EncryptionService::encrypt($resident->email_address);
                $hashUpdates['email_address_hash'] = EncryptionService::searchHash($resident->email_address);
                $needsEncryption = true;
            }

            // Check and encrypt complete_address
            if ($resident->complete_address && !EncryptionService::isEncrypted($resident->complete_address)) {
                $updates['complete_address'] = EncryptionService::encrypt($resident->complete_address);
                $needsEncryption = true;
            }

            // Check and encrypt current_address
            if ($resident->current_address && !EncryptionService::isEncrypted($resident->current_address)) {
                $updates['current_address'] = EncryptionService::encrypt($resident->current_address);
                $needsEncryption = true;
            }

            if ($needsEncryption && !$dryRun) {
                // Update without triggering model events to avoid double encryption
                DB::table('residents')
                    ->where('id', $resident->id)
                    ->update(array_merge($updates, $hashUpdates));
                $encryptedCount++;
            } elseif ($needsEncryption) {
                $encryptedCount++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("   📊 Residents processed: {$residents->count()}");
        $this->info("   🔒 Residents encrypted: {$encryptedCount}");
    }

    /**
     * Encrypt households data
     */
    private function encryptHouseholds(bool $dryRun): void
    {
        $this->info('🔒 Processing Households...');

        // Get households with unencrypted data
        $households = Household::whereNotNull('complete_address')->get();

        $bar = $this->output->createProgressBar($households->count());
        $encryptedCount = 0;

        foreach ($households as $household) {
            $needsEncryption = false;
            $updates = [];
            $hashUpdates = [];

            // Check and encrypt complete_address
            if ($household->complete_address && !EncryptionService::isEncrypted($household->complete_address)) {
                $updates['complete_address'] = EncryptionService::encrypt($household->complete_address);
                $hashUpdates['complete_address_hash'] = EncryptionService::searchHash($household->complete_address);
                $needsEncryption = true;
            }

            if ($needsEncryption && !$dryRun) {
                // Update without triggering model events to avoid double encryption
                DB::table('households')
                    ->where('id', $household->id)
                    ->update(array_merge($updates, $hashUpdates));
                $encryptedCount++;
            } elseif ($needsEncryption) {
                $encryptedCount++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("   📊 Households processed: {$households->count()}");
        $this->info("   🔒 Households encrypted: {$encryptedCount}");
    }
}
