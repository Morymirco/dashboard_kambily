"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"
import {
  ChevronRight,
  CircleDollarSign,
  Edit,
  ImageIcon,
  ImagePlus,
  LayoutGrid,
  Loader2,
  Package,
  Plus,
  Save,
  Tag,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { STOCK_STATUS } from "@/constants"
import { API_BASE_URL } from "@/constants"
import { getAuthToken, getAuthHeaders } from "@/lib/auth-utils"

// Types pour les variantes
type VariantAttribute = {
  name: string
  values: string[]
}

type VariantCombination = {
  id: string
  attributes: Record<string, string>
  price: string
  stock: string
  sku: string
}

export default function AjouterProduitPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingAttributes, setLoadingAttributes] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [productType, setProductType] = useState<"simple" | "variable">("simple")
  const [productData, setProductData] = useState({
    name: "",
    slug: "",
    short_description: "",
    long_description: "",
    regular_price: "",
    promo_price: "",
    sku: "",
    quantity: "0",
    etat_stock: "En Stock",
    product_type: "simple",
    is_recommended: false,
    is_published: true,
    is_vedette: false,
    weight: "1",
    length: "1",
    width: "1",
    height: "1",
    partenaire: null as number | null,
    categories: [] as number[],
    etiquettes: [] as number[],
  })

  // État pour les images
  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])

  // État pour les attributs et catégories
  const [availableCategories, setAvailableCategories] = useState<any[]>([])
  const [availableTags, setAvailableTags] = useState<any[]>([])
  const [availablePartners, setAvailablePartners] = useState<any[]>([])
  const [availableAttributes, setAvailableAttributes] = useState<any[]>([])
  const [availableColors, setAvailableColors] = useState<any[]>([])
  const [availableSizes, setAvailableSizes] = useState<any[]>([])
  const [groupedAttributes, setGroupedAttributes] = useState<Record<string, any[]>>({})

  // État pour les attributs de variante
  const [variantAttributes, setVariantAttributes] = useState<VariantAttribute[]>([
    { name: "Couleur", values: ["Rouge", "Bleu", "Noir"] },
    { name: "Taille", values: ["S", "M", "L", "XL"] },
  ])

  // État pour les combinaisons de variantes
  const [variantCombinations, setVariantCombinations] = useState<VariantCombination[]>([])

  // État pour la variante unique (nouveau design)
  const [variante, setVariante] = useState({
    attributs: [], // IDs des attributs sélectionnés
    regular_price: 0,
    promo_price: 0,
    quantity: 0,
    images: [],
    image: null,
  })

  // État pour le type de produit
  const [formData, setFormData] = useState({
    // ... autres champs
    product_type: "simple", // ou "variable"
    is_variable: false,
    // ... autres champs
  })

  // Fonction pour organiser les catégories de manière hiérarchique
  const organizeCategories = (categories: any[]) => {
    const categoryMap = new Map()
    const rootCategories = []

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

        const sizes = attributs.filter((attr: any) => attr.attribut.nom === "size")
        const colors = attributs.filter((attr: any) => attr.attribut.nom === "color")

        setAvailableSizes(sizes)
        setAvailableColors(colors)

        const otherAttrs = attributs.filter(
          (attr: any) => attr.attribut.nom !== "size" && attr.attribut.nom !== "color",
        )
        const grouped = otherAttrs.reduce((acc: Record<string, any[]>, attr: any) => {
          if (!acc[attr.attribut.nom]) {
            acc[attr.attribut.nom] = []
          }
          acc[attr.attribut.nom].push(attr)
          return acc
        }, {})
        setGroupedAttributes(grouped)
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

  // Ajouter un attribut de variante
  const handleAddAttribute = () => {
    setVariantAttributes((prev) => [...prev, { name: "", values: [] }])
  }

  // Mettre à jour un attribut de variante
  const handleUpdateAttribute = (index: number, field: "name" | "values", value: string | string[]) => {
    setVariantAttributes((prev) => {
      const updated = [...prev]
      if (field === "name") {
        updated[index].name = value as string
      } else {
        updated[index].values = value as string[]
      }
      return updated
    })
  }

  // Supprimer un attribut de variante
  const handleRemoveAttribute = (index: number) => {
    setVariantAttributes((prev) => prev.filter((_, i) => i !== index))
  }

  // Gérer les changements de type de produit
  const handleProductTypeChange = (value: string) => {
    setProductType(value as "simple" | "variable")
    setProductData({
      ...productData,
      product_type: value,
    })
  }

  // Gérer les changements dans la variante
  const handleVariantChange = (field: string, value: any) => {
    setVariante((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Gérer les changements d'attributs
  const handleAttributeChange = (attrId: number) => {
    setVariante((prev) => ({
      ...prev,
      attributs: prev.attributs.includes(attrId)
        ? prev.attributs.filter((id) => id !== attrId)
        : [...prev.attributs, attrId],
    }))
  }

  // Générer toutes les combinaisons possibles de variantes
  const generateVariantCombinations = () => {
    // Filtrer les attributs valides
    const validAttributes = variantAttributes.filter((attr) => attr.name && attr.values.length > 0)

    if (validAttributes.length === 0) {
      toast.error("Veuillez ajouter au moins un attribut avec des valeurs")
      return
    }

    // Fonction récursive pour générer toutes les combinaisons
    const generateCombinations = (
      attributes: VariantAttribute[],
      currentIndex: number,
      currentCombination: Record<string, string> = {},
    ): Record<string, string>[] => {
      if (currentIndex === attributes.length) {
        return [currentCombination]
      }

      const currentAttribute = attributes[currentIndex]
      const combinations: Record<string, string>[] = []

      currentAttribute.values.forEach((value) => {
        const newCombination = { ...currentCombination, [currentAttribute.name]: value }
        combinations.push(...generateCombinations(attributes, currentIndex + 1, newCombination))
      })

      return combinations
    }

    // Générer toutes les combinaisons possibles
    const combinations = generateCombinations(validAttributes, 0)

    // Créer les objets de variante
    const newVariants: VariantCombination[] = combinations.map((combo, index) => ({
      id: `variant-${index}`,
      attributes: combo,
      price: productData.regular_price,
      stock: productData.quantity,
      sku: `${productData.sku || "SKU"}-${Object.values(combo).join("-")}`,
    }))

    setVariantCombinations(newVariants)
    toast.success(`${newVariants.length} variantes générées`)
  }

  // Mettre à jour une combinaison de variante
  const handleUpdateVariantCombination = (id: string, field: string, value: string) => {
    setVariantCombinations((prev) =>
      prev.map((variant) => (variant.id === id ? { ...variant, [field]: value } : variant)),
    )
  }

  // Supprimer une combinaison de variante
  const handleRemoveVariantCombination = (id: string) => {
    setVariantCombinations((prev) => prev.filter((variant) => variant.id !== id))
  }

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
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
        setIsLoading(false)
        return
      }

      // Préparer les données pour l'API
      const formData = new FormData()

      // Ajouter les données du produit
      Object.entries(productData).forEach(([key, value]) => {
        if (key === "product_type") {
          formData.append(key, productType)
        } else if (key !== "categories" && key !== "etiquettes") {
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

      // Si c'est un produit variable, ajouter la variante
      if (productType === "variable") {
        formData.append(
          "variante",
          JSON.stringify({
            attributs: variante.attributs,
            regular_price: variante.regular_price,
            promo_price: variante.promo_price,
            quantity: variante.quantity,
          }),
        )

        // Ajouter les images de la variante si elles existent
        if (variante.images && variante.images.length > 0) {
          variante.images.forEach((image) => {
            formData.append("images_variante", image)
          })
        }
      }

      // Ajouter les images du produit
      images.forEach((file) => {
        formData.append("images", file)
      })

      console.log("%c[AjouterProduitPage] Données du formulaire préparées", "color: #10b981;")

      // Utiliser getAuthHeaders pour l'authentification
      const headers = getAuthHeaders()
      // Supprimer Content-Type car FormData le gère automatiquement
      delete headers['Content-Type']

      console.log("%c[AjouterProduitPage] Envoi de la requête POST pour créer le produit...", "color: #3b82f6;")
      const response = await fetch(`${API_BASE_URL}/products/viewset/`, {
        method: "POST",
        headers: headers,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("%c[AjouterProduitPage] Erreur de réponse:", "color: #ef4444;", errorData)
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log("%c[AjouterProduitPage] Produit créé avec succès:", "color: #10b981; font-weight: bold;", data)

      // Télécharger les images
      if (images.length > 0 && data.id) {
        console.log("%c[AjouterProduitPage] Téléchargement des images...", "color: #3b82f6;")
        const uploadPromises = images.map((image) => {
          const imgFormData = new FormData()
          imgFormData.append("image", image)
          imgFormData.append("product", data.id.toString())

          return fetch(`${API_BASE_URL}/products/images/`, {
            method: "POST",
            headers: headers,
            body: imgFormData,
          })
        })

        await Promise.all(uploadPromises)
        console.log("%c[AjouterProduitPage] Images téléchargées avec succès", "color: #10b981; font-weight: bold;")
      }

      toast.success("Produit ajouté avec succès")
      console.log("%c[AjouterProduitPage] Redirection vers la liste des produits", "color: #10b981; font-weight: bold;")
      router.push("/produits")
    } catch (error: any) {
      console.error(
        "%c[AjouterProduitPage] Erreur lors de l'ajout du produit:",
        "color: #ef4444; font-weight: bold;",
        error,
      )
      setError(error.message || "Une erreur est survenue lors de l'ajout du produit")
      toast.error("Une erreur est survenue lors de l'ajout du produit")
    } finally {
      setIsLoading(false)
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
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSubmit} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
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
            <TabsTrigger value="variants" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Variantes</span>
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
                    <Label htmlFor="slug">
                      Slug <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="slug"
                        name="slug"
                        placeholder="nom-du-produit"
                        value={productData.slug}
                        onChange={handleChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() =>
                          setProductData({
                            ...productData,
                            slug: productData.name
                              .toLowerCase()
                              .replace(/\s+/g, "-")
                              .replace(/[^\w-]+/g, ""),
                          })
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="short_description">Description courte</Label>
                    <Textarea
                      id="short_description"
                      name="short_description"
                      placeholder="Description courte du produit"
                      rows={2}
                      value={productData.short_description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="long_description">
                      Description complète <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="long_description"
                      name="long_description"
                      placeholder="Description détaillée du produit"
                      rows={5}
                      value={productData.long_description}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Type de produit</Label>
                  <RadioGroup
                    defaultValue="simple"
                    value={productType}
                    className="flex space-x-4"
                    onValueChange={handleProductTypeChange}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="simple" id="simple" />
                      <Label htmlFor="simple">Produit simple</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="variable" id="variable" />
                      <Label htmlFor="variable">Produit avec variantes</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="partenaire" className="text-base">
                    Partenaire
                  </Label>
                  <Select
                    value={productData.partenaire ? productData.partenaire.toString() : ""}
                    onValueChange={(value) =>
                      setProductData({
                        ...productData,
                        partenaire: value === "none" ? null : Number.parseInt(value, 10),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un partenaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun partenaire</SelectItem>
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
                    <Label htmlFor="regular_price">Prix (GNF)</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="promo_price">Prix promotionnel (GNF)</Label>
                    <div className="relative">
                      <CircleDollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="promo_price"
                        name="promo_price"
                        type="number"
                        placeholder="0"
                        className="pl-10"
                        value={productData.promo_price}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU (Référence)</Label>
                    <Input
                      id="sku"
                      name="sku"
                      placeholder="SKU-12345"
                      value={productData.sku}
                      onChange={handleChange}
                    />
                  </div>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etat_stock">Statut du stock</Label>
                  <Select
                    value={productData.etat_stock}
                    onValueChange={(value) => setProductData((prev) => ({ ...prev, etat_stock: value }))}
                  >
                    <SelectTrigger id="etat_stock">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {STOCK_STATUS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="weight">
                      Poids (kg) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productData.weight}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="length">
                      Longueur (cm) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="length"
                      name="length"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productData.length}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">
                      Largeur (cm) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="width"
                      name="width"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productData.width}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">
                      Hauteur (cm) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productData.height}
                      onChange={handleChange}
                      required
                    />
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
                {loadingAttributes ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Chargement des attributs...</span>
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
                          const findCategory = (categories: any[], id: number) => {
                            for (const cat of categories) {
                              if (cat.id === id) return cat
                              if (cat.children) {
                                const found = findCategory(cat.children, id)
                                if (found) return found
                              }
                            }
                            return null
                          }
                          const category = findCategory(availableCategories, categoryId)
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

          {/* Onglet Variantes */}
          {productType === "variable" && (
            <TabsContent value="variants" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration de la variante</CardTitle>
                  <CardDescription>Définissez les attributs et les détails de la variante</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sélecteur de type de produit */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_variable"
                      checked={productData.is_variable}
                      onCheckedChange={(checked) => {
                        setProductData(prev => ({
                          ...prev,
                          is_variable: checked,
                          product_type: checked ? "variable" : "simple"
                        }))
                      }}
                    />
                    <Label htmlFor="is_variable">Produit variable</Label>
                  </div>

                  {productData.is_variable && (
                    <div className="grid grid-cols-1 gap-6">
                      {/* Sélection des attributs */}
                      <div className="space-y-4">
                        <Label className="text-base">Attributs de la variante</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Couleurs */}
                          <div className="space-y-4">
                            <Label>Couleurs</Label>
                            <ScrollArea className="h-32 rounded-md border p-4">
                              {availableColors.map((color) => (
                                <div key={color.id} className="flex items-center space-x-2 mb-2">
                                  <Checkbox
                                    checked={variante.attributs.includes(color.id)}
                                    onCheckedChange={() => handleAttributeChange(color.id)}
                                  />
                                  <Label>{color.valeur}</Label>
                                </div>
                              ))}
                            </ScrollArea>
                          </div>

                          {/* Tailles */}
                          <div className="space-y-4">
                            <Label>Tailles</Label>
                            <ScrollArea className="h-32 rounded-md border p-4">
                              {availableSizes.map((size) => (
                                <div key={size.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={variante.attributs.includes(size.id)}
                                    onCheckedChange={() => handleAttributeChange(size.id)}
                                  />
                                  <Label>{size.valeur}</Label>
                                </div>
                              ))}
                            </ScrollArea>
                          </div>

                          {/* Autres attributs groupés */}
                          {Object.entries(groupedAttributes).map(([groupName, attributes]) => (
                            <div key={groupName} className="space-y-4">
                              <Label>{groupName}</Label>
                              <ScrollArea className="h-32 rounded-md border p-4">
                                {attributes.map((attr) => (
                                  <div key={attr.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={variante.attributs.includes(attr.id)}
                                      onCheckedChange={() => handleAttributeChange(attr.id)}
                                    />
                                    <Label>{attr.valeur}</Label>
                                  </div>
                                ))}
                              </ScrollArea>
                            </div>
                          ))}
                        </div>

                        {/* Affichage des attributs sélectionnés */}
                        <div className="mt-4">
                          <Label className="text-sm text-gray-500">Attributs sélectionnés :</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {variante.attributs.map((attrId) => {
                              const attr = [
                                ...availableColors,
                                ...availableSizes,
                                ...Object.values(groupedAttributes).flat()
                              ].find(a => a.id === attrId);
                              
                              return attr ? (
                                <Badge key={attrId} variant="secondary" className="gap-1">
                                  {attr.valeur}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                    onClick={() => handleAttributeChange(attrId)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Prix et quantité */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="variant-regular-price">Prix régulier</Label>
                          <Input
                            id="variant-regular-price"
                            type="number"
                            value={variante.regular_price}
                            onChange={(e) => handleVariantChange('regular_price', Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="variant-promo-price">Prix promotionnel</Label>
                          <Input
                            id="variant-promo-price"
                            type="number"
                            value={variante.promo_price}
                            onChange={(e) => handleVariantChange('promo_price', Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="variant-quantity">Quantité</Label>
                          <Input
                            id="variant-quantity"
                            type="number"
                            value={variante.quantity}
                            onChange={(e) => handleVariantChange('quantity', Number(e.target.value))}
                          />
                        </div>
                      </div>

                      {/* Images de la variante */}
                      <div className="space-y-4">
                        <Label>Images de la variante</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              handleVariantChange('images', files);
                            }}
                          />
                        </div>
                        
                        {/* Aperçu des images */}
                        {variante.images && variante.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-4 mt-4">
                            {Array.from(variante.images).map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`Aperçu ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-md"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    const newImages = Array.from(variante.images).filter((_, i) => i !== index);
                                    handleVariantChange('images', newImages);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
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

