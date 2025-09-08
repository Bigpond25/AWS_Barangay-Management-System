<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations - Add critical performance indexes for documents table
     */
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // Only add indexes if they don't exist
            if (!$this->indexExists('documents', 'idx_documents_applicant_status')) {
                $table->index(['applicant_name', 'status'], 'idx_documents_applicant_status');
            }
            if (!$this->indexExists('documents', 'idx_documents_numbers')) {
                $table->index(['document_number', 'serial_number'], 'idx_documents_numbers');
            }
            
            // Text search indexes for ILIKE performance
            if (!$this->indexExists('documents', 'idx_documents_applicant_name_text')) {
                $table->index('applicant_name', 'idx_documents_applicant_name_text');
            }
            if (!$this->indexExists('documents', 'idx_documents_received_from_text')) {
                $table->index('received_from', 'idx_documents_received_from_text');
            }
            if (!$this->indexExists('documents', 'idx_documents_representing_entity_text')) {
                $table->index('representing_entity', 'idx_documents_representing_entity_text');
            }
            if (!$this->indexExists('documents', 'idx_documents_acknowledgement_address_text')) {
                $table->index('acknowledgement_address', 'idx_documents_acknowledgement_address_text');
            }
            
            // Composite indexes for filtering + pagination
            if (!$this->indexExists('documents', 'idx_documents_type_status_date')) {
                $table->index(['type', 'status', 'submitted_at'], 'idx_documents_type_status_date');
            }
            if (!$this->indexExists('documents', 'idx_documents_status_priority_date')) {
                $table->index(['status', 'priority', 'submitted_at'], 'idx_documents_status_priority_date');
            }
            if (!$this->indexExists('documents', 'idx_documents_resident_status_date')) {
                $table->index(['resident_id', 'status', 'submitted_at'], 'idx_documents_resident_status_date');
            }
            
            // Date range query optimization (skip existing ones)
            if (!$this->indexExists('documents', 'idx_documents_submitted_status') && 
                !$this->indexExists('documents', 'documents_submitted_at_index')) {
                $table->index(['submitted_at', 'status'], 'idx_documents_submitted_status');
            }
            if (!$this->indexExists('documents', 'idx_documents_needed_status_optimized')) {
                $table->index(['needed_date', 'status'], 'idx_documents_needed_status_optimized');
            }
            
            // Payment and processing workflow indexes
            if (!$this->indexExists('documents', 'idx_documents_payment_workflow')) {
                $table->index(['payment_status', 'status', 'submitted_at'], 'idx_documents_payment_workflow');
            }
            if (!$this->indexExists('documents', 'idx_documents_processed_by_status')) {
                $table->index(['processed_by', 'status'], 'idx_documents_processed_by_status');
            }
            
            // Additional workflow indexes
            if (!$this->indexExists('documents', 'idx_documents_approved_workflow')) {
                $table->index(['approved_by', 'approved_at'], 'idx_documents_approved_workflow');
            }
            if (!$this->indexExists('documents', 'idx_documents_released_workflow')) {
                $table->index(['released_by', 'released_at'], 'idx_documents_released_workflow');
            }
        });
        
        // Add text search indexes on residents table for JOIN performance
        Schema::table('residents', function (Blueprint $table) {
            // Composite index for name search with soft deletes
            if (!$this->indexExists('residents', 'idx_residents_name_search')) {
                $table->index(['first_name', 'last_name', 'deleted_at'], 'idx_residents_name_search');
            }
            if (!$this->indexExists('residents', 'idx_residents_lastname_search')) {
                $table->index(['last_name', 'first_name', 'deleted_at'], 'idx_residents_lastname_search');
            }
            
            // Text search performance for JOIN queries
            if (!$this->indexExists('residents', 'idx_residents_first_name_text')) {
                $table->index('first_name', 'idx_residents_first_name_text');
            }
            if (!$this->indexExists('residents', 'idx_residents_last_name_text')) {
                $table->index('last_name', 'idx_residents_last_name_text');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // Drop performance indexes
            $table->dropIndex('idx_documents_applicant_status');
            $table->dropIndex('idx_documents_numbers');
            $table->dropIndex('idx_documents_applicant_name_text');
            $table->dropIndex('idx_documents_received_from_text');
            $table->dropIndex('idx_documents_representing_entity_text');
            $table->dropIndex('idx_documents_acknowledgement_address_text');
            $table->dropIndex('idx_documents_type_status_date');
            $table->dropIndex('idx_documents_status_priority_date');
            $table->dropIndex('idx_documents_resident_status_date');
            $table->dropIndex('idx_documents_submitted_status');
            $table->dropIndex('idx_documents_needed_status_optimized');
            $table->dropIndex('idx_documents_payment_workflow');
            $table->dropIndex('idx_documents_processed_by_status');
            $table->dropIndex('idx_documents_approved_workflow');
            $table->dropIndex('idx_documents_released_workflow');
        });
        
        Schema::table('residents', function (Blueprint $table) {
            $table->dropIndex('idx_residents_name_search');
            $table->dropIndex('idx_residents_lastname_search');
            
            if ($this->indexExists('residents', 'idx_residents_first_name_text')) {
                $table->dropIndex('idx_residents_first_name_text');
            }
            if ($this->indexExists('residents', 'idx_residents_last_name_text')) {
                $table->dropIndex('idx_residents_last_name_text');
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
