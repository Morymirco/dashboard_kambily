// Types pour les rôles utilisateur
export type UserRole = 
  | 'customer'
  | 'manager'
  | 'product_manager'
  | 'marketin_gmanager' // Note: il y a une faute de frappe dans votre backend
  | 'finance_manager'
  | 'client_manager'
  | 'logistic_manager'
  | 'admin';

// Types pour les permissions
export type Permission = 
  // Permissions générales
  | 'dashboard:view'
  
  // Permissions produits
  | 'products:view'
  | 'products:create'
  | 'products:edit'
  | 'products:delete'
  | 'products:manage_variants'
  
  // Permissions commandes
  | 'orders:view'
  | 'orders:manage'
  | 'orders:export'
  
  // Permissions utilisateurs
  | 'users:view'
  | 'users:manage'
  
  // Permissions partenaires
  | 'partners:view'
  | 'partners:manage'
  
  // Permissions marketing
  | 'marketing:view'
  | 'marketing:manage'
  | 'promocodes:view'
  | 'promocodes:manage'
  
  // Permissions finances
  | 'finance:view'
  | 'finance:manage'
  
  // Permissions logistique
  | 'logistics:view'
  | 'logistics:manage'
  
  // Permissions avis
  | 'reviews:view'
  | 'reviews:manage';

// Interface pour les permissions par rôle
export interface RolePermissions {
  [key: string]: Permission[];
}

// Configuration des permissions par rôle
export const ROLE_PERMISSIONS: RolePermissions = {
  // Admin a toutes les permissions
  admin: [
    'dashboard:view',
    'products:view', 'products:create', 'products:edit', 'products:delete', 'products:manage_variants',
    'orders:view', 'orders:manage', 'orders:export',
    'users:view', 'users:manage',
    'partners:view', 'partners:manage',
    'marketing:view', 'marketing:manage', 'promocodes:view', 'promocodes:manage',
    'finance:view', 'finance:manage',
    'logistics:view', 'logistics:manage',
    'reviews:view', 'reviews:manage'
  ],
  
  // Manager a la plupart des permissions
  manager: [
    'dashboard:view',
    'products:view', 'products:create', 'products:edit', 'products:manage_variants',
    'orders:view', 'orders:manage', 'orders:export',
    'users:view',
    'partners:view', 'partners:manage',
    'marketing:view', 'marketing:manage', 'promocodes:view', 'promocodes:manage',
    'finance:view',
    'logistics:view',
    'reviews:view', 'reviews:manage'
  ],
  
  // Product Manager - focus sur les produits
  product_manager: [
    'dashboard:view',
    'products:view', 'products:create', 'products:edit', 'products:manage_variants',
    'orders:view',
    'reviews:view'
  ],
  
  // Marketing Manager - focus sur le marketing
  marketin_gmanager: [
    'dashboard:view',
    'products:view',
    'marketing:view', 'marketing:manage',
    'promocodes:view', 'promocodes:manage',
    'reviews:view', 'reviews:manage'
  ],
  
  // Finance Manager - focus sur les finances
  finance_manager: [
    'dashboard:view',
    'orders:view', 'orders:export',
    'finance:view', 'finance:manage'
  ],
  
  // Client Manager - focus sur les clients
  client_manager: [
    'dashboard:view',
    'users:view', 'users:manage',
    'orders:view',
    'reviews:view'
  ],
  
  // Logistic Manager - focus sur la logistique
  logistic_manager: [
    'dashboard:view',
    'orders:view', 'orders:manage',
    'logistics:view', 'logistics:manage'
  ],
  
  // Customer - permissions limitées
  customer: [
    'dashboard:view'
  ]
};

// Interface pour le hook de permissions
export interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  userRole: UserRole | null;
  userPermissions: Permission[];
} 