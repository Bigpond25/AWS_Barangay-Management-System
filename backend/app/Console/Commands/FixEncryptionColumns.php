<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class FixEncryptionColumns extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'encrypt:fix-columns';

    /**
     * The console command description.
     */
    protected $description = 'Fix encryption column names';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fixing encryption column names...');

        try {
            // Fix residents table
            Schema::table('residents', function ($table) {
                // Drop old incorrect columns
                if (Schema::hasColumn('residents', 'phone_hash')) {
                    $table->dropColumn('phone_hash');
                }
                if (Schema::hasColumn('residents', 'email_hash')) {
                    $table->dropColumn('email_hash');
                }
                
                // Add correct columns
                if (!Schema::hasColumn('residents', 'mobile_number_hash')) {
                    $table->string('mobile_number_hash')->nullable()->index()->after('mobile_number');
                }
                if (!Schema::hasColumn('residents', 'email_address_hash')) {
                    $table->string('email_address_hash')->nullable()->index()->after('email_address');
                }
            });

            // Fix households table
            Schema::table('households', function ($table) {
                // Drop old incorrect column
                if (Schema::hasColumn('households', 'address_hash')) {
                    $table->dropColumn('address_hash');
                }
                
                // Add correct column
                if (!Schema::hasColumn('households', 'complete_address_hash')) {
                    $table->string('complete_address_hash')->nullable()->index()->after('complete_address');
                }
            });

            $this->info('✅ Encryption columns fixed successfully!');
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            return 1;
        }
    }
}
