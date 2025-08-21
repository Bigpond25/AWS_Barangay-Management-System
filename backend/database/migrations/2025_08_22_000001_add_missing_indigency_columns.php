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
        Schema::table('documents', function (Blueprint $table) {
            // Add monthly_income column as expected by the schema and frontend
            $table->decimal('monthly_income', 10, 2)->nullable()->after('indigency_reason');
            
            // Note: family_monthly_income already exists but we're keeping both for compatibility
            // The frontend and schema expect 'monthly_income', while the original migration had 'family_monthly_income'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('monthly_income');
        });
    }
};
