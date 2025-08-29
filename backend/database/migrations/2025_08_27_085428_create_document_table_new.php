<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Document Classification
            $table->enum('type', [
                'BARANGAY_CLEARANCE',
                'CERTIFICATE_OF_RESIDENCY',
                'CERTIFICATE_OF_INDIGENCY',
                'BUSINESS_PERMIT',
                'COMMUNITY_TAX_CERTIFICATE',
                'BIRTH_CERTIFICATE_REQUEST',
                'DEATH_CERTIFICATE_REQUEST',
                'MARRIAGE_CERTIFICATE_REQUEST',
                'FIRST_TIME_JOB_SEEKER',
                'SENIOR_CITIZEN_ID',
                'PWD_ID',
                'TRAVEL_PERMIT',
                'BUILDING_PERMIT',
                'ELECTRICAL_PERMIT',
                'PLUMBING_PERMIT',
                'COMPLAINT_CERTIFICATE',
                'CASH BOND',
                'SUMMON',
                'BARANGAY_CLEARANCE_INSTALLATION',
                'OTHER'
            ]);

            // Applicant Information
            $table->uuid('resident_id'); // Must be UUID to match residents table
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
            $table->text('indigency_reason')->nullable();
            $table->decimal('family_monthly_income', 10, 2)->nullable();
            $table->integer('family_size')->nullable();
            $table->string('residency_period')->nullable();
            $table->text('previous_address')->nullable();

            // Cash Bond specific fields
            $table->string('received_from', 255)->nullable();
            $table->decimal('bond_amount', 10, 2)->nullable();
            $table->string('representing_entity', 255)->nullable();
            $table->string('acknowledgement_address', 255)->nullable();

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

            // Indexes for performance
            $table->index(['type', 'status']);
            $table->index('payment_status');
            $table->index('submitted_at');
            $table->index(['resident_id', 'type']);
            $table->index('status');
            $table->index(['status', 'needed_date']);
            $table->index(['created_at']);
            $table->index('file_migrated_to_supabase');
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