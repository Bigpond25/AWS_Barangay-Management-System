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
        Schema::create('barangay_officials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Person information
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('suffix')->nullable();
            $table->string('full_name')->nullable();
            
            // Position information
            $table->enum('position', [
                'BARANGAY_CAPTAIN',
                'BARANGAY_KAGAWAD',
                'SK_CHAIRMAN',
                'SK_KAGAWAD',
                'BARANGAY_SECRETARY',
                'BARANGAY_TREASURER',
                'BARANGAY_CLERK',
                'TANOD',
                'HEALTH_WORKER',
                'DAY_CARE_WORKER',
                'OTHER'
            ])->default('OTHER');
            
            $table->string('committee')->nullable(); // For kagawads assigned to committees
            $table->text('description')->nullable();
            
            // Contact information
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            
            // Term information
            $table->date('term_start')->nullable();
            $table->date('term_end')->nullable();
            $table->enum('status', [
                'ACTIVE',
                'INACTIVE',
                'RESIGNED',
                'TERMINATED',
                'EXPIRED'
            ])->default('ACTIVE');
            
            // Order for display purposes
            $table->integer('order_index')->default(0);
            
            // Profile picture
            $table->string('profile_picture')->nullable();
            
            // Audit fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index('position');
            $table->index('status');
            $table->index('order_index');
            $table->index(['last_name', 'first_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barangay_officials');
    }
};
