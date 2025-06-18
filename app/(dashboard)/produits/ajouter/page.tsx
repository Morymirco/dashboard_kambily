"use client"

import type React from "react"

import {
  ChevronRight,
  CircleDollarSign,
  ImageIcon,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  Save,
  Tag,
  Trash2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"

import { Editor } from "@/app/components/editor"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { API_BASE_URL } from "@/constants"
import { useCategoriesOff } from "@/hooks/api/categories"
import { usePartnersOff } from "@/hooks/api/parteners"
import { useCreateProduct } from "@/hooks/api/products"
import { useTags } from "@/hooks/api/tags"
import { getAuthHeaders, getAuthToken } from "@/lib/auth-utils"
import { CreateProductData } from "@/lib/types/products"

export default function AjouterProduitPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingAttributes, setLoadingAttributes] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { mutate: createProduct, isPending } = useCreateProduct()

  // Utilisation des hooks pour récupérer les données
  const { data: categoriesData, isLoading: loadingCategories } = useCategoriesOff()
  const { data: partnersData, isLoading: loadingPartners } = usePartnersOff()
  const { data: tagsData, isLoading: loadingTags } = useTags()

  const [productData, setProductData] = useState<CreateProductData>({
    name: "",
    sku: "",
    regular_price: "",
    quantity: 0,
    supplier_price: 0,
    is_published: true,
    product_type: "simple",
    is_recommended: false,
    is_vedette: false,
    is_variable: false,
    partenaire: 0,
    categories: [],
    etiquettes: [],
    images: [],
    short_description: "",
    long_description: ""
  })

  // État pour les images
  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])

  // État pour les attributs et catégories
  const [availableCategories, setAvailableCategories] = useState<any[]>([])
  const [availableTags, setAvailableTags] = useState<any[]>([])
  const [availablePartners, setAvailablePartners] = useState<any[]>([])
  const [availableAttributes, setAvailableAttributes] = useState<any[]>([])

  // Mettre à jour les états quand les données sont chargées
  useEffect(() => {
    if (categoriesData) {
      const organizedCategories = organizeCategories(categoriesData)
      setAvailableCategories(organizedCategories)
    }
  }, [categoriesData])

  useEffect(() => {
    if (tagsData) {
      setAvailableTags(tagsData)
    }
  }, [tagsData])

  useEffect(() => {
    if (partnersData) {
      setAvailablePartners(partnersData)
    }
  }, [partnersData])

  // Fonction pour organiser les catégories de manière hiérarchique
  const organizeCategories = (categories: any[]) => {
    const categoryMap = new Map()
    const rootCategories: any[] = []

    // Créer un Map de toutes les catégories
    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] })
    })

    // Organiser les catégories dans une structure hiérarchique
    categories.forEach((category) => {
      const categoryWithChildren = categoryMap.get(category.id)
      if (category.parent_category === null) {
        rootCategories.push(categoryWithChildren)
      } else {
        const parentCategory = categoryMap.get(category.parent_category)
        if (parentCategory) {
          parentCategory.children.push(categoryWithChildren)
        }
      }
    })

    return rootCategories
  }

  // Charger les attributs et catégories au chargement de la page
  useEffect(() => {
    console.log("%c[AjouterProduitPage] Initialisation de la page", "color: #3b82f6; font-weight: bold;")

    const fetchData = async () => {
      try {
        console.log("%c[AjouterProduitPage] Récupération des attributs et catégories...", "color: #3b82f6;")
        
        const response = await fetch(
          `${API_BASE_URL}/products/attributes/of/`,
          {
            method: 'GET',
            headers: getAuthHeaders(),
          }
        )

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login')
            return
          }
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data = await response.json()
        console.log("%c[AjouterProduitPage] Données reçues:", "color: #10b981;", data)
        
        const { categories, tags, partenaires, attributs } = data

        // Organiser les catégories de manière hiérarchique
        const organizedCategories = organizeCategories(categories)
        setAvailableCategories(organizedCategories)

        setAvailableTags(tags)
        setAvailablePartners(partenaires)
        setAvailableAttributes(attributs)

        console.log(
          "%c[AjouterProduitPage] Données traitées et stockées avec succès",
          "color: #10b981; font-weight: bold;",
        )
      } catch (error) {
        console.error(
          "%c[AjouterProduitPage] Erreur lors de la récupération des données:",
          "color: #ef4444; font-weight: bold;",
          error
        )
        if (error instanceof Error && error.message.includes('401')) {
          router.push('/login')
          return
        }
        toast.error("Erreur lors de la récupération des données")
      } finally {
        setLoadingAttributes(false)
      }
    }

    fetchData()
  }, [router])

  // Gérer les changements dans le formulaire principal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProductData((prev) => ({ ...prev, [name]: value }))
  }

  // Gérer les changements de switch
  const handleSwitchChange = (name: string, checked: boolean) => {
    setProductData((prev) => ({ ...prev, [name]: checked }))
  }

  // Gérer le téléchargement d'images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setImages((prev) => [...prev, ...newFiles])

      // Créer des URLs pour les aperçus
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file))
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls])
    }
  }

  // Supprimer une image
  const handleRemoveImage = (index: number) => {
    // Libérer l'URL de l'aperçu
    URL.revokeObjectURL(imagePreviewUrls[index])

    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    console.log("%c[AjouterProduitPage] Soumission du formulaire...", "color: #3b82f6; font-weight: bold;")

    try {
      // Validation de base
      if (!productData.name || !productData.long_description) {
        console.warn(
          "%c[AjouterProduitPage] Validation échouée: champs obligatoires manquants",
          "color: #f59e0b; font-weight: bold;",
        )
        toast.error("Veuillez remplir tous les champs obligatoires")
        return
      }

      // Préparer les données pour l'API
      const formData = new FormData()

      // Ajouter les données du produit
      Object.entries(productData).forEach(([key, value]) => {
        if (key !== "categories" && key !== "etiquettes" && key !== "images" && value !== null) {
          formData.append(key, value.toString())
        }
      })

      // Ajouter les catégories
      productData.categories.forEach((categoryId) => {
        formData.append("categories", categoryId.toString())
      })

      // Ajouter les étiquettes
      productData.etiquettes.forEach((tagId) => {
        formData.append("etiquettes", tagId.toString())
      })

      // Ajouter les images du produit
      images.forEach((file) => {
        formData.append("images", file)
      })

      console.log("%c[AjouterProduitPage] Données du formulaire préparées", "color: #10b981;")

      createProduct(formData, {
        onSuccess: (data) => {
          console.log("%c[AjouterProduitPage] Produit créé avec succès:", "color: #10b981; font-weight: bold;", data)
          toast.success("Produit ajouté avec succès")
          router.push("/produits")
        },
        onError: (error: any) => {
          console.error(
            "%c[AjouterProduitPage] Erreur lors de l'ajout du produit:",
            "color: #ef4444; font-weight: bold;",
            error,
          )
          setError(error.message || "Une erreur est survenue lors de l'ajout du produit")
          toast.error("Une erreur est survenue lors de l'ajout du produit")
        }
      })

    } catch (error: any) {
      console.error(
        "%c[AjouterProduitPage] Erreur lors de l'ajout du produit:",
        "color: #ef4444; font-weight: bold;",
        error,
      )
      setError(error.message || "Une erreur est survenue lors de l'ajout du produit")
      toast.error("Une erreur est survenue lors de l'ajout du produit")
    }
  }

  // Fonction récursive pour afficher les catégories
  const CategoryItem = ({ category, level = 0 }: { category: any; level?: number }) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center">
          <div style={{ marginLeft: `${level * 20}px` }} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category.id}`}
              checked={productData.categories.includes(category.id)}
              onCheckedChange={(checked) => {
                const isChecked = Boolean(checked)
                const updatedCategories = isChecked
                  ? [...productData.categories, category.id]
                  : productData.categories.filter((id) => id !== category.id)
                setProductData({ ...productData, categories: updatedCategories })
              }}
            />
            <Label
              htmlFor={`category-${category.id}`}
              className="cursor-pointer text-sm flex-1 p-2 hover:bg-white rounded-md transition-colors flex items-center"
            >
              {category.name}
              {category.is_main && (
                <Badge variant="secondary" className="ml-2">
                  Principal
                </Badge>
              )}
            </Label>
          </div>
        </div>
        {category.children && category.children.length > 0 && (
          <div className="ml-4">
            {category.children.map((child: any) => (
              <CategoryItem key={child.id} category={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Vérifier l'authentification au chargement de la page
  useEffect(() => {
    console.log("%c[AjouterProduitPage] Page d'ajout de produit chargée", "color: #3b82f6; font-weight: bold;")

    // Vérifier si le token est disponible
    const token = getAuthToken()
    if (token) {
      console.log(
        "%c[AjouterProduitPage] Token disponible au chargement:",
        "color: #10b981; font-weight: bold;",
        token.substring(0, 10) + "...",
      )
    } else {
      console.warn("%c[AjouterProduitPage] Token non disponible au chargement", "color: #f59e0b; font-weight: bold;")
    }
  }, [])

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ajouter un produit</h1>
          <p className="text-muted-foreground">Créez un nouveau produit dans votre catalogue</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/produits")}>
            <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
            Retour
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSubmit} disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Général</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Images</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Prix & Stock</span>
            </TabsTrigger>
            <TabsTrigger value="attributes" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Attributs</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Général */}
          <TabsContent value="general" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>Informations de base sur le produit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nom du produit <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Nom du produit"
                      value={productData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">
                      SKU <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sku"
                      name="sku"
                      placeholder="SKU-12345"
                      value={productData.sku}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="short_description">Description courte</Label>
                    <Editor
                      value={productData.short_description}
                      onChange={(content: string) => {
                        setProductData({
                          ...productData,
                          short_description: content
                        })
                      }}
                      height={150}
                      toolbar={[
                        'bold italic underline | alignleft aligncenter alignright | bullist numlist | removeformat'
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="long_description">
                      Description complète <span className="text-red-500">*</span>
                    </Label>
                    <Editor
                      value={productData.long_description}
                      onChange={(content: string) => {
                        setProductData({
                          ...productData,
                          long_description: content
                        })
                      }}
                      height={400}
                      toolbar={[
                        'undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | removeformat'
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="partenaire" className="text-base">
                    Partenaire
                  </Label>
                  <Select
                    value={productData.partenaire ? productData.partenaire.toString() : "0"}
                    onValueChange={(value) =>
                      setProductData({
                        ...productData,
                        partenaire: Number.parseInt(value, 10),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un partenaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Aucun partenaire</SelectItem>
                      {availablePartners.map((partner) => (
                        <SelectItem key={partner.id} value={partner.id.toString()}>
                          {partner.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_recommended">Produit recommandé</Label>
                      <p className="text-sm text-muted-foreground">
                        Afficher ce produit dans les sections recommandées
                      </p>
                    </div>
                    <Switch
                      id="is_recommended"
                      checked={productData.is_recommended}
                      onCheckedChange={(checked) => handleSwitchChange("is_recommended", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_published">Publié</Label>
                      <p className="text-sm text-muted-foreground">Rendre ce produit visible sur le site</p>
                    </div>
                    <Switch
                      id="is_published"
                      checked={productData.is_published}
                      onCheckedChange={(checked) => handleSwitchChange("is_published", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_vedette">Produit vedette</Label>
                      <p className="text-sm text-muted-foreground">Mettre ce produit en avant sur la page d'accueil</p>
                    </div>
                    <Switch
                      id="is_vedette"
                      checked={productData.is_vedette}
                      onCheckedChange={(checked) => handleSwitchChange("is_vedette", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Images */}
          <TabsContent value="images" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Images du produit</CardTitle>
                <CardDescription>Ajoutez des images pour votre produit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Pour une présentation optimale de votre produit, ajoutez au moins une image. Les formats acceptés
                    sont JPEG, PNG et WEBP.
                  </p>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Ajouter des images
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {imagePreviewUrls.map((imageUrl, index) => (
                    <div key={index} className="relative rounded-md border border-border overflow-hidden group">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={`Product ${index + 1}`}
                        className="h-40 w-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div
                    className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/50 p-4 text-center hover:bg-muted cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <p className="mt-2 text-sm font-medium">Ajouter des images</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP jusqu'à 5MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Prix & Stock */}
          <TabsContent value="pricing" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prix et stock</CardTitle>
                <CardDescription>Gérez les prix et le stock de votre produit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="supplier_price">Prix du fournisseur (GNF)</Label>
                    <div className="relative">
                      <CircleDollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="supplier_price"
                        name="supplier_price"
                        type="number"
                        placeholder="0"
                        className="pl-10"
                        value={productData.supplier_price}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regular_price">Prix de vente (GNF)</Label>
                    <div className="relative">
                      <CircleDollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="regular_price"
                        name="regular_price"
                        type="number"
                        placeholder="0"
                        className="pl-10"
                        value={productData.regular_price}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantité en stock</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      placeholder="0"
                      value={productData.quantity}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_type">Type de produit</Label>
                    <Select
                      value={productData.product_type}
                      onValueChange={(value) => setProductData({ ...productData, product_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="variable">Variable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Attributs */}
          <TabsContent value="attributes" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Catégories et étiquettes</CardTitle>
                <CardDescription>Classez votre produit pour faciliter sa découverte</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCategories || loadingPartners || loadingTags ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Chargement des données...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Catégories */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-500" />
                        <h3 className="font-medium">Catégories</h3>
                      </div>

                      <ScrollArea className="h-64 border rounded-lg p-4 bg-muted/50">
                        <div className="space-y-2">
                          {availableCategories.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">Aucune catégorie disponible</p>
                          ) : (
                            availableCategories.map((category) => (
                              <CategoryItem key={category.id} category={category} />
                            ))
                          )}
                        </div>
                      </ScrollArea>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {productData.categories.map((categoryId) => {
                          interface Category {
                            id: number;
                            name: string;
                            children?: Category[];
                          }

                          const findCategory = (categories: Category[], id: number): Category | null => {
                            for (const cat of categories) {
                              if (cat.id === id) return cat;
                              if (cat.children) {
                                const found = findCategory(cat.children, id);
                                if (found) return found;
                              }
                            }
                            return null;
                          };

                          const category = findCategory(availableCategories, categoryId);
                          return category ? (
                            <Badge key={categoryId} variant="secondary" className="gap-1">
                              {category.name}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => {
                                  setProductData({
                                    ...productData,
                                    categories: productData.categories.filter((id) => id !== categoryId),
                                  })
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>

                    {/* Étiquettes */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-gray-500" />
                        <h3 className="font-medium">Étiquettes</h3>
                      </div>

                      <ScrollArea className="h-64 border rounded-lg p-4 bg-muted/50">
                        <div className="space-y-2">
                          {availableTags.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">Aucune étiquette disponible</p>
                          ) : (
                            availableTags.map((tag) => (
                              <div key={tag.id} className="flex items-center">
                                <Checkbox
                                  id={`tag-${tag.id}`}
                                  checked={productData.etiquettes.includes(tag.id)}
                                  onCheckedChange={(checked) => {
                                    const isChecked = Boolean(checked)
                                    const updatedTags = isChecked
                                      ? [...productData.etiquettes, tag.id]
                                      : productData.etiquettes.filter((id) => id !== tag.id)
                                    setProductData({ ...productData, etiquettes: updatedTags })
                                  }}
                                />
                                <Label
                                  htmlFor={`tag-${tag.id}`}
                                  className="ml-2 cursor-pointer text-sm flex-1 p-2 hover:bg-white rounded-md transition-colors"
                                >
                                  <span>{tag.name}</span>
                                  {tag.description && <p className="text-xs text-gray-500">{tag.description}</p>}
                                </Label>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}