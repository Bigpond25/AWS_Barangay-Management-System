<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * FIXED VERSION: Documents table with proper UUID foreign key to residents
     */
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            // Primary key
            $table->uuid('id')->primary();
            
            // Basic Document Information
            $table->string('document_type');
            $table->uuid('resident_id'); // ✅ FIXED: Using UUID to match residents.id
            $table->string('applicant_name');
            $table->text('purpose');
            
            // Contact Information
            $table->text('applicant_address')->nullable();
            $table->string('applicant_contact')->nullable();
            $table->string('applicant_email')->nullable();
            
            // Request Details
            $table->string('priority')->default('NORMAL'); // LOW, NORMAL, HIGH, URGENT
            $table->date('needed_date')->nullable();
            $table->decimal('processing_fee', 10, 2)->default(0);
            
            // Document Status and Payment
            $table->string('status')->default('PENDING'); // PENDING, UNDER_REVIEW, APPROVED, RELEASED, REJECTED, CANCELLED
            $table->string('payment_status')->default('UNPAID'); // UNPAID, PAID, WAIVED
            
            // System tracking fields
            $table->string('document_number')->nullable()->unique();
            $table->string('serial_number')->nullable()->unique();
            $table->timestamp('request_date')->useCurrent();
            $table->timestamp('processed_date')->nullable();
            $table->timestamp('approved_date')->nullable();
            $table->timestamp('released_date')->nullable();
            
            // Document Specific Fields (Barangay Clearance)
            $table->string('clearance_purpose')->nullable();
            $table->string('clearance_type')->nullable();
            
            // Document Specific Fields (Business Permit)
            $table->string('business_name')->nullable();
            $table->string('business_type')->nullable();
            $table->string('business_address')->nullable();
            $table->string('business_owner')->nullable();
            
            // Document Specific Fields (Certificate of Indigency)
            $table->string('indigency_reason')->nullable();
            $table->decimal('monthly_income', 10, 2)->nullable();
            $table->integer('family_size')->nullable();
            
            // Document Specific Fields (Certificate of Residency)
            $table->string('residency_period')->nullable();
            $table->string('previous_address')->nullable();
            
            // Processing Information
            $table->json('requirements_submitted')->nullable();
            $table->text('notes')->nullable();
            $table->text('remarks')->nullable();
            
            // Officials
            $table->string('certifying_official')->nullable();
            $table->uuid('processed_by')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->uuid('released_by')->nullable();
            
            // System fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            
            // Foreign Key Constraints
            $table->foreign('resident_id')->references('id')->on('residents')->onDelete('cascade');
            
            // Indexes for performance
            $table->index('resident_id');
            $table->index(['status', 'payment_status']);
            $table->index(['document_type', 'status']);
            $table->index('request_date');
            $table->index(['priority', 'status']);
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
