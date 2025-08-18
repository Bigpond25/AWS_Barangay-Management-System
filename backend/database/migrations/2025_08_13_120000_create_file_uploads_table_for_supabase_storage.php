<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create file_uploads table for tracking Supabase storage files
        Schema::create('file_uploads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('entity_type', 50); // 'resident', 'document', 'ticket', etc.
            $table->uuid('entity_id'); // ID of the related entity
            $table->string('file_type', 50); // 'profile_photo', 'document', 'supporting_document'
            $table->string('bucket_name', 100); // Supabase bucket name
            $table->string('file_path', 500); // Full path within bucket
            $table->string('original_filename', 255); // Original uploaded filename
            $table->integer('file_size')->nullable(); // File size in bytes
            $table->string('mime_type', 100)->nullable(); // MIME type
            $table->boolean('is_public')->default(false); // Whether file is publicly accessible
            $table->string('public_url', 500)->nullable(); // Public URL if applicable
            $table->string('storage_provider', 50)->default('supabase'); // Storage provider
            $table->json('metadata')->nullable(); // Additional file metadata
            $table->uuid('uploaded_by')->nullable(); // User who uploaded the file
            $table->timestamps();
            $table->softDeletes();

            // Foreign key constraints
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');

            // Indexes for performance
            $table->index(['entity_type', 'entity_id'], 'idx_file_uploads_entity');
            $table->index('bucket_name', 'idx_file_uploads_bucket');
            $table->index('file_type', 'idx_file_uploads_file_type');
            $table->index('uploaded_by', 'idx_file_uploads_uploaded_by');
            $table->index('storage_provider', 'idx_file_uploads_provider');
        });

        // Note: Storage fields are now added directly in the create table migrations
        // for residents, documents, and supporting_documents tables
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop file_uploads table
        Schema::dropIfExists('file_uploads');
        
        // Note: Storage fields are part of the main table creation migrations
        // and will be dropped when those tables are dropped
    }
};
