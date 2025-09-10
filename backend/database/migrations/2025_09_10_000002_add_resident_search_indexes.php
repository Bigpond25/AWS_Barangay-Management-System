<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations - Add search performance indexes for residents table
     */
    public function up(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            // Enhanced search indexes for text fields (similar to documents optimization)
            if (!$this->indexExists('residents', 'idx_residents_mobile_search')) {
                $table->index('mobile_number', 'idx_residents_mobile_search');
            }
            if (!$this->indexExists('residents', 'idx_residents_email_search')) {
                $table->index('email_address', 'idx_residents_email_search');
            }
            if (!$this->indexExists('residents', 'idx_residents_address_search')) {
                $table->index('complete_address', 'idx_residents_address_search');
            }
            
            // Composite indexes for common query patterns
            if (!$this->indexExists('residents', 'idx_residents_age_classification')) {
                $table->index(['birth_date', 'senior_citizen', 'status'], 'idx_residents_age_classification');
            }
            if (!$this->indexExists('residents', 'idx_residents_household_search')) {
                $table->index(['first_name', 'last_name', 'status'], 'idx_residents_household_search');
            }
            
            // Employment and voting status combinations
            if (!$this->indexExists('residents', 'idx_residents_employment_voter')) {
                $table->index(['employment_status', 'voter_status'], 'idx_residents_employment_voter');
            }
            
            // Special classifications for reporting
            if (!$this->indexExists('residents', 'idx_residents_special_programs')) {
                $table->index(['four_ps_beneficiary', 'indigenous_people', 'status'], 'idx_residents_special_programs');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            if ($this->indexExists('residents', 'idx_residents_mobile_search')) {
                $table->dropIndex('idx_residents_mobile_search');
            }
            if ($this->indexExists('residents', 'idx_residents_email_search')) {
                $table->dropIndex('idx_residents_email_search');
            }
            if ($this->indexExists('residents', 'idx_residents_address_search')) {
                $table->dropIndex('idx_residents_address_search');
            }
            if ($this->indexExists('residents', 'idx_residents_age_classification')) {
                $table->dropIndex('idx_residents_age_classification');
            }
            if ($this->indexExists('residents', 'idx_residents_household_search')) {
                $table->dropIndex('idx_residents_household_search');
            }
            if ($this->indexExists('residents', 'idx_residents_employment_voter')) {
                $table->dropIndex('idx_residents_employment_voter');
            }
            if ($this->indexExists('residents', 'idx_residents_special_programs')) {
                $table->dropIndex('idx_residents_special_programs');
            }
        });
    }
    
    /**
     * Check if an index exists
     */
    private function indexExists(string $table, string $index): bool
    {
        $indexes = DB::select('SELECT indexname FROM pg_indexes WHERE tablename = ? AND indexname = ?', [$table, $index]);
        return !empty($indexes);
    }
};
