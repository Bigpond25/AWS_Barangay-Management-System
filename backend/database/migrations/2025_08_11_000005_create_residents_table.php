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
        Schema::create('residents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Basic Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix')->nullable();
            $table->date('birth_date');
            $table->string('birth_place');
            $table->enum('gender', ['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']);
            $table->enum('civil_status', [
                'SINGLE', 'LIVE_IN', 'MARRIED', 'WIDOWED', 'DIVORCED', 
                'SEPARATED', 'ANNULLED', 'PREFER_NOT_TO_SAY'
            ]);
            $table->enum('nationality', [
                'FILIPINO', 'AMERICAN', 'BRITISH', 'CANADIAN', 'AUSTRALIAN', 'OTHER'
            ]);
            $table->enum('religion', [
                'CATHOLIC', 'IGLESIA_NI_CRISTO', 'EVANGELICAL', 'PROTESTANT', 'ISLAM',
                'BUDDHIST', 'HINDU', 'SEVENTH_DAY_ADVENTIST', 'JEHOVAHS_WITNESS',
                'BORN_AGAIN_CHRISTIAN', 'ORTHODOX', 'JUDAISM', 'ATHEIST', 
                'AGLIPAYAN', 'OTHER', 'PREFER_NOT_TO_SAY'
            ]);
            
            // Contact Information
            $table->string('mobile_number')->nullable();
            $table->string('landline_number')->nullable();
            $table->string('email_address')->nullable();
            
            // Address Information
            $table->string('region')->nullable();
            $table->string('province')->nullable();
            $table->string('city')->nullable();
            $table->string('barangay')->nullable();
            $table->string('house_number')->nullable();
            $table->string('street')->nullable();
            $table->text('complete_address');
            
            // Family Information
            $table->string('mother_name')->nullable();
            $table->string('father_name')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_number')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            
            // Employment & Education
            $table->enum('educational_attainment', [
                'NO_FORMAL_EDUCATION', 'ELEMENTARY_UNDERGRADUATE', 'ELEMENTARY_GRADUATE',
                'HIGH_SCHOOL_UNDERGRADUATE', 'HIGH_SCHOOL_GRADUATE', 'COLLEGE_UNDERGRADUATE',
                'COLLEGE_GRADUATE', 'POST_GRADUATE', 'VOCATIONAL', 'OTHER'
            ]);
            $table->enum('employment_status', [
                'EMPLOYED', 'UNEMPLOYED', 'SELF_EMPLOYED', 'RETIRED', 'STUDENT', 'OFW'
            ]);
            $table->string('occupation')->nullable();
            $table->string('employer')->nullable();
            
            // Government IDs & Voting
            $table->string('primary_id_type')->nullable();
            $table->string('id_number')->nullable();
            $table->string('philhealth_number')->nullable();
            $table->string('sss_number')->nullable();
            $table->string('tin_number')->nullable();
            $table->string('voters_id_number')->nullable();
            $table->enum('voter_status', ['NOT_REGISTERED', 'REGISTERED', 'DECEASED', 'TRANSFERRED'])->default('NOT_REGISTERED');
            $table->string('precinct_number')->nullable();
            
            // Health Information
            $table->text('medical_conditions')->nullable();
            $table->text('allergies')->nullable();
            
            // Special Classifications
            $table->boolean('senior_citizen')->default(false);
            $table->boolean('person_with_disability')->default(false);
            $table->string('disability_type')->nullable();
            $table->boolean('indigenous_people')->default(false);
            $table->string('indigenous_group')->nullable();
            $table->boolean('four_ps_beneficiary')->default(false);
            $table->string('four_ps_household_id')->nullable();
            
            // Profile & Status
            $table->string('profile_photo_url')->nullable();
            $table->string('photo_storage_provider')->default('local');
            $table->string('photo_bucket')->nullable();
            $table->string('photo_path')->nullable();
            $table->boolean('photo_migrated_to_supabase')->default(false);
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'DECEASED', 'TRANSFERRED'])->default('ACTIVE');
            
            // Audit fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index(['first_name', 'last_name']);
            $table->index(['gender', 'civil_status']);
            $table->index(['employment_status', 'educational_attainment']);
            $table->index(['senior_citizen', 'person_with_disability', 'indigenous_people', 'four_ps_beneficiary']);
            $table->index(['voter_status', 'precinct_number']);
            $table->index(['birth_date']);
            $table->index('created_at');
            $table->index(['status', 'senior_citizen']);
            $table->index(['status', 'person_with_disability']);
            $table->index(['barangay', 'status']);
            $table->index(['photo_migrated_to_supabase']);
            $table->index(['photo_storage_provider']);
            // Search optimization indexes
            $table->index(['first_name', 'last_name', 'status'], 'idx_residents_name_status');
            $table->index(['mobile_number', 'status'], 'idx_residents_mobile_status');
            $table->index(['email_address', 'status'], 'idx_residents_email_status');
            
            // Statistics optimization indexes
            $table->index(['status', 'gender'], 'idx_residents_status_gender');
            $table->index(['status', 'employment_status'], 'idx_residents_status_employment');
            $table->index(['status', 'civil_status'], 'idx_residents_status_civil');
            $table->index(['status', 'voter_status'], 'idx_residents_status_voter');
            
            // Age calculation optimization
            $table->index(['birth_date', 'status'], 'idx_residents_birth_status');
            
            // Enhanced search indexes for text fields
            $table->index('mobile_number', 'idx_residents_mobile_search');
            $table->index('email_address', 'idx_residents_email_search');
            $table->index('complete_address', 'idx_residents_address_search');
            
            // Composite indexes for common query patterns
            $table->index(['birth_date', 'senior_citizen', 'status'], 'idx_residents_age_classification');
            $table->index(['first_name', 'last_name', 'status'], 'idx_residents_household_search');
            
            // Employment and voting status combinations
            $table->index(['employment_status', 'voter_status'], 'idx_residents_employment_voter');
            
            // Special classifications for reporting
            $table->index(['four_ps_beneficiary', 'indigenous_people', 'status'], 'idx_residents_special_programs');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('residents');
    }
};
