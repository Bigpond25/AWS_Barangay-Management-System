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
        Schema::create('project_team_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Related project and user
            $table->uuid('project_id');
            $table->uuid('user_id');
            
            // Role in the project
            $table->enum('role', [
                'PROJECT_MANAGER',
                'TEAM_LEAD',
                'MEMBER',
                'CONSULTANT',
                'STAKEHOLDER',
                'OBSERVER'
            ])->default('MEMBER');
            
            // Permissions
            $table->boolean('can_edit')->default(false);
            $table->boolean('can_manage_team')->default(false);
            $table->boolean('can_approve')->default(false);
            
            // Participation details
            $table->date('joined_date')->nullable();
            $table->date('left_date')->nullable();
            $table->enum('status', [
                'ACTIVE',
                'INACTIVE',
                'LEFT'
            ])->default('ACTIVE');
            
            // Responsibilities
            $table->text('responsibilities')->nullable();
            $table->text('notes')->nullable();
            
            // Audit fields
            $table->uuid('added_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('added_by')->references('id')->on('users')->onDelete('set null');
            
            // Unique constraint - one role per user per project
            $table->unique(['project_id', 'user_id']);
            
            // Indexes
            $table->index('project_id');
            $table->index('user_id');
            $table->index('role');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_team_members');
    }
};
