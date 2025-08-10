// ============================================================================
// hooks/usePermissionCheck.ts - Permission checking hook
// ============================================================================

import { useAuth } from '@/contexts/AuthContext';
import { permissionsService } from '@/services/permissions/permissions.service';
import { useUserPermissions } from '@/services/permissions/usePermissions';

export const usePermissionCheck = () => {
  const { user } = useAuth();
  const { data: userPermissions } = useUserPermissions(user?.id || '', !!user?.id);

  const hasPermission = (permission: string): boolean => {
    if (!userPermissions) return false;
    return permissionsService.hasPermission(userPermissions.permissions, permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!userPermissions) return false;
    return permissionsService.hasAnyPermission(userPermissions.permissions, permissions);
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!userPermissions) return false;
    return permissionsService.hasAllPermissions(userPermissions.permissions, permissions);
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return !!user && roles.includes(user.role);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    userPermissions: userPermissions?.permissions || [],
    userRole: user?.role
  };
};
