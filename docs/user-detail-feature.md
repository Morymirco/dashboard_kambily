# Fonctionnalité Détails Utilisateur

## Vue d'ensemble

Cette fonctionnalité permet d'afficher les détails complets d'un utilisateur spécifique dans le dashboard Kambily. Elle est protégée par un système de permissions et accessible via l'API backend.

## Endpoint API

### Récupération des détails d'un utilisateur

```http
GET /accounts/admin/user/<user_id>/
```

**Permissions requises :** Admin, Manager ou Client Manager  
**Description :** Récupère les détails d'un utilisateur spécifique

**Réponse :**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "0612345678",
  "role": "Client",
  "is_active": true,
  "is_confirmed": true,
  "date_joined": "2025-01-15T10:30:00Z"
}
```

## Implémentation Frontend

### 1. Hook API

Le hook `useUserDetail` gère la récupération des données :

```tsx
import { useUserDetail } from '@/hooks/api/users'

const UserDetailPage = () => {
  const { data: user, isLoading, isError, error } = useUserDetail(userId)
  
  // Utilisation des données...
}
```

### 2. Service Backend

Le service `getUserDetail` gère l'appel API :

```tsx
import { getUserDetail } from '@/lib/services/users.service'

export const getUserDetail = async (userId: string) => {
  const response = await fetch(
    `${API_BASE_URL}/accounts/admin/user/${userId}/`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )
  
  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`)
  }
  
  return response.json()
}
```

### 3. Types TypeScript

```tsx
export interface UserDetail {
  id: number
  email: string
  first_name: string
  last_name: string
  phone_number: string
  role: string
  is_active: boolean
  is_confirmed: boolean
  date_joined: string
}
```

## Page de Détails

### Route
```
/utilisateurs/[id]
```

### Composants

#### 1. Header avec Navigation
- Bouton retour vers la liste des utilisateurs
- Nom complet de l'utilisateur
- Bouton "Modifier" (si permissions)

#### 2. Informations Personnelles
- Email
- Téléphone
- Date d'inscription

#### 3. Statut et Permissions
- Rôle utilisateur (avec badge coloré)
- Statut du compte (Actif/Inactif)
- Confirmation email (Confirmé/Non confirmé)

#### 4. Actions Disponibles
- Envoyer un message
- Modifier les permissions
- Voir l'historique

## Permissions

### Protection de la Page
La page est protégée par le HOC `withUserPermissions` :

```tsx
export default withUserPermissions(UserDetailPage)
```

### Permissions Requises
- `users:view` - Pour voir les détails
- `users:manage` - Pour modifier l'utilisateur

### Actions Conditionnelles
```tsx
<PermissionGuard permissions={['users:manage']}>
  <Button>Modifier</Button>
</PermissionGuard>
```

## Navigation

### Depuis la Liste des Utilisateurs
1. Cliquer sur "Voir les détails" dans le menu d'actions
2. Ou cliquer directement sur le nom de l'utilisateur

### Menu d'Actions dans la Liste
```tsx
<DropdownMenuItem onClick={() => navigateToUserDetail(user.id)}>
  <Eye className="mr-2 h-4 w-4" />
  Voir les détails
</DropdownMenuItem>
```

## États de l'Interface

### 1. Chargement
- Skeleton loaders pour les informations
- Message "Vérification des permissions..."

### 2. Erreur
- Message d'erreur explicite
- Bouton "Réessayer"
- Bouton retour à la liste

### 3. Utilisateur Non Trouvé
- Message informatif
- Suggestion de retour à la liste

### 4. Données Chargées
- Affichage complet des informations
- Actions disponibles selon les permissions

## Fonctionnalités

### 1. Affichage des Informations
- **Informations personnelles** : nom, email, téléphone
- **Statut du compte** : actif/inactif, email confirmé
- **Rôle utilisateur** : avec badge coloré selon le rôle
- **Date d'inscription** : formatée en français

### 2. Actions Disponibles
- **Modifier** : redirection vers la page de modification
- **Envoyer un message** : (à implémenter)
- **Modifier les permissions** : (à implémenter)
- **Voir l'historique** : (à implémenter)

### 3. Navigation
- **Retour** : vers la liste des utilisateurs
- **Modifier** : vers la page de modification

## Tests

### Tests Unitaires
Le fichier `__tests__/user-detail.test.tsx` contient les tests pour :

1. **Affichage des données** : vérification que les informations s'affichent correctement
2. **États de chargement** : vérification des skeletons et messages
3. **Gestion des erreurs** : vérification des messages d'erreur
4. **Utilisateur inexistant** : vérification du message approprié
5. **Permissions** : vérification de l'affichage conditionnel des actions

### Exécution des Tests
```bash
npm test user-detail.test.tsx
```

## Sécurité

### 1. Authentification
- Vérification du token d'authentification
- Redirection vers login si non authentifié

### 2. Autorisation
- Vérification des permissions côté client
- Protection des routes avec HOC
- Actions conditionnelles selon les rôles

### 3. Validation
- Vérification de l'existence de l'utilisateur
- Gestion des erreurs API
- Messages d'erreur appropriés

## Améliorations Futures

### 1. Fonctionnalités à Ajouter
- **Historique des connexions** : dates et heures des dernières connexions
- **Statistiques utilisateur** : nombre de commandes, montant total
- **Adresses de livraison** : liste des adresses enregistrées
- **Commandes récentes** : dernières commandes de l'utilisateur

### 2. Actions à Implémenter
- **Envoi de message** : système de messagerie interne
- **Modification des permissions** : interface pour changer les rôles
- **Export des données** : téléchargement des informations utilisateur
- **Suspension de compte** : désactivation temporaire

### 3. Interface
- **Onglets** : séparer les informations par catégories
- **Graphiques** : visualisation des statistiques
- **Recherche** : recherche dans l'historique
- **Filtres** : filtrer les données affichées

## Dépendances

### Hooks
- `useUserDetail` : récupération des données
- `usePermissions` : vérification des permissions
- `useRouter` : navigation

### Composants
- `PermissionGuard` : protection conditionnelle
- `Card`, `Button`, `Badge` : interface utilisateur
- `Skeleton` : états de chargement

### Services
- `getUserDetail` : appel API
- `getAuthHeaders` : headers d'authentification

## Configuration

### Variables d'Environnement
```env
API_BASE_URL=http://localhost:8000/api
```

### Permissions Backend
Assurez-vous que les permissions suivantes sont configurées dans votre backend :
- `IsAdmin`
- `IsManager`
- `IsClientManager`

## Dépannage

### Problèmes Courants

1. **Erreur 403** : Vérifiez les permissions de l'utilisateur connecté
2. **Erreur 404** : L'utilisateur n'existe pas ou a été supprimé
3. **Erreur 401** : Token d'authentification expiré ou invalide
4. **Données manquantes** : Vérifiez la structure de la réponse API

### Logs
Vérifiez les logs du navigateur pour :
- Erreurs de requête API
- Problèmes de permissions
- Erreurs de rendu

### Debug
Utilisez les outils de développement pour :
- Vérifier les requêtes réseau
- Inspecter les états des hooks
- Tester les permissions 