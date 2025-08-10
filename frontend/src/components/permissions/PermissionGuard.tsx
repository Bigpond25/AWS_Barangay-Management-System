// ============================================================================
// components/permissions/PermissionGuard.tsx - Route permission guard
// ============================================================================

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { permissionsService } from '@/services/permissions/permissions.service';
import { useUserPermissions } from '@/services/permissions/usePermissions';
import { Lock, AlertTriangle } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  roles?: string[];
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback,
  roles = []
}) => {
  const { user, isAuthenticated } = useAuth();
  const { data: userPermissions } = useUserPermissions(user?.id || '', !!user?.id);

  // If not authenticated, don't render anything
  if (!isAuthenticated || !user) {
    return fallback || <AccessDenied message="Authentication required" />;
  }

  // Role-based check
  if (roles.length > 0 && !roles.includes(user.role)) {
    return fallback || <AccessDenied message="Insufficient role permissions" />;
  }

  // Permission-based check
  if (permission || permissions.length > 0) {
    if (!userPermissions) {
      return <LoadingPermissions />;
    }

    const userPerms = userPermissions.permissions || [];
    let hasAccess = false;

    if (permission) {
      hasAccess = permissionsService.hasPermission(userPerms, permission);
    } else if (permissions.length > 0) {
      hasAccess = requireAll
        ? permissionsService.hasAllPermissions(userPerms, permissions)
        : permissionsService.hasAnyPermission(userPerms, permissions);
    } else {
      hasAccess = true; // No specific permissions required
    }

    if (!hasAccess) {
      return fallback || <AccessDenied message="Insufficient permissions" />;
    }
  }

  return <>{children}</>;
};

// Loading component
const LoadingPermissions: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center space-x-3">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span className="text-gray-600">Checking permissions...</span>
    </div>
  </div>
);

// Access denied component
interface AccessDeniedProps {
  message?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ message = "Access denied" }) => (
  <div className="flex items-center justify-center min-h-96">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
        <Lock className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
      <p className="text-sm text-gray-600 mb-4">{message}</p>
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
        <AlertTriangle className="h-4 w-4" />
        <span>Contact your administrator if you believe this is an error</span>
      </div>
    </div>
  </div>
);

export default PermissionGuard;
