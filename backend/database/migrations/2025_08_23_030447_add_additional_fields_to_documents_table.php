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
            // General additional fields
            $table->string('received_from')->nullable();
            $table->decimal('bond_amount', 10, 2)->nullable();
            $table->string('representing_entity')->nullable();
            $table->text('acknowledgement_address')->nullable();
            
            // Notice of Hearing Fields
            $table->string('case_number')->nullable();
            $table->enum('case_title', [
                'Sum of Money',
                'Eviction',
                'Property Dispute',
                'Noise Complaint',
                'Boundary Dispute',
                'Defamation',
                'Physical Injury',
                'Damage to Property',
                'Breach of Contract',
                'Other'
            ])->nullable();
            $table->text('case_description')->nullable();
            $table->string('complainant_name')->nullable();
            $table->text('complainant_address')->nullable();
            $table->string('respondent_name')->nullable();
            $table->text('respondent_address')->nullable();
            $table->date('hearing_date')->nullable();
            $table->time('hearing_time')->nullable();
            $table->enum('hearing_type', [
                'MEDIATION',
                'CONCILIATION',
                'ARBITRATION',
                'SETTLEMENT_CONFERENCE',
                'FAILURE_TO_APPEAR'
            ])->nullable();
            
            // Retirement/Cessation/Dissolution Fields
            $table->enum('ownership_type', [
                'SOLE_PROPRIETORSHIP',
                'PARTNERSHIP',
                'CORPORATION',
                'COOPERATIVE',
                'ASSOCIATION',
                'OTHER'
            ])->nullable();
            $table->date('retirement_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // Drop all the added columns
            $table->dropColumn([
                'received_from',
                'bond_amount',
                'representing_entity',
                'acknowledgement_address',
                'case_number',
                'case_title',
                'case_description',
                'complainant_name',
                'complainant_address',
                'respondent_name',
                'respondent_address',
                'hearing_date',
                'hearing_time',
                'hearing_type',
                'ownership_type',
                'retirement_date'
            ]);
        });
    }
};
