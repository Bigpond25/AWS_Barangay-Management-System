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
        Schema::create('other_people_involved', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Related blotter case
            $table->uuid('blotter_id');
            
            // Person information
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('suffix')->nullable();
            $table->string('full_name')->nullable();
            
            // Contact information
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            
            // Address
            $table->text('address')->nullable();
            $table->string('barangay')->nullable();
            $table->string('municipality')->nullable();
            $table->string('province')->nullable();
            
            // Role in the case
            $table->enum('involvement_type', [
                'WITNESS',
                'COMPLAINANT',
                'RESPONDENT',
                'VICTIM',
                'SUSPECT',
                'OTHER'
            ])->default('OTHER');
            
            $table->text('description')->nullable();
            $table->text('statement')->nullable();
            
            // Audit fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('blotter_id')->references('id')->on('blotters')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index('blotter_id');
            $table->index('involvement_type');
            $table->index(['last_name', 'first_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('other_people_involved');
    }
};
