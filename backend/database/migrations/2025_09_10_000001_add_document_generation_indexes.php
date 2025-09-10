<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations - Add indexes specifically for document number generation performance
     */
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // CRITICAL: Index for document number generation queries
            if (!$this->indexExists('documents', 'idx_documents_type_date_generation')) {
                $table->index(['type', 'submitted_at', 'document_number'], 'idx_documents_type_date_generation');
            }
            
            // Additional index for serial number uniqueness checks (if needed)
            if (!$this->indexExists('documents', 'idx_documents_serial_unique')) {
                $table->index('serial_number', 'idx_documents_serial_unique');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            if ($this->indexExists('documents', 'idx_documents_type_date_generation')) {
                $table->dropIndex('idx_documents_type_date_generation');
            }
            if ($this->indexExists('documents', 'idx_documents_serial_unique')) {
                $table->dropIndex('idx_documents_serial_unique');
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
