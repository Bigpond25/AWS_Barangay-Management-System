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
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['MALE', 'FEMALE'])->nullable();
            
            // Contact information
            $table->string('contact_number', 20)->nullable();
            $table->string('email_address')->nullable();
            $table->text('address')->nullable();
            
            // Position information
            $table->enum('position', [
                'BARANGAY_CAPTAIN',
                'BARANGAY_SECRETARY',
                'BARANGAY_TREASURER',
                'KAGAWAD',
                'SK_CHAIRPERSON',
                'SK_KAGAWAD',
                'BARANGAY_CLERK',
                'BARANGAY_TANOD',
                // Keep existing values for backward compatibility
                'BARANGAY_KAGAWAD',
                'SK_CHAIRMAN',
                'TANOD',
                'HEALTH_WORKER',
                'DAY_CARE_WORKER',
                'OTHER'
            ])->default('OTHER');
            
            $table->string('committee')->nullable(); // For kagawads assigned to committees
            $table->text('description')->nullable();
            $table->string('position_title')->nullable();
            $table->json('committee_assignments')->nullable();
            $table->json('committee_memberships')->nullable();
            
            // Term information
            $table->date('term_start')->nullable();
            $table->date('term_end')->nullable();
            $table->integer('term_number')->default(1);
            $table->boolean('is_current_term')->default(true);
            
            // Election information
            $table->date('election_date')->nullable();
            $table->integer('votes_received')->nullable();
            $table->boolean('is_elected')->default(true);
            $table->string('appointment_document', 500)->nullable();
            
            // Status
            $table->enum('status', [
                'ACTIVE',
                'INACTIVE',
                'RESIGNED',
                'TERMINATED',
                'EXPIRED',
                'SUSPENDED',
                'DECEASED'
            ])->default('ACTIVE');
            $table->date('status_date')->nullable();
            $table->text('status_reason')->nullable();
            
            // Educational & Professional Background
            $table->text('educational_background')->nullable();
            $table->text('work_experience')->nullable();
            $table->text('skills_expertise')->nullable();
            $table->json('trainings_attended')->nullable();
            $table->json('certifications')->nullable();
            
            // Performance & Accomplishments
            $table->text('major_accomplishments')->nullable();
            $table->json('projects_initiated')->nullable();
            $table->text('performance_notes')->nullable();
            $table->integer('performance_rating')->nullable();
            
            // Emergency Contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_number', 20)->nullable();
            $table->string('emergency_contact_relationship', 100)->nullable();
            
            // Social Media & Communication
            $table->json('social_media_accounts')->nullable();
            
            // Documents & Files
            $table->json('documents')->nullable();
            $table->string('profile_photo', 500)->nullable();
            $table->string('digital_signature', 500)->nullable();
            
            // Oath & Legal
            $table->date('oath_taking_date')->nullable();
            $table->text('oath_taking_notes')->nullable();
            $table->text('legal_issues')->nullable();
            $table->text('ethical_violations')->nullable();
            
            // Attendance & Participation
            $table->decimal('session_attendance_rate', 5, 2)->nullable();
            $table->text('committee_participation')->nullable();
            $table->text('community_engagement')->nullable();
            
            // Additional Information
            $table->text('remarks')->nullable();
            $table->text('bio_summary')->nullable();
            $table->text('personal_mission')->nullable();
            
            // Order for display purposes
            $table->integer('order_index')->default(0);
            
            // Relationships
            $table->uuid('resident_id'); // Required field
            $table->uuid('user_id')->nullable(); // Optional user account link
            
            // Audit fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('resident_id')->references('id')->on('residents')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Indexes
            $table->index('position');
            $table->index('status');
            $table->index('order_index');
            $table->index(['last_name', 'first_name']);
            $table->index(['is_current_term']);
            $table->index(['term_start', 'term_end']);
            $table->index('user_id');
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
