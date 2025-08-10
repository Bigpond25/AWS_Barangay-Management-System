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
        Schema::create('supporting_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Can belong to different entities
            $table->uuid('document_id')->nullable(); // For regular documents
            $table->uuid('blotter_id')->nullable();  // For blotter cases
            $table->uuid('complaint_id')->nullable(); // For complaints
            
            // File Information
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type')->nullable();
            $table->integer('file_size')->nullable();
            $table->string('original_filename')->nullable();
            $table->text('description')->nullable();
            
            // Audit fields
            $table->uuid('uploaded_by')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('document_id')->references('id')->on('documents')->onDelete('cascade');
            $table->foreign('blotter_id')->references('id')->on('blotters')->onDelete('cascade');
            $table->foreign('complaint_id')->references('id')->on('complaints')->onDelete('cascade');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index('document_id');
            $table->index('blotter_id');
            $table->index('complaint_id');
            $table->index('file_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supporting_documents');
    }
};
