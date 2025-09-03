<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - Add performance indexes for faster queries.
     */
    public function up(): void
    {
        // Add performance indexes to residents table
        Schema::table('residents', function (Blueprint $table) {
            // Search optimization indexes
            $table->index(['first_name', 'last_name', 'status'], 'idx_residents_name_status');
            $table->index(['mobile_number', 'status'], 'idx_residents_mobile_status');
            $table->index(['email_address', 'status'], 'idx_residents_email_status');
            
            // Statistics optimization indexes
            $table->index(['status', 'gender'], 'idx_residents_status_gender');
            $table->index(['status', 'employment_status'], 'idx_residents_status_employment');
            $table->index(['status', 'civil_status'], 'idx_residents_status_civil');
            $table->index(['status', 'voter_status'], 'idx_residents_status_voter');
            
            // Age calculation optimization
            $table->index(['birth_date', 'status'], 'idx_residents_birth_status');
        });

        // Add performance indexes to documents table
        Schema::table('documents', function (Blueprint $table) {
            // Search optimization indexes
            $table->index(['document_number'], 'idx_documents_number');
            $table->index(['serial_number'], 'idx_documents_serial');
            $table->index(['applicant_name'], 'idx_documents_applicant');
            
            // Status and filtering indexes
            $table->index(['status', 'type'], 'idx_documents_status_type');
            $table->index(['status', 'priority'], 'idx_documents_status_priority');
            $table->index(['payment_status', 'status'], 'idx_documents_payment_status');
            
            // Date range optimization
            $table->index(['submitted_at', 'status'], 'idx_documents_submitted_status');
            $table->index(['needed_date', 'status'], 'idx_documents_needed_status');
            
            // Cash bond search optimization
            $table->index(['received_from'], 'idx_documents_received_from');
            $table->index(['representing_entity'], 'idx_documents_representing');
            
            // Revenue calculations
            $table->index(['payment_status', 'processing_fee'], 'idx_documents_payment_fee');
        });

        // Add performance indexes to households table
        Schema::table('households', function (Blueprint $table) {
            // Search optimization indexes
            $table->index(['household_number'], 'idx_households_number');
            $table->index(['complete_address'], 'idx_households_address');
            
            // Classification optimization
            $table->index(['household_type'], 'idx_households_type');
            $table->index(['monthly_income'], 'idx_households_income');
            $table->index(['house_type'], 'idx_households_house_type');
            $table->index(['ownership_status'], 'idx_households_ownership');
            
            // Boolean flags optimization
            $table->index(['four_ps_beneficiary'], 'idx_households_4ps');
            $table->index(['indigent_family'], 'idx_households_indigent');
            $table->index(['has_senior_citizen'], 'idx_households_senior');
            $table->index(['has_pwd_member'], 'idx_households_pwd');
            
            // Utilities optimization
            $table->index(['has_electricity', 'has_water_supply', 'has_internet_access'], 'idx_households_utilities');
        });

        // Add performance indexes to household_members pivot table
        Schema::table('household_members', function (Blueprint $table) {
            // Pivot table optimization
            $table->index(['resident_id', 'household_id'], 'idx_household_members_resident_household');
            $table->index(['household_id', 'relationship'], 'idx_household_members_household_relationship');
            $table->index(['relationship'], 'idx_household_members_relationship');
        });

        // Add performance indexes to activity_logs for audit trails
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index(['subject_type', 'subject_id'], 'idx_activity_logs_subject');
            $table->index(['causer_type', 'causer_id'], 'idx_activity_logs_causer');
            $table->index(['created_at'], 'idx_activity_logs_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop performance indexes from residents table
        Schema::table('residents', function (Blueprint $table) {
            $table->dropIndex('idx_residents_name_status');
            $table->dropIndex('idx_residents_mobile_status');
            $table->dropIndex('idx_residents_email_status');
            $table->dropIndex('idx_residents_status_gender');
            $table->dropIndex('idx_residents_status_employment');
            $table->dropIndex('idx_residents_status_civil');
            $table->dropIndex('idx_residents_status_voter');
            $table->dropIndex('idx_residents_birth_status');
        });

        // Drop performance indexes from documents table
        Schema::table('documents', function (Blueprint $table) {
            $table->dropIndex('idx_documents_number');
            $table->dropIndex('idx_documents_serial');
            $table->dropIndex('idx_documents_applicant');
            $table->dropIndex('idx_documents_status_type');
            $table->dropIndex('idx_documents_status_priority');
            $table->dropIndex('idx_documents_payment_status');
            $table->dropIndex('idx_documents_submitted_status');
            $table->dropIndex('idx_documents_needed_status');
            $table->dropIndex('idx_documents_received_from');
            $table->dropIndex('idx_documents_representing');
            $table->dropIndex('idx_documents_payment_fee');
        });

        // Drop performance indexes from households table
        Schema::table('households', function (Blueprint $table) {
            $table->dropIndex('idx_households_number');
            $table->dropIndex('idx_households_address');
            $table->dropIndex('idx_households_type');
            $table->dropIndex('idx_households_income');
            $table->dropIndex('idx_households_house_type');
            $table->dropIndex('idx_households_ownership');
            $table->dropIndex('idx_households_4ps');
            $table->dropIndex('idx_households_indigent');
            $table->dropIndex('idx_households_senior');
            $table->dropIndex('idx_households_pwd');
            $table->dropIndex('idx_households_utilities');
        });

        // Drop performance indexes from household_members pivot table
        Schema::table('household_members', function (Blueprint $table) {
            $table->dropIndex('idx_household_members_resident_household');
            $table->dropIndex('idx_household_members_household_relationship');
            $table->dropIndex('idx_household_members_relationship');
        });

        // Drop performance indexes from activity_logs
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex('idx_activity_logs_subject');
            $table->dropIndex('idx_activity_logs_causer');
            $table->dropIndex('idx_activity_logs_created');
        });
    }
};
