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
        Schema::create('documents', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Document Classification
            $table->enum('type', [
                'BARANGAY_CLEARANCE', 'CERTIFICATE_OF_RESIDENCY', 'CERTIFICATE_OF_INDIGENCY',
                'BUSINESS_PERMIT', 'COMMUNITY_TAX_CERTIFICATE', 'BIRTH_CERTIFICATE_REQUEST',
                'DEATH_CERTIFICATE_REQUEST', 'MARRIAGE_CERTIFICATE_REQUEST', 'FIRST_TIME_JOB_SEEKER',
                'SENIOR_CITIZEN_ID', 'PWD_ID', 'TRAVEL_PERMIT', 'BUILDING_PERMIT',
                'ELECTRICAL_PERMIT', 'PLUMBING_PERMIT', 'COMPLAINT_CERTIFICATE', 'NOTICE_OF_HEARING',
                'RETIREMENT_CESSATION_DISSOLUTION', 'SUMMON', 'CASH_BOND', 'BARANGAY_CLEARANCE_INSTALLATION',
                'BUSINESS_SIGN_CLEARANCE', 'OTHER'
            ]);

            // Applicant Information
            $table->uuid('resident_id');
            $table->string('applicant_name');
            $table->text('purpose');
            $table->text('applicant_address')->nullable();
            $table->string('applicant_contact')->nullable();
            $table->string('applicant_email')->nullable();

            // Processing Information
            $table->enum('priority', ['NORMAL', 'RUSH', 'URGENT'])->default('NORMAL');
            $table->date('needed_date')->nullable();
            $table->decimal('processing_fee', 8, 2)->default(0);

            // Status Tracking
            $table->enum('status', ['PENDING', 'PROCESSING', 'APPROVED', 'RELEASED', 'REJECTED', 'CANCELLED'])->default('PENDING');
            $table->enum('payment_status', ['UNPAID', 'PAID', 'WAIVED', 'REFUNDED'])->default('PAID');

            // Document Numbers
            $table->string('document_number')->unique()->nullable();
            $table->string('serial_number')->unique()->nullable();

            // Important Dates
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->date('expiry_date')->nullable();

            // Document-specific fields
            $table->string('clearance_purpose')->nullable();
            $table->string('clearance_type')->nullable();
            $table->string('business_name')->nullable();
            $table->string('business_type')->nullable();
            $table->text('business_address')->nullable();
            $table->string('business_owner')->nullable();
            // Business Sign Clearance fields
            $table->string('sign_wordings')->nullable();
            $table->string('sign_material')->nullable();
            $table->string('sign_size')->nullable();
            $table->text('indigency_reason')->nullable();
            $table->decimal('family_monthly_income', 10, 2)->nullable();
            $table->decimal('monthly_income', 10, 2)->nullable();
            $table->integer('family_size')->nullable();
            $table->string('residency_period')->nullable();
            $table->text('previous_address')->nullable();

            // Additional/Notice of Hearing/Retirement fields
            $table->string('received_from')->nullable();
            $table->decimal('bond_amount', 10, 2)->nullable();
            $table->string('representing_entity')->nullable();
            $table->text('acknowledgement_address')->nullable();
            $table->string('case_number')->nullable();
            $table->enum('case_title', [
                'Sum of Money', 'Eviction', 'Property Dispute', 'Noise Complaint', 'Boundary Dispute',
                'Defamation', 'Physical Injury', 'Damage to Property', 'Breach of Contract', 'Other'
            ])->nullable();
            $table->text('case_description')->nullable();
            $table->string('complainant_name')->nullable();
            $table->text('complainant_address')->nullable();
            $table->string('respondent_name')->nullable();
            $table->text('respondent_address')->nullable();
            $table->date('hearing_date')->nullable();
            $table->time('hearing_time')->nullable();
            $table->enum('hearing_type', [
                'MEDIATION', 'CONCILIATION', 'ARBITRATION', 'SETTLEMENT_CONFERENCE', 'FAILURE_TO_APPEAR'
            ])->nullable();
            $table->enum('ownership_type', [
                'SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'CORPORATION', 'COOPERATIVE', 'ASSOCIATION', 'OTHER'
            ])->nullable();
            $table->date('retirement_date')->nullable();
            $table->string('business_category')->nullable();

            // Processing Notes
            $table->text('requirements_submitted')->nullable();
            $table->text('notes')->nullable();
            $table->text('remarks')->nullable();
            $table->string('certifying_official')->nullable();

            // File Storage
            $table->string('file_path', 500)->nullable();
            $table->string('file_bucket', 100)->nullable();
            $table->string('file_storage_path', 500)->nullable();
            $table->string('file_storage_provider', 50)->default('local');
            $table->boolean('file_migrated_to_supabase')->default(false);

            // Staff Processing
            $table->uuid('processed_by')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->uuid('released_by')->nullable();

            // Audit fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('resident_id')->references('id')->on('residents')->onDelete('cascade');
            $table->foreign('processed_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('released_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            // Indexes for performance and document generation
            $table->index(['type', 'status']);
            $table->index('payment_status');
            $table->index('submitted_at');
            $table->index(['resident_id', 'type']);
            $table->index('status');
            $table->index(['status', 'needed_date']);
            $table->index(['created_at']);
            $table->index('file_migrated_to_supabase');
            $table->index(['applicant_name', 'status'], 'idx_documents_applicant_status');
            $table->index(['document_number', 'serial_number'], 'idx_documents_numbers');
            $table->index('applicant_name', 'idx_documents_applicant_name_text');
            $table->index('received_from', 'idx_documents_received_from_text');
            $table->index('representing_entity', 'idx_documents_representing_entity_text');
            $table->index('acknowledgement_address', 'idx_documents_acknowledgement_address_text');
            $table->index(['type', 'status', 'submitted_at'], 'idx_documents_type_status_date');
            $table->index(['status', 'priority', 'submitted_at'], 'idx_documents_status_priority_date');
            $table->index(['resident_id', 'status', 'submitted_at'], 'idx_documents_resident_status_date');
            $table->index(['submitted_at', 'status'], 'idx_documents_submitted_status');
            $table->index(['needed_date', 'status'], 'idx_documents_needed_status_optimized');
            $table->index(['payment_status', 'status', 'submitted_at'], 'idx_documents_payment_workflow');
            $table->index(['processed_by', 'status'], 'idx_documents_processed_by_status');
            $table->index(['approved_by', 'approved_at'], 'idx_documents_approved_workflow');
            $table->index(['released_by', 'released_at'], 'idx_documents_released_workflow');
            $table->index(['type', 'submitted_at', 'document_number'], 'idx_documents_type_date_generation');
            $table->index('serial_number', 'idx_documents_serial_unique');
            
            // Additional performance indexes from performance migration
            $table->index(['document_number'], 'idx_documents_number');
            $table->index(['serial_number'], 'idx_documents_serial');
            $table->index(['applicant_name'], 'idx_documents_applicant');
            $table->index(['status', 'type'], 'idx_documents_status_type');
            $table->index(['status', 'priority'], 'idx_documents_status_priority');
            $table->index(['payment_status', 'status'], 'idx_documents_payment_status');
            $table->index(['received_from'], 'idx_documents_received_from');
            $table->index(['representing_entity'], 'idx_documents_representing');
            $table->index(['payment_status', 'processing_fee'], 'idx_documents_payment_fee');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
