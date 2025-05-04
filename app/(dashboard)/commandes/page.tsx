"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { format, parse } from "date-fns"
import { fr } from "date-fns/locale"
import {
  AlertCircle,
  ArrowDownUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Loader2,
  MoreHorizontal,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  User,
  CreditCard,
  Banknote,
} from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  fetchOrders,
  exportOrders,
  getStatusColor,
  getStatusText,
  getPaymentMethodText,
  type Order,
} from "@/services/order-service"
import { getAuthToken } from "@/lib/auth-utils"

export default function CommandesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedOrders, setSelectedOrders] = useState<number[]>([])
  const [filters, setFilters] = useState({
    status: "",
    payment: "",
    dateRange: "",
    startDate: "",
    endDate: "",
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  })
  const [exportLoading, setExportLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  const datePickerRef = useRef<HTMLDivElement>(null)

  // Effet pour le debounce de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Effet pour détecter les clics en dehors du date picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Charger les commandes
  useEffect(() => {
    fetchOrdersData()
  }, [debouncedSearchTerm, currentPage])

  // Ajouter un effet pour logger la disponibilité du token spécifiquement pour cette page
  useEffect(() => {
    const token = getAuthToken()
    console.log(
      `%c[Auth] Page Commandes | Token: ${token ? "Disponible" : "Non disponible"}`,
      token
        ? "background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;"
        : "background: #F44336; color: white; padding: 2px 5px; border-radius: 3px;",
    )

    // Logger les headers qui seront utilisés pour les requêtes API
    console.log("[Auth] Headers pour les requêtes API:", {
      Authorization: token ? `Bearer ${token}` : "Non disponible",
    })
  }, [])

  // Effet pour filtrer et trier les commandes
  useEffect(() => {
    if (orders.length > 0) {
      let result = [...orders]

      // Appliquer les filtres
      if (filters.status) {
        result = result.filter((order) => order.status === filters.status)
      }

      if (filters.payment) {
        result = result.filter((order) => {
          if (filters.payment === "cod" && order.cash_on_delivery) {
            return true
          }
          return order.payement?.payment_method === filters.payment
        })
      }

      // Appliquer la plage de dates
      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate)
        const endDate = new Date(filters.endDate)

        result = result.filter((order) => {
          const orderDate = parseOrderDate(order.created_at)
          return orderDate >= startDate && orderDate <= endDate
        })
      }

      // Appliquer le tri
      result = sortOrders(result, sortConfig.key, sortConfig.direction as "asc" | "desc")

      setFilteredOrders(result)
      setTotalOrders(result.length)
      setTotalPages(Math.ceil(result.length / 10)) // 10 commandes par page
    }
  }, [filters, orders, sortConfig])

  const fetchOrdersData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetchOrders()

      if (Array.isArray(response.orders)) {
        setOrders(response.orders)
        setFilteredOrders(response.orders)
        setTotalOrders(response.orders.length)
        setTotalPages(Math.ceil(response.orders.length / 10)) // 10 commandes par page
      } else {
        throw new Error("La réponse de l'API n'est pas un tableau")
      }
    } catch (err) {
      console.error("Erreur:", err)
      setError("Erreur lors du chargement des commandes")
      toast.error("Erreur lors du chargement des commandes")
    } finally {
      setLoading(false)
    }
  }

  const parseOrderDate = (dateString: string): Date => {
    try {
      // Si la date est au format "dd/MM/yyyy HH:mm:ss"
      if (dateString.includes("/")) {
        return parse(dateString, "dd/MM/yyyy HH:mm:ss", new Date())
      }
      // Si la date est au format ISO
      return new Date(dateString)
    } catch (error) {
      console.error("Erreur de parsing de date:", error)
      return new Date()
    }
  }

  const formatOrderDate = (dateString: string): string => {
    try {
      const date = parseOrderDate(dateString)
      return format(date, "dd MMM yyyy", { locale: fr })
    } catch (error) {
      console.error("Erreur de formatage de date:", error)
      return dateString
    }
  }

  const calculateDeliveryDate = (orderDate: string) => {
    try {
      const orderDateTime = parseOrderDate(orderDate)
      const day = orderDateTime.getDay()
      const hour = orderDateTime.getHours()

      if ((day === 4 && hour >= 18) || day === 5 || (day === 6 && hour < 18)) {
        return "Lundi"
      } else if ((day === 0 && hour >= 18) || day === 1 || (day === 2 && hour < 18)) {
        return "Mercredi"
      } else if ((day === 2 && hour >= 18) || day === 3 || (day === 4 && hour < 18)) {
        return "Vendredi"
      }
      return "Date de livraison non définie"
    } catch (error) {
      console.error("Erreur de calcul de date:", error)
      return "Date indéterminée"
    }
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map((order) => order.id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const handleBulkDelete = () => {
    if (selectedOrders.length === 0) {
      toast.error("Aucune commande sélectionnée")
      return
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedOrders.length} commande(s) ?`)) {
      // Logique de suppression
      toast.success(`${selectedOrders.length} commande(s) supprimée(s)`)
      setSelectedOrders([])
    }
  }

  // Remplacer la fonction handleExportOrders complète
  const handleExportOrders = async () => {
    try {
      setExportLoading(true)
      const loadingToast = toast.loading("Exportation en cours...")

      const data = await exportOrders()

      // Lien du fichier excel
      const url = data.data.file

      const a = document.createElement("a")
      a.href = url
      a.download = "commandes.xlsx"
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      toast.dismiss(loadingToast)
      toast.success("Exportation réussie")
    } catch (err) {
      console.error("Erreur:", err)
      toast.error("Erreur lors de l'exportation des commandes")
    } finally {
      setExportLoading(false)
    }
  }

  // Ajoutez cette fonction helper pour définir l'ordre de priorité des statuts
  const getPaymentStatusPriority = (status: string | undefined) => {
    switch (status) {
      case "completed":
        return 3
      case "pending":
        return 2
      case "failed":
        return 1
      default:
        return 0
    }
  }

  // Modifiez la fonction de tri pour inclure le tri par statut de paiement
  const sortOrders = (orders: Order[], key: string, direction: "asc" | "desc") => {
    return [...orders].sort((a, b) => {
      switch (key) {
        case "created_at":
          const dateA = parseOrderDate(a.created_at)
          const dateB = parseOrderDate(b.created_at)
          return direction === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
        case "total_price":
          return direction === "asc" ? a.total_price - b.total_price : b.total_price - a.total_price
        case "status":
          return direction === "asc" ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status)
        case "payment_status":
          const statusA = getPaymentStatusPriority(a.payement?.payment_status)
          const statusB = getPaymentStatusPriority(b.payement?.payment_status)
          return direction === "asc" ? statusA - statusB : statusB - statusA
        default:
          return 0
      }
    })
  }

  // Gestionnaire de tri
  const handleSort = (key: string) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Icône de tri pour les en-têtes de colonnes
  const getSortIcon = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? (
        <ArrowDownUp className="h-4 w-4 text-primary" />
      ) : (
        <ArrowDownUp className="h-4 w-4 text-primary" />
      )
    }
    return <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
  }

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: "",
      payment: "",
      dateRange: "",
      startDate: "",
      endDate: "",
    })
    setSearchQuery("")
  }

  // Pagination
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * 10, currentPage * 10)

  // Ajoutez cette fonction helper en haut du fichier avec les autres fonctions utilitaires
  const getPaymentStatusText = (status: string | undefined) => {
    switch (status) {
      case "completed":
        return "Payé"
      case "pending":
        return "En attente"
      case "processing":
        return "En cours"
      case "failed":
        return "Échoué"
      case "refunded":
        return "Remboursé"
      case "cancelled":
        return "Annulé"
      default:
        return "Non payé"
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Commandes</h1>
            <p className="text-muted-foreground">Gérez les commandes de votre boutique</p>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Commandes totales</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Commandes en attente</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Commandes livrées</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Liste des commandes</CardTitle>
              <CardDescription><Skeleton className="h-4 w-32 inline-block" /></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Skeleton className="h-10 w-full sm:w-64" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"><Skeleton className="h-4 w-4" /></TableHead>
                      <TableHead>Commande</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Paiement</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-7 w-7 bg-primary/10 rounded-full flex items-center justify-center">
                              <Skeleton className="h-3.5 w-3.5" />
                            </div>
                            <div className="ml-2">
                              <Skeleton className="h-4 w-16 mb-1" />
                              <Skeleton className="h-3 w-8" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-6 w-6 bg-muted rounded-full flex items-center justify-center mr-1.5">
                              <Skeleton className="h-3.5 w-3.5" />
                            </div>
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
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
          <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Erreur de chargement</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchOrdersData()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* En-tête avec actions groupées */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Commandes</h1>
          <p className="text-muted-foreground">Gérez les commandes de votre boutique</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedOrders.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Supprimer ({selectedOrders.length})
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleExportOrders}
            disabled={exportLoading}
            className="flex items-center gap-2"
          >
            {exportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commandes totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-green-500 dark:text-green-400">+12% par rapport au mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commandes en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter((o) => o.status === "pending").length}</div>
            <p className="text-xs text-yellow-500 dark:text-yellow-400">Nécessite votre attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commandes livrées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter((o) => o.status === "delivered").length}</div>
            <p className="text-xs text-green-500 dark:text-green-400">+18% par rapport au mois dernier</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres avancés */}
      <div className="mt-6 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Liste des commandes</CardTitle>
            <CardDescription>{totalOrders} commandes au total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher une commande..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="accepted">Accepté</SelectItem>
                    <SelectItem value="prepared">En livraison</SelectItem>
                    <SelectItem value="delivered">Livré</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.payment} onValueChange={(value) => setFilters({ ...filters, payment: value })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par paiement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les paiements</SelectItem>
                    <SelectItem value="om">Orange Money</SelectItem>
                    <SelectItem value="momo">MTN Money</SelectItem>
                    <SelectItem value="card">Carte bancaire</SelectItem>
                    <SelectItem value="cod">Paiement à la livraison</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative" ref={datePickerRef}>
                  <Button
                    variant="outline"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Période</span>
                  </Button>

                  {showDatePicker && (
                    <div className="absolute z-10 mt-2 right-0 bg-card rounded-lg shadow-lg border border-border p-4 w-[300px]">
                      <h3 className="text-sm font-medium text-foreground mb-3">Sélectionner une période</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Date de début</label>
                          <Input
                            type="datetime-local"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Date de fin</label>
                          <Input
                            type="datetime-local"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="w-full"
                          />
                        </div>
                        <div className="flex justify-between pt-2">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setFilters({ ...filters, startDate: "", endDate: "" })
                            }}
                            className="text-sm"
                          >
                            Effacer
                          </Button>
                          <Button onClick={() => setShowDatePicker(false)} className="text-sm">
                            Appliquer
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>
            </div>

            {(filters.status || filters.payment || filters.startDate || filters.endDate) && (
              <div className="mb-4 flex items-center text-sm text-primary">
                <Filter className="h-4 w-4 mr-1" />
                Filtres actifs
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-input h-4 w-4"
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("number")}>
                      <div className="flex items-center gap-1">
                        Commande
                        {getSortIcon("number")}
                      </div>
                    </TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("created_at")}>
                      <div className="flex items-center gap-1">
                        Date
                        {getSortIcon("created_at")}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("total_price")}>
                      <div className="flex items-center gap-1">
                        Total
                        {getSortIcon("total_price")}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                      <div className="flex items-center gap-1">
                        Statut
                        {getSortIcon("status")}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort("payment_status")}
                    >
                      <div className="flex items-center gap-1">
                        Statut paiement
                        {getSortIcon("payment_status")}
                      </div>
                    </TableHead>
                    <TableHead>Livraison</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">Aucune commande trouvée</p>
                          {(searchQuery ||
                            filters.status ||
                            filters.payment ||
                            filters.startDate ||
                            filters.endDate) && (
                            <Button variant="link" onClick={resetFilters} className="mt-2">
                              Réinitialiser les filtres
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/commandes/${order.number}`)}
                      >
                        <TableCell className="w-[40px]" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => handleSelectOrder(order.id)}
                            className="rounded border-input h-4 w-4"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-7 w-7 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                              <ShoppingBag className="h-3.5 w-3.5" />
                            </div>
                            <div className="ml-2">
                              <div className="text-sm font-medium text-foreground">#{order.number}</div>
                              <div className="text-xs text-muted-foreground">{order.total_products} art.</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-6 w-6 bg-muted rounded-full flex items-center justify-center text-muted-foreground mr-1.5">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            <span className="truncate text-sm text-foreground">
                              {order.user.first_name} {order.user.last_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatOrderDate(order.created_at)}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-foreground">
                          {order.total_price.toLocaleString()} GNF
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              order.payement?.payment_status === "completed" 
                                ? "bg-green-50 text-green-600 border-green-300" 
                                : order.payement?.payment_status === "pending"
                                ? "bg-yellow-50 text-yellow-600 border-yellow-300"
                                : order.payement?.payment_status === "processing"
                                ? "bg-blue-50 text-blue-600 border-blue-300"
                                : order.payement?.payment_status === "failed"
                                ? "bg-red-50 text-red-600 border-red-300"
                                : order.payement?.payment_status === "refunded"
                                ? "bg-purple-50 text-purple-600 border-purple-300"
                                : order.payement?.payment_status === "cancelled"
                                ? "bg-gray-50 text-gray-600 border-gray-300"
                                : "bg-gray-50 text-gray-600 border-gray-300"
                            }
                          >
                            {getPaymentStatusText(order.payement?.payment_status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {calculateDeliveryDate(order.created_at)}
                        </TableCell>
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
                              <DropdownMenuItem onClick={() => router.push(`/commandes/${order.number}`)}>
                                Voir les détails
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
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
                  Affichage de {(currentPage - 1) * 10 + 1} à {Math.min(currentPage * 10, totalOrders)} sur{" "}
                  {totalOrders} commandes
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

