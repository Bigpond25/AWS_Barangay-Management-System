// ============================================================================
// services/permissions/usePermissions.ts - React Query hooks for permissions
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionsService } from './permissions.service';
import type { UserRole, RolePermissions } from './permissions.types';

// Query keys
export const permissionsKeys = {
  all: ['permissions'] as const,
  permissions: () => [...permissionsKeys.all, 'list'] as const,
  rolePermissions: () => [...permissionsKeys.all, 'roles'] as const,
  userPermissions: (userId: string) => [...permissionsKeys.all, 'user', userId] as const,
};

/**
 * Get all available permissions
 */
export function usePermissions() {
  return useQuery({
    queryKey: permissionsKeys.permissions(),
    queryFn: () => permissionsService.getPermissions(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Get role permissions mapping
 */
export function useRolePermissions() {
  return useQuery({
    queryKey: permissionsKeys.rolePermissions(),
    queryFn: () => permissionsService.getRolePermissions(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Get user permissions
 */
export function useUserPermissions(userId: string, enabled = true) {
  return useQuery({
    queryKey: permissionsKeys.userPermissions(userId),
    queryFn: () => permissionsService.getUserPermissions(userId),
    enabled: enabled && !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Update role permissions mutation
 */
export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ role, permissions }: { role: UserRole; permissions: string[] }) =>
      permissionsService.updateRolePermissions(role, permissions),
    onSuccess: (data: RolePermissions) => {
      // Invalidate and refetch role permissions
      queryClient.invalidateQueries({ queryKey: permissionsKeys.rolePermissions() });
      
      // Invalidate user permissions for all users with this role
      queryClient.invalidateQueries({ 
        queryKey: permissionsKeys.all,
        predicate: (query) => query.queryKey.includes('user')
      });

      console.log(`Permissions for ${data.role} have been updated successfully`);
    },
    onError: (error) => {
      console.error('Update Role Permissions Error:', error);
    },
  });
}
