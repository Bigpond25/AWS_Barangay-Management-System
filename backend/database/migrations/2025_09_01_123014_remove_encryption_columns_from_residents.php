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
        Schema::table('residents', function (Blueprint $table) {
            // Remove hash columns used for encryption search
            $table->dropIndex(['first_name_hash']);
            $table->dropColumn('first_name_hash');
            
            $table->dropIndex(['last_name_hash']);
            $table->dropColumn('last_name_hash');
            
            $table->dropIndex(['mobile_number_hash']);
            $table->dropColumn('mobile_number_hash');
            
            $table->dropIndex(['email_address_hash']);
            $table->dropColumn('email_address_hash');
        });
        
        Schema::table('households', function (Blueprint $table) {
            // Remove hash columns from households
            $table->dropIndex(['complete_address_hash']);
            $table->dropColumn('complete_address_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            // Re-add hash columns if needed for rollback
            $table->string('first_name_hash')->nullable()->index();
            $table->string('last_name_hash')->nullable()->index();
            $table->string('mobile_number_hash')->nullable()->index();
            $table->string('email_address_hash')->nullable()->index();
        });
        
        Schema::table('households', function (Blueprint $table) {
            $table->string('complete_address_hash')->nullable()->index();
        });
    }
};
