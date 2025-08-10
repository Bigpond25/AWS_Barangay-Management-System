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
        Schema::create('appointments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ticket_id'); // Base ticket reference
            
            // Appointment Details
            $table->enum('department', [
                'ADMINISTRATION', 'HEALTH_SERVICES', 'SOCIAL_SERVICES',
                'SECURITY_PUBLIC_SAFETY', 'FINANCE_TREASURY', 'RECORDS_MANAGEMENT',
                'COMMUNITY_DEVELOPMENT', 'DISASTER_RISK_REDUCTION', 'ENVIRONMENTAL_MANAGEMENT',
                'YOUTH_SPORTS_DEVELOPMENT', 'SENIOR_CITIZEN_AFFAIRS', 'WOMENS_AFFAIRS',
                'BUSINESS_PERMITS', 'INFRASTRUCTURE_DEVELOPMENT'
            ]);
            $table->date('date');
            $table->time('time');
            $table->text('purpose')->nullable();
            $table->text('additional_notes')->nullable();
            
            // Relationship to resident (derived from ticket)
            $table->uuid('resident_id')->nullable();
            
            // Status specific to appointments
            $table->enum('status', ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])->default('SCHEDULED');
            
            // Audit fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
            $table->foreign('resident_id')->references('id')->on('residents')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index('department');
            $table->index('date');
            $table->index(['date', 'time']);
            $table->index('status');
            $table->index('resident_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
