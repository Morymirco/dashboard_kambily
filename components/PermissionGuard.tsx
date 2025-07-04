import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission, UserRole } from '@/lib/types/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  role?: UserRole;
  roles?: UserRole[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // true = toutes les permissions/rôles, false = au moins une
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  role,
  roles,
  fallback = null,
  requireAll = false
}) => {
  const { 
    hasPermission, 
    hasRole, 
    hasAnyRole, 
    hasAllPermissions, 
    hasAnyPermission 
  } = usePermissions();

  // Vérifier les permissions
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else if (role) {
    hasAccess = hasRole(role);
  } else if (roles) {
    hasAccess = hasAnyRole(roles);
  } else {
    // Si aucune condition n'est spécifiée, autoriser l'accès
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Composants spécialisés pour des cas d'usage courants
export const ProductPermissionGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    permissions={['products:view', 'products:create', 'products:edit', 'products:delete']} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const OrderPermissionGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    permissions={['orders:view', 'orders:manage']} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const UserPermissionGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    permissions={['users:view', 'users:manage']} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const MarketingPermissionGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    permissions={['marketing:view', 'marketing:manage', 'promocodes:view', 'promocodes:manage']} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const FinancePermissionGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    permissions={['finance:view', 'finance:manage']} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const LogisticsPermissionGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    permissions={['logistics:view', 'logistics:manage']} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const AdminOnlyGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    role="admin" 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const ManagerOrAdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    roles={['admin', 'manager']} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
); 