"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Edit, Trash2, Tag, Package, Search, Eye, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useTag, useTagProducts, useRemoveTagFromProduct, useAddTagToProduct, useUpdateTag, useDeleteTag } from "@/hooks/api/tags"
import { useSimpleProductList } from "@/hooks/api/products"
import { toast } from "react-hot-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Tag {
  id: number
  name: string
  description?: string
  products_count?: number
  created_at: string
  products?: Product[]
}

interface Product {
  id: number
  name: string
  sku: string
  regular_price: string
  quantity: number
  is_published: boolean
  product_type: string
  created_at: string
  images?: Array<{ image: string }>
}

export default function TagDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data: tag, isLoading, error } = useTag(id)
  const { data: productsData, isLoading: isLoadingProducts, error: errorProducts } = useTagProducts(id, page, pageSize)
  const removeTagMutation = useRemoveTagFromProduct()
  const addTagMutation = useAddTagToProduct()
  const [addProductId, setAddProductId] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const { data: simpleProducts, isLoading: isLoadingSimpleProducts } = useSimpleProductList(productSearch, 300)

  const { mutate: updateTag, isPending: isUpdating } = useUpdateTag()
  const { mutate: deleteTag, isPending: isDeleting } = useDeleteTag()

  const [searchTerm, setSearchTerm] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })

  const handleEdit = () => {
    if (tag) {
      setFormData({
        name: tag.name,
        description: tag.description || ""
      })
      setIsEditDialogOpen(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (tag) {
      updateTag(
        { id: tag.id.toString(), data: formData },
        {
          onSuccess: () => {
            toast.success("Étiquette modifiée avec succès")
            setIsEditDialogOpen(false)
          },
          onError: (error: Error) => {
            console.error("Erreur lors de la modification:", error)
            toast.error("Erreur lors de la modification de l'étiquette")
          }
        }
      )
    }
  }

  const handleDelete = () => {
    if (tag && window.confirm("Êtes-vous sûr de vouloir supprimer cette étiquette ?")) {
      deleteTag(tag.id.toString(), {
        onSuccess: () => {
          toast.success("Étiquette supprimée avec succès")
          router.push("/etiquettes")
        },
        onError: (error: Error) => {
          console.error("Erreur lors de la suppression:", error)
          toast.error("Erreur lors de la suppression de l'étiquette")
        }
      })
    }
  }

  const formatPrice = (price: string): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(price))
  }

  // Afficher un toast si erreur de chargement des produits
  useEffect(() => {
    if (errorProducts) {
      toast.error("Erreur lors du chargement des produits associés à cette étiquette.");
    }
  }, [errorProducts]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-muted rounded mb-4" />
        <div className="h-6 w-32 bg-muted rounded mb-2" />
        <div className="h-4 w-64 bg-muted rounded mb-2" />
        <div className="h-4 w-40 bg-muted rounded mb-2" />
      </div>
    )
  }

  if (error || !tag) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">Erreur lors du chargement de l'étiquette.</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </div>
    )
  }

  // Pagination helpers
  const total = productsData?.count || 0
  const totalPages = Math.ceil(total / pageSize)
  const products = productsData?.results || []

  return (
    <div className="p-6 mx-auto">
      <Button onClick={() => router.back()} variant="outline" className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-5 w-5 text-teal-600" />
            <CardTitle className="text-2xl">{tag.name}</CardTitle>
          </div>
          <CardDescription>
            {tag.description || <span className="italic text-muted-foreground">Aucune description</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Badge variant="secondary" className="bg-teal-100 text-teal-800">
              {productsData?.count || 0} produit{productsData?.count !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Créée le : {tag.created_at ? new Date(tag.created_at).toLocaleDateString('fr-FR') : '-'}
          </div>
          {tag.updated_at && (
            <div className="text-sm text-muted-foreground">
              Modifiée le : {new Date(tag.updated_at).toLocaleDateString('fr-FR')}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        {/*<CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Produits associés</CardTitle>
          </div>
          <CardDescription>
            Liste paginée des produits ayant cette étiquette
          </CardDescription>
          <form
            className="flex flex-col sm:flex-row gap-2 mt-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!addProductId) return;
              try {
                await addTagMutation.mutateAsync({ tagId: id, productId: Number(addProductId) });
                toast.success("Étiquette ajoutée au produit avec succès");
                setAddProductId("");
              } catch (err: any) {
                toast.error(err?.response?.data?.error || err.message || "Erreur lors de l'ajout de l'étiquette au produit");
              }
            }}
          >
            <div className="flex flex-col gap-2 w-full sm:flex-row">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="border rounded px-3 py-2 w-full sm:w-48"
              />
              <select
                value={addProductId}
                onChange={e => setAddProductId(e.target.value)}
                className="border rounded px-3 py-2 w-full sm:w-64"
                required
                disabled={isLoadingSimpleProducts}
              >
                <option value="">Sélectionner un produit</option>
                {simpleProducts?.results?.map((prod: any) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} (ID: {prod.id})
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              disabled={addTagMutation.isPending || !addProductId}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {addTagMutation.isPending ? "Ajout..." : "Ajouter à un produit"}
            </Button>
          </form>
        </CardHeader>*/}
        <CardContent>
          {isLoadingProducts ? (
            <div className="flex flex-col gap-2">
              {[...Array(pageSize)].map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded animate-pulse" />
              ))}
              <span className="text-center text-muted-foreground mt-2">Chargement des produits...</span>
            </div>
          ) : errorProducts ? (
            <div className="text-red-600 py-8 text-center">Impossible de charger les produits.</div>
          ) : products.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">Aucun produit associé à cette étiquette.</div>
          ) : (
            <div className="divide-y divide-border">
              {products.map((product: any) => (
                <div key={product.id} className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-medium text-foreground text-base">{product.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">{product.short_description}</div>
                    </div>
                    <div className="flex flex-col md:items-end gap-1">
                      <span className="text-sm">Prix : <span className="font-semibold">{product.regular_price} GNF</span></span>
                      {product.promo_price && (
                        <span className="text-xs text-green-600">Promo : {product.promo_price} GNF</span>
                      )}
                      <span className="text-xs">Stock : {product.etat_stock}</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="mt-2"
                        disabled={removeTagMutation.isPending}
                        onClick={async () => {
                          try {
                            await removeTagMutation.mutateAsync({ tagId: id, productId: product.id });
                            toast.success("Étiquette retirée du produit avec succès");
                          } catch (err: any) {
                            toast.error(err?.response?.data?.error || err.message || "Erreur lors du retrait de l'étiquette");
                          }
                        }}
                      >
                        {removeTagMutation.isPending ? "Suppression..." : "Retirer l'étiquette"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => router.push(`/produits/${product.id}`)}
                      >
                        Détail
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <span className="text-sm">
                Page {page} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 