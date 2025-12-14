<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller
{
    /**
     * Get all available permissions
     */
    public function getPermissions(): JsonResponse
    {
        $permissions = [
            'residents' => [
                'view-residents' => 'View Residents',
                'create-residents' => 'Create Residents',
                'edit-residents' => 'Edit Residents',
                'delete-residents' => 'Delete Residents',
                'export-residents' => 'Export Residents',
            ],
            'households' => [
                'view-households' => 'View Households',
                'create-households' => 'Create Households',
                'edit-households' => 'Edit Households',
                'delete-households' => 'Delete Households',
            ],
            'documents' => [
                'view-documents' => 'View Documents',
                'create-documents' => 'Create Documents',
                'process-documents' => 'Process Documents',
                'approve-documents' => 'Approve Documents',
                'release-documents' => 'Release Documents',
                'delete-documents' => 'Delete Documents',
            ],
            'projects' => [
                'view-projects' => 'View Projects',
                'create-projects' => 'Create Projects',
                'edit-projects' => 'Edit Projects',
                'delete-projects' => 'Delete Projects',
                'manage-project-team' => 'Manage Project Team',
            ],
            'help_desk' => [
                'view-complaints' => 'View Complaints',
                'create-complaints' => 'Create Complaints',
                'assign-complaints' => 'Assign Complaints',
                'resolve-complaints' => 'Resolve Complaints',
                'view-suggestions' => 'View Suggestions',
                'create-suggestions' => 'Create Suggestions',
                'review-suggestions' => 'Review Suggestions',
            ],
            'blotters' => [
                'view-blotter-cases' => 'View Blotter Cases',
                'create-blotter-cases' => 'Create Blotter Cases',
                'investigate-blotter-cases' => 'Investigate Blotter Cases',
                'mediate-blotter-cases' => 'Mediate Blotter Cases',
            ],
            'appointments' => [
                'view-appointments' => 'View Appointments',
                'create-appointments' => 'Create Appointments',
                'manage-appointments' => 'Manage Appointments',
            ],
            'officials' => [
                'view-officials' => 'View Officials',
                'create-officials' => 'Create Officials',
                'edit-officials' => 'Edit Officials',
                'delete-officials' => 'Delete Officials',
            ],
            'reports' => [
                'view-reports' => 'View Reports',
                'generate-reports' => 'Generate Reports',
                'view-analytics' => 'View Analytics',
            ],
            'system' => [
                'manage-users' => 'Manage Users',
                'manage-roles' => 'Manage Roles',
                'system-settings' => 'System Settings',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $permissions
        ]);
    }

    /**
     * Get role permissions mapping
     */
    public function getRolePermissions(): JsonResponse
    {
        // Load all roles with their permissions
        $roles = Role::with('permissions')->get();

        $output = [];

        foreach ($roles as $role) {
            // Convert DB role name (slug format) → PAYROLL FORMAT
            // barangay-captain → BARANGAY_CAPTAIN
            $keyName = strtoupper(str_replace('-', '_', $role->name));

            // Get list of permission names
            $permissions = $role->permissions->pluck('name')->toArray();

            // SUPER_ADMIN should always return "*"
            if ($role->name === 'super-admin') {
                $permissions = ['*'];
            }

            $output[$keyName] = $permissions;
        }

        return response()->json([
            'success' => true,
            'data' => $output
        ]);
    }

    /**
     * Update role permissions
     */
    public function updateRolePermissions(Request $request)
    {
        $request->validate([
            'role' => 'required|string|in:SUPER_ADMIN,ADMIN,BARANGAY_CAPTAIN,BARANGAY_SECRETARY,BARANGAY_TREASURER,BARANGAY_COUNCILOR,BARANGAY_CLERK,HEALTH_WORKER,SOCIAL_WORKER,SECURITY_OFFICER,DATA_ENCODER,VIEWER',
            'permissions' => 'required|array',
            'permissions.*' => 'string'
        ]);

        // For this demo, we'll return success
        // In a real implementation, you'd update the permissions in the database
        // and regenerate the middleware permission cache
        // Here you would typically sync the permissions with the role
        // $role->syncPermissions($request->permissions);

        $roleName = strtolower(str_replace('_', '-', $request->role));

        $role = Role::findByName($roleName, 'web');

        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }
      
        $role->syncPermissions($request->permissions);

        return response()->json([
            'success' => true,
            'message' => 'Role permissions updated successfully',
            'data' => [
                'role' => $request->role,
                'permissions' => $request->permissions
            ]
        ]);
    }

    /**
     * Get user permissions
     */
    public function getUserPermissions(Request $request, $userId): JsonResponse
    {
        $user = \App\Models\User::findOrFail($userId);
        
        $rolePermissions = $this->getRolePermissions()->getData()->data;
        $userPermissions = $rolePermissions->{$user->role} ?? [];

        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => $userId,
                'role' => $user->role,
                'permissions' => $userPermissions
            ]
        ]);
    }
}
