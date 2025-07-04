# Système de Permissions - Dashboard Kambily

## Vue d'ensemble

Le système de permissions du dashboard Kambily est basé sur les rôles utilisateur et permet de contrôler l'accès aux différentes fonctionnalités selon le rôle de l'utilisateur connecté.

## Rôles disponibles

### Rôles principaux
- **admin** : Accès complet à toutes les fonctionnalités
- **manager** : Accès étendu à la plupart des fonctionnalités
- **product_manager** : Focus sur la gestion des produits
- **marketin_gmanager** : Focus sur le marketing et les promotions
- **finance_manager** : Focus sur les finances et les commandes
- **client_manager** : Focus sur la gestion des clients
- **logistic_manager** : Focus sur la logistique et les commandes
- **customer** : Accès limité au dashboard

## Permissions disponibles

### Permissions générales
- `dashboard:view` - Accès au tableau de bord

### Permissions produits
- `products:view` - Voir les produits
- `products:create` - Créer des produits
- `products:edit` - Modifier des produits
- `products:delete` - Supprimer des produits
- `products:manage_variants` - Gérer les variantes de produits

### Permissions commandes
- `orders:view` - Voir les commandes
- `orders:manage` - Gérer les commandes
- `orders:export` - Exporter les commandes

### Permissions utilisateurs
- `users:view` - Voir les utilisateurs
- `users:manage` - Gérer les utilisateurs

### Permissions partenaires
- `partners:view` - Voir les partenaires
- `partners:manage` - Gérer les partenaires

### Permissions marketing
- `marketing:view` - Voir les outils marketing
- `marketing:manage` - Gérer les outils marketing
- `promocodes:view` - Voir les codes promo
- `promocodes:manage` - Gérer les codes promo

### Permissions finances
- `finance:view` - Voir les données financières
- `finance:manage` - Gérer les données financières

### Permissions logistique
- `logistics:view` - Voir les données logistiques
- `logistics:manage` - Gérer les données logistiques

### Permissions avis
- `reviews:view` - Voir les avis clients
- `reviews:manage` - Gérer les avis clients

## Utilisation

### 1. Hook usePermissions

Le hook `usePermissions` fournit toutes les fonctions nécessaires pour vérifier les permissions :

```tsx
import { usePermissions } from '@/hooks/usePermissions';

const MyComponent = () => {
  const { 
    hasPermission, 
    hasRole, 
    hasAnyRole, 
    hasAllPermissions, 
    hasAnyPermission,
    userRole,
    userPermissions 
  } = usePermissions();

  // Vérifier une permission spécifique
  if (hasPermission('products:create')) {
    // L'utilisateur peut créer des produits
  }

  // Vérifier un rôle spécifique
  if (hasRole('admin')) {
    // L'utilisateur est admin
  }

  // Vérifier plusieurs rôles (au moins un)
  if (hasAnyRole(['admin', 'manager'])) {
    // L'utilisateur est admin ou manager
  }

  // Vérifier plusieurs permissions (toutes requises)
  if (hasAllPermissions(['products:view', 'products:edit'])) {
    // L'utilisateur peut voir ET modifier les produits
  }

  // Vérifier plusieurs permissions (au moins une)
  if (hasAnyPermission(['products:view', 'products:create'])) {
    // L'utilisateur peut voir OU créer des produits
  }

  return (
    <div>
      <p>Rôle actuel : {userRole}</p>
      <p>Permissions : {userPermissions.join(', ')}</p>
    </div>
  );
};
```

### 2. Composant PermissionGuard

Le composant `PermissionGuard` permet de conditionner l'affichage d'éléments selon les permissions :

```tsx
import { PermissionGuard } from '@/components/PermissionGuard';

const MyComponent = () => {
  return (
    <div>
      {/* Protection par permission unique */}
      <PermissionGuard permission="products:create">
        <Button>Créer un produit</Button>
      </PermissionGuard>

      {/* Protection par plusieurs permissions (au moins une) */}
      <PermissionGuard permissions={['products:view', 'products:edit']}>
        <Button>Gérer les produits</Button>
      </PermissionGuard>

      {/* Protection par plusieurs permissions (toutes requises) */}
      <PermissionGuard 
        permissions={['products:view', 'products:edit']} 
        requireAll={true}
      >
        <Button>Action avancée</Button>
      </PermissionGuard>

      {/* Protection par rôle */}
      <PermissionGuard role="admin">
        <Button>Action admin</Button>
      </PermissionGuard>

      {/* Protection par plusieurs rôles */}
      <PermissionGuard roles={['admin', 'manager']}>
        <Button>Action manager+</Button>
      </PermissionGuard>

      {/* Avec fallback personnalisé */}
      <PermissionGuard 
        permission="products:delete"
        fallback={<p>Vous n'avez pas la permission de supprimer</p>}
      >
        <Button variant="destructive">Supprimer</Button>
      </PermissionGuard>
    </div>
  );
};
```

