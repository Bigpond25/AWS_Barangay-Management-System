<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DataConsent;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ConsentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get sample users (or create test users)
        $users = User::take(5)->get();

        if ($users->isEmpty()) {
            // Create sample users if none exist
            $users = collect([
                User::create([
                    'first_name' => 'Admin',
                    'last_name' => 'User',
                    'email' => 'admin@barangay.local',
                    'password' => Hash::make('password'),
                    'role' => 'ADMIN',
                    'email_verified_at' => now(),
                ]),
                User::create([
                    'first_name' => 'Secretary',
                    'last_name' => 'User',
                    'email' => 'secretary@barangay.local',
                    'password' => Hash::make('password'),
                    'role' => 'BARANGAY_SECRETARY',
                    'email_verified_at' => now(),
                ]),
                User::create([
                    'first_name' => 'Staff',
                    'last_name' => 'User',
                    'email' => 'staff@barangay.local',
                    'password' => Hash::make('password'),
                    'role' => 'STAFF',
                    'email_verified_at' => now(),
                ]),
            ]);
        }

        // Sample consent data for each user
        foreach ($users as $user) {
            // Registration consent (always granted for existing users)
            DataConsent::recordConsent(
                $user->id,
                DataConsent::TYPE_REGISTRATION,
                [
                    'terms_version' => '1.0',
                    'privacy_policy_version' => '1.0',
                    'source' => 'account_creation'
                ],
                '1.0',
                '127.0.0.1',
                'Mozilla/5.0 (Test Seeder)'
            );

            // Data processing consent
            DataConsent::recordConsent(
                $user->id,
                DataConsent::TYPE_DATA_PROCESSING,
                [
                    'purposes' => ['service_delivery', 'record_keeping', 'compliance'],
                    'retention_period' => '7_years',
                    'source' => 'registration_form'
                ],
                '1.0',
                '127.0.0.1',
                'Mozilla/5.0 (Test Seeder)'
            );

            // Analytics consent (some users may decline)
            if (rand(1, 10) > 3) { // 70% consent rate
                DataConsent::recordConsent(
                    $user->id,
                    DataConsent::TYPE_ANALYTICS,
                    [
                        'tracking_type' => 'basic',
                        'anonymized' => true,
                        'source' => 'settings_page'
                    ],
                    '1.0',
                    '127.0.0.1',
                    'Mozilla/5.0 (Test Seeder)'
                );
            }

            // Marketing consent (optional - lower consent rate)
            if (rand(1, 10) > 6) { // 40% consent rate
                DataConsent::recordConsent(
                    $user->id,
                    DataConsent::TYPE_MARKETING,
                    [
                        'channels' => ['email', 'sms'],
                        'frequency' => 'monthly',
                        'source' => 'newsletter_signup'
                    ],
                    '1.0',
                    '127.0.0.1',
                    'Mozilla/5.0 (Test Seeder)'
                );
            }

            // Cookies consent (most users accept)
            if (rand(1, 10) > 2) { // 80% consent rate
                DataConsent::recordConsent(
                    $user->id,
                    DataConsent::TYPE_COOKIES,
                    [
                        'cookie_types' => ['essential', 'functional', 'analytics'],
                        'third_party' => false,
                        'source' => 'cookie_banner'
                    ],
                    '1.0',
                    '127.0.0.1',
                    'Mozilla/5.0 (Test Seeder)'
                );
            }
        }

        // Create some withdrawn consents for testing
        $withdrawnConsents = DataConsent::where('consent_type', DataConsent::TYPE_MARKETING)
            ->take(2)
            ->get();

        foreach ($withdrawnConsents as $consent) {
            if (rand(1, 10) > 7) { // 30% withdrawal rate for marketing
                $consent->withdraw('No longer interested in marketing communications');
            }
        }

        $this->command->info('Sample consent data created successfully!');
        $this->command->info('Created consents for ' . $users->count() . ' users');
        $this->command->info('Consent types: Registration, Data Processing, Analytics, Marketing, Cookies');
    }
}
