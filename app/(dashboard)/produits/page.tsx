"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useProducts, useDeleteProduct } from "@/hooks/api/products"
import { useDebounce } from "@/hooks/use-debounce"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function ProduitsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  
  // Debounce la recherche pour éviter trop de requêtes
  const debouncedSearch = useDebounce(searchTerm, 500)
  
  // Utiliser le hook useProducts
  const { 
    data: productsData, 
    isLoading, 
    isError, 
    error 
  } = useProducts(currentPage, debouncedSearch)
  
  const deleteProductMutation = useDeleteProduct()

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset à la première page lors d'une recherche
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
    console.log("View product", id)
    router.push(`/produits/${id}`)
  }

  const handleEditProduct = (id: string) => {
    console.log("Edit product", id)
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Produit
        </Button>
      </div>

      {/* Barre de recherche */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher des produits..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

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
          ) : productsData?.results?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "Aucun produit trouvé pour cette recherche" : "Aucun produit disponible"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {productsData?.results?.map((product) => (
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
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.short_description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="font-medium">{product.regular_price}€</span>
                      <Badge variant={product.etat_stock === "en_stock" ? "default" : "secondary"}>
                        {product.etat_stock === "en_stock" ? "En stock" : "Rupture de stock"}
                      </Badge>
                      {product.quantity !== undefined && (
                        <span className="text-sm text-muted-foreground">
                          Stock: {product.quantity}
                        </span>
                      )}
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
          
          {/* Pagination */}
          {productsData && productsData.count > 0 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} sur {Math.ceil(productsData.count / 10)}
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!productsData.previous || isLoading}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!productsData.next || isLoading}
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