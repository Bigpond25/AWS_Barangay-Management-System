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
        Schema::create('user_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // User information
            $table->uuid('user_id');
            
            // Session details
            $table->string('session_token')->unique();
            $table->string('device_name')->nullable();
            $table->string('device_type')->nullable(); // web, mobile, tablet, etc.
            $table->string('browser')->nullable();
            $table->string('platform')->nullable(); // OS
            
            // Location information
            $table->string('ip_address');
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            // Session status
            $table->enum('status', [
                'ACTIVE',
                'EXPIRED',
                'TERMINATED',
                'LOGGED_OUT'
            ])->default('ACTIVE');
            
            // Timestamps
            $table->timestamp('started_at');
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            
            // Additional tracking
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable(); // Additional session data
            
            // Security flags
            $table->boolean('is_suspicious')->default(false);
            $table->text('security_notes')->nullable();
            
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Indexes
            $table->index('user_id');
            $table->index('session_token');
            $table->index('status');
            $table->index('ip_address');
            $table->index('started_at');
            $table->index('last_activity_at');
            $table->index('expires_at');
            $table->index('is_suspicious');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_sessions');
    }
};
