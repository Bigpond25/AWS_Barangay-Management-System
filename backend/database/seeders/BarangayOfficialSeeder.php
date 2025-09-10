<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Resident;
use App\Models\BarangayOfficial;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

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
            
            // Create or find user for this official
            $userRole = $this->getUserRoleForPosition($officialData['position']);
            $username = $this->generateUsername($resident->first_name, $resident->last_name, $officialData['position']);
            
            // Check if user already exists by email, username, or role/position combination
            $user = User::where('email', $resident->email_address)
                       ->orWhere('username', $username)
                       ->orWhere(function($query) use ($userRole, $officialData) {
                           $query->where('role', $userRole);
                           // For specific positions, check if position already exists
                           if (in_array($officialData['position'], ['BARANGAY_CAPTAIN', 'BARANGAY_SECRETARY', 'BARANGAY_TREASURER', 'SK_CHAIRPERSON'])) {
                               $query->where('position', $this->getPositionTitle($officialData['position']));
                           }
                       })
                       ->first();
            
            if (!$user) {
                // Make sure username is unique
                $originalUsername = $username;
                $counter = 1;
                while (User::where('username', $username)->exists()) {
                    $username = $originalUsername . $counter;
                    $counter++;
                }
                
                // Make sure employee_id is unique by checking what's already in use
                $employeeId = $this->generateUniqueEmployeeId($officialData['position']);
                
                $user = User::create([
                    'username' => $username,
                    'email' => $resident->email_address,
                    'password' => Hash::make($this->generateDefaultPassword($userRole)),
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'phone' => $resident->mobile_number,
                    'role' => $userRole,
                    'department' => $this->getDepartmentForPosition($officialData['position']),
                    'position' => $this->getPositionTitle($officialData['position']),
                    'employee_id' => $employeeId,
                    'resident_id' => $resident->id,
                    'is_active' => true,
                    'is_verified' => true,
                    'email_verified_at' => now(),
                    'notes' => 'Created for barangay official seeding',
                ]);
            } else {
                // Update existing user with resident_id if not set
                if (!$user->resident_id) {
                    $user->update(['resident_id' => $resident->id]);
                }
            }
            
            // Create barangay official linked to both resident and user
            BarangayOfficial::create([
                'resident_id' => $resident->id,
                'user_id' => $user->id,
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
            
            $this->command->info("Created barangay official: {$resident->first_name} {$resident->last_name} ({$officialData['position']}) with user account (username: {$user->username})");
        }
        
        $this->command->info('Barangay officials seeded successfully!');
    }
    
    /**
     * Map position to user role
     */
    private function getUserRoleForPosition(string $position): string
    {
        return match($position) {
            'BARANGAY_CAPTAIN' => 'BARANGAY_CAPTAIN',
            'BARANGAY_SECRETARY' => 'BARANGAY_SECRETARY',
            'BARANGAY_TREASURER' => 'BARANGAY_TREASURER',
            'KAGAWAD' => 'BARANGAY_COUNCILOR',
            'SK_CHAIRPERSON' => 'BARANGAY_COUNCILOR', // SK Chairperson is treated as councilor
            default => 'BARANGAY_COUNCILOR'
        };
    }
    
    /**
     * Generate username from name and position
     */
    private function generateUsername(string $firstName, string $lastName, string $position): string
    {
        $prefix = match($position) {
            'BARANGAY_CAPTAIN' => 'captain',
            'BARANGAY_SECRETARY' => 'secretary',
            'BARANGAY_TREASURER' => 'treasurer',
            'SK_CHAIRPERSON' => 'sk',
            default => 'kagawad'
        };
        
        return strtolower($prefix . '.' . $lastName);
    }
    
    /**
     * Generate default password for role
     */
    private function generateDefaultPassword(string $role): string
    {
        return match($role) {
            'BARANGAY_CAPTAIN' => 'Captain123!',
            'BARANGAY_SECRETARY' => 'Secretary123!',
            'BARANGAY_TREASURER' => 'Treasurer123!',
            'BARANGAY_COUNCILOR' => 'Councilor123!',
            default => 'Official123!'
        };
    }
    
    /**
     * Get department for position
     */
    private function getDepartmentForPosition(string $position): string
    {
        return match($position) {
            'BARANGAY_TREASURER' => 'FINANCE_TREASURY',
            'SK_CHAIRPERSON' => 'YOUTH_SPORTS_DEVELOPMENT',
            default => 'ADMINISTRATION'
        };
    }
    
    /**
     * Get position title for display
     */
    private function getPositionTitle(string $position): string
    {
        return match($position) {
            'BARANGAY_CAPTAIN' => 'Barangay Captain',
            'BARANGAY_SECRETARY' => 'Barangay Secretary',
            'BARANGAY_TREASURER' => 'Barangay Treasurer',
            'KAGAWAD' => 'Barangay Councilor',
            'SK_CHAIRPERSON' => 'SK Chairperson',
            default => 'Barangay Official'
        };
    }
    
    /**
     * Generate employee ID for position
     */
    private function generateEmployeeId(string $position): string
    {
        static $counters = [];
        
        $prefix = match($position) {
            'BARANGAY_CAPTAIN' => 'BC',
            'BARANGAY_SECRETARY' => 'BS',
            'BARANGAY_TREASURER' => 'BT',
            'KAGAWAD' => 'BK',
            'SK_CHAIRPERSON' => 'SK',
            default => 'BO'
        };
        
        if (!isset($counters[$prefix])) {
            $counters[$prefix] = 1;
        } else {
            $counters[$prefix]++;
        }
        
        return $prefix . '-' . str_pad($counters[$prefix], 3, '0', STR_PAD_LEFT);
    }
    
    /**
     * Generate unique employee ID that doesn't conflict with existing users
     */
    private function generateUniqueEmployeeId(string $position): string
    {
        $prefix = match($position) {
            'BARANGAY_CAPTAIN' => 'BC',
            'BARANGAY_SECRETARY' => 'BS',
            'BARANGAY_TREASURER' => 'BT',
            'KAGAWAD' => 'BK',
            'SK_CHAIRPERSON' => 'SK',
            default => 'BO'
        };
        
        // Find the highest existing number for this prefix
        $existingIds = User::where('employee_id', 'like', $prefix . '-%')
                          ->pluck('employee_id')
                          ->map(function($id) use ($prefix) {
                              $parts = explode('-', $id);
                              return isset($parts[1]) ? intval($parts[1]) : 0;
                          })
                          ->max();
        
        $nextNumber = ($existingIds ?? 0) + 1;
        
        return $prefix . '-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }
}
