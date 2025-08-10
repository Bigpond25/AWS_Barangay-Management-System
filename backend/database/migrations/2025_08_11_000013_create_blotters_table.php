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
        Schema::create('blotters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ticket_id'); // Base ticket reference
            
            // Incident Details
            $table->enum('type_of_incident', [
                'THEFT', 'PHYSICAL_ASSAULT', 'VERBAL_ASSAULT', 'PROPERTY_DAMAGE',
                'DISTURBANCE', 'TRESPASSING', 'FRAUD', 'HARASSMENT',
                'DOMESTIC_DISPUTE', 'NOISE_COMPLAINT', 'THREATS', 'VANDALISM',
                'BREACH_OF_PEACE', 'PUBLIC_INTOXICATION', 'OTHER'
            ]);
            $table->date('incident_date');
            $table->time('incident_time')->nullable();
            $table->string('incident_location');
            
            // Parties Involved
            $table->uuid('complainant_resident_id')->nullable();
            $table->string('complainant_name')->nullable();
            $table->string('complainant_address')->nullable();
            $table->string('complainant_contact')->nullable();
            
            $table->uuid('respondent_resident_id')->nullable();
            $table->string('respondent_name')->nullable();
            $table->string('respondent_address')->nullable();
            $table->string('respondent_contact')->nullable();
            
            // Incident Details
            $table->text('incident_narrative');
            $table->text('complainant_statement')->nullable();
            $table->text('respondent_statement')->nullable();
            $table->text('witness_statements')->nullable();
            
            // Action Taken
            $table->text('action_taken')->nullable();
            $table->text('recommendations')->nullable();
            $table->text('settlement_terms')->nullable();
            
            // Officials
            $table->string('investigating_officer')->nullable();
            $table->string('mediating_official')->nullable();
            
            // Status
            $table->enum('status', ['FILED', 'INVESTIGATING', 'MEDIATION', 'SETTLED', 'ESCALATED', 'CLOSED'])->default('FILED');
            $table->date('settlement_date')->nullable();
            
            // Audit fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
            $table->foreign('complainant_resident_id')->references('id')->on('residents')->onDelete('set null');
            $table->foreign('respondent_resident_id')->references('id')->on('residents')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index('type_of_incident');
            $table->index('incident_date');
            $table->index('status');
            $table->index('complainant_resident_id');
            $table->index('respondent_resident_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blotters');
    }
};
