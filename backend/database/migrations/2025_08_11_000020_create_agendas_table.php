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
            // Renamed columns to match frontend
            $table->date('date');
            $table->time('time')->nullable();
            $table->string('venue')->nullable();

            // New/added columns for frontend compatibility
            $table->time('end_time')->nullable()->after('time');
            $table->integer('duration_minutes')->nullable()->after('end_time');
            $table->enum('category', [
                'MEETING', 'REVIEW', 'PRESENTATION', 'EVALUATION', 'BUDGET', 'PLANNING', 'INSPECTION', 'OTHER'
            ])->default('MEETING')->after('duration_minutes');
            $table->enum('priority', [
                'LOW', 'NORMAL', 'HIGH', 'URGENT'
            ])->default('NORMAL')->after('category');
            $table->string('location')->nullable()->after('priority');
            $table->json('participants')->nullable()->after('venue');
            $table->string('organizer')->nullable()->after('participants');

            // Meeting type
            $table->enum('meeting_type', [
                'REGULAR_SESSION',
                'SPECIAL_SESSION',
                'COMMITTEE_MEETING',
                'PUBLIC_HEARING',
                'EMERGENCY_SESSION',
                'OTHER'
            ])->default('REGULAR_SESSION');

            // Status (updated to match frontend)
            $table->enum('status', [
                'SCHEDULED',
                'IN_PROGRESS',
                'COMPLETED',
                'CANCELLED',
                'POSTPONED'
            ])->default('SCHEDULED')->after('priority');

            // Agenda items (JSON array)
            $table->json('agenda_items')->nullable();

            // Attendees
            $table->json('expected_attendees')->nullable();
            $table->json('actual_attendees')->nullable();

            // Meeting details (renamed meeting_notes to notes)
            $table->text('notes')->nullable();
            $table->json('decisions_made')->nullable();
            $table->json('action_items')->nullable();
            $table->text('next_meeting_notes')->nullable();

            // Documents
            $table->string('agenda_document')->nullable();
            $table->string('minutes_document')->nullable();
            $table->json('attachments')->nullable();

            // Reminders
            $table->boolean('reminder_enabled')->default(true)->after('notes');
            $table->integer('reminder_minutes_before')->default(15)->after('reminder_enabled');

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
            $table->index('date');
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
