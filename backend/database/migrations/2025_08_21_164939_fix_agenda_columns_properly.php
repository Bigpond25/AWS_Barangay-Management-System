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
            // First, rename columns to match frontend expectations
            if (Schema::hasColumn('agendas', 'meeting_date') && !Schema::hasColumn('agendas', 'date')) {
                $table->renameColumn('meeting_date', 'date');
            }
            if (Schema::hasColumn('agendas', 'meeting_time') && !Schema::hasColumn('agendas', 'time')) {
                $table->renameColumn('meeting_time', 'time');
            }
            if (Schema::hasColumn('agendas', 'meeting_notes') && !Schema::hasColumn('agendas', 'notes')) {
                $table->renameColumn('meeting_notes', 'notes');
            }
        });

        Schema::table('agendas', function (Blueprint $table) {
            // Add missing columns that the Agenda model expects
            if (!Schema::hasColumn('agendas', 'end_time')) {
                $table->time('end_time')->nullable()->after('time');
            }
            if (!Schema::hasColumn('agendas', 'duration_minutes')) {
                $table->integer('duration_minutes')->nullable()->after('end_time');
            }
            if (!Schema::hasColumn('agendas', 'category')) {
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
            }
            if (!Schema::hasColumn('agendas', 'priority')) {
                $table->enum('priority', [
                    'LOW',
                    'NORMAL',
                    'HIGH',
                    'URGENT'
                ])->default('NORMAL')->after('category');
            }
            if (!Schema::hasColumn('agendas', 'location')) {
                $table->string('location')->nullable()->after('priority');
            }
            if (!Schema::hasColumn('agendas', 'participants')) {
                $table->json('participants')->nullable()->after('venue');
            }
            if (!Schema::hasColumn('agendas', 'organizer')) {
                $table->string('organizer')->nullable()->after('participants');
            }
            if (!Schema::hasColumn('agendas', 'reminder_enabled')) {
                $table->boolean('reminder_enabled')->default(true)->after('notes');
            }
            if (!Schema::hasColumn('agendas', 'reminder_minutes_before')) {
                $table->integer('reminder_minutes_before')->default(15)->after('reminder_enabled');
            }
        });

        Schema::table('agendas', function (Blueprint $table) {
            // Update status enum to match frontend expectations
            if (Schema::hasColumn('agendas', 'status')) {
                $table->dropColumn('status');
            }
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
            if (Schema::hasColumn('agendas', 'date') && !Schema::hasColumn('agendas', 'meeting_date')) {
                $table->renameColumn('date', 'meeting_date');
            }
            if (Schema::hasColumn('agendas', 'time') && !Schema::hasColumn('agendas', 'meeting_time')) {
                $table->renameColumn('time', 'meeting_time');
            }
            if (Schema::hasColumn('agendas', 'notes') && !Schema::hasColumn('agendas', 'meeting_notes')) {
                $table->renameColumn('notes', 'meeting_notes');
            }
            
            // Remove added columns
            $columnsToRemove = [
                'end_time',
                'duration_minutes',
                'category',
                'priority',
                'location',
                'participants',
                'organizer',
                'reminder_enabled',
                'reminder_minutes_before'
            ];
            
            foreach ($columnsToRemove as $column) {
                if (Schema::hasColumn('agendas', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('agendas', function (Blueprint $table) {
            // Remove current status
            if (Schema::hasColumn('agendas', 'status')) {
                $table->dropColumn('status');
            }
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
