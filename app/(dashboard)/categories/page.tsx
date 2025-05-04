"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { PROTOCOL_HTTP, HOST_IP, PORT } from "@/constants"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Tags, Plus, Pencil, Trash2, FolderTree, AlertTriangle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
  parent_category: number | null
}

export default function CategoriesPage() {
  const { getToken } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const token = getToken()
      
      const response = await fetch(`${PROTOCOL_HTTP}://${HOST_IP}${PORT}/categories/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error)
      toast.error("Impossible de charger les catégories")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category)
    setIsDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return
    
    try {
      setIsDeleting(true)
      const token = getToken()
      
      const response = await fetch(`${PROTOCOL_HTTP}://${HOST_IP}${PORT}/categories/viewset/${categoryToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
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
      
      // Mettre à jour la liste des catégories
      setCategories(categories.filter(cat => cat.id !== categoryToDelete.id))
      toast.success(`La catégorie "${categoryToDelete.name}" a été supprimée`)
      
      // Fermer le modal
      setIsDialogOpen(false)
      setCategoryToDelete(null)
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie:", error)
      toast.error(error instanceof Error ? error.message : "Impossible de supprimer la catégorie")
    } finally {
      setIsDeleting(false)
    }
  }

  // Filtrer les catégories principales et les sous-catégories
  const mainCategories = categories.filter(cat => cat.is_main)
  const subCategories = categories.filter(cat => !cat.is_main)

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Catégories</h1>
        <Button className="bg-teal-600 hover:bg-teal-700" asChild>
          <Link href="/categories/add">
            <Plus className="mr-2 h-4 w-4" /> Ajouter une catégorie
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Toutes les catégories</TabsTrigger>
          <TabsTrigger value="main">Catégories principales</TabsTrigger>
          <TabsTrigger value="sub">Sous-catégories</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <>
                {[...Array(6)].map((_, index) => (
                  <CategorySkeleton key={index} />
                ))}
              </>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <CategoryCard 
                  key={category.id} 
                  category={category} 
                  onDeleteClick={handleDeleteClick}
                />
              ))
            ) : (
              <p>Aucune catégorie trouvée</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="main" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <>
                {[...Array(3)].map((_, index) => (
                  <CategorySkeleton key={index} />
                ))}
              </>
            ) : mainCategories.length > 0 ? (
              mainCategories.map((category) => (
                <CategoryCard 
                  key={category.id} 
                  category={category} 
                  onDeleteClick={handleDeleteClick}
                />
              ))
            ) : (
              <p>Aucune catégorie principale trouvée</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sub" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <>
                {[...Array(3)].map((_, index) => (
                  <CategorySkeleton key={index} />
                ))}
              </>
            ) : subCategories.length > 0 ? (
              subCategories.map((category) => (
                <CategoryCard 
                  key={category.id} 
                  category={category} 
                  onDeleteClick={handleDeleteClick}
                />
              ))
            ) : (
              <p>Aucune sous-catégorie trouvée</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de confirmation de suppression */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la catégorie <strong>{categoryToDelete?.name}</strong> ?
              {categoryToDelete?.is_main && (
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md text-amber-800 dark:text-amber-200">
                  <p className="text-sm font-medium">Attention !</p>
                  <p className="text-xs">
                    Cette catégorie est une catégorie principale. Sa suppression entraînera également la suppression de toutes ses sous-catégories.
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
              onClick={confirmDelete}
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

// Composant pour afficher une carte de catégorie
function CategoryCard({ 
  category, 
  onDeleteClick 
}: { 
  category: Category, 
  onDeleteClick: (category: Category) => void 
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Link href={`/categories/${category.id}`}>
            <CardTitle className="text-lg hover:text-teal-600 transition-colors">
              {category.name}
            </CardTitle>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/categories/${category.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDeleteClick(category)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="line-clamp-2">{category.description || "Aucune description"}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={`/categories/${category.id}`} className="block">
          <div className="aspect-video relative mb-3 overflow-hidden rounded-md bg-muted">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Tags className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
          </div>
        </Link>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            {category.is_main ? (
              <span className="flex items-center">
                <FolderTree className="mr-1 h-4 w-4" /> Principale
              </span>
            ) : (
              <span className="flex items-center">
                <Tags className="mr-1 h-4 w-4" /> Sous-catégorie
              </span>
            )}
          </div>
          <span>Slug: {category.slug}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Composant pour le squelette de chargement d'une carte de catégorie
function CategorySkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-[150px]" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-video w-full rounded-md mb-3" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      </CardContent>
    </Card>
  )
} 