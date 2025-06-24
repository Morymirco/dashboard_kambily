"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Edit, Trash2, Tag, Package, Search, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useTagDetail, useUpdateTag, useDeleteTag } from "@/hooks/api/tags"
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

  const { data: tag, isLoading, refetch } = useTagDetail(id)
  const { mutate: updateTag, isPending: isUpdating } = useUpdateTag()
  const { mutate: deleteTag, isPending: isDeleting } = useDeleteTag()

  const [searchTerm, setSearchTerm] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })

  // Filtrer les produits par recherche
  const filteredProducts = tag?.products?.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

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
        { id: tag.id, data: formData },
        {
          onSuccess: () => {
            toast.success("Étiquette modifiée avec succès")
            setIsEditDialogOpen(false)
            refetch()
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
      deleteTag(tag.id, {
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon">
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

  if (!tag) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.push("/etiquettes")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Détails de l'étiquette</h1>
        </div>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <CardTitle className="text-red-700 mb-2">Étiquette non trouvée</CardTitle>
            <CardDescription className="text-red-600 mb-4">
              L'étiquette que vous recherchez n'existe pas ou a été supprimée.
            </CardDescription>
            <Button onClick={() => router.push("/etiquettes")}>Retour aux étiquettes</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push("/etiquettes")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Tag className="h-6 w-6 text-teal-600" />
              {tag.name}
            </h1>
            <p className="text-muted-foreground">Détails de l'étiquette et produits associés</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
          <Button 
            variant="destructive" 
            className="flex items-center gap-2"
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produits associés ({tag.products?.length || 0})
              </CardTitle>
              <CardDescription>
                Liste des produits qui utilisent cette étiquette
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {tag.products && tag.products.length > 0 ? (
                <div className="space-y-4">
                  {filteredProducts.map((product: Product) => (
                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img 
                                src={product.images[0].image} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Eye className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-lg truncate">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="font-medium text-lg">
                                    {formatPrice(product.regular_price)}
                                  </span>
                                  <Badge 
                                    variant={product.is_published ? "default" : "secondary"}
                                    className={product.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                  >
                                    {product.is_published ? "Publié" : "Brouillon"}
                                  </Badge>
                                  <Badge variant="outline">
                                    {product.product_type === "variable" ? "Variable" : "Simple"}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/produits/${product.id}`)}
                                className="flex-shrink-0"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Voir
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchTerm ? "Aucun produit trouvé" : "Aucun produit associé"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? "Essayez de modifier vos critères de recherche"
                      : "Aucun produit n'utilise cette étiquette pour le moment"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'étiquette</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nom</p>
                <p className="font-medium">{tag.name}</p>
              </div>

              {tag.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{tag.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre de produits</p>
                <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                  {tag.products?.length || 0} produit{(tag.products?.length || 0) !== 1 ? 's' : ''}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                <p className="text-sm">
                  {new Date(tag.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'étiquette</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'étiquette
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de l'étiquette</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Nouveau, Populaire, Promotion"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de l'étiquette..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isUpdating ? "Enregistrement..." : "Modifier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 