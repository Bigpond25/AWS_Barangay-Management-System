<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Resident;
use App\Models\BarangayOfficial;
use Carbon\Carbon;

class BarangayOfficialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define barangay officials data
        $officialsData = [
            [
                'position' => 'BARANGAY_CAPTAIN',
                'committee' => null,
                'term_start' => '2023-07-01',
                'term_end' => '2026-06-30',
                'resident_data' => [
                    'first_name' => 'Maria',
                    'last_name' => 'Santos',
                    'middle_name' => 'dela Cruz',
                    'birth_date' => '1975-03-15',
                    'gender' => 'FEMALE',
                    'civil_status' => 'MARRIED',
                    'nationality' => 'FILIPINO',
                    'religion' => 'CATHOLIC',
                    'educational_attainment' => 'COLLEGE_GRADUATE',
                    'employment_status' => 'EMPLOYED',
                    'occupation' => 'Barangay Captain',
                    'complete_address' => 'Purok 1, Barangay San Antonio, Quezon City',
                    'mobile_number' => '09171234567',
                    'email_address' => 'maria.santos@barangay.gov.ph',
                    'birth_place' => 'Quezon City',
                    'voter_status' => 'REGISTERED',
                    'status' => 'ACTIVE'
                ]
            ],
            [
                'position' => 'KAGAWAD',
                'committee' => 'Health and Sanitation',
                'term_start' => '2023-07-01',
                'term_end' => '2026-06-30',
                'resident_data' => [
                    'first_name' => 'Juan',
                    'last_name' => 'Dela Cruz',
                    'middle_name' => 'Rodriguez',
                    'birth_date' => '1980-07-22',
                    'gender' => 'MALE',
                    'civil_status' => 'MARRIED',
                    'nationality' => 'FILIPINO',
                    'religion' => 'CATHOLIC',
                    'educational_attainment' => 'COLLEGE_GRADUATE',
                    'employment_status' => 'EMPLOYED',
                    'occupation' => 'Engineer',
                    'complete_address' => 'Purok 2, Barangay San Antonio, Quezon City',
                    'mobile_number' => '09181234567',
                    'email_address' => 'juan.delacruz@barangay.gov.ph',
                    'birth_place' => 'Manila',
                    'voter_status' => 'REGISTERED',
                    'status' => 'ACTIVE'
                ]
            ],
            [
                'position' => 'KAGAWAD',
                'committee' => 'Education and Youth Development',
                'term_start' => '2023-07-01',
                'term_end' => '2026-06-30',
                'resident_data' => [
                    'first_name' => 'Ana',
                    'last_name' => 'Reyes',
                    'middle_name' => 'Martinez',
                    'birth_date' => '1978-11-08',
                    'gender' => 'FEMALE',
                    'civil_status' => 'SINGLE',
                    'nationality' => 'FILIPINO',
                    'religion' => 'CATHOLIC',
                    'educational_attainment' => 'COLLEGE_GRADUATE',
                    'employment_status' => 'EMPLOYED',
                    'occupation' => 'Teacher',
                    'complete_address' => 'Purok 3, Barangay San Antonio, Quezon City',
                    'mobile_number' => '09191234567',
                    'email_address' => 'ana.reyes@barangay.gov.ph',
                    'birth_place' => 'Quezon City',
                    'voter_status' => 'REGISTERED',
                    'status' => 'ACTIVE'
                ]
            ],
            [
                'position' => 'KAGAWAD',
                'committee' => 'Peace and Order',
                'term_start' => '2023-07-01',
                'term_end' => '2026-06-30',
                'resident_data' => [
                    'first_name' => 'Roberto',
                    'last_name' => 'Garcia',
                    'middle_name' => 'Santos',
                    'birth_date' => '1972-05-20',
                    'gender' => 'MALE',
                    'civil_status' => 'MARRIED',
                    'nationality' => 'FILIPINO',
                    'religion' => 'CATHOLIC',
                    'educational_attainment' => 'HIGH_SCHOOL_GRADUATE',
                    'employment_status' => 'EMPLOYED',
                    'occupation' => 'Security Guard',
                    'complete_address' => 'Purok 4, Barangay San Antonio, Quezon City',
                    'mobile_number' => '09201234567',
                    'email_address' => 'roberto.garcia@barangay.gov.ph',
                    'birth_place' => 'Caloocan City',
                    'voter_status' => 'REGISTERED',
                    'status' => 'ACTIVE'
                ]
            ],
            [
                'position' => 'BARANGAY_SECRETARY',
                'committee' => null,
                'term_start' => '2023-07-01',
                'term_end' => '2026-06-30',
                'resident_data' => [
                    'first_name' => 'Carmen',
                    'last_name' => 'Flores',
                    'middle_name' => 'Aguilar',
                    'birth_date' => '1985-09-12',
                    'gender' => 'FEMALE',
                    'civil_status' => 'SINGLE',
                    'nationality' => 'FILIPINO',
                    'religion' => 'CATHOLIC',
                    'educational_attainment' => 'COLLEGE_GRADUATE',
                    'employment_status' => 'EMPLOYED',
                    'occupation' => 'Office Administrator',
                    'complete_address' => 'Purok 5, Barangay San Antonio, Quezon City',
                    'mobile_number' => '09211234567',
                    'email_address' => 'carmen.flores@barangay.gov.ph',
                    'birth_place' => 'Quezon City',
                    'voter_status' => 'REGISTERED',
                    'status' => 'ACTIVE'
                ]
            ],
            [
                'position' => 'BARANGAY_TREASURER',
                'committee' => null,
                'term_start' => '2023-07-01',
                'term_end' => '2026-06-30',
                'resident_data' => [
                    'first_name' => 'Eduardo',
                    'last_name' => 'Villanueva',
                    'middle_name' => 'Ramos',
                    'birth_date' => '1970-12-03',
                    'gender' => 'MALE',
                    'civil_status' => 'MARRIED',
                    'nationality' => 'FILIPINO',
                    'religion' => 'CATHOLIC',
                    'educational_attainment' => 'COLLEGE_GRADUATE',
                    'employment_status' => 'EMPLOYED',
                    'occupation' => 'Accountant',
                    'complete_address' => 'Purok 6, Barangay San Antonio, Quezon City',
                    'mobile_number' => '09221234567',
                    'email_address' => 'eduardo.villanueva@barangay.gov.ph',
                    'birth_place' => 'Manila',
                    'voter_status' => 'REGISTERED',
                    'status' => 'ACTIVE'
                ]
            ],
            [
                'position' => 'SK_CHAIRPERSON',
                'committee' => null,
                'term_start' => '2023-12-01',
                'term_end' => '2026-11-30',
                'resident_data' => [
                    'first_name' => 'Miguel',
                    'last_name' => 'Torres',
                    'middle_name' => 'Cruz',
                    'birth_date' => '2000-04-18',
                    'gender' => 'MALE',
                    'civil_status' => 'SINGLE',
                    'nationality' => 'FILIPINO',
                    'religion' => 'CATHOLIC',
                    'educational_attainment' => 'COLLEGE_UNDERGRADUATE',
                    'employment_status' => 'STUDENT',
                    'occupation' => 'Student',
                    'complete_address' => 'Purok 7, Barangay San Antonio, Quezon City',
                    'mobile_number' => '09231234567',
                    'email_address' => 'miguel.torres@barangay.gov.ph',
                    'birth_place' => 'Quezon City',
                    'voter_status' => 'REGISTERED',
                    'status' => 'ACTIVE'
                ]
            ]
        ];

        foreach ($officialsData as $officialData) {
            // Create resident first
            $resident = Resident::create($officialData['resident_data']);
            
            // Create barangay official linked to the resident
            BarangayOfficial::create([
                'resident_id' => $resident->id,
                'first_name' => $resident->first_name,
                'last_name' => $resident->last_name,
                'middle_name' => $resident->middle_name,
                'birth_date' => $resident->birth_date,
                'gender' => $resident->gender,
                'contact_number' => $resident->mobile_number,
                'email_address' => $resident->email_address,
                'address' => $resident->complete_address,
                'position' => $officialData['position'],
                'committee' => $officialData['committee'],
                'term_start' => Carbon::parse($officialData['term_start']),
                'term_end' => Carbon::parse($officialData['term_end']),
                'term_number' => 1,
                'is_current_term' => true,
                'is_elected' => true,
                'status' => 'ACTIVE',
                'status_date' => now(),
                'oath_taking_date' => Carbon::parse($officialData['term_start']),
            ]);
            
            $this->command->info("Created barangay official: {$resident->first_name} {$resident->last_name} ({$officialData['position']})");
        }
        
        $this->command->info('Barangay officials seeded successfully!');
    }
}
