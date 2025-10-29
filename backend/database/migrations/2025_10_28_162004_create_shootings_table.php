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
        Schema::create('shootings', function (Blueprint $table) {
            $table->id();
            $table->date('date_of_application')->nullable();
            $table->string('name_of_outfit', 1000)->nullable();
            $table->string('program_title', 1000)->nullable();
            $table->string('location', 1000)->nullable();
            $table->string('time', 255)->nullable();
            $table->date('date_of_shooting')->nullable();
            $table->string('requested_by', 1000)->nullable();
            $table->string('or_no', 255)->nullable();
            $table->decimal('amount_paid', 15, 2)->nullable();
            $table->text('remarks')->nullable();

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
        Schema::dropIfExists('shootings');
    }
};
