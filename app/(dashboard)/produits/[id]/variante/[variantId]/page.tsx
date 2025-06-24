"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Edit, Trash2, Package, Eye, Plus, Calendar, Tag, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProductDetail, useAddVariantImages } from "@/hooks/api/products"
import { toast } from "react-hot-toast"
import { API_BASE_URL } from "@/constants"
import { getAuthHeaders } from "@/lib/auth-utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface Variant {
  id: number
  attributs: Array<{
    id: number
    attribut: {
      id: number
      nom: string
      created_at: string
      updated_at: string
    }
    valeur: string
    hex_code: string | null
    created_at: string
    updated_at: string
  }>
  images: Array<{
    id: number
    image: string
  }>
  image: string | null
  image_url: string | null
  supplier_price: string
  regular_price: string
  promo_price: string
  quantity: number
  nombre_ventes: number
  created_at: string
  updated_at: string
}

export default function VariantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const productId = params.id as string
  const variantId = params.variantId as string

  // Validation de l'ID de la variante
  if (!variantId || isNaN(Number(variantId))) {
    return (
      <div className="p-6 dark:bg-black dark:text-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push(`/produits/${productId}`)}
            className="dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Détails de la variante</h1>
        </div>
        
        <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <CardTitle className="text-red-700 dark:text-red-300 mb-2">ID de variante invalide</CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400 mb-4">
              L'identifiant de la variante n'est pas valide.
            </CardDescription>
            <Button 
              onClick={() => router.push(`/produits/${productId}`)}
              className="dark:bg-red-800 dark:hover:bg-red-700"
            >
              Retour au produit
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: product, isLoading: productLoading } = useProductDetail(productId)
  const { mutate: addVariantImages, isPending: isAddingImages } = useAddVariantImages()
  
  // Hook pour récupérer les détails de la variante
  const { data: variant, isLoading: variantLoading, refetch, error: variantError } = useQuery({
    queryKey: ['variant-detail', variantId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/products/viewset/variante/${variantId}/detail/`, {
        headers: getAuthHeaders(),
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Variante non trouvée')
        }
        throw new Error('Erreur lors de la récupération des détails de la variante')
      }
      
      return response.json()
    },
    enabled: !!variantId && !isNaN(Number(variantId)),
    retry: (failureCount, error) => {
      // Ne pas retry si c'est une erreur 404 (variante non trouvée)
      if (error.message === 'Variante non trouvée') {
        return false
      }
      return failureCount < 3
    }
  })

  // Hook pour supprimer la variante
  const { mutate: deleteVariant, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_BASE_URL}/products/viewset/variante/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la variante')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-detail', productId] })
      queryClient.invalidateQueries({ queryKey: ['variant-detail', variantId] })
    },
  })

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const formatPrice = (price: string | number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(price))
  }

  const formatAttributes = (attributs: Variant['attributs']): string => {
    if (!attributs || attributs.length === 0) return 'Aucun attribut'
    return attributs.map(attr => `${attr.attribut.nom}: ${attr.valeur}`).join(', ')
  }

  const handleDelete = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette variante ?")) {
      deleteVariant(parseInt(variantId), {
        onSuccess: () => {
          toast.success("Variante supprimée avec succès")
          router.push(`/produits/${productId}`)
        },
        onError: (error: Error) => {
          console.error("Erreur lors de la suppression:", error)
          toast.error("Erreur lors de la suppression de la variante")
        }
      })
    }
  }

  const handleAddImages = () => {
    imageInputRef.current?.click()
  }

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const formData = new FormData()
    
    // Format attendu par l'API backend:
    // FormData avec clé 'images' contenant un tableau de fichiers
    // { images: [File1, File2, File3, ...] }
    
    // Ajouter chaque image au FormData avec la clé 'images'
    // L'API backend s'attend à recevoir un tableau d'images
    Array.from(files).forEach((file) => {
      formData.append('images', file) // Clé 'images' pour le tableau
    })

    addVariantImages(
      { variantId, data: formData },
      {
        onSuccess: () => {
          toast.success("Images ajoutées avec succès")
          if (imageInputRef.current) {
            imageInputRef.current.value = ''
          }
          // Refresh des données de la variante pour afficher les nouvelles images
          refetch()
        },
        onError: (error) => {
          console.error("Erreur lors de l'ajout d'images:", error)
          toast.error("Erreur lors de l'ajout d'images")
        }
      }
    )
  }

  if (productLoading || variantLoading) {
    return (
      <div className="p-6 dark:bg-black dark:text-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" className="dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Skeleton className="h-[400px] rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-[400px] rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  // Gestion des erreurs
  if (variantError) {
    return (
      <div className="p-6 dark:bg-black dark:text-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push(`/produits/${productId}`)}
            className="dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Détails de la variante</h1>
        </div>
        
        <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <CardTitle className="text-red-700 dark:text-red-300 mb-2">
              {variantError.message === 'Variante non trouvée' ? 'Variante non trouvée' : 'Erreur de chargement'}
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400 mb-4">
              {variantError.message === 'Variante non trouvée' 
                ? 'La variante que vous recherchez n\'existe pas ou a été supprimée.'
                : variantError.message
              }
            </CardDescription>
            <Button 
              onClick={() => router.push(`/produits/${productId}`)}
              className="dark:bg-red-800 dark:hover:bg-red-700"
            >
              Retour au produit
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product || !variant) {
    return (
      <div className="p-6 dark:bg-black dark:text-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push(`/produits/${productId}`)}
            className="dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Détails de la variante</h1>
        </div>
        
        <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <CardTitle className="text-red-700 dark:text-red-300 mb-2">Données manquantes</CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400 mb-4">
              Impossible de charger les données du produit ou de la variante.
            </CardDescription>
            <Button 
              onClick={() => router.push(`/produits/${productId}`)}
              className="dark:bg-red-800 dark:hover:bg-red-700"
            >
              Retour au produit
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 dark:bg-black dark:text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push(`/produits/${productId}`)}
            className="dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
              <Package className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              Variante de {product.name}
            </h1>
            <p className="text-muted-foreground dark:text-gray-400">
              {variant.attributs && variant.attributs.length > 0 
                ? `Attributs: ${formatAttributes(variant.attributs)}`
                : 'Détails de la variante et ses attributs'
              }
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
            onClick={() => router.push(`/produits/${productId}/modifier?variant=${variantId}`)}
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
          <Button 
            variant="destructive" 
            className="flex items-center gap-2 dark:bg-red-900 dark:hover:bg-red-800"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="border-gray-200 dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Eye className="h-5 w-5" />
                Images de la variante
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Images spécifiques à cette variante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg relative mb-4">
                {variant.images && variant.images.length > 0 ? (
                  <img
                    src={variant.images[selectedImageIndex]?.image || "/placeholder.svg"}
                    alt={`Variante ${variant.id}`}
                    className="object-contain w-full h-full rounded-lg"
                  />
                ) : product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]?.image || "/placeholder.svg"}
                    alt={`Variante ${variant.id}`}
                    className="object-contain w-full h-full rounded-lg opacity-60"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground dark:text-gray-500">
                    <Eye className="h-12 w-12" />
                    <p className="ml-2">Aucune image disponible</p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex gap-2 overflow-x-auto">
                  {variant.images && variant.images.length > 0 && (
                    <>
                      {variant.images.map((image: any, index: any) => (
                        <div
                          key={index}
                          className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 flex-shrink-0 ${
                            selectedImageIndex === index ? "border-primary dark:border-blue-500" : "border-transparent"
                          }`}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img 
                            src={image.image} 
                            alt={`Image ${index + 1}`} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ))}
                    </>
                  )}
                  <div
                    className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                    onClick={handleAddImages}
                    title="Ajouter des images"
                  >
                    {isAddingImages ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 dark:border-gray-500"></div>
                    ) : (
                      <Plus className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              <input
                ref={imageInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </CardContent>
          </Card>

          <Tabs defaultValue="attributes" className="mt-6">
            <TabsList className="grid w-full grid-cols-2 dark:bg-gray-900">
              <TabsTrigger value="attributes" className="dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white dark:text-gray-400">Attributs</TabsTrigger>
              <TabsTrigger value="pricing" className="dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white dark:text-gray-400">Prix & Stock</TabsTrigger>
            </TabsList>

            <TabsContent value="attributes">
              <Card className="border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Tag className="h-5 w-5" />
                    Attributs principaux de la variante
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Configuration spécifique de cette variante
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {variant.attributs && variant.attributs.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {variant.attributs.map((attr: any) => (
                        <div key={attr.id} className="p-4 border rounded-lg dark:border-gray-800 dark:bg-black">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-sm text-muted-foreground dark:text-gray-400 uppercase">
                              {attr.attribut.nom}
                            </span>
                            {attr.hex_code && (
                              <div 
                                className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: attr.hex_code }}
                                title={`Couleur: ${attr.valeur}`}
                              />
                            )}
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-base dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                            style={attr.hex_code ? { 
                              backgroundColor: attr.hex_code, 
                              color: 'white',
                              borderColor: attr.hex_code
                            } : {}}
                          >
                            {attr.valeur}
                          </Badge>
                          <div className="mt-2 text-xs text-muted-foreground dark:text-gray-500">
                            ID: {attr.id}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Tag className="h-12 w-12 text-muted-foreground dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-muted-foreground dark:text-gray-400">Aucun attribut défini pour cette variante</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing">
              <Card className="border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="dark:text-white">Prix et stock</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Informations de tarification et de disponibilité
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Prix fournisseur</p>
                        <p className="text-2xl font-bold dark:text-white">{formatPrice(variant.supplier_price)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Prix de vente</p>
                        <p className="text-2xl font-bold text-primary dark:text-blue-400">{formatPrice(variant.regular_price)}</p>
                      </div>
                      {variant.promo_price && Number(variant.promo_price) > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Prix promotionnel</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatPrice(variant.promo_price)}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Stock disponible</p>
                        <Badge 
                          className={`text-lg px-3 py-1 ${
                            variant.quantity > 10 
                              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" 
                              : variant.quantity > 0 
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300" 
                              : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                          }`}
                        >
                          {variant.quantity} unités
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Ventes</p>
                        <p className="text-xl font-bold dark:text-white">{variant.nombre_ventes} ventes</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="border-gray-200 dark:border-gray-800 dark:bg-gray-900 h-full">
            <CardHeader className="pb-3 border-b dark:border-gray-800">
              <CardTitle className="text-xl dark:text-white">Informations variante</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Prix</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold dark:text-white">{formatPrice(variant.regular_price)}</p>
                    {variant.promo_price && Number(variant.promo_price) > 0 && (
                      <p className="text-lg line-through text-muted-foreground dark:text-gray-500">
                        {formatPrice(variant.promo_price)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">SKU</p>
                  <p className="font-medium dark:text-gray-200">{variant.sku || `${product.sku}-V${variant.id}`}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Stock</p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={`${
                        variant.quantity > 10 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" 
                          : variant.quantity > 0 
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300" 
                          : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                      }`}
                    >
                      {variant.quantity > 0 ? `${variant.quantity} en stock` : "Épuisé"}
                    </Badge>
                  </div>
                </div>

                {variant.attributs && variant.attributs.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Attributs principaux</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {variant.attributs.map((attr: any) => (
                        <Badge 
                          key={attr.id} 
                          variant="outline" 
                          className="bg-muted dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          style={attr.hex_code ? { 
                            backgroundColor: attr.hex_code, 
                            color: 'white',
                            borderColor: attr.hex_code
                          } : {}}
                        >
                          {attr.attribut.nom}: {attr.valeur}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Images</p>
                  <p className="font-medium dark:text-gray-200">
                    {variant.images ? variant.images.length : 0} image{variant.images && variant.images.length > 1 ? 's' : ''}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Prix fournisseur</p>
                  <p className="font-medium dark:text-gray-200">{formatPrice(variant.supplier_price)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Ventes réalisées</p>
                  <p className="font-medium dark:text-gray-200">{variant.nombre_ventes} ventes</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Date de création</p>
                  <p className="font-medium flex items-center gap-1 dark:text-gray-300">
                    <Calendar className="h-3 w-3 text-muted-foreground dark:text-gray-500" />
                    {new Date(variant.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Dernière modification</p>
                  <p className="font-medium flex items-center gap-1 dark:text-gray-300">
                    <Calendar className="h-3 w-3 text-muted-foreground dark:text-gray-500" />
                    {new Date(variant.updated_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 