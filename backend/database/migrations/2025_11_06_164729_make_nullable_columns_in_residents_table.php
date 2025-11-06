<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            $table->date('birth_date')->nullable()->change();

            // Allow NULL on the gender column
            DB::statement('ALTER TABLE residents ALTER COLUMN gender DROP NOT NULL;');
            DB::statement('ALTER TABLE residents ALTER COLUMN civil_status DROP NOT NULL;');
            DB::statement('ALTER TABLE residents ALTER COLUMN employment_status DROP NOT NULL;');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            // $table->date('birth_date')->change();
        });
    }
};
