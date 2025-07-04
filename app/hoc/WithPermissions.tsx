import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission, UserRole } from '@/lib/types/permissions';

interface WithPermissionsOptions {
  permission?: Permission;
  permissions?: Permission[];
  role?: UserRole;
  roles?: UserRole[];
  requireAll?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export default function WithPermissions<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithPermissionsOptions = {}
) {
  return function WithPermissionsComponent(props: P) {
    const { user, loading } = useAuth();
    const { 
      hasPermission, 
      hasRole, 
      hasAnyRole, 
      hasAllPermissions, 
      hasAnyPermission 
    } = usePermissions();
    const router = useRouter();

    const {
      permission,
      permissions,
      role,
      roles,
      requireAll = false,
      redirectTo = '/unauthorized',
      fallback
    } = options;

    const isAuthenticated = !!user;

    // Vérifier les permissions
    const checkAccess = () => {
      if (!isAuthenticated) return false;

      if (permission) {
        return hasPermission(permission);
      } else if (permissions) {
        return requireAll 
          ? hasAllPermissions(permissions)
          : hasAnyPermission(permissions);
      } else if (role) {
        return hasRole(role);
      } else if (roles) {
        return hasAnyRole(roles);
      }
      
      // Si aucune condition n'est spécifiée, autoriser l'accès
      return true;
    };

    const hasAccess = checkAccess();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/login');
      } else if (!loading && isAuthenticated && !hasAccess) {
        router.push(redirectTo);
      }
    }, [isAuthenticated, hasAccess, loading, router, redirectTo]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Vérification des permissions...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Ne rien afficher pendant la redirection
    }

    if (!hasAccess) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-4xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// HOCs spécialisés pour des cas d'usage courants
export const withProductPermissions = <P extends object>(
  Component: React.ComponentType<P>
) => WithPermissions(Component, {
  permissions: ['products:view', 'products:create', 'products:edit', 'products:delete'],
  redirectTo: '/unauthorized'
});

export const withOrderPermissions = <P extends object>(
  Component: React.ComponentType<P>
) => WithPermissions(Component, {
  permissions: ['orders:view', 'orders:manage'],
  redirectTo: '/unauthorized'
});

export const withUserPermissions = <P extends object>(
  Component: React.ComponentType<P>
) => WithPermissions(Component, {
  permissions: ['users:view', 'users:manage'],
  redirectTo: '/unauthorized'
});

export const withMarketingPermissions = <P extends object>(
  Component: React.ComponentType<P>
) => WithPermissions(Component, {
  permissions: ['marketing:view', 'marketing:manage', 'promocodes:view', 'promocodes:manage'],
  redirectTo: '/unauthorized'
});

export const withFinancePermissions = <P extends object>(
  Component: React.ComponentType<P>
) => WithPermissions(Component, {
  permissions: ['finance:view', 'finance:manage'],
  redirectTo: '/unauthorized'
});

export const withLogisticsPermissions = <P extends object>(
  Component: React.ComponentType<P>
) => WithPermissions(Component, {
  permissions: ['logistics:view', 'logistics:manage'],
  redirectTo: '/unauthorized'
});

export const withAdminOnly = <P extends object>(
  Component: React.ComponentType<P>
) => WithPermissions(Component, {
  role: 'admin',
  redirectTo: '/unauthorized'
});

export const withManagerOrAdmin = <P extends object>(
  Component: React.ComponentType<P>
) => WithPermissions(Component, {
  roles: ['admin', 'manager'],
  redirectTo: '/unauthorized'
}); 