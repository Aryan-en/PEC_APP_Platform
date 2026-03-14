"use client";

import { useState } from 'react';
import { RolePermissions, UserRole, getRolePermissions } from '@/lib/rolePermissions';

export interface CurrentUser {
  uid: string;
  email: string | null;
  fullName: string | null;
  role: UserRole;
  department?: string;
  permissions: RolePermissions;
  avatar: string | null;
  verified: boolean;
  profileComplete: boolean;
  organizationId?: string | null;
  semester?: number | null;
}

interface UseAuthResult {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Mock demo user — always authenticated
const DEMO_USER: CurrentUser = {
  uid: 'demo-user-001',
  email: 'demo@PEC App.edu',
  fullName: 'Arjun Singh',
  role: 'student',
  department: 'Computer Science',
  permissions: getRolePermissions('student'),
  avatar: null,
  verified: true,
  profileComplete: true,
  organizationId: 'demo-org-001',
  semester: 6,
};

export function useAuth(): UseAuthResult {
  const [user] = useState<CurrentUser | null>(DEMO_USER);

  return {
    user,
    loading: false,
    error: null,
    isAuthenticated: true,
  };
}

// Hook to check specific permission
export function useHasPermission(requiredPermission: keyof RolePermissions): boolean {
  const { user } = useAuth();
  return user?.permissions[requiredPermission] ?? false;
}

// Hook to check multiple permissions (AND)
export function useHasAllPermissions(requiredPermissions: (keyof RolePermissions)[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return requiredPermissions.every(perm => user.permissions[perm]);
}

// Hook to check multiple permissions (OR)
export function useHasAnyPermission(requiredPermissions: (keyof RolePermissions)[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return requiredPermissions.some(perm => user.permissions[perm]);
}

// Hook to check user role
export function useUserRole(): UserRole | null {
  const { user } = useAuth();
  return user?.role ?? null;
}

// Hook to check if user is specific role
export function useIsRole(role: UserRole | UserRole[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  if (Array.isArray(role)) {
    return role.includes(user?.role);
  }
  return user?.role === role;
}
