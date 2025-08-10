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
        Schema::create('agendas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Meeting information
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('meeting_date');
            $table->time('meeting_time')->nullable();
            $table->string('venue')->nullable();
            
            // Meeting type
            $table->enum('meeting_type', [
                'REGULAR_SESSION',
                'SPECIAL_SESSION',
                'COMMITTEE_MEETING',
                'PUBLIC_HEARING',
                'EMERGENCY_SESSION',
                'OTHER'
            ])->default('REGULAR_SESSION');
            
            // Status
            $table->enum('status', [
                'DRAFT',
                'PUBLISHED',
                'IN_PROGRESS',
                'COMPLETED',
                'CANCELLED',
                'POSTPONED'
            ])->default('DRAFT');
            
            // Agenda items (JSON array)
            $table->json('agenda_items')->nullable();
            
            // Attendees
            $table->json('expected_attendees')->nullable(); // Array of user IDs
            $table->json('actual_attendees')->nullable();   // Array of user IDs who attended
            
            // Meeting details
            $table->text('meeting_notes')->nullable();
            $table->json('decisions_made')->nullable();
            $table->json('action_items')->nullable();
            $table->text('next_meeting_notes')->nullable();
            
            // Documents
            $table->string('agenda_document')->nullable(); // Path to agenda PDF
            $table->string('minutes_document')->nullable(); // Path to minutes PDF
            $table->json('attachments')->nullable();
            
            // Meeting leader/chairperson
            $table->uuid('chairperson_id')->nullable();
            $table->uuid('secretary_id')->nullable();
            
            // Publishing
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_public')->default(true);
            
            // Audit fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('chairperson_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('secretary_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index('meeting_date');
            $table->index('meeting_type');
            $table->index('status');
            $table->index('is_public');
            $table->index('published_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agendas');
    }
};
