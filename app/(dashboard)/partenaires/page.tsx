"use client"

import type React from "react"

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  ExternalLink,
  Mail,
  MoreHorizontal,
  Package,
  Phone,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePartners } from "@/hooks/api/parteners"
import { getAuthToken } from "@/lib/auth-utils"
import { type Partner } from "@/services/partner-service"
import { useQueryClient } from "@tanstack/react-query"

export default function PartenairesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPartners, setSelectedPartners] = useState<number[]>([])

  // Utilisation des hooks
  const { data: partnersData, isLoading: loading, error: queryError, refetch } = usePartners(currentPage, debouncedSearchTerm)
  
  // Extraire les données depuis la réponse du hook
  const partners = partnersData?.results || []
  const totalPartners = partnersData?.count || 0
  const totalPages = Math.ceil(totalPartners / 10)
  const error = queryError ? "Impossible de charger les partenaires" : null

  // Effet pour le debounce de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Ajouter un effet pour logger la disponibilité du token spécifiquement pour cette page
  useEffect(() => {
    const token = getAuthToken()
    console.log(
      `%c[Auth] Page Partenaires | Token: ${token ? "Disponible" : "Non disponible"}`,
      token
        ? "background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;"
        : "background: #F44336; color: white; padding: 2px 5px; border-radius: 3px;",
    )

    // Logger les headers qui seront utilisés pour les requêtes API
    console.log("[Auth] Headers pour les requêtes API:", {
      Authorization: token ? `Bearer ${token}` : "Non disponible",
    })
  }, [])

  // Filtrer les partenaires
  const filteredPartners = partners.filter((partner: Partner) => {
    if (!searchTerm) return true

    return (
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (partner.email && partner.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (partner.address && partner.address.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPartners(filteredPartners.map((partner: Partner) => partner.id))
    } else {
      setSelectedPartners([])
    }
  }

  const handleSelectPartner = (partnerId: number) => {
    setSelectedPartners((prev) =>
      prev.includes(partnerId) ? prev.filter((id) => id !== partnerId) : [...prev, partnerId],
    )
  }

  const handleDeletePartner = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) {
      try {
        const response = await fetch(`/api/partners/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du partenaire")
        }

        toast.success("Partenaire supprimé avec succès")
        // Invalider et refetch les données des partenaires
        queryClient.invalidateQueries({ queryKey: ['partners'] })
      } catch (error) {
        console.error("Erreur:", error)
        toast.error("Erreur lors de la suppression du partenaire")
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedPartners.length === 0) {
      toast.error("Aucun partenaire sélectionné")
      return
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedPartners.length} partenaire(s) ?`)) {
      try {
        const deletePromises = selectedPartners.map((id) => fetch(`/api/partners/${id}`, { method: "DELETE" }))

        await Promise.all(deletePromises)

        toast.success(`${selectedPartners.length} partenaire(s) supprimé(s)`)
        setSelectedPartners([])

        // Invalider et refetch les données des partenaires
        queryClient.invalidateQueries({ queryKey: ['partners'] })
      } catch (error) {
        console.error("Erreur:", error)
        toast.error("Erreur lors de la suppression des partenaires")
      }
    }
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Partenaires</h1>
            <p className="text-muted-foreground">Gérez vos partenaires commerciaux</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Partenaires totaux</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Partenaires actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Dernier ajout</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Liste des partenaires</CardTitle>
              <CardDescription><Skeleton className="h-4 w-32 inline-block" /></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Skeleton className="h-10 w-full sm:w-64" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"><Skeleton className="h-4 w-4" /></TableHead>
                      <TableHead>Partenaire</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Adresse</TableHead>
                      <TableHead>Site Web</TableHead>
                      <TableHead>Date d'ajout</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-md" />
                            <div>
                              <Skeleton className="h-5 w-32 mb-1" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-4 w-16" />
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
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 max-w-md">
          <div className="text-red-500 dark:text-red-400 mx-auto mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Erreur de chargement</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partenaires</h1>
          <p className="text-muted-foreground">Gérez vos partenaires commerciaux</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedPartners.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Supprimer ({selectedPartners.length})
            </Button>
          )}
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              // Logique d'exportation
              toast.success("Exportation des partenaires en cours...")
            }}
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push("/partenaires/produits")}
          >
            <Package className="h-4 w-4" />
            Tous les produits
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => router.push("/partenaires/ajouter")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un partenaire
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Partenaires totaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPartners}</div>
            <p className="text-xs text-green-500">+3 nouveaux ce mois-ci</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Partenaires actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPartners}</div>
            <p className="text-xs text-green-500">100% des partenaires</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dernier ajout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partners[0]?.name || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {partners[0]?.created_at ? formatDate(partners[0].created_at) : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Liste des partenaires</CardTitle>
            <CardDescription>{filteredPartners.length} partenaires au total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un partenaire..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setSearchTerm("")} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <input
                        type="checkbox"
                        checked={selectedPartners.length === filteredPartners.length && filteredPartners.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-input h-4 w-4"
                      />
                    </TableHead>
                    <TableHead>Partenaire</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Site Web</TableHead>
                    <TableHead>Date d'ajout</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-muted-foreground mb-2">🏢</div>
                          <p className="text-muted-foreground">Aucun partenaire trouvé</p>
                          {searchTerm && (
                            <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2">
                              Réinitialiser la recherche
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPartners.map((partner: Partner) => (
                      <TableRow
                        key={partner.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/partenaires/${partner.id}`)}
                      >
                        <TableCell className="w-[40px]" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedPartners.includes(partner.id)}
                            onChange={() => handleSelectPartner(partner.id)}
                            className="rounded border-input h-4 w-4"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                              {partner.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{partner.name}</div>
                              <div className="text-sm text-muted-foreground">ID: {partner.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{partner.email || "N/A"}</div>
                            <div className="text-sm text-muted-foreground">{partner.phone || "N/A"}</div>
                          </div>
                        </TableCell>
                        <TableCell>{partner.address || "N/A"}</TableCell>
                        <TableCell>
                          {partner.website ? (
                            <a
                              href={partner.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3 w-3" />
                              {partner.website.replace(/^https?:\/\//, "")}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>{formatDate(partner.created_at)}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => router.push(`/partenaires/${partner.id}`)}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                <span>Voir détails</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/partenaires/${partner.id}/modifier`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Modifier</span>
                              </DropdownMenuItem>
                              {partner.email && (
                                <DropdownMenuItem onClick={() => window.open(`mailto:${partner.email}`)}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>Envoyer un email</span>
                                </DropdownMenuItem>
                              )}
                              {partner.phone && (
                                <DropdownMenuItem onClick={() => window.open(`tel:${partner.phone}`)}>
                                  <Phone className="mr-2 h-4 w-4" />
                                  <span>Appeler</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeletePartner(partner.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Supprimer</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Affichage de {(currentPage - 1) * 10 + 1} à {Math.min(currentPage * 10, totalPartners)} sur{" "}
                  {totalPartners} partenaires
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} sur {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

