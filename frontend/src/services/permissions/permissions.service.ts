// ============================================================================
// services/permissions/permissions.service.ts - Permission service
// ============================================================================

import { BaseApiService } from '@/services/__shared/api';
import { ApiResponseSchema } from '@/services/__shared/types';
import { 
  PermissionCategorySchema,
  RolePermissionsSchema,
  type PermissionCategory,
  type RolePermissions,
  type UserRole
} from './permissions.types';
import { z } from 'zod';

export class PermissionsService extends BaseApiService {
  protected basePath = '/permissions';

  /**
   * Get all available permissions grouped by category
   */
  async getPermissions(): Promise<PermissionCategory> {
    const responseSchema = ApiResponseSchema(PermissionCategorySchema);
    
    const response = await this.request(`${this.basePath}`, responseSchema, {
      method: 'GET',
    });

    if (!response.data) {
      throw new Error('Failed to fetch permissions');
    }

    return response.data;
  }

  /**
   * Get role permissions mapping
   */
  async getRolePermissions(): Promise<Record<UserRole, string[]>> {
    const responseSchema = ApiResponseSchema(z.record(z.array(z.string())));
    
    const response = await this.request(`${this.basePath}/roles`, responseSchema, {
      method: 'GET',
    });

    if (!response.data) {
      throw new Error('Failed to fetch role permissions');
    }

    return response.data as Record<UserRole, string[]>;
  }

  /**
   * Update role permissions
   */
  async updateRolePermissions(role: UserRole, permissions: string[]): Promise<RolePermissions> {
    const responseSchema = ApiResponseSchema(RolePermissionsSchema);
    
    const response = await this.request(`${this.basePath}/roles/${role}`, responseSchema, {
      method: 'PUT',
      data: {
        role,
        permissions
      },
    });

    if (!response.data) {
      throw new Error('Failed to update role permissions');
    }

    return response.data;
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string): Promise<{
    user_id: string;
    role: UserRole;
    permissions: string[];
  }> {
    const responseSchema = ApiResponseSchema(z.object({
      user_id: z.string(),
      role: z.string() as z.ZodType<UserRole>,
      permissions: z.array(z.string()),
    }));
    
    const response = await this.request(`${this.basePath}/users/${userId}`, responseSchema, {
      method: 'GET',
    });

    if (!response.data) {
      throw new Error('Failed to fetch user permissions');
    }

    return response.data;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(userPermissions: string[], permission: string): boolean {
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(userPermissions: string[], permissions: string[]): boolean {
    if (userPermissions.includes('*')) return true;
    return permissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(userPermissions: string[], permissions: string[]): boolean {
    if (userPermissions.includes('*')) return true;
    return permissions.every(permission => userPermissions.includes(permission));
  }
}

// Create singleton instance
export const permissionsService = new PermissionsService();
