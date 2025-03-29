"use client"

import { useEffect, useState } from "react"
import { Search, UserPlus, MoreHorizontal, Mail, Phone, Loader2, X } from "lucide-react"
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
import { fetchUsers, type User, updateUserStatus, deleteUser } from "@/services/user-service"
import { getAuthToken } from "@/lib/auth-utils"

export default function UtilisateursPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [processingUser, setProcessingUser] = useState<number | null>(null)

  // Effet pour le debounce de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Effet pour charger les utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        const usersData = await fetchUsers(currentPage, debouncedSearchTerm, roleFilter, statusFilter)

        if (Array.isArray(usersData)) {
          setUsers(usersData)
          setTotalUsers(usersData.length)
          setTotalPages(Math.ceil(usersData.length / 10)) // 10 utilisateurs par page
        } else {
          console.error("Réponse invalide de l'API:", usersData)
          setUsers([])
          setTotalUsers(0)
          setTotalPages(1)
          setError("Format de réponse invalide. Veuillez réessayer plus tard.")
        }
      } catch (err) {
        console.error("Erreur lors du chargement des utilisateurs:", err)
        setUsers([])
        setTotalUsers(0)
        setTotalPages(1)
        setError("Impossible de charger les utilisateurs. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [currentPage, debouncedSearchTerm, roleFilter, statusFilter])

  // Ajouter un effet pour logger la disponibilité du token spécifiquement pour cette page
  useEffect(() => {
    const token = getAuthToken()
    console.log(
      `%c[Auth] Page Utilisateurs | Token: ${token ? "Disponible" : "Non disponible"}`,
      token
        ? "background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;"
        : "background: #F44336; color: white; padding: 2px 5px; border-radius: 3px;",
    )

    // Logger les headers qui seront utilisés pour les requêtes API
    console.log("[Auth] Headers pour les requêtes API:", {
      Authorization: token ? `Bearer ${token}` : "Non disponible",
    })
  }, [])

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

  if (loading && users.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
            <p className="text-muted-foreground">Gérez les utilisateurs de votre plateforme</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg font-medium">Chargement des utilisateurs...</span>
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
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un utilisateur..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

            {loading && safeUsers.length > 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg font-medium">Mise à jour des données...</span>
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
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Commandes</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeUsers.map((user) => (
                      <TableRow
                        key={user.id || Math.random()}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => user.id && navigateToUserDetail(user.id)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={user.image || "/placeholder.svg?height=40&width=40"}
                                alt={`${user.first_name} ${user.last_name}`}
                              />
                              <AvatarFallback>{user.first_name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {user.first_name || "Sans"} {user.last_name || "nom"}
                              </div>
                              <div className="text-sm text-muted-foreground">{user.email || "Pas d'email"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.role || "Non défini"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.status ? "success" : "secondary"}
                            className={
                              user.status
                                ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-100"
                            }
                          >
                            {user.status ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.total_orders || 0}</TableCell>
                        <TableCell>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                        </TableCell>
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
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) handlePageChange(currentPage - 1)
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Logique pour afficher les pages autour de la page courante
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(pageNum)
                            }}
                            isActive={currentPage === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(totalPages)
                            }}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) handlePageChange(currentPage + 1)
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

