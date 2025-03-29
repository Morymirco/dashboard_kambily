"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, MoreHorizontal, PlusCircle, Edit, Trash2, Copy, ChevronLeft, ChevronRight, Eye, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

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
import { fetchProducts, formatPrice, type Product } from "@/services/product-service"
import { getAuthToken } from "@/lib/auth-utils"

interface ApiResponse {
  count: number
  results: ApiResponseResults[]
}

interface ApiResponseResults {
  id: string
  name: string
  sku: string
  regular_price: string
  quantity: number
  nombre_ventes: number
  etat_stock: string
  product_type: string
  created_at: string
  short_description: string
  images: { image: string }[]
}

export default function ProduitsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<ApiResponseResults[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<"name" | "price" | "stock" | "sales" | "date">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const itemsPerPage = 10
  const router = useRouter()

  // Chargement des produits
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products')
        const data: ApiResponse = await response.json()
        setProducts(data.results)
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error)
        toast.error("Impossible de charger les produits")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Fonction de tri
  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filtrage et tri des produits
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]

    // Recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.short_description.toLowerCase().includes(searchLower)
      )
    }

    // Filtrage par statut
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "in-stock":
          filtered = filtered.filter(p => p.etat_stock === "En Stock")
          break
        case "low-stock":
          filtered = filtered.filter(p => p.etat_stock === "Stock faible")
          break
        case "out-of-stock":
          filtered = filtered.filter(p => p.etat_stock === "Rupture de stock")
          break
      }
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "price":
          comparison = parseFloat(a.regular_price) - parseFloat(b.regular_price)
          break
        case "stock":
          comparison = a.quantity - b.quantity
          break
        case "sales":
          comparison = a.nombre_ventes - b.nombre_ventes
          break
        case "date":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    // Pagination
    const totalItems = filtered.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage

    return {
      products: filtered.slice(start, end),
      totalItems,
      totalPages
    }
  }, [products, searchTerm, statusFilter, sortField, sortDirection, currentPage])

  // Calculer les statistiques sur les produits filtrés
  const stats = useMemo(() => {
    const outOfStockCount = products.filter(p => p.etat_stock === "Rupture de stock").length
    const lowStockCount = products.filter(p => p.etat_stock === "Stock faible").length
    return { outOfStockCount, lowStockCount, totalProducts: products.length }
  }, [products])

  // Ajouter un effet pour logger la disponibilité du token spécifiquement pour cette page
  useEffect(() => {
    const token = getAuthToken()
    console.log(
      `%c[Auth] Page Produits | Token: ${token ? "Disponible" : "Non disponible"}`,
      token
        ? "background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;"
        : "background: #F44336; color: white; padding: 2px 5px; border-radius: 3px;",
    )

    // Logger les headers qui seront utilisés pour les requêtes API
    console.log("[Auth] Headers pour les requêtes API:", {
      Authorization: token ? `Bearer ${token}` : "Non disponible",
    })
  }, [])

  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "En Stock":
        return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
      case "Stock faible":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100"
      case "Rupture de stock":
        return "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-100"
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produits</h1>
          <p className="text-muted-foreground">Gérez vos produits ici</p>
        </div>
        <Button onClick={() => router.push("/produits/ajouter")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Produits totaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Catalogue complet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock faible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockCount}</div>
            <p className="text-xs text-yellow-500">Nécessite réapprovisionnement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Produits en rupture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outOfStockCount}</div>
            <p className="text-xs text-red-500">Nécessite votre attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Catalogue de produits</CardTitle>
            <CardDescription>{stats.totalProducts} produits au total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Statut du stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="in-stock">En stock</SelectItem>
                    <SelectItem value="low-stock">Stock faible</SelectItem>
                    <SelectItem value="out-of-stock">Rupture de stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer w-[300px]"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        Produit
                        {sortField === "name" && (
                          <ChevronUp className={cn(
                            "h-4 w-4",
                            sortDirection === "desc" && "rotate-180"
                          )} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center gap-2">
                        Prix
                        {sortField === "price" && (
                          <ChevronUp className={cn(
                            "h-4 w-4",
                            sortDirection === "desc" && "rotate-180"
                          )} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("stock")}
                    >
                      <div className="flex items-center gap-2">
                        Stock
                        {sortField === "stock" && (
                          <ChevronUp className={cn(
                            "h-4 w-4",
                            sortDirection === "desc" && "rotate-180"
                          )} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("sales")}
                    >
                      <div className="flex items-center gap-2">
                        Ventes
                        {sortField === "sales" && (
                          <ChevronUp className={cn(
                            "h-4 w-4",
                            sortDirection === "desc" && "rotate-180"
                          )} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center gap-2">
                        Date
                        {sortField === "date" && (
                          <ChevronUp className={cn(
                            "h-4 w-4",
                            sortDirection === "desc" && "rotate-180"
                          )} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Afficher des skeletons pendant le chargement
                    Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-md" />
                              <Skeleton className="h-4 w-40" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                  ) : filteredAndSortedProducts.products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Aucun produit trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedProducts.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0]?.image || "/placeholder.svg"}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                            <div>
                              <div className="font-medium line-clamp-1">{product.name}</div>
                              <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatPrice(product.regular_price)}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>{product.nombre_ventes}</TableCell>
                        <TableCell>{product.created_at}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeClass(product.etat_stock)}>
                            {product.etat_stock}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.product_type === "variable" ? "secondary" : "outline"}>
                            {product.product_type === "variable" ? "Variable" : "Simple"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => router.push(`/produits/${product.id}`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Modifier</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/produits/${product.id}/copier`)}>
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Copier</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/produits/${product.id}/supprimer`)}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}