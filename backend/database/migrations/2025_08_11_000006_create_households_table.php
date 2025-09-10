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
        Schema::create('households', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('household_number')->unique()->nullable();
            
            // Household Classification
            $table->enum('household_type', ['NUCLEAR', 'EXTENDED', 'SINGLE', 'SINGLE_PARENT', 'OTHER'])->default('NUCLEAR');
            $table->uuid('head_resident_id')->nullable(); // This will be the head resident
            
            // Address Information
            $table->string('house_number');
            $table->string('street_sitio');
            $table->string('barangay');
            $table->text('complete_address');
            // removed complete_address_hash (was dropped in a later migration)
            
            // Economic Information
            $table->enum('monthly_income', [
                'BELOW_10000', 'RANGE_10000_25000', 'RANGE_25000_50000', 
                'RANGE_50000_100000', 'ABOVE_100000'
            ])->nullable();
            $table->string('primary_income_source')->nullable();
            
            // Social Classifications
            $table->boolean('four_ps_beneficiary')->default(false);
            $table->boolean('indigent_family')->default(false);
            $table->boolean('has_senior_citizen')->default(false);
            $table->boolean('has_pwd_member')->default(false);
            
            // Housing Information
            $table->enum('house_type', ['CONCRETE', 'SEMI_CONCRETE', 'WOOD', 'BAMBOO', 'MIXED'])->nullable();
            $table->enum('ownership_status', ['OWNED', 'RENTED', 'SHARED', 'INFORMAL_SETTLER'])->nullable();
            
            // Utilities
            $table->boolean('has_electricity')->default(false);
            $table->boolean('has_water_supply')->default(false);
            $table->boolean('has_internet_access')->default(false);
            
            // Status and Notes
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'TRANSFERRED'])->default('ACTIVE');
            $table->text('remarks')->nullable();
            
            // Audit fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            
            // Indexes (including performance indexes)
            $table->index('barangay');
            $table->index('household_type');
            $table->index('monthly_income');
            $table->index('house_type');
            $table->index('ownership_status');
            $table->index('status');
            $table->index('four_ps_beneficiary');
            $table->index('indigent_family');
            $table->index('has_senior_citizen');
            $table->index('has_pwd_member');
            $table->index(['household_number'], 'idx_households_number');
            $table->index(['complete_address'], 'idx_households_address');
            $table->index(['household_type'], 'idx_households_type');
            $table->index(['monthly_income'], 'idx_households_income');
            $table->index(['house_type'], 'idx_households_house_type');
            $table->index(['ownership_status'], 'idx_households_ownership');
            $table->index(['four_ps_beneficiary'], 'idx_households_4ps');
            $table->index(['indigent_family'], 'idx_households_indigent');
            $table->index(['has_senior_citizen'], 'idx_households_senior');
            $table->index(['has_pwd_member'], 'idx_households_pwd');
            $table->index(['has_electricity', 'has_water_supply', 'has_internet_access'], 'idx_households_utilities');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('households');
    }
};
