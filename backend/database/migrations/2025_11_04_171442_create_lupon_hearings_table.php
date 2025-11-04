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
        Schema::create('lupon_hearings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lupon_case_id')->constrained('lupon_cases')->cascadeOnDelete();

            // Hearing details
            $table->unsignedInteger('sequence_no')->default(1); // e.g. 1 = first hearing, 2 = second, etc.
            $table->date('notice_date')->nullable();
            $table->date('hearing_date')->nullable();
            $table->time('hearing_time')->nullable();
            $table->text('remarks')->nullable();
            $table->text('proceedings')->nullable();

            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lupon_hearings');
    }
};
