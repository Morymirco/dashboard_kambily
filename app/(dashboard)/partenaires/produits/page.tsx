"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Search, ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchAllPartnerProducts, type PartnerProduct } from "@/services/partner-service"

export default function AllPartnerProductsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [products, setProducts] = useState<PartnerProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  // Effet pour le debounce de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Charger les produits
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const data = await fetchAllPartnerProducts(currentPage, debouncedSearchTerm)
        setProducts(data.results || [])
        setTotalProducts(data.count)
        setTotalPages(Math.ceil(data.count / 10)) // Supposons 10 produits par page
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error)
        setError("Impossible de charger les produits des partenaires")
        toast.error("Impossible de charger les produits des partenaires")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [currentPage, debouncedSearchTerm])

  // Formater le prix
  const formatPrice = (price: string) => {
    return Number.parseInt(price).toLocaleString() + " GNF"
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array(8)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} className="h-[300px] rounded-lg" />
            ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.push("/partenaires")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Produits des partenaires</h1>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
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
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.push("/partenaires")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Produits des partenaires</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Liste des produits</CardTitle>
          <CardDescription>{totalProducts} produits au total</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un produit..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-muted-foreground mb-2 text-4xl">📦</div>
              <p className="text-muted-foreground">Aucun produit trouvé</p>
              {searchTerm && (
                <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2">
                  Réinitialiser la recherche
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].image || "/placeholder.svg?height=200&width=300"}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">Pas d'image</div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <div className="flex flex-wrap gap-1 my-1">
                      {product.categories &&
                        product.categories.map((category) => (
                          <span key={category.id} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                            {category.name}
                          </span>
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{product.short_description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <p className="font-bold">{formatPrice(product.regular_price)}</p>
                        <p className="text-xs text-muted-foreground">Stock: {product.quantity}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/produits/${product.id}`)}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Partenaire:
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/partenaires/${product.partenaire.id}`)
                          }}
                        >
                          {product.partenaire.name}
                        </Button>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Affichage de {(currentPage - 1) * 10 + 1} à {Math.min(currentPage * 10, totalProducts)} sur{" "}
                {totalProducts} produits
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
  )
}

