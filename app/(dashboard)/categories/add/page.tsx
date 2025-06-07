"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { useAddCategory, useParentCategories } from "@/hooks/api/categories"
import { ArrowLeft, FolderTree, Save, Tags, Upload } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function AddCategoryPage() {
  const router = useRouter()
  const { getToken } = useAuth()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    is_main: false,
    parent_category: null as number | null
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Utilisation des hooks
  const addCategory = useAddCategory()
  const { data: parentCategories, isLoading: isLoadingCategories } = useParentCategories()

  // Générer automatiquement le slug à partir du nom
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Supprimer les caractères spéciaux
        .replace(/\s+/g, "-") // Remplacer les espaces par des tirets
        .replace(/--+/g, "-") // Éviter les tirets multiples
      
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name])



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Effacer l'erreur pour ce champ s'il y en a une
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      is_main: checked,
      // Si c'est une catégorie principale, on supprime la catégorie parente
      parent_category: checked ? null : prev.parent_category
    }))
    
    // Effacer l'erreur pour parent_category si on passe à une catégorie principale
    if (checked && errors.parent_category) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.parent_category
        return newErrors
      })
    }
  }

  const handleParentCategoryChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      parent_category: value ? parseInt(value) : null 
    }))
    
    // Effacer l'erreur pour parent_category
    if (errors.parent_category) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.parent_category
        return newErrors
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      
      // Créer une URL pour la prévisualisation
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Fonction de validation du formulaire
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis"
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = "Le slug est requis"
    }
    
    if (!formData.is_main && formData.parent_category === null) {
      newErrors.parent_category = "La catégorie parente est requise pour une sous-catégorie"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Valider le formulaire avant soumission
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire")
      return
    }
    
    try {
      // Créer l'objet de données pour le hook
        const categoryData = new FormData()
        categoryData.append("name", formData.name)
        categoryData.append("description", formData.description)
        categoryData.append("slug", formData.slug)
        categoryData.append("is_main", formData.is_main.toString())
        categoryData.append("parent_category", formData.parent_category?.toString() || "")
        if (imageFile) {
          categoryData.append("image", imageFile)
        }
      
      await addCategory.mutateAsync(categoryData as any)
      
      toast.success("Catégorie créée avec succès!")
      router.push("/categories")
    } catch (error) {
      console.error("Erreur lors de la création de la catégorie:", error)
      toast.error(error instanceof Error ? error.message : "Impossible de créer la catégorie")
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/categories" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux catégories
        </Link>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Ajouter une nouvelle catégorie</CardTitle>
            <CardDescription>
              Créez une nouvelle catégorie pour organiser vos produits
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nom de la catégorie <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Électronique, Vêtements, etc."
                  className={errors.name ? "border-red-300" : ""}
                  required
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez brièvement cette catégorie..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="ex: electronique"
                  className={errors.slug ? "border-red-300" : ""}
                  required
                />
                {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
                <p className="text-xs text-muted-foreground">
                  Le slug est utilisé dans l'URL de la catégorie. Il est généré automatiquement à partir du nom.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-base font-medium">Type de catégorie</Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_main"
                      checked={formData.is_main}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="is_main" className="flex items-center cursor-pointer">
                      <FolderTree className="mr-2 h-4 w-4" />
                      Catégorie principale
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground pl-10">
                    {formData.is_main 
                      ? "Cette catégorie sera une catégorie de premier niveau sans parent." 
                      : "Cette catégorie sera une sous-catégorie et nécessite une catégorie parente."}
                  </p>
                </div>
              </div>
              
              {!formData.is_main && (
                <div className="space-y-2 border-l-2 border-teal-500 pl-4">
                  <Label htmlFor="parent_category" className="text-base font-medium">
                    Catégorie parente <span className="text-red-500">*</span>
                  </Label>
                  {isLoadingCategories ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full rounded-md" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : (
                    <>
                      <Select
                        value={formData.parent_category?.toString() || ""}
                        onValueChange={handleParentCategoryChange}
                      >
                        <SelectTrigger className={errors.parent_category ? "border-red-300" : ""}>
                          <SelectValue placeholder="Sélectionner une catégorie parente" />
                        </SelectTrigger>
                        <SelectContent>
                          {parentCategories && parentCategories.length > 0 ? (
                            parentCategories.map((category: any) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-parent" disabled>
                              Aucune catégorie principale disponible
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.parent_category && <p className="text-xs text-red-500">{errors.parent_category}</p>}
                      <p className="text-xs text-muted-foreground">
                        Sélectionnez la catégorie principale à laquelle cette sous-catégorie appartient.
                      </p>
                    </>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="image">Image de la catégorie</Label>
                <div className="flex items-center gap-4">
                  <div className="aspect-video w-40 relative overflow-hidden rounded-md bg-muted">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Prévisualisation"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Tags className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-center border rounded-md border-input bg-background hover:bg-accent hover:text-accent-foreground">
                        <Upload className="mr-2 h-4 w-4" />
                        Choisir une image
                      </div>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Formats acceptés: JPG, PNG, WebP. Taille max: 2 MB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.push("/categories")}>
                Annuler
              </Button>
              <Button type="submit" disabled={addCategory.isPending} className="bg-teal-600 hover:bg-teal-700">
                {addCategory.isPending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création en cours...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Créer la catégorie
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
} 