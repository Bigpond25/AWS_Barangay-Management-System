// ============================================================================
// components/permissions/PermissionManagementPage.tsx - Permission management interface
// ============================================================================

import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Users, 
  Lock, 
  Save, 
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { usePermissions, useRolePermissions, useUpdateRolePermissions } from '@/services/permissions/usePermissions';
import { 
  UserRole,
  ROLE_DISPLAY_NAMES,
  CATEGORY_DISPLAY_NAMES
} from '@/services/permissions/permissions.types';

const PermissionManagementPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('VIEWER');
  const [editedPermissions, setEditedPermissions] = useState<Partial<Record<UserRole, string[]>>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: permissions, isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useRolePermissions();
  const updateRolePermissionsMutation = useUpdateRolePermissions();

  // Get current permissions for selected role
  const currentPermissions = useMemo(() => {
    if (!rolePermissions) return [];
    return editedPermissions[selectedRole] || rolePermissions[selectedRole] || [];
  }, [rolePermissions, editedPermissions, selectedRole]);

  // Handle permission toggle
  const handlePermissionToggle = (permission: string) => {
    const updatedPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];

    setEditedPermissions(prev => ({
      ...prev,
      [selectedRole]: updatedPermissions
    }));
    setHasChanges(true);
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!editedPermissions[selectedRole]) return;

    try {
      await updateRolePermissionsMutation.mutateAsync({
        role: selectedRole,
        permissions: editedPermissions[selectedRole]
      });
      
      // Clear edited permissions for this role
      setEditedPermissions(prev => {
        const updated = { ...prev };
        delete updated[selectedRole];
        return updated;
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save permissions:', error);
    }
  };

  // Handle reset changes
  const handleResetChanges = () => {
    setEditedPermissions(prev => {
      const updated = { ...prev };
      delete updated[selectedRole];
      return updated;
    });
    setHasChanges(false);
  };

  // Handle role change
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setHasChanges(!!editedPermissions[role]);
  };

  if (permissionsLoading || rolePermissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Shield className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Permission Management</h1>
            <p className="text-gray-600">Configure access permissions for different user roles</p>
          </div>
        </div>

        {hasChanges && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
              <span className="text-amber-800">You have unsaved changes</span>
              <div className="ml-auto flex space-x-2">
                <button
                  onClick={handleResetChanges}
                  className="btn-secondary btn-sm flex items-center"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={updateRolePermissionsMutation.isPending}
                  className="btn-primary btn-sm flex items-center"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {updateRolePermissionsMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Roles
            </h2>
            <div className="space-y-2">
              {Object.entries(ROLE_DISPLAY_NAMES).map(([role, displayName]) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role as UserRole)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedRole === role
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  } ${editedPermissions[role as UserRole] ? 'border-l-4 border-l-amber-400' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{displayName}</span>
                    {editedPermissions[role as UserRole] && (
                      <div className="w-2 h-2 bg-amber-400 rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Permissions for {ROLE_DISPLAY_NAMES[selectedRole]}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure what actions this role can perform in the system
              </p>
            </div>

            <div className="p-6">
              {permissions && Object.entries(permissions).map(([category, categoryPermissions]) => (
                <div key={category} className="mb-8 last:mb-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-gray-500" />
                    {CATEGORY_DISPLAY_NAMES[category] || category}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(categoryPermissions).map(([permission, label]) => {
                      const isChecked = currentPermissions.includes(permission);
                      const isSuperAdmin = selectedRole === 'SUPER_ADMIN';
                      
                      return (
                        <label
                          key={permission}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-green-50 border-green-200 text-green-900'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          } ${isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSuperAdmin || isChecked}
                            onChange={() => !isSuperAdmin && handlePermissionToggle(permission)}
                            disabled={isSuperAdmin}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center">
                              <span className="text-sm font-medium">
                                {label}
                              </span>
                              {isChecked && (
                                <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{permission}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {selectedRole === 'SUPER_ADMIN' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 text-sm">
                      Super Admin has all permissions by default and cannot be modified.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionManagementPage;
