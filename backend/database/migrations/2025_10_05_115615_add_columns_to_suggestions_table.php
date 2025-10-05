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
        Schema::table('suggestions', function (Blueprint $table) {
            $table->string('department')->nullable()->change();
            $table->string('expected_benefits')->nullable()->after('implementaion_note');
            $table->string('implementation_ideas')->nullable()->after('expected_benefits');
            $table->string('resources_needed')->nullable()->after('implementation_ideas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('suggestions', function (Blueprint $table) {
            $table->dropColumn('expected_benefits');
            $table->dropColumn('implementation_ideas');
            $table->dropColumn('resources_needed');
        });
    }
};
