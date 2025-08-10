<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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
        $rolePermissions = [
            'SUPER_ADMIN' => ['*'], // All permissions
            'ADMIN' => [
                'view-residents', 'create-residents', 'edit-residents', 'delete-residents', 'export-residents',
                'view-households', 'create-households', 'edit-households', 'delete-households',
                'view-documents', 'create-documents', 'process-documents', 'approve-documents', 'release-documents', 'delete-documents',
                'view-projects', 'create-projects', 'edit-projects', 'delete-projects', 'manage-project-team',
                'view-complaints', 'create-complaints', 'assign-complaints', 'resolve-complaints',
                'view-suggestions', 'create-suggestions', 'review-suggestions',
                'view-blotter-cases', 'create-blotter-cases', 'investigate-blotter-cases', 'mediate-blotter-cases',
                'view-appointments', 'create-appointments', 'manage-appointments',
                'view-officials', 'create-officials', 'edit-officials', 'delete-officials',
                'view-reports', 'generate-reports', 'view-analytics',
                'manage-users', 'manage-roles', 'system-settings'
            ],
            'BARANGAY_CAPTAIN' => [
                'view-residents', 'create-residents', 'edit-residents', 'export-residents',
                'view-households', 'create-households', 'edit-households',
                'view-documents', 'create-documents', 'process-documents', 'approve-documents', 'release-documents',
                'view-projects', 'create-projects', 'edit-projects', 'manage-project-team',
                'view-complaints', 'assign-complaints', 'resolve-complaints',
                'view-suggestions', 'review-suggestions',
                'view-blotter-cases', 'create-blotter-cases', 'investigate-blotter-cases', 'mediate-blotter-cases',
                'view-appointments', 'create-appointments', 'manage-appointments',
                'view-officials', 'create-officials', 'edit-officials',
                'view-reports', 'generate-reports', 'view-analytics'
            ],
            'BARANGAY_SECRETARY' => [
                'view-residents', 'create-residents', 'edit-residents',
                'view-households', 'create-households', 'edit-households',
                'view-documents', 'create-documents', 'process-documents', 'release-documents',
                'view-appointments', 'create-appointments', 'manage-appointments',
                'view-complaints', 'create-complaints',
                'view-reports'
            ],
            'BARANGAY_TREASURER' => [
                'view-residents', 'view-households',
                'view-documents', 'create-documents', 'process-documents',
                'view-appointments', 'create-appointments',
                'view-reports', 'generate-reports'
            ],
            'BARANGAY_COUNCILOR' => [
                'view-residents', 'view-households',
                'view-documents', 'create-documents',
                'view-projects', 'view-complaints',
                'view-suggestions', 'review-suggestions',
                'view-blotter-cases', 'mediate-blotter-cases',
                'view-appointments',
                'view-reports'
            ],
            'BARANGAY_CLERK' => [
                'view-residents', 'create-residents', 'edit-residents',
                'view-households', 'create-households', 'edit-households',
                'view-documents', 'create-documents', 'process-documents',
                'view-appointments', 'create-appointments',
                'view-complaints', 'create-complaints'
            ],
            'HEALTH_WORKER' => [
                'view-residents', 'edit-residents',
                'view-households',
                'view-documents', 'create-documents',
                'view-appointments', 'create-appointments'
            ],
            'SOCIAL_WORKER' => [
                'view-residents', 'edit-residents',
                'view-households',
                'view-documents', 'create-documents',
                'view-appointments', 'create-appointments',
                'view-complaints', 'create-complaints'
            ],
            'SECURITY_OFFICER' => [
                'view-residents',
                'view-blotter-cases', 'create-blotter-cases', 'investigate-blotter-cases',
                'view-complaints', 'create-complaints'
            ],
            'DATA_ENCODER' => [
                'view-residents', 'create-residents', 'edit-residents',
                'view-households', 'create-households', 'edit-households',
                'view-documents', 'create-documents'
            ],
            'VIEWER' => [
                'view-residents', 'view-households', 'view-documents',
                'view-appointments', 'view-complaints', 'view-suggestions'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $rolePermissions
        ]);
    }

    /**
     * Update role permissions
     */
    public function updateRolePermissions(Request $request): JsonResponse
    {
        $request->validate([
            'role' => 'required|string|in:SUPER_ADMIN,ADMIN,BARANGAY_CAPTAIN,BARANGAY_SECRETARY,BARANGAY_TREASURER,BARANGAY_COUNCILOR,BARANGAY_CLERK,HEALTH_WORKER,SOCIAL_WORKER,SECURITY_OFFICER,DATA_ENCODER,VIEWER',
            'permissions' => 'required|array',
            'permissions.*' => 'string'
        ]);

        // For this demo, we'll return success
        // In a real implementation, you'd update the permissions in the database
        // and regenerate the middleware permission cache

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
