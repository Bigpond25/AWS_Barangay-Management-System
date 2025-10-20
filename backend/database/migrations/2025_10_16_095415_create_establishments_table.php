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
        Schema::create('establishments', function (Blueprint $table) {
            $table->id();
            $table->string('business_name')->nullable();
            $table->string('room_unit')->nullable();
            $table->string('building')->nullable();
            $table->string('no')->nullable();
            $table->string('location')->nullable();
            $table->string('owner')->nullable();
            $table->string('telephone')->nullable();
            $table->string('nature_of_business')->nullable();
            $table->string('representative')->nullable();
            $table->string('position')->nullable();
            $table->date('date_approved')->nullable();
            $table->date('date_of_last_renewal')->nullable();
            $table->string('type')->nullable();
            $table->string('status')->nullable();
            $table->decimal('capitalization', 15, 2)->nullable();
            $table->text('remarks')->nullable();
            $table->string('ctc_no')->nullable();
            $table->date('date_issued')->nullable();
            $table->decimal('amount_paid', 15, 2)->nullable();
            $table->decimal('clearance_fee', 15, 2)->nullable();
            $table->text('remarks_on_print_business')->nullable();
            $table->date('date_of_retirement')->nullable();
            $table->text('sign_wordings')->nullable();
            $table->string('size')->nullable();
            $table->string('material')->nullable();
            $table->decimal('sign_amount_paid', 15, 2)->nullable();
            $table->date('sign_date')->nullable();
            $table->string('sign_or')->nullable();
            $table->date('custom_date')->nullable();
            $table->decimal('custom_paid', 15, 2)->nullable();
            $table->string('custom_or')->nullable();
            $table->date('date_retirement_clearance')->nullable();
            $table->decimal('personal_clearance_fee', 15, 2)->nullable();
            $table->decimal('retirement_clearance', 15, 2)->nullable();
            $table->json('docs_attachment')->nullable();
            $table->string('signature')->nullable();

            $table->uuid('created_by');
            $table->uuid('updated_by')->nullable();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('cascade');

            $table->index('business_name', 'idx_establishments_business_name');
            $table->index('owner', 'idx_establishments_owner');
            $table->index('representative', 'idx_establishments_representative');
            $table->index('position', 'idx_establishments_position');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('establishments');
    }
};
