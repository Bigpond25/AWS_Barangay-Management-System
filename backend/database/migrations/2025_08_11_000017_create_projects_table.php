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
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Project basic information
            $table->string('name');
            $table->text('description');
            $table->text('objectives')->nullable();
            
            // Project timeline
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('target_completion_date')->nullable();
            
            // Budget information
            $table->decimal('budget', 15, 2)->nullable();
            $table->decimal('actual_cost', 15, 2)->nullable();
            $table->string('funding_source')->nullable();
            
            // Project status
            $table->enum('status', [
                'PLANNING',
                'APPROVED',
                'IN_PROGRESS',
                'ON_HOLD',
                'COMPLETED',
                'CANCELLED',
                'DELAYED'
            ])->default('PLANNING');
            
            // Priority
            $table->enum('priority', [
                'LOW',
                'NORMAL',
                'HIGH',
                'URGENT'
            ])->default('NORMAL');
            
            // Project manager/lead
            $table->uuid('project_manager_id')->nullable();
            
            // Location/beneficiaries
            $table->text('location')->nullable();
            $table->integer('beneficiaries_count')->nullable();
            $table->text('beneficiaries_description')->nullable();
            
            // Progress tracking
            $table->integer('progress_percentage')->default(0);
            $table->text('current_phase')->nullable();
            $table->text('next_steps')->nullable();
            $table->text('challenges')->nullable();
            
            // Images/attachments
            $table->json('images')->nullable();
            $table->json('documents')->nullable();
            
            // Audit fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('project_manager_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index('status');
            $table->index('priority');
            $table->index('start_date');
            $table->index('end_date');
            $table->index('project_manager_id');
            $table->index('progress_percentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
