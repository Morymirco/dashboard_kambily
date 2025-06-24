"use client"

import { ProductFilters, type ProductFilters as ProductFiltersType } from "@/app/components/products/product-filters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeleteProduct, useProducts } from "@/hooks/api/products"
import { useDebounce } from "@/hooks/use-debounce"
import { Edit, Eye, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import toast from "react-hot-toast"
import DOMPurify from "dompurify"

export default function ProduitsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ProductFiltersType>({
    search: "",
    priceRange: [0, 1000000],
    stockStatus: "all",
    category: "all",
    sortBy: "newest"
  })
  
  const router = useRouter()
  
  // Debounce la recherche pour éviter trop de requêtes
  const debouncedSearch = useDebounce(filters.search, 500)
  
  // Utiliser le hook useProducts
  const { 
    data: productsData, 
    isLoading, 
    isError, 
    error 
  } = useProducts(currentPage, debouncedSearch)
  
  const deleteProductMutation = useDeleteProduct()

  // Filtrer et trier les produits côté frontend
  const filteredProducts = useMemo(() => {
    if (!productsData?.results) return []

    let filtered = [...productsData.results]

    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.short_description?.toLowerCase().includes(searchLower) ||
        product.sku?.toLowerCase().includes(searchLower)
      )
    }

    // Filtre par plage de prix
    filtered = filtered.filter(product => {
      const price = Number(product.regular_price)
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })

    // Filtre par statut de stock
    if (filters.stockStatus !== "all") {
      filtered = filtered.filter(product => {
        switch (filters.stockStatus) {
          case "en_stock":
            return product.stock_status === true
          case "rupture":
            return product.stock_status === false
          case "faible":
            return product.quantity < 10 && product.quantity > 0
          default:
            return true
        }
      })
    }

    // Filtre par catégorie
    if (filters.category !== "all") {
      filtered = filtered.filter(product => {
        // Vérifier si le produit a des catégories
        if (!product.categories || !Array.isArray(product.categories)) {
          return false
        }
        // Vérifier si l'une des catégories correspond à la catégorie sélectionnée
        return product.categories.some(cat => cat.id.toString() === filters.category)
      })
    }

    // Tri des produits
    switch (filters.sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case "price_asc":
        filtered.sort((a, b) => Number(a.regular_price) - Number(b.regular_price))
        break
      case "price_desc":
        filtered.sort((a, b) => Number(b.regular_price) - Number(a.regular_price))
        break
      case "name_asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name_desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "sales":
        filtered.sort((a, b) => b.nombre_ventes - a.nombre_ventes)
        break
    }

    return filtered
  }, [productsData?.results, filters])

  // Calculer le nombre total de pages
  const totalPages = Math.ceil((productsData?.count || 0) / 10)
  const startIndex = (currentPage - 1) * 10
  const endIndex = startIndex + 10
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    setCurrentPage(1)
  }

  const handleFilterChange = (newFilters: ProductFiltersType) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setFilters({
      search: "",
      priceRange: [0, 1000000],
      stockStatus: "all",
      category: "all",
      sortBy: "newest"
    })
    setCurrentPage(1)
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await deleteProductMutation.mutateAsync(id)
        toast.success("Produit supprimé avec succès")
      } catch (error) {
        toast.error("Erreur lors de la suppression du produit")
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleViewProduct = (id: string) => {
    router.push(`/produits/${id}`)
  }

  const handleEditProduct = (id: string) => {
    router.push(`/produits/${id}/edit`)
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-500">
              Erreur lors du chargement des produits: {error?.message}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Produits</h1>
          <p className="text-muted-foreground">
            Gérez votre catalogue de produits
          </p>
        </div>
        <Button onClick={() => router.push("/produits/ajouter")}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Produit
        </Button>
      </div>

      {/* Filtres de produits */}
      <ProductFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Liste des produits */}
      <Card>
        <CardHeader>
          <CardTitle>
            Produits 
            {productsData && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({productsData.count} au total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            // Skeleton loading
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {filters.search ? "Aucun produit trouvé pour cette recherche" : "Aucun produit disponible"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  {/* Image du produit */}
                  <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                    {product.images[0] ? (
                      <img 
                        src={product.images[0].image} 
                        alt={product.name}
                        className="h-full w-full object-cover rounded"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">Pas d'image</span>
                    )}
                  </div>
                  
                  {/* Informations du produit */}
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p
  className="text-sm text-muted-foreground line-clamp-2"
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(product.short_description),
  }}
></p>

                    <div className="flex items-center space-x-4 mt-2">
                      <span className="font-medium">{product.regular_price} GNF</span>
                      {product.promo_price && (
                        <span className="text-sm text-red-500 line-through">
                          {product.promo_price} GNF
                        </span>
                      )}
                      <Badge variant={product.stock_status ? "default" : "secondary"}>
                        {product.stock_status ? "En stock" : "Rupture de stock"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Stock: {product.quantity}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Ventes: {product.nombre_ventes}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Type: {product.product_type}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewProduct(product.id.toString())}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditProduct(product.id.toString())}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id.toString())}
                      disabled={deleteProductMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination améliorée */}
          {productsData && productsData.count > 0 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Affichage de {startIndex + 1} à {Math.min(endIndex, productsData.count)} sur {productsData.count} produits
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  Précédent
                </Button>
                <span className="px-4 py-2 text-sm">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}