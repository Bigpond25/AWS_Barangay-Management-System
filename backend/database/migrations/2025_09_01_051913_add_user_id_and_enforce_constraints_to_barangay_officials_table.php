<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('barangay_officials', function (Blueprint $table) {
            // Add user_id field with foreign key constraint
            $table->uuid('user_id')->nullable()->after('resident_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Add index for better performance
            $table->index('user_id');
        });
        
        // In a separate schema operation, make resident_id non-nullable
        // First, we need to ensure all existing records have a resident_id
        // For production, you might want to handle this differently
        Schema::table('barangay_officials', function (Blueprint $table) {
            // Remove the existing nullable constraint and make it required
            $table->uuid('resident_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('barangay_officials', function (Blueprint $table) {
            // Drop foreign key and user_id column
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
            
            // Make resident_id nullable again
            $table->uuid('resident_id')->nullable()->change();
        });
    }
};
