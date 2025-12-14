<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Str;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Frontend role constants
        $frontendRoles = [
            'SUPER_ADMIN',
            'ADMIN',
            'BARANGAY_CAPTAIN',
            'BARANGAY_SECRETARY',
            'BARANGAY_TREASURER',
            'BARANGAY_COUNCILOR',
            'BARANGAY_CLERK',
            'HEALTH_WORKER',
            'SOCIAL_WORKER',
            'SECURITY_OFFICER',
            'DATA_ENCODER',
            'VIEWER',
        ];

        foreach ($frontendRoles as $frontendKey) {

            // SUPER_ADMIN → super-admin
            $backendSlug = Str::of($frontendKey)
                ->lower()
                ->replace('_', '-')
                ->toString();

            Role::firstOrCreate(
                [
                    'name' => $backendSlug,
                    'guard_name' => 'web'
                ]
            );
        }
    }
}