### 3. Composants spécialisés

Des composants spécialisés sont disponibles pour des cas d'usage courants :

```tsx
import { 
  ProductPermissionGuard,
  OrderPermissionGuard,
  UserPermissionGuard,
  MarketingPermissionGuard,
  FinancePermissionGuard,
  LogisticsPermissionGuard,
  AdminOnlyGuard,
  ManagerOrAdminGuard
} from '@/components/PermissionGuard';

const MyComponent = () => {
  return (
    <div>
      <ProductPermissionGuard>
        <Button>Action produit</Button>
      </ProductPermissionGuard>

      <OrderPermissionGuard>
        <Button>Action commande</Button>
      </OrderPermissionGuard>

      <AdminOnlyGuard>
        <Button>Action admin uniquement</Button>
      </AdminOnlyGuard>
    </div>
  );
};
```

### 4. HOC WithPermissions

Pour protéger des pages entières, utilisez le HOC `WithPermissions` :

```tsx
import WithPermissions from '@/app/hoc/WithPermissions';

const MyPage = () => {
  return <div>Contenu de la page</div>;
};

// Protection par permission
export default WithPermissions(MyPage, {
  permission: 'products:view'
});

// Protection par plusieurs permissions
export default WithPermissions(MyPage, {
  permissions: ['products:view', 'products:edit'],
  requireAll: false // au moins une permission
});

// Protection par rôle
export default WithPermissions(MyPage, {
  role: 'admin'
});

// Avec redirection personnalisée
export default WithPermissions(MyPage, {
  permission: 'products:create',
  redirectTo: '/custom-unauthorized'
});
```

### 5. HOCs spécialisés

Des HOCs spécialisés sont disponibles :

```tsx
import { 
  withProductPermissions,
  withOrderPermissions,
  withUserPermissions,
  withMarketingPermissions,
  withFinancePermissions,
  withLogisticsPermissions,
  withAdminOnly,
  withManagerOrAdmin
} from '@/app/hoc/WithPermissions';

const MyPage = () => {
  return <div>Contenu de la page</div>;
};

// Protection par domaine fonctionnel
export default withProductPermissions(MyPage);
export default withAdminOnly(MyPage);
export default withManagerOrAdmin(MyPage);
```

## Configuration des permissions par rôle

Les permissions sont définies dans `lib/types/permissions.ts` :

```tsx
export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    'dashboard:view',
    'products:view', 'products:create', 'products:edit', 'products:delete',
    // ... toutes les permissions
  ],
  product_manager: [
    'dashboard:view',
    'products:view', 'products:create', 'products:edit', 'products:manage_variants',
    'orders:view',
    'reviews:view'
  ],
  // ... autres rôles
};
```

## Bonnes pratiques

### 1. Protection en couches
- Protégez les routes avec des HOCs
- Protégez les composants avec PermissionGuard
- Vérifiez les permissions dans les hooks

### 2. Messages d'erreur appropriés
```tsx
<PermissionGuard 
  permission="products:delete"
  fallback={
    <div className="text-center p-4">
      <p className="text-muted-foreground">
        Vous n'avez pas la permission de supprimer des produits.
      </p>
    </div>
  }
>
  <Button variant="destructive">Supprimer</Button>
</PermissionGuard>
```

### 3. Vérification côté serveur
N'oubliez pas que les permissions côté client sont pour l'UX uniquement. 
Toujours vérifier les permissions côté serveur pour la sécurité.

### 4. Logs et monitoring
```tsx
const { hasPermission } = usePermissions();

const handleAction = () => {
  if (!hasPermission('products:delete')) {
    console.warn('Tentative d'accès non autorisé à products:delete');
    return;
  }
  // Action sécurisée
};
```

## Ajout de nouvelles permissions

1. Ajoutez la nouvelle permission dans `lib/types/permissions.ts`
2. Mettez à jour `ROLE_PERMISSIONS` pour assigner la permission aux rôles appropriés
3. Utilisez la permission dans vos composants avec `PermissionGuard` ou `usePermissions`

## Dépannage

### Problème : Les permissions ne fonctionnent pas
- Vérifiez que l'utilisateur a bien un rôle défini
- Vérifiez que le rôle est correctement mappé dans `usePermissions`
- Vérifiez que les permissions sont bien assignées au rôle

### Problème : Rôle non reconnu
- Ajoutez le mapping du rôle dans `usePermissions`
- Vérifiez la normalisation du rôle (minuscules, espaces, etc.)

### Problème : Permission manquante
- Ajoutez la permission dans `ROLE_PERMISSIONS`
- Vérifiez l'orthographe de la permission 