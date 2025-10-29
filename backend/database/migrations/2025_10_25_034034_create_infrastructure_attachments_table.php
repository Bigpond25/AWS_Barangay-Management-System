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
        Schema::create('infrastructure_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('infrastructure_id')->constrained('infrastructures');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_size');
            $table->string('file_type');
            $table->string('file_extension');
            $table->uuid('created_by');
            $table->uuid('updated_by')->nullable();
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('updated_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('infrastructure_attachments');
    }
};
