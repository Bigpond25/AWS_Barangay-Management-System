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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Log subject - what was acted upon
            $table->string('log_name')->nullable(); // Category like 'default', 'auth', 'document', etc.
            $table->text('description');
            
            // Subject - the model that was acted upon
            $table->string('subject_type')->nullable(); // Model class name
            $table->uuid('subject_id')->nullable(); // Model ID
            
            // Causer - who performed the action
            $table->string('causer_type')->nullable(); // Usually User model
            $table->uuid('causer_id')->nullable(); // User ID
            
            // Properties - additional data about the action
            $table->json('properties')->nullable(); // Changes, old values, new values, etc.
            
            // Event - what happened
            $table->string('event')->nullable(); // created, updated, deleted, etc.
            
            // Batch UUID for grouping related actions
            $table->uuid('batch_uuid')->nullable();
            
            // IP and User Agent for security tracking
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            
            // Additional context
            $table->json('context')->nullable(); // Request data, session info, etc.
            
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('causer_id')->references('id')->on('users')->onDelete('set null');
            
            // Indexes for performance
            $table->index('log_name');
            $table->index('subject_type');
            $table->index('subject_id');
            $table->index('causer_type');
            $table->index('causer_id');
            $table->index('event');
            $table->index('batch_uuid');
            $table->index('created_at');
            
            // Composite indexes for common queries
            $table->index(['subject_type', 'subject_id']);
            $table->index(['causer_type', 'causer_id']);
            $table->index(['log_name', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
