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
        Schema::table('agendas', function (Blueprint $table) {
            // Rename columns to match frontend expectations
            $table->renameColumn('meeting_date', 'date');
            $table->renameColumn('meeting_time', 'time');
            
            // Add missing columns that frontend expects
            $table->time('end_time')->nullable()->after('time');
            $table->integer('duration_minutes')->nullable()->after('end_time');
            $table->enum('category', [
                'MEETING',
                'REVIEW', 
                'PRESENTATION',
                'EVALUATION',
                'BUDGET',
                'PLANNING',
                'INSPECTION',
                'OTHER'
            ])->default('MEETING')->after('duration_minutes');
            $table->enum('priority', [
                'LOW',
                'NORMAL',
                'HIGH',
                'URGENT'
            ])->default('NORMAL')->after('category');
            $table->string('location')->nullable()->after('priority');
            $table->json('participants')->nullable()->after('venue');
            $table->string('organizer')->nullable()->after('participants');
            $table->boolean('reminder_enabled')->default(true)->after('notes');
            $table->integer('reminder_minutes_before')->default(15)->after('reminder_enabled');
            
            // Update status enum to match frontend
            $table->dropColumn('status');
        });
        
        Schema::table('agendas', function (Blueprint $table) {
            $table->enum('status', [
                'SCHEDULED',
                'IN_PROGRESS', 
                'COMPLETED',
                'CANCELLED',
                'POSTPONED'
            ])->default('SCHEDULED')->after('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agendas', function (Blueprint $table) {
            // Reverse the changes
            $table->renameColumn('date', 'meeting_date');
            $table->renameColumn('time', 'meeting_time');
            
            // Remove added columns
            $table->dropColumn([
                'end_time',
                'duration_minutes',
                'category',
                'priority',
                'location',
                'participants',
                'organizer',
                'reminder_enabled',
                'reminder_minutes_before',
                'status'
            ]);
        });
        
        Schema::table('agendas', function (Blueprint $table) {
            // Restore original status enum
            $table->enum('status', [
                'DRAFT',
                'PUBLISHED',
                'IN_PROGRESS',
                'COMPLETED',
                'CANCELLED',
                'POSTPONED'
            ])->default('DRAFT');
        });
    }
};
