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
            // Add hash fields for encrypted searchable fields
            $table->string('first_name_hash')->nullable()->index()->after('first_name');
            $table->string('last_name_hash')->nullable()->index()->after('last_name');
            $table->string('mobile_number_hash')->nullable()->index()->after('mobile_number');
            $table->string('email_address_hash')->nullable()->index()->after('email_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            $table->dropIndex(['first_name_hash']);
            $table->dropIndex(['last_name_hash']);
            $table->dropIndex(['mobile_number_hash']);
            $table->dropIndex(['email_address_hash']);
            
            $table->dropColumn([
                'first_name_hash',
                'last_name_hash', 
                'mobile_number_hash',
                'email_address_hash'
            ]);
        });
    }
};
