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
        Schema::create('project_milestones', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Related project
            $table->uuid('project_id');
            
            // Milestone information
            $table->string('name');
            $table->text('description')->nullable();
            
            // Timeline
            $table->date('target_date')->nullable();
            $table->date('actual_completion_date')->nullable();
            
            // Progress
            $table->enum('status', [
                'NOT_STARTED',
                'IN_PROGRESS',
                'COMPLETED',
                'DELAYED',
                'CANCELLED'
            ])->default('NOT_STARTED');
            
            $table->integer('progress_percentage')->default(0);
            
            // Budget allocation
            $table->decimal('allocated_budget', 15, 2)->nullable();
            $table->decimal('actual_cost', 15, 2)->nullable();
            
            // Dependencies
            $table->json('dependencies')->nullable(); // Array of prerequisite milestone IDs
            
            // Order/sequence
            $table->integer('order_index')->default(0);
            
            // Notes
            $table->text('notes')->nullable();
            $table->text('completion_notes')->nullable();
            
            // Audit fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index('project_id');
            $table->index('status');
            $table->index('target_date');
            $table->index('order_index');
            $table->index('progress_percentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_milestones');
    }
};
