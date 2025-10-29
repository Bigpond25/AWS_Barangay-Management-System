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
        Schema::create('infrastructure_clearances', function (Blueprint $table) {
            $table->id(); // record no in the form
            $table->foreignId('infrastructure_id')
                ->constrained('infrastructures');

            $table->string('applicant_name')->nullable();
            $table->string('type_of_project')->nullable();
            $table->string('address')->nullable();
            $table->date('issued_date')->nullable();

            $table->text('remarks_and_condition')->nullable();

            $table->string('file_name')->nullable();
            $table->string('file_path')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('file_type')->nullable();
            $table->string('file_extension')->nullable();

            $table->uuid('issued_by');

            $table->foreign('issued_by')->references('id')->on('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('infrastructure_clearances');
    }
};
