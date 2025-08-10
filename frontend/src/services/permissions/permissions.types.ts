// ============================================================================
// services/permissions/permissions.types.ts - Permission types and schemas
// ============================================================================

import { z } from 'zod';

// Permission definition schema
export const PermissionSchema = z.object({
  key: z.string(),
  label: z.string(),
  category: z.string(),
});

// Role permissions schema
export const RolePermissionsSchema = z.object({
  role: z.string(),
  permissions: z.array(z.string()),
});

// Permission category schema
export const PermissionCategorySchema = z.record(z.record(z.string()));

// User roles enum
export const UserRoleSchema = z.enum([
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
  'VIEWER'
]);

// Type exports
export type Permission = z.infer<typeof PermissionSchema>;
export type RolePermissions = z.infer<typeof RolePermissionsSchema>;
export type PermissionCategory = z.infer<typeof PermissionCategorySchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;

// Role display mapping
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  'SUPER_ADMIN': 'Super Administrator',
  'ADMIN': 'Administrator',
  'BARANGAY_CAPTAIN': 'Barangay Captain',
  'BARANGAY_SECRETARY': 'Barangay Secretary',
  'BARANGAY_TREASURER': 'Barangay Treasurer',
  'BARANGAY_COUNCILOR': 'Barangay Councilor',
  'BARANGAY_CLERK': 'Barangay Clerk',
  'HEALTH_WORKER': 'Health Worker',
  'SOCIAL_WORKER': 'Social Worker',
  'SECURITY_OFFICER': 'Security Officer',
  'DATA_ENCODER': 'Data Encoder',
  'VIEWER': 'Viewer'
};

// Category display mapping
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'residents': 'Residents Management',
  'households': 'Households Management',
  'documents': 'Document Processing',
  'projects': 'Project Management',
  'help_desk': 'Help Desk & Support',
  'blotters': 'Blotter Management',
  'appointments': 'Appointment Management',
  'officials': 'Barangay Officials',
  'reports': 'Reports & Analytics',
  'system': 'System Administration'
};

// Permission helper functions
export const formatPermissionName = (permission: string): string => {
  return permission.replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

export const getCategoryFromPermission = (permission: string): string => {
  if (permission.includes('resident')) return 'residents';
  if (permission.includes('household')) return 'households';
  if (permission.includes('document')) return 'documents';
  if (permission.includes('project')) return 'projects';
  if (permission.includes('complaint') || permission.includes('suggestion')) return 'help_desk';
  if (permission.includes('blotter')) return 'blotters';
  if (permission.includes('appointment')) return 'appointments';
  if (permission.includes('official')) return 'officials';
  if (permission.includes('report') || permission.includes('analytic')) return 'reports';
  if (permission.includes('user') || permission.includes('role') || permission.includes('setting')) return 'system';
  return 'other';
};
