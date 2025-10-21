<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Document;
use App\Models\Resident;

class DocumentSeeder extends Seeder
{
    public function run()
    {
        // Make sure you have some residents first, otherwise resident_id foreign key will fail
        $resident = Resident::first();

        if (!$resident) {
            $this->command->info('No residents found, skipping document seeding.');
            return;
        }

        Document::create([
            'type' => 'BARANGAY_CLEARANCE',
            'resident_id' => $resident->id,
            'applicant_name' => 'Juan Dela Cruz',
            'purpose' => 'Proof of residency',
            'priority' => 'NORMAL',
            'payment_status' => 'PAID',
            'status' => 'PENDING',
        ]);
    }
}
