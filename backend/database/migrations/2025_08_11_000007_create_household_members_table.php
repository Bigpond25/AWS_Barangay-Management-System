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
        Schema::create('household_members', function (Blueprint $table) {
            $table->id();
            $table->uuid('household_id');
            $table->uuid('resident_id');
            $table->enum('relationship_to_head', [
                'HEAD', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER',
                'BROTHER', 'SISTER', 'GRANDFATHER', 'GRANDMOTHER',
                'GRANDSON', 'GRANDDAUGHTER', 'UNCLE', 'AUNT',
                'NEPHEW', 'NIECE', 'COUSIN', 'IN_LAW', 'BOARDER', 'OTHER'
            ])->default('OTHER');
            
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('household_id')->references('id')->on('households')->onDelete('cascade');
            $table->foreign('resident_id')->references('id')->on('residents')->onDelete('cascade');
            
            // Unique constraint to prevent duplicate memberships
            $table->unique(['household_id', 'resident_id']);
            
            // Indexes
            $table->index('household_id');
            $table->index('resident_id');
            $table->index('relationship_to_head');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('household_members');
    }
};
