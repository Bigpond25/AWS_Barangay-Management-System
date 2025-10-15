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
        Schema::table('documents', function (Blueprint $table) {
            $table->date('summon_date')->nullable()->after('last_compliance');
            $table->time('summon_time')->nullable()->after('summon_date');
            $table->text('summon_address')->nullable()->after('summon_time');
            $table->string('barangay_case')->nullable()->after('summon_address');
            $table->string('for')->nullable()->after('barangay_case');
            $table->string('to')->nullable()->after('for');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('summon_date');
            $table->dropColumn('summon_time');
            $table->dropColumn('summon_address');
            $table->dropColumn('barangay_case');
            $table->dropColumn('for');
            $table->dropColumn('to');
        });
    }
};
