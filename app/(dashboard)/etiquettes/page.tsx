"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/hooks/api/tags"
import { toast } from "react-hot-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

interface TagFormData {
  name: string
  description: string
}

interface Tag {
  id: number
  name: string
  description?: string
  products_count?: number
  created_at: string
}

export default function EtiquettesPage() {
  const { data: tags, isLoading, refetch } = useTags()
  const { mutate: createTag, isPending: isCreating } = useCreateTag()
  const { mutate: updateTag, isPending: isUpdating } = useUpdateTag()
  const { mutate: deleteTag, isPending: isDeleting } = useDeleteTag()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [formData, setFormData] = useState<TagFormData>({
    name: "",
    description: ""
  })

  const filteredTags = tags?.filter((tag: Tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingTag) {
      updateTag(
        { id: editingTag.id, data: formData },
        {
          onSuccess: () => {
            toast.success("Étiquette modifiée avec succès")
            setIsDialogOpen(false)
            resetForm()
            refetch()
          },
          onError: (error: Error) => {
            console.error("Erreur lors de la modification:", error)
            toast.error("Erreur lors de la modification de l'étiquette")
          }
        }
      )
    } else {
      createTag(
        formData,
        {
          onSuccess: () => {
            toast.success("Étiquette créée avec succès")
            setIsDialogOpen(false)
            resetForm()
            refetch()
          },
          onError: (error: Error) => {
            console.error("Erreur lors de la création:", error)
            toast.error("Erreur lors de la création de l'étiquette")
          }
        }
      )
    }
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      description: tag.description || ""
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (tagId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette étiquette ?")) {
      deleteTag(tagId, {
        onSuccess: () => {
          toast.success("Étiquette supprimée avec succès")
          refetch()
        },
        onError: (error: Error) => {
          console.error("Erreur lors de la suppression:", error)
          toast.error("Erreur lors de la suppression de l'étiquette")
        }
      })
    }
  }

  const resetForm = () => {
    setFormData({ name: "", description: "" })
    setEditingTag(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Étiquettes</h1>
            <p className="text-muted-foreground">Gérez les étiquettes de vos produits</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Étiquettes</h1>
          <p className="text-muted-foreground">Gérez les étiquettes de vos produits</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une étiquette
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher une étiquette..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTags.map((tag: Tag) => (
          <Card key={tag.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-teal-600" />
                  <CardTitle className="text-lg cursor-pointer hover:text-teal-600 transition-colors" 
                    onClick={() => router.push(`/etiquettes/${tag.id}`)}>
                    {tag.name}
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(tag)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(tag.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {tag.description && (
                <CardDescription className="mt-2">
                  {tag.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                  {tag.products_count || 0} produit{tag.products_count !== 1 ? 's' : ''}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(tag.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTags.length === 0 && (
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? "Aucune étiquette trouvée" : "Aucune étiquette"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? "Essayez de modifier vos critères de recherche"
              : "Commencez par créer votre première étiquette"
            }
          </p>
          {!searchTerm && (
            <Button onClick={openCreateDialog} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="mr-2 h-4 w-4" />
              Créer une étiquette
            </Button>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTag ? "Modifier l'étiquette" : "Créer une étiquette"}
            </DialogTitle>
            <DialogDescription>
              {editingTag 
                ? "Modifiez les informations de l'étiquette"
                : "Ajoutez une nouvelle étiquette pour classer vos produits"
              }
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
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isCreating || isUpdating ? "Enregistrement..." : editingTag ? "Modifier" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 