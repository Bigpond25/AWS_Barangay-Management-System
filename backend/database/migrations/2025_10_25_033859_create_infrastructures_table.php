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
        Schema::create('infrastructures', function (Blueprint $table) {
            $table->id();
            $table->date('date_of_application')->nullable();
            $table->string('type_of_project')->nullable();
            $table->string('classification')->nullable();
            $table->string('name_of_applicant', 1000)->nullable();
            $table->string('address_of_applicant', 1000)->nullable();
            $table->string('applicant_contact_no', 1000)->nullable();
            $table->string('applicants_representative', 1000)->nullable();
            $table->string('location_of_project', 1000)->nullable();
            $table->string('property_owner', 1000)->nullable();
            $table->string('contractor', 1000)->nullable();
            $table->string('contractors_address', 1000)->nullable();
            $table->string('contractors_contact_person', 1000)->nullable();
            $table->string('contractors_contact_no', 1000)->nullable();
            $table->text('remarks_on_clearance')->nullable();
            $table->text('remarks_hidden')->nullable();
            $table->string('bond_amount_words', 1000)->nullable();
            $table->decimal('bond_amount_figure', 15, 2)->nullable();
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
        Schema::dropIfExists('infrastructures');
    }
};
