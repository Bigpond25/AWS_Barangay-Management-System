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
        Schema::create('lupon_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lupon_case_id')->constrained('lupon_cases');
            $table->foreignId('lupon_hearing_id')->nullable()->constrained('lupon_hearings');


            // File metadata
            $table->string('file_name');        // e.g. 'Notice 1.pdf'
            $table->string('file_path');        // e.g. 'storage/lupon/notice_1.pdf'
            $table->string('file_type')->nullable(); // e.g. 'pdf', 'image/jpeg'
            $table->text('description')->nullable(); // optional user-entered description

            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();

            // Foreign key for created_by
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('updated_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lupon_attachments');
    }
};
