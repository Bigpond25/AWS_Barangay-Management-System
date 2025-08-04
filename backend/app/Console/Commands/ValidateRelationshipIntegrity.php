<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Document;
use App\Models\Resident;
use App\Models\Household;
use Illuminate\Support\Facades\DB;

class ValidateRelationshipIntegrity extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'barangay:validate-relationships {--fix : Attempt to fix found issues}';

    /**
     * The console command description.
     */
    protected $description = 'Validate relationship integrity across all entities in the Barangay Management System';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Starting Relationship Integrity Validation...');
        $this->newLine();

        $hasIssues = false;

        // Check for orphaned documents
        $hasIssues |= $this->checkOrphanedDocuments();
        
        // Check household member consistency
        $hasIssues |= $this->checkHouseholdMemberConsistency();
        
        // Check UUID consistency
        $hasIssues |= $this->checkUuidConsistency();
        
        // Check for missing required relationships
        $hasIssues |= $this->checkMissingRelationships();

        $this->newLine();
        
        if (!$hasIssues) {
            $this->info('✅ All relationship integrity checks passed!');
            return 0;
        }

        $this->warn('⚠️  Issues found. Run with --fix flag to attempt automatic fixes.');
        return 1;
    }

    /**
     * Check for documents with invalid resident references
     */
    private function checkOrphanedDocuments(): bool
    {
        $this->info('📄 Checking for orphaned documents...');
        
        $orphanedDocs = Document::whereNotExists(function ($query) {
            $query->select(DB::raw(1))
                  ->from('residents')
                  ->whereRaw('residents.id = documents.resident_id');
        })->count();

        if ($orphanedDocs > 0) {
            $this->error("   ❌ Found {$orphanedDocs} orphaned documents");
            
            if ($this->option('fix')) {
                $this->warn('   🔧 Deleting orphaned documents...');
                Document::whereNotExists(function ($query) {
                    $query->select(DB::raw(1))
                          ->from('residents')
                          ->whereRaw('residents.id = documents.resident_id');
                })->delete();
                $this->info('   ✅ Orphaned documents deleted');
            }
            
            return true;
        }

        $this->info('   ✅ No orphaned documents found');
        return false;
    }

    /**
     * Check household member consistency
     */
    private function checkHouseholdMemberConsistency(): bool
    {
        $this->info('🏠 Checking household member consistency...');
        
        $invalidMembers = DB::table('household_members')
            ->leftJoin('residents', 'household_members.resident_id', '=', 'residents.id')
            ->leftJoin('households', 'household_members.household_id', '=', 'households.id')
            ->where(function ($query) {
                $query->whereNull('residents.id')
                      ->orWhereNull('households.id');
            })
            ->count();

        if ($invalidMembers > 0) {
            $this->error("   ❌ Found {$invalidMembers} invalid household member records");
            
            if ($this->option('fix')) {
                $this->warn('   🔧 Cleaning up invalid household member records...');
                DB::table('household_members')
                    ->leftJoin('residents', 'household_members.resident_id', '=', 'residents.id')
                    ->leftJoin('households', 'household_members.household_id', '=', 'households.id')
                    ->where(function ($query) {
                        $query->whereNull('residents.id')
                              ->orWhereNull('households.id');
                    })
                    ->delete();
                $this->info('   ✅ Invalid household member records cleaned up');
            }
            
            return true;
        }

        $this->info('   ✅ All household member records are valid');
        return false;
    }

    /**
     * Check UUID consistency across tables
     */
    private function checkUuidConsistency(): bool
    {
        $this->info('🔑 Checking UUID consistency...');
        
        $issues = [];

        // Check residents table
        $invalidResidentIds = Resident::whereRaw('id !~ \'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$\'')->count();
        if ($invalidResidentIds > 0) {
            $issues[] = "residents table has {$invalidResidentIds} invalid UUID primary keys";
        }

        // Check documents table foreign keys
        $invalidDocumentRefs = Document::whereRaw('resident_id !~ \'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$\'')->count();
        if ($invalidDocumentRefs > 0) {
            $issues[] = "documents table has {$invalidDocumentRefs} invalid UUID foreign keys";
        }

        if (!empty($issues)) {
            foreach ($issues as $issue) {
                $this->error("   ❌ {$issue}");
            }
            return true;
        }

        $this->info('   ✅ All UUIDs are properly formatted');
        return false;
    }

    /**
     * Check for missing required relationships
     */
    private function checkMissingRelationships(): bool
    {
        $this->info('🔗 Checking for missing required relationships...');
        
        $issues = [];

        // Check households without heads
        $householdsWithoutHeads = Household::whereDoesntHave('members', function ($query) {
            $query->wherePivot('relationship', 'HEAD');
        })->count();

        if ($householdsWithoutHeads > 0) {
            $issues[] = "{$householdsWithoutHeads} households without designated heads";
        }

        // Check documents without valid status
        $invalidStatusDocs = Document::whereNotIn('status', ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'RELEASED', 'REJECTED', 'CANCELLED'])->count();
        if ($invalidStatusDocs > 0) {
            $issues[] = "{$invalidStatusDocs} documents with invalid status values";
        }

        if (!empty($issues)) {
            foreach ($issues as $issue) {
                $this->error("   ❌ {$issue}");
            }
            return true;
        }

        $this->info('   ✅ All required relationships are properly established');
        return false;
    }
}
