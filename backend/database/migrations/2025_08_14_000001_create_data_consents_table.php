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
        Schema::create('data_consents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable()->index();
            $table->string('consent_type')->index(); // 'registration', 'data_processing', 'marketing', etc.
            $table->string('consent_version')->default('1.0');
            $table->boolean('consented')->default(false);
            $table->timestamp('consented_at')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->json('consent_data')->nullable(); // Store specific consent details
            $table->timestamp('withdrawn_at')->nullable();
            $table->string('withdrawal_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign key constraints
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            
            // Indexes for performance
            $table->index(['consent_type', 'consented']);
            $table->index(['user_id', 'consent_type']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_consents');
    }
};
