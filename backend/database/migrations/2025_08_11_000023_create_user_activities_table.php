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
        Schema::create('user_activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // User who performed the activity
            $table->uuid('user_id');
            
            // Activity details
            $table->string('activity_type'); // login, logout, document_view, document_download, etc.
            $table->string('activity_category')->nullable(); // auth, document, resident, etc.
            $table->text('description');
            
            // Related entity (what was acted upon)
            $table->string('entity_type')->nullable(); // Model class name
            $table->uuid('entity_id')->nullable(); // Model ID
            
            // Activity metadata
            $table->json('metadata')->nullable(); // Additional data about the activity
            $table->json('changes')->nullable(); // Before/after values for updates
            
            // Request information
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('request_method')->nullable(); // GET, POST, PUT, DELETE
            $table->text('request_url')->nullable();
            
            // Session information
            $table->uuid('session_id')->nullable();
            
            // Result/status
            $table->enum('status', [
                'SUCCESS',
                'FAILED',
                'ERROR',
                'CANCELLED'
            ])->default('SUCCESS');
            
            $table->text('error_message')->nullable();
            
            // Duration (for performance tracking)
            $table->integer('duration_ms')->nullable(); // Duration in milliseconds
            
            // Risk assessment
            $table->enum('risk_level', [
                'LOW',
                'MEDIUM',
                'HIGH',
                'CRITICAL'
            ])->default('LOW');
            
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('session_id')->references('id')->on('user_sessions')->onDelete('set null');
            
            // Indexes for performance
            $table->index('user_id');
            $table->index('activity_type');
            $table->index('activity_category');
            $table->index('entity_type');
            $table->index('entity_id');
            $table->index('status');
            $table->index('risk_level');
            $table->index('created_at');
            $table->index('ip_address');
            
            // Composite indexes for common queries
            $table->index(['user_id', 'created_at']);
            $table->index(['activity_type', 'created_at']);
            $table->index(['entity_type', 'entity_id']);
            $table->index(['user_id', 'activity_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_activities');
    }
};
