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
        Schema::create('tickets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('ticket_number')->unique();
            
            // Basic Ticket Information
            $table->string('subject');
            $table->text('description');
            $table->enum('priority', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
            
            // Requester Information
            $table->string('requester_name')->nullable();
            $table->uuid('resident_id')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('email_address')->nullable();
            $table->string('complete_address')->nullable();
            
            // Ticket Classification
            $table->enum('category', ['APPOINTMENT', 'BLOTTER', 'COMPLAINT', 'SUGGESTION']);
            $table->enum('status', ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'])->default('OPEN');

            // Audit fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('resident_id')->references('id')->on('residents')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index('category');
            $table->index('status');
            $table->index('priority');
            $table->index('resident_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
