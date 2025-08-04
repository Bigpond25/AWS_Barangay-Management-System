<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * CRITICAL FIX: Change documents.resident_id from unsignedBigInteger to UUID
     * to match residents.id primary key type. This fixes the relationship type mismatch.
     */
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // First, drop the existing foreign key constraint
            $table->dropForeign(['resident_id']);
            
            // Drop the existing column
            $table->dropColumn('resident_id');
        });

        Schema::table('documents', function (Blueprint $table) {
            // Add the new UUID column
            $table->uuid('resident_id')->after('document_type');
            
            // Add the foreign key constraint with proper UUID reference
            $table->foreign('resident_id')
                  ->references('id')
                  ->on('residents')
                  ->onDelete('cascade');
                  
            // Add index for performance
            $table->index('resident_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // Drop foreign key and index
            $table->dropForeign(['resident_id']);
            $table->dropIndex(['resident_id']);
            $table->dropColumn('resident_id');
        });

        Schema::table('documents', function (Blueprint $table) {
            // Restore the original unsignedBigInteger column
            $table->unsignedBigInteger('resident_id')->after('document_type');
            
            // Note: We don't restore the foreign key in rollback since 
            // it was broken anyway (UUID vs BigInteger mismatch)
        });
    }
};
