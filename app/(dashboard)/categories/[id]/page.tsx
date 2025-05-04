"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {formatPrice } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ArrowLeft, Tags, Save, Trash2, FolderTree, ImageIcon, Package, AlertTriangle, Pencil } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { API_BASE_URL } from "@/constants"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Type pour les catégories
type Category = {
  id: number
  name: string
  description: string
  slug: string
  is_main: boolean
  image: string | null
  created_at: string
  updated_at: string
  parent_category: number | string | null
  total_products?: number
  total?: number
}

// Type pour les produits
type Product = {
  id: number
  name: string
  slug: string
  regular_price: string
  promo_price: string
  short_description: string
  images: Array<{ id: number, image: string }>
  is_recommended: boolean
}

export default function CategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getToken } = useAuth()
  const [category, setCategory] = useState<Category | null>(null)
  const [parentCategories, setParentCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_main: false,
    parent_category: null as number | null,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const id = params.id as string

  useEffect(() => {
    fetchCategory()
    fetchParentCategories()
  }, [id])

  const fetchCategory = async () => {
    try {
      setIsLoading(true)
      const token = getToken()
      
      const response = await fetch(`${API_BASE_URL}/categories/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      setCategory(data)
      setProducts(data.products || [])
      setFormData({
        name: data.name,
        description: data.description || "",
        is_main: data.is_main,
        parent_category: typeof data.parent_category === 'number' ? data.parent_category : null,
      })
      setImagePreview(data.image)
    } catch (error) {
      console.error("Erreur lors de la récupération de la catégorie:", error)
      toast.error("Impossible de charger les détails de la catégorie")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchParentCategories = async () => {
    try {
      const token = getToken()
      
        const response = await fetch(`${API_BASE_URL}/categories/?is_main=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      // Filtrer pour exclure la catégorie actuelle des parents possibles
      setParentCategories(data.filter((cat: Category) => cat.id !== parseInt(id)))
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories parentes:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_main: checked }))
  }

  const handleParentCategoryChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      parent_category: value ? parseInt(value) : null 
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      
      // Créer un aperçu de l'image
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const token = getToken()
      
      // Créer un FormData pour envoyer l'image
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('is_main', formData.is_main.toString())
      
      if (formData.parent_category !== null) {
        formDataToSend.append('parent_category', formData.parent_category.toString())
      }
      
      if (imageFile) {
        formDataToSend.append('image', imageFile)
      }
      
      const response = await fetch(`${API_BASE_URL}/categories/viewset/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const updatedCategory = await response.json()
      setCategory(updatedCategory)
      setIsEditing(false)
      toast.success("Catégorie mise à jour avec succès")
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la catégorie:", error)
      toast.error("Impossible de mettre à jour la catégorie")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const token = getToken()
      
      const response = await fetch(`${API_BASE_URL}/categories/viewset/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        // Si la réponse contient un corps JSON avec des détails d'erreur
        try {
          const errorData = await response.json()
          throw new Error(
            Object.entries(errorData)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
              .join("\n")
          )
        } catch (jsonError) {
          // Si la réponse n'est pas du JSON, utiliser le statut HTTP
          throw new Error(`Erreur lors de la suppression: ${response.status} ${response.statusText}`)
        }
      }
      
      toast.success(`La catégorie "${category?.name}" a été supprimée`)
      router.push('/categories')
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie:", error)
      toast.error(error instanceof Error ? error.message : "Impossible de supprimer la catégorie")
      setIsDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading && !category) {
    return <CategoryDetailSkeleton />
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/categories" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux catégories
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Détails de la catégorie */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Détails de la catégorie</CardTitle>
                <CardDescription>Informations sur la catégorie et ses paramètres</CardDescription>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>Modifier</Button>
                ) : (
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false)
                    // Réinitialiser le formulaire
                    if (category) {
                      setFormData({
                        name: category.name,
                        description: category.description || "",
                        is_main: category.is_main,
                        parent_category: typeof category.parent_category === 'number' ? category.parent_category : null,
                      })
                      setImagePreview(category.image)
                      setImageFile(null)
                    }
                  }}>
                    Annuler
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="aspect-video relative overflow-hidden rounded-md bg-muted">
                    {category?.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Tags className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{category?.name}</h2>
                    <p className="text-muted-foreground">{category?.description || "Aucune description"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Type</p>
                      <p className="flex items-center text-muted-foreground">
                        {category?.is_main ? (
                          <>
                            <FolderTree className="mr-1 h-4 w-4" /> Catégorie principale
                          </>
                        ) : (
                          <>
                            <Tags className="mr-1 h-4 w-4" /> Sous-catégorie
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Slug</p>
                      <p className="text-muted-foreground">{category?.slug}</p>
                    </div>
                    {!category?.is_main && category?.parent_category && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium">Catégorie parente</p>
                        <p className="text-muted-foreground">
                          {typeof category.parent_category === 'string' 
                            ? category.parent_category 
                            : parentCategories.find(cat => cat.id === category.parent_category)?.name || `ID: ${category.parent_category}`}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">Nombre de produits</p>
                      <p className="text-muted-foreground">
                        {category?.total_products || products.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Valeur totale</p>
                      <p className="flex items-center text-muted-foreground">
                        {category?.total ? (
                          <>
                            {category.total.toLocaleString()} GNF
                          </>
                        ) : (
                          "0 GNF"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Créée le</p>
                      <p className="text-muted-foreground">
                        {new Date(category?.created_at || "").toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Mise à jour le</p>
                      <p className="text-muted-foreground">
                        {new Date(category?.updated_at || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la catégorie</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_main"
                      checked={formData.is_main}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="is_main">Catégorie principale</Label>
                  </div>
                  
                  {!formData.is_main && (
                    <div className="space-y-2">
                      <Label htmlFor="parent_category">Catégorie parente</Label>
                      <Select
                        value={formData.parent_category?.toString() || ""}
                        onValueChange={handleParentCategoryChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie parente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Aucune</SelectItem>
                          {parentCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="image">Image</Label>
                    <div className="grid gap-4">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {imagePreview && (
                        <div className="aspect-video relative overflow-hidden rounded-md bg-muted">
                          <Image
                            src={imagePreview}
                            alt="Aperçu"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="submit" disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les modifications
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Produits de la catégorie */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Produits associés</CardTitle>
              <CardDescription>
                {category?.total_products || products.length} produit{(category?.total_products || products.length) !== 1 ? 's' : ''} dans cette catégorie
              </CardDescription>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="flex items-center space-x-3 rounded-md border p-3">
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
                        <div className="flex items-center text-sm text-muted-foreground">
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
                          {product.is_recommended && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-amber-500">Recommandé</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Aucun produit dans cette catégorie
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/produits?category=${id}`}>
                  Voir tous les produits
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la catégorie <strong>{category?.name}</strong> ?
              
              {category?.is_main && (
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md text-amber-800 dark:text-amber-200">
                  <p className="text-sm font-medium">Attention !</p>
                  <p className="text-xs">
                    Cette catégorie est une catégorie principale. Sa suppression entraînera également la suppression de toutes ses sous-catégories.
                  </p>
                </div>
              )}
              
              {products.length > 0 && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md text-blue-800 dark:text-blue-200">
                  <p className="text-sm font-medium">Information</p>
                  <p className="text-xs">
                    Cette catégorie contient {products.length} produit{products.length > 1 ? 's' : ''}. 
                    Les produits ne seront pas supprimés, mais ils ne seront plus associés à cette catégorie.
                  </p>
                </div>
              )}
              
              <p className="mt-2 text-sm">Cette action est irréversible.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Composant pour le squelette de chargement de la page de détail
function CategoryDetailSkeleton() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center text-muted-foreground">
          <Skeleton className="mr-2 h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Squelette pour les détails de la catégorie */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <Skeleton className="h-6 w-[180px] mb-2" />
                <Skeleton className="h-4 w-[250px]" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-[100px] rounded-md" />
                <Skeleton className="h-10 w-[100px] rounded-md" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="aspect-video relative overflow-hidden rounded-md bg-muted">
                  <Skeleton className="h-full w-full" />
                </div>
                <div>
                  <Skeleton className="h-8 w-[250px] mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-5 w-[80px] mb-1" />
                    <Skeleton className="h-4 w-[120px]" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-[80px] mb-1" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-[120px] mb-1" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-[100px] mb-1" />
                    <Skeleton className="h-4 w-[130px]" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-[80px] mb-1" />
                    <Skeleton className="h-4 w-[120px]" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-[100px] mb-1" />
                    <Skeleton className="h-4 w-[120px]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Squelette pour les produits associés */}
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px] mb-2" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-3 rounded-md border p-3">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-[180px] mb-2" />
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[80px] ml-4" />
                      </div>
                    </div>
                    <Skeleton className="h-2 w-2 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full rounded-md" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 