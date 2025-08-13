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
        Schema::table('households', function (Blueprint $table) {
            // Add hash fields for encrypted searchable fields
            $table->string('complete_address_hash')->nullable()->index()->after('complete_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('households', function (Blueprint $table) {
            $table->dropIndex(['complete_address_hash']);
            $table->dropColumn('complete_address_hash');
        });
    }
};
