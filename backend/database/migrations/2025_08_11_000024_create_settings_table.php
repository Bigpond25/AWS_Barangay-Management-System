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
        Schema::create('settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Setting identification
            $table->string('key')->unique(); // Unique setting identifier
            $table->string('name'); // Human-readable name
            $table->text('description')->nullable();
            
            // Setting value
            $table->text('value'); // JSON or string value
            $table->string('type')->default('string'); // string, integer, boolean, json, file, etc.
            
            // Grouping and organization
            $table->string('group')->default('general'); // general, system, notification, etc.
            $table->string('category')->nullable(); // Sub-category within group
            
            // UI/Display options
            $table->boolean('is_public')->default(false); // Can be viewed by non-admin users
            $table->boolean('is_editable')->default(true); // Can be modified through UI
            $table->integer('sort_order')->default(0);
            
            // Validation rules
            $table->text('validation_rules')->nullable(); // Laravel validation rules
            $table->json('options')->nullable(); // For select/radio options
            $table->text('default_value')->nullable();
            
            // Help text
            $table->text('help_text')->nullable();
            $table->text('placeholder')->nullable();
            
            // System settings
            $table->boolean('is_system')->default(false); // System setting (not deletable)
            $table->boolean('requires_restart')->default(false); // Requires app restart to take effect
            
            // Environment-specific
            $table->string('environment')->nullable(); // production, staging, development, etc.
            
            // Audit fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index('key');
            $table->index('group');
            $table->index('category');
            $table->index('is_public');
            $table->index('is_system');
            $table->index('sort_order');
            $table->index(['group', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
