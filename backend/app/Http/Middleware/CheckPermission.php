<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $permission
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $permission)
    {
        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        if (!$this->userHasPermission(auth()->user(), $permission)) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to access this resource',
                'required_permission' => $permission
            ], 403);
        }

        return $next($request);
    }

    /**
     * Check if user has the required permission based on role
     */
    private function userHasPermission($user, string $permission): bool
    {
        // Role-based permission mapping
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

        $userRole = $user->role;
        $permissions = $rolePermissions[$userRole] ?? [];

        // Super admin has all permissions
        if (in_array('*', $permissions)) {
            return true;
        }

        return in_array($permission, $permissions);
    }
}
