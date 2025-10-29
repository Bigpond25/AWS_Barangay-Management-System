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
        Schema::create('barangay_clearances_new', function (Blueprint $table) {
            $table->id();

            // Foreign key (establishment)
            $table->foreignId('establishment_id')->constrained('establishments');

            // Historical establishment data (snapshot)
            $table->string('applicant_name')->nullable();
            $table->string('business_name')->nullable();
            $table->string('location')->nullable();
            $table->string('ownership')->nullable();
            $table->string('record_no')->nullable();
            $table->string('clearance_fee')->nullable();
            $table->string('or_no')->nullable();
            $table->string('remarks')->nullable();
            $table->date('issued_date')->nullable();

            // PDF file reference
            $table->string('file_name', 5000)->nullable();
            $table->string('file_path', 5000)->nullable();
            $table->string('file_size', 5000)->nullable();
            $table->string('file_type', 5000)->nullable();
            $table->string('file_extension', 5000)->nullable();

            // Status or audit trail
            $table->smallInteger('status')->default(1)->comment('1 = Issued, 2 = Revoked, 3 = Reprinted');
            $table->uuid('issued_by');

            $table->foreign('issued_by')->references('id')->on('users');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barangay_clearances_new');
    }
};
