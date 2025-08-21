<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Document;
use App\Models\Ticket;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Str;

class RelationshipTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding relationship test data...');

        // Create test residents with complete relationships
        $this->seedResidentsWithHouseholds();
        $this->seedDocumentRelationships();
        $this->seedHelpDeskRelationships();
        
        $this->command->info('✅ Relationship test data seeded successfully!');
    }

    /**
     * Create residents and their household relationships
     */
    private function seedResidentsWithHouseholds(): void
    {
        $this->command->info('   👥 Creating residents and households...');

        // Family 1: Nuclear family
        $father = Resident::create([
            'id' => Str::uuid(),
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'birth_date' => '1980-05-15',
            'birth_place' => 'Manila',
            'gender' => 'MALE',
            'civil_status' => 'MARRIED',
            'nationality' => 'FILIPINO',
            'religion' => 'CATHOLIC',
            'educational_attainment' => 'COLLEGE_GRADUATE',
            'employment_status' => 'EMPLOYED',
            'occupation' => 'Teacher',
            'complete_address' => '123 Main Street, Barangay Sample',
            'barangay' => 'Sample Barangay',
            'voter_status' => 'REGISTERED',
            'senior_citizen' => false,
            'person_with_disability' => false,
            'indigenous_people' => false,
            'four_ps_beneficiary' => false,
        ]);

        $mother = Resident::create([
            'id' => Str::uuid(),
            'first_name' => 'Maria',
            'last_name' => 'Dela Cruz',
            'birth_date' => '1982-03-22',
            'birth_place' => 'Quezon City',
            'gender' => 'FEMALE',
            'civil_status' => 'MARRIED',
            'nationality' => 'FILIPINO',
            'religion' => 'CATHOLIC',
            'educational_attainment' => 'COLLEGE_GRADUATE',
            'employment_status' => 'EMPLOYED',
            'occupation' => 'Nurse',
            'complete_address' => '123 Main Street, Barangay Sample',
            'barangay' => 'Sample Barangay',
            'voter_status' => 'REGISTERED',
            'senior_citizen' => false,
            'person_with_disability' => false,
            'indigenous_people' => false,
            'four_ps_beneficiary' => false,
        ]);

        $child1 = Resident::create([
            'id' => Str::uuid(),
            'first_name' => 'Jose',
            'last_name' => 'Dela Cruz',
            'birth_date' => '2010-08-10',
            'age' => Carbon::parse('2010-08-10')->age,
            'birth_place' => 'Quezon City',
            'gender' => 'MALE',
            'civil_status' => 'SINGLE',
            'nationality' => 'FILIPINO',
            'religion' => 'CATHOLIC',
            'educational_attainment' => 'ELEMENTARY_UNDERGRADUATE',
            'employment_status' => 'STUDENT',
            'complete_address' => '123 Main Street, Barangay Sample',
            'barangay' => 'Sample Barangay',
            'voter_status' => 'NOT_REGISTERED',
            'senior_citizen' => false,
            'person_with_disability' => false,
            'indigenous_people' => false,
            'four_ps_beneficiary' => false,
        ]);

        $child2 = Resident::create([
            'id' => Str::uuid(),
            'first_name' => 'Ana',
            'last_name' => 'Dela Cruz',
            'birth_date' => '2012-12-05',
            'age' => Carbon::parse('2012-12-05')->age,
            'birth_place' => 'Quezon City',
            'gender' => 'FEMALE',
            'civil_status' => 'SINGLE',
            'nationality' => 'FILIPINO',
            'religion' => 'CATHOLIC',
            'educational_attainment' => 'ELEMENTARY_UNDERGRADUATE',
            'employment_status' => 'STUDENT',
            'complete_address' => '123 Main Street, Barangay Sample',
            'barangay' => 'Sample Barangay',
            'voter_status' => 'NOT_REGISTERED',
            'senior_citizen' => false,
            'person_with_disability' => false,
            'indigenous_people' => false,
            'four_ps_beneficiary' => false,
        ]);

        // Create household
        $household1 = Household::create([
            'id' => Str::uuid(),
            'household_number' => 'HH-2025-001',
            'household_type' => 'NUCLEAR',
            'house_number' => '123',
            'street_sitio' => 'Main Street',
            'barangay' => 'Sample Barangay',
            'complete_address' => '123 Main Street, Barangay Sample',
            'monthly_income' => 'RANGE_25000_50000',
            'primary_income_source' => 'Employment',
            'four_ps_beneficiary' => false,
            'indigent_family' => false,
            'has_senior_citizen' => false,
            'has_pwd_member' => false,
            'house_type' => 'CONCRETE',
            'ownership_status' => 'OWNED',
            'has_electricity' => true,
            'has_water_supply' => true,
            'has_internet_access' => true,
        ]);

        // Attach family members to household
        $father->households()->attach($household1->id, ['relationship' => 'HEAD']);
        $mother->households()->attach($household1->id, ['relationship' => 'SPOUSE']);
        $child1->households()->attach($household1->id, ['relationship' => 'SON']);
        $child2->households()->attach($household1->id, ['relationship' => 'DAUGHTER']);

        // Create single resident household
        $senior = Resident::create([
            'id' => Str::uuid(),
            'first_name' => 'Pedro',
            'last_name' => 'Santos',
            'birth_date' => '1955-01-20',
            'age' => Carbon::parse('1955-01-20')->age,
            'birth_place' => 'Manila',
            'gender' => 'MALE',
            'civil_status' => 'WIDOWED',
            'nationality' => 'FILIPINO',
            'religion' => 'CATHOLIC',
            'educational_attainment' => 'HIGH_SCHOOL_GRADUATE',
            'employment_status' => 'RETIRED',
            'complete_address' => '456 Secondary Road, Barangay Sample',
            'barangay' => 'Sample Barangay',
            'voter_status' => 'REGISTERED',
            'senior_citizen' => true,
            'person_with_disability' => false,
            'indigenous_people' => false,
            'four_ps_beneficiary' => false,
        ]);

        $household2 = Household::create([
            'id' => Str::uuid(),
            'household_number' => 'HH-2025-002',
            'household_type' => 'SINGLE',
            'house_number' => '456',
            'street_sitio' => 'Secondary Road',
            'barangay' => 'Sample Barangay',
            'complete_address' => '456 Secondary Road, Barangay Sample',
            'monthly_income' => 'BELOW_10000',
            'primary_income_source' => 'Pension',
            'four_ps_beneficiary' => false,
            'indigent_family' => true,
            'has_senior_citizen' => true,
            'has_pwd_member' => false,
            'house_type' => 'WOOD',
            'ownership_status' => 'OWNED',
            'has_electricity' => true,
            'has_water_supply' => false,
            'has_internet_access' => false,
        ]);

        $senior->households()->attach($household2->id, ['relationship' => 'HEAD']);

        $this->command->info('     ✅ Created 2 households with 5 residents');
    }

    /**
     * Create document relationships
     */
    private function seedDocumentRelationships(): void
    {
        $this->command->info('   📄 Creating document relationships...');

        $residents = Resident::all();
        $documentTypes = ['BARANGAY_CLEARANCE', 'BUSINESS_PERMIT', 'CERTIFICATE_OF_INDIGENCY', 'CERTIFICATE_OF_RESIDENCY'];
        $statuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'RELEASED'];

        foreach ($residents->take(3) as $index => $resident) {
            // Create 2-3 documents per resident
            for ($i = 0; $i < rand(2, 3); $i++) {
                Document::create([
                    'id' => Str::uuid(),
                    'document_type' => $documentTypes[array_rand($documentTypes)],
                    'resident_id' => $resident->id,
                    'applicant_name' => $resident->first_name . ' ' . $resident->last_name,
                    'purpose' => 'Test purpose for ' . $documentTypes[array_rand($documentTypes)],
                    'priority' => ['LOW', 'NORMAL', 'HIGH'][array_rand(['LOW', 'NORMAL', 'HIGH'])],
                    'processing_fee' => rand(50, 500),
                    'status' => $statuses[array_rand($statuses)],
                    'payment_status' => ['UNPAID', 'PAID'][array_rand(['UNPAID', 'PAID'])],
                    'document_number' => 'DOC-' . date('Y') . '-' . str_pad(($index * 3) + $i + 1, 4, '0', STR_PAD_LEFT),
                    'request_date' => now()->subDays(rand(1, 30)),
                ]);
            }
        }

        $this->command->info('     ✅ Created documents for residents');
    }

    /**
     * Create help desk relationships (tickets, appointments)
     */
    private function seedHelpDeskRelationships(): void
    {
        $this->command->info('   🎫 Creating help desk relationships...');

        $residents = Resident::all();

        foreach ($residents->take(3) as $index => $resident) {
            // Create tickets
            if ($index < 2) {
                Ticket::create([
                    'id' => Str::uuid(),
                    'ticket_number' => 'TKT-' . date('Y') . '-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                    'resident_id' => $resident->id,
                    'subject' => 'Sample ticket subject for ' . $resident->first_name,
                    'description' => 'This is a test ticket description for testing relationships.',
                    'category' => 'GENERAL_INQUIRY',
                    'priority' => ['LOW', 'NORMAL', 'HIGH'][array_rand(['LOW', 'NORMAL', 'HIGH'])],
                    'status' => ['OPEN', 'IN_PROGRESS', 'RESOLVED'][array_rand(['OPEN', 'IN_PROGRESS', 'RESOLVED'])],
                    'created_at' => now()->subDays(rand(1, 15)),
                ]);
            }

            // Create appointments
            if ($index % 2 === 0) {
                Appointment::create([
                    'id' => Str::uuid(),
                    'resident_id' => $resident->id,
                    'purpose' => 'Consultation for ' . $resident->first_name,
                    'appointment_date' => now()->addDays(rand(1, 7))->toDateString(),
                    'appointment_time' => '09:00:00',
                    'status' => ['SCHEDULED', 'CONFIRMED'][array_rand(['SCHEDULED', 'CONFIRMED'])],
                    'notes' => 'Test appointment for relationship testing',
                    'created_at' => now()->subDays(rand(1, 5)),
                ]);
            }
        }

        $this->command->info('     ✅ Created tickets and appointments for residents');
    }
}
