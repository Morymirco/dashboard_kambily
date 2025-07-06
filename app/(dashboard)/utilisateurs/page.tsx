"use client"

import { useEffect, useState, useMemo } from "react"
import { Search, UserPlus, MoreHorizontal, Mail, Phone, Loader2, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Eye, EyeOff, Trash2 } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { User,SortConfig } from "@/lib/types/users_list"
import { fetchUsers, updateUserStatus, deleteUser } from "@/services/user-service"

import { Skeleton } from "@/components/ui/skeleton"
import { useUsers } from "@/hooks/api/users"
import { PermissionGuard } from "@/components/PermissionGuard"
import { usePermissions } from "@/hooks/usePermissions"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { ROLE_PERMISSIONS, UserRole } from '@/lib/types/permissions'
import { getAxiosConfig } from "@/constants/client"
import { API_URL } from "@/constants"

export default function UtilisateursPage() {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [processingUser, setProcessingUser] = useState<number | null>(null)
  const itemsPerPage = 10 // Nombre d'éléments par page
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "created_at",
    direction: "desc"
  })

  const { data: usersData, isLoading: isLoadingUsers } = useUsers()

  // Définir la fonction ici pour qu'elle soit accessible dans columns
  const navigateToUserDetail = (userId: number) => {
    router.push(`/utilisateurs/${userId}`)
  }

  // Effet pour le debounce de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (usersData) {
      setUsers(usersData)
    }
    setLoading(false)
  }, [usersData])

  const handleStatusChange = async (userId: number, newStatus: boolean) => {
    try {
      setProcessingUser(userId)
      await updateUserStatus(userId, newStatus)

      // Mettre à jour l'utilisateur dans la liste locale
      setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))

      toast.success("Statut de l'utilisateur mis à jour avec succès")
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)
      toast.error("Erreur lors de la mise à jour du statut")
    } finally {
      setProcessingUser(null)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    if (!confirmed) return

    try {
      setProcessingUser(userId)
      await deleteUser(userId)

      // Supprimer l'utilisateur de la liste locale
      setUsers(users.filter((user) => user.id !== userId))
      setTotalUsers((prev) => prev - 1)

      toast.success("Utilisateur supprimé avec succès")
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error)
      toast.error("Erreur lors de la suppression de l'utilisateur")
    } finally {
      setProcessingUser(null)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Calcul des indices de début et de fin pour la pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem)

  // Fonction de tri
  const handleSort = (key: keyof User | 'name') => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }))
  }

  // Filtrer et trier les utilisateurs
  const filteredAndSortedUsers = useMemo(() => {
    // Debug: Afficher les rôles disponibles dans les données
    if (users.length > 0) {
      console.log("🔍 Rôles disponibles dans les données:", [...new Set(users.map(u => u.role))])
      console.log("🎯 Filtre de rôle actuel:", roleFilter)
      console.log("📊 Nombre total d'utilisateurs:", users.length)
      console.log("🔄 État de chargement:", { isLoadingUsers, loading })
    }

    let filtered = users.filter((user) => {
      const searchString = searchTerm.toLowerCase()
      const matchesSearch = (
        user.first_name?.toLowerCase().includes(searchString) ||
        user.last_name?.toLowerCase().includes(searchString) ||
        user.email?.toLowerCase().includes(searchString) ||
        user.phone_number?.toLowerCase().includes(searchString)
      )
      
      // Filtre par rôle
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      
      // Debug: Afficher les détails du filtrage pour chaque utilisateur
      if (roleFilter !== "all") {
        console.log(`👤 ${user.first_name} ${user.last_name}: role="${user.role}", filtre="${roleFilter}", match=${matchesRole}`)
      }
      
      // Filtre par statut
      const matchesStatus = statusFilter === "all" || user.status.toString() === statusFilter
      
      return matchesSearch && matchesRole && matchesStatus
    })

    console.log("✅ Nombre d'utilisateurs après filtrage:", filtered.length)
    return filtered

    return filtered.sort((a, b) => {
      if (sortConfig.key === "name") {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase()
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase()
        return sortConfig.direction === "asc" 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA)
      }

      const valueA = a[sortConfig.key as keyof User]
      const valueB = b[sortConfig.key as keyof User]
      
      // Gestion des valeurs nullables
      if (valueA === null || valueA === undefined) return sortConfig.direction === "asc" ? -1 : 1
      if (valueB === null || valueB === undefined) return sortConfig.direction === "asc" ? 1 : -1
      
      if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1
      if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })
  }, [users, searchTerm, sortConfig, roleFilter, statusFilter])

  // Pagination des résultats filtrés
  const filteredAndSortedCurrentUsers = filteredAndSortedUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5 // Nombre maximum de pages à afficher

    if (totalPages <= maxPagesToShow) {
      // Si le nombre total de pages est inférieur au maximum, afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Sinon, afficher un nombre limité de pages avec des ellipses
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("...")
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1)
        pageNumbers.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        pageNumbers.push(1)
        pageNumbers.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("...")
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  // Liste des rôles disponibles
  const availableRoles: { value: UserRole, label: string }[] = [
    { value: 'customer', label: 'Client' },
    { value: 'deliverer', label: 'Livreur' },
    { value: 'admin', label: 'Administrateur' },
    { value: 'manager', label: 'Manager' },
    { value: 'product_manager', label: 'Product Manager' },
    { value: 'marketing_manager', label: 'Marketing Manager' },
    { value: 'fincance_manager', label: 'Fincance Manager' },
    { value: 'client_manager', label: 'Client Manager' },
    { value: 'logistic_manager', label: 'Logistic Manager' },
  ]

  const [openDialog, setOpenDialog] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    role: 'customer' as UserRole,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/accounts/create-account/`, {
        method: 'POST',
        headers: {
          ...getAxiosConfig().headers
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Erreur lors de la création du compte')
      const data = await res.json()
      toast.success(data.message || 'Compte créé avec succès')
      setOpenDialog(false)
      setForm({ first_name: '', last_name: '', email: '', phone_number: '', role: 'customer' as UserRole })
      // Optionnel : rafraîchir la liste
      if (typeof window !== 'undefined') window.location.reload()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création du compte')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingUsers || loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
            <p className="text-muted-foreground">Gérez les utilisateurs de votre plateforme</p>
          </div>
          <Skeleton className="h-10 w-48" />
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Liste des utilisateurs</CardTitle>
              <CardDescription><Skeleton className="h-4 w-32 inline-block" /></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Skeleton className="h-10 w-full sm:w-96" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-[180px]" />
                  <Skeleton className="h-10 w-[180px]" />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Inscription</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-32 mb-1" />
                              <Skeleton className="h-3 w-40" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-center mt-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
            <p className="text-muted-foreground">Gérez les utilisateurs de votre plateforme</p>
          </div>
        </div>
        <div className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <X className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-red-600 mb-2">Erreur</h3>
                <p className="text-gray-600 mb-4 max-w-md">{error}</p>
                <Button onClick={() => window.location.reload()}>Réessayer</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // S'assurer que users est toujours un tableau
  const safeUsers = Array.isArray(users) ? users : []

  const columns = [
    {
      key: "name",
      label: "Nom",
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.image || "/placeholder.svg"} alt={`${user.first_name} ${user.last_name}`} />
            <AvatarFallback>{user.first_name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{`${user.first_name} ${user.last_name}`}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      key: "phone_number",
      label: "Téléphone",
      sortable: true,
      render: (user: User) => user.phone_number || "Non renseigné"
    },
    {
      key: "role",
      label: "Rôle",
      sortable: true,
      render: (user: User) => (
        <Badge variant="outline" className="capitalize">
          {user.role}
        </Badge>
      )
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      render: (user: User) => (
        <Badge
          variant={user.status ? "default" : "secondary"}
          className={user.status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
        >
          {user.status ? "Actif" : "Inactif"}
        </Badge>
      )
    },
    {
      key: "created_at",
      label: "Inscription",
      sortable: true,
      render: (user: User) => new Date(user.created_at).toLocaleDateString()
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <PermissionGuard permissions={['users:view']}>
              <DropdownMenuItem onClick={() => navigateToUserDetail(user.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
            </PermissionGuard>
            <PermissionGuard permissions={['users:manage']}>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusChange(user.id, !user.status)}>
                {user.status ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Activer
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteUser(user.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </PermissionGuard>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les utilisateurs de votre plateforme</p>
        </div>
        <PermissionGuard permissions={['users:manage']}>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block mb-1 font-medium">Prénom</label>
                    <input name="first_name" value={form.first_name} onChange={handleFormChange} required className="w-full border rounded p-2" />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 font-medium">Nom</label>
                    <input name="last_name" value={form.last_name} onChange={handleFormChange} required className="w-full border rounded p-2" />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleFormChange} required className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Téléphone</label>
                  <input name="phone_number" value={form.phone_number} onChange={handleFormChange} required className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Rôle</label>
                  <select name="role" value={form.role} onChange={handleFormChange} required className="w-full border rounded p-2">
                    {availableRoles.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Création...' : 'Créer le compte'}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Annuler</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      <div className="mt-6 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Liste des utilisateurs</CardTitle>
            <CardDescription>{totalUsers} utilisateurs au total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-[#048B9A] focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="true">Actif</SelectItem>
                    <SelectItem value="false">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(!isLoadingUsers && !loading && safeUsers.length === 0) ? (
              <div className="text-center p-8 bg-muted/50 rounded-lg border">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">Aucun utilisateur trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  Aucun utilisateur ne correspond à vos critères de recherche.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setRoleFilter("all")
                    setStatusFilter("all")
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead
                          key={column.key}
                          className={column.sortable ? "cursor-pointer select-none" : ""}
                          onClick={() => column.sortable && handleSort(column.key as keyof User | 'name')}
                        >
                          <div className="flex items-center gap-2">
                            {column.label}
                            {sortConfig.key === column.key && (
                              sortConfig.direction === "asc" ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                      ))}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedCurrentUsers.map((user) => (
                      <TableRow
                        key={user.id || Math.random()}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => user.id && navigateToUserDetail(user.id)}
                      >
                        {columns.map((column) => (
                          <TableCell key={`${user.id}-${column.key}`}>
                            {column.render(user)}
                          </TableCell>
                        ))}
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          {processingUser === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => user.id && navigateToUserDetail(user.id)}>
                                  Voir les détails
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>Envoyer un email</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Phone className="mr-2 h-4 w-4" />
                                  <span>Appeler</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => user.id && handleStatusChange(user.id, !user.status)}>
                                  {user.status ? "Désactiver" : "Activer"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => user.id && handleDeleteUser(user.id)}
                                  className="text-destructive"
                                >
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {getPageNumbers().map((pageNumber, index) => (
                  <button
                    key={index}
                    onClick={() => typeof pageNumber === "number" && handlePageChange(pageNumber)}
                    disabled={pageNumber === "..."}
                    className={`px-3 py-1 rounded-md ${
                      pageNumber === currentPage
                        ? "bg-[#048B9A] text-white"
                        : pageNumber === "..."
                        ? "cursor-default"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="text-sm text-gray-500 text-center mt-2">
              Page {currentPage} sur {totalPages}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

