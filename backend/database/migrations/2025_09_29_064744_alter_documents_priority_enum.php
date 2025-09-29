<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the old check constraint
        DB::statement("ALTER TABLE documents DROP CONSTRAINT documents_priority_check");

        // Add the new check constraint with HIGH included
        DB::statement("
            ALTER TABLE documents
            ADD CONSTRAINT documents_priority_check
            CHECK (priority IN ('NORMAL', 'RUSH', 'URGENT', 'HIGH'))
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to the original constraint
        DB::statement("ALTER TABLE documents DROP CONSTRAINT documents_priority_check");

        DB::statement("
            ALTER TABLE documents
            ADD CONSTRAINT documents_priority_check
            CHECK (priority IN ('NORMAL', 'RUSH', 'URGENT'))
        ");
    }
};
