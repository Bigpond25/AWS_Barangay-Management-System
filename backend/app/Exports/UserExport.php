<?php

// ============================================================================
// App/Exports/UserExport.php (for Excel export functionality)
// Compatible with maatwebsite/excel 1.x
// ============================================================================

namespace App\Exports;

use App\Models\User;
use Illuminate\Support\Collection;

class UserExport
{
    protected $users;

    public function __construct($users)
    {
        $this->users = $users;
    }

    /**
     * Get the users data as an array for export (compatible with Excel 1.x)
     */
    public function toArray(): array
    {
        $data = [];
        
        // Add headers
        $data[] = [
            'ID',
            'First Name',
            'Middle Name', 
            'Last Name',
            'Username',
            'Email',
            'Phone',
            'Role',
            'Department',
            'Position',
            'Employee ID',
            'Is Active',
            'Is Verified',
            'Created At',
            'Last Login'
        ];

        // Add user data
        foreach ($this->users as $user) {
            $data[] = [
                $user->id,
                $user->first_name,
                $user->middle_name,
                $user->last_name,
                $user->username,
                $user->email,
                $user->phone ?? '',
                $user->role,
                $user->department,
                $user->position ?? '',
                $user->employee_id ?? '',
                $user->is_active ? 'Yes' : 'No',
                $user->is_verified ? 'Yes' : 'No',
                $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : '',
                $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : 'Never'
            ];
        }

        return $data;
    }

    /**
     * Get collection for Excel export
     */
    public function collection(): Collection
    {
        return collect($this->toArray());
    }
}

