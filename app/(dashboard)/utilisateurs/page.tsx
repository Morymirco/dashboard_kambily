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
import { getAuthToken } from "@/lib/auth-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useUsers } from "@/hooks/api/users"


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
  }
]

export default function UtilisateursPage() {
  const router = useRouter()
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

  const navigateToUserDetail = (userId: number) => {
    router.push(`/utilisateurs/${userId}`)
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
    let filtered = users.filter((user) => {
      const searchString = searchTerm.toLowerCase()
      return (
        user.first_name?.toLowerCase().includes(searchString) ||
        user.last_name?.toLowerCase().includes(searchString) ||
        user.email?.toLowerCase().includes(searchString) ||
        user.phone_number?.toLowerCase().includes(searchString)
      )
    })

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
  }, [users, searchTerm, sortConfig])

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

  if (loading && users.length === 0) {
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
                    {Array.from({ length: 5 }).map((_, index) => (
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

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les utilisateurs de votre plateforme</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un utilisateur
        </Button>
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
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
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

            {loading ? (
              <div className="space-y-4">
                {/* Skeleton pour l'en-tête */}
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-[200px]" />
                  <Skeleton className="h-10 w-[150px]" />
                </div>

                {/* Skeleton pour le tableau */}
                <div className="border rounded-lg">
                  <div className="divide-y">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="p-4">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                          <div className="ml-auto flex space-x-2">
                            <Skeleton className="h-8 w-[100px]" />
                            <Skeleton className="h-8 w-[100px]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skeleton pour la pagination */}
                <div className="flex justify-center space-x-2 mt-4">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ) : safeUsers.length === 0 ? (
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

