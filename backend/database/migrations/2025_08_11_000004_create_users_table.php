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
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            
            // Personal Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('phone');
            
            // Role and Department
            $table->enum('role', [
                'SUPER_ADMIN', 'ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_SECRETARY',
                'BARANGAY_TREASURER', 'BARANGAY_COUNCILOR', 'BARANGAY_CLERK',
                'HEALTH_WORKER', 'SOCIAL_WORKER', 'SECURITY_OFFICER',
                'DATA_ENCODER', 'VIEWER'
            ]);
            $table->enum('department', [
                'ADMINISTRATION', 'HEALTH_SERVICES', 'SOCIAL_SERVICES',
                'SECURITY_PUBLIC_SAFETY', 'FINANCE_TREASURY', 'RECORDS_MANAGEMENT',
                'COMMUNITY_DEVELOPMENT', 'DISASTER_RISK_REDUCTION', 'ENVIRONMENTAL_MANAGEMENT',
                'YOUTH_SPORTS_DEVELOPMENT', 'SENIOR_CITIZEN_AFFAIRS', 'WOMENS_AFFAIRS',
                'BUSINESS_PERMITS', 'INFRASTRUCTURE_DEVELOPMENT'
            ]);
            $table->string('position')->nullable();
            $table->string('employee_id')->unique()->nullable();
            
            // Status and Activity
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->timestamp('last_login_at')->nullable();
            $table->text('notes')->nullable();
            
            // Foreign Keys
            $table->uuid('resident_id')->nullable();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['role', 'department']);
            $table->index(['is_active', 'is_verified']);
            $table->index('last_login_at');
            $table->index('resident_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
