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
        Schema::create('lupon_cases', function (Blueprint $table) {
            $table->id();

            // Core case info (matches $fillable)
            $table->string('case_no');
            $table->string('case_title')->nullable();
            $table->string('case_type')->nullable();
            $table->date('date_filed')->nullable();
            $table->string('mediator')->nullable();
            $table->text('remarks')->nullable();
            $table->string('final_action')->nullable();

            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();

            $table->timestamps();

            // Foreign key to users
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('updated_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lupon_cases');
    }
};
