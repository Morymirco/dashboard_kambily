import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { 
  Permission, 
  UserRole, 
  ROLE_PERMISSIONS, 
  UsePermissionsReturn 
} from '@/lib/types/permissions';

export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuth();

  const userRole = useMemo((): UserRole | null => {
    if (!user?.role) return null;
    
    // Normaliser le rôle (gérer les variations possibles)
    const normalizedRole = user.role.toLowerCase().trim();
    
    // Mapper les rôles possibles
    const roleMap: Record<string, UserRole> = {
      'admin': 'admin',
      'manager': 'manager',
      'product_manager': 'product_manager',
      'product manager': 'product_manager',
      'marketing_manager': 'marketin_gmanager', // Corriger la faute de frappe du backend
      'marketing manager': 'marketin_gmanager',
      'marketin_gmanager': 'marketin_gmanager',
      'finance_manager': 'finance_manager',
      'finance manager': 'finance_manager',
      'client_manager': 'client_manager',
      'client manager': 'client_manager',
      'logistic_manager': 'logistic_manager',
      'logistic manager': 'logistic_manager',
      'logistics_manager': 'logistic_manager',
      'logistics manager': 'logistic_manager',
      'customer': 'customer'
    };

    return roleMap[normalizedRole] || null;
  }, [user?.role]);

  const userPermissions = useMemo((): Permission[] => {
    if (!userRole) return [];
    return ROLE_PERMISSIONS[userRole] || [];
  }, [userRole]);

  const hasPermission = (permission: Permission): boolean => {
    if (!userRole) return false;
    return userPermissions.includes(permission);
  };

  const hasRole = (role: UserRole): boolean => {
    return userRole === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!userRole) return false;
    return roles.includes(userRole);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!userRole) return false;
    return permissions.every(permission => userPermissions.includes(permission));
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!userRole) return false;
    return permissions.some(permission => userPermissions.includes(permission));
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllPermissions,
    hasAnyPermission,
    userRole,
    userPermissions
  };
}; 