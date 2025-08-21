<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add the new columns for business sign clearance
        Schema::table('documents', function (Blueprint $table) {
            $table->string('sign_wordings')->nullable()->after('business_owner');
            $table->string('sign_material')->nullable()->after('sign_wordings');
            $table->string('sign_size')->nullable()->after('sign_material');
        });
        
        // Drop the existing constraint and recreate it with the new enum value
        DB::statement('ALTER TABLE documents DROP CONSTRAINT documents_type_check');
        DB::statement('ALTER TABLE documents ADD CONSTRAINT documents_type_check CHECK (((type)::text = ANY ((ARRAY[\'BARANGAY_CLEARANCE\'::character varying, \'CERTIFICATE_OF_RESIDENCY\'::character varying, \'CERTIFICATE_OF_INDIGENCY\'::character varying, \'BUSINESS_PERMIT\'::character varying, \'COMMUNITY_TAX_CERTIFICATE\'::character varying, \'BIRTH_CERTIFICATE_REQUEST\'::character varying, \'DEATH_CERTIFICATE_REQUEST\'::character varying, \'MARRIAGE_CERTIFICATE_REQUEST\'::character varying, \'FIRST_TIME_JOB_SEEKER\'::character varying, \'SENIOR_CITIZEN_ID\'::character varying, \'PWD_ID\'::character varying, \'TRAVEL_PERMIT\'::character varying, \'BUILDING_PERMIT\'::character varying, \'ELECTRICAL_PERMIT\'::character varying, \'PLUMBING_PERMIT\'::character varying, \'COMPLAINT_CERTIFICATE\'::character varying, \'OTHER\'::character varying, \'BUSINESS_SIGN_CLEARANCE\'::character varying])::text[])))');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore the original constraint without BUSINESS_SIGN_CLEARANCE
        DB::statement('ALTER TABLE documents DROP CONSTRAINT documents_type_check');
        DB::statement('ALTER TABLE documents ADD CONSTRAINT documents_type_check CHECK (((type)::text = ANY ((ARRAY[\'BARANGAY_CLEARANCE\'::character varying, \'CERTIFICATE_OF_RESIDENCY\'::character varying, \'CERTIFICATE_OF_INDIGENCY\'::character varying, \'BUSINESS_PERMIT\'::character varying, \'COMMUNITY_TAX_CERTIFICATE\'::character varying, \'BIRTH_CERTIFICATE_REQUEST\'::character varying, \'DEATH_CERTIFICATE_REQUEST\'::character varying, \'MARRIAGE_CERTIFICATE_REQUEST\'::character varying, \'FIRST_TIME_JOB_SEEKER\'::character varying, \'SENIOR_CITIZEN_ID\'::character varying, \'PWD_ID\'::character varying, \'TRAVEL_PERMIT\'::character varying, \'BUILDING_PERMIT\'::character varying, \'ELECTRICAL_PERMIT\'::character varying, \'PLUMBING_PERMIT\'::character varying, \'COMPLAINT_CERTIFICATE\'::character varying, \'OTHER\'::character varying])::text[])))');
        
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['sign_wordings', 'sign_material', 'sign_size']);
        });
    }
};