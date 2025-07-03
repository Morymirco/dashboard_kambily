"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useCategoryProducts } from "@/hooks/api/categories"
import { ChevronLeft, ChevronRight, Package, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

// Type pour les produits
type Product = {
  id: number
  name: string
  slug: string
  regular_price: string
  promo_price: string
  short_description: string
  etat_stock: string
  sku: string
  stock_status: boolean
  quantity: number
  nombre_ventes: number
  product_type: string
  is_recommended: boolean
  images: Array<{ id: number, image: string, image_url: string | null, created_at: string, updated_at: string, product: number }>
  variantes_keys: string[]
  created_at: string
  updated_at: string
}

interface CategoryProductsPanelProps {
  categoryId: string
  categoryName?: string
  showHeader?: boolean
  maxProducts?: number
}

export default function CategoryProductsPanel({ 
  categoryId, 
  categoryName = "Produits", 
  showHeader = true,
  maxProducts 
}: CategoryProductsPanelProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [filterType, setFilterType] = useState("all")

  const { data: categoryProductsData, isLoading } = useCategoryProducts(categoryId, currentPage)

  const products = categoryProductsData?.products || []
  const pagination = categoryProductsData?.pagination

  // Filtrer et trier les produits
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = filterType === "all" || 
                         (filterType === "simple" && product.product_type === "simple") ||
                         (filterType === "variable" && product.product_type === "variable") ||
                         (filterType === "recommended" && product.is_recommended) ||
                         (filterType === "inStock" && product.stock_status === false)

      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "price":
          return parseFloat(a.regular_price) - parseFloat(b.regular_price)
        case "sales":
          return b.nombre_ventes - a.nombre_ventes
        case "stock":
          return b.quantity - a.quantity
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })
    .slice(0, maxProducts)

  const totalProducts = pagination?.total_products || 0
  const totalPages = pagination?.total_pages || 1

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produits de la catégorie {categoryName}
          </CardTitle>
          <CardDescription>
            {totalProducts} produit{totalProducts !== 1 ? 's' : ''} dans cette catégorie
          </CardDescription>
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {/* Filtres et recherche */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="price">Prix</SelectItem>
                <SelectItem value="sales">Ventes</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="newest">Plus récent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="variable">Variable</SelectItem>
                <SelectItem value="recommended">Recommandés</SelectItem>
                <SelectItem value="inStock">En stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Liste des produits */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center space-x-3 rounded-md border p-3">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="space-y-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="flex items-center space-x-3 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0].image}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-6 w-6 m-3 text-muted-foreground/50" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/produits/${product.id}`}
                    className="font-medium hover:underline truncate block"
                  >
                    {product.name}
                  </Link>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="truncate">
                      {product.promo_price && product.promo_price !== "0.00" ? (
                        <>
                          <span className="line-through">{parseInt(product.regular_price).toLocaleString()} GNF</span>
                          <span className="ml-1 text-green-600">{parseInt(product.promo_price).toLocaleString()} GNF</span>
                        </>
                      ) : (
                        <>{parseInt(product.regular_price).toLocaleString()} GNF</>
                      )}
                    </span>
                    
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">
                      {product.product_type === "variable" ? "Variable" : "Simple"}
                    </span>
                    
                    {product.is_recommended && (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        Recommandé
                      </span>
                    )}
                    
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.stock_status ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {product.stock_status ? "Rupture" : "En stock"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span>SKU: {product.sku}</span>
                    <span>Stock: {product.quantity}</span>
                    <span>Ventes: {product.nombre_ventes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm || filterType !== "all" 
                ? "Aucun produit ne correspond aux critères de recherche" 
                : "Aucun produit dans cette catégorie"
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !maxProducts && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= totalPages || isLoading}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Bouton voir tous les produits */}
        {maxProducts && filteredProducts.length >= maxProducts && (
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/produits?category=${categoryId}`}>
                Voir tous les produits de cette catégorie
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 