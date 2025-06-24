"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Tag, Palette, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { API_BASE_URL } from "@/constants"
import { getAuthHeaders } from "@/lib/auth-utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface Attribute {
  id: number
  nom: string
  created_at: string
  updated_at: string
  valeurs: AttributeValue[]
}

interface AttributeValue {
  id: number
  valeur: string
  hex_code?: string
  created_at: string
  updated_at: string
}

interface AttributeFormData {
  nom: string
  valeurs: string[]
}

export default function AttributsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null)
  const [formData, setFormData] = useState<AttributeFormData>({
    nom: "",
    valeurs: [""]
  })

  // Hook pour récupérer les attributs
  const { data: attributes, isLoading, refetch } = useQuery({
    queryKey: ['attributes'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/products/attributes/of/`, {
        headers: getAuthHeaders(),
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des attributs')
      }
      
      const data = await response.json()
      return data.attributs || []
    }
  })

  // Hook pour créer un attribut
  const { mutate: createAttribute, isPending: isCreating } = useMutation({
    mutationFn: async (data: AttributeFormData) => {
      const response = await fetch(`${API_BASE_URL}/products/attributes/`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: data.nom,
          valeurs: data.valeurs.filter(v => v.trim() !== '')
        }),
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'attribut')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] })
    },
  })

  // Hook pour modifier un attribut
  const { mutate: updateAttribute, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AttributeFormData }) => {
      const response = await fetch(`${API_BASE_URL}/products/attributes/${id}/`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: data.nom,
          valeurs: data.valeurs.filter(v => v.trim() !== '')
        }),
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la modification de l\'attribut')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] })
    },
  })

  // Hook pour supprimer un attribut
  const { mutate: deleteAttribute, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_BASE_URL}/products/attributes/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'attribut')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] })
    },
  })

  const filteredAttributes = attributes?.filter(attr =>
    attr.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attr.valeurs.some(val => val.valeur.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingAttribute) {
      updateAttribute(
        { id: editingAttribute.id, data: formData },
        {
          onSuccess: () => {
            toast.success("Attribut modifié avec succès")
            setIsDialogOpen(false)
            resetForm()
          },
          onError: (error: Error) => {
            console.error("Erreur lors de la modification:", error)
            toast.error("Erreur lors de la modification de l'attribut")
          }
        }
      )
    } else {
      createAttribute(
        formData,
        {
          onSuccess: () => {
            toast.success("Attribut créé avec succès")
            setIsDialogOpen(false)
            resetForm()
          },
          onError: (error: Error) => {
            console.error("Erreur lors de la création:", error)
            toast.error("Erreur lors de la création de l'attribut")
          }
        }
      )
    }
  }

  const handleEdit = (attribute: Attribute) => {
    setEditingAttribute(attribute)
    setFormData({
      nom: attribute.nom,
      valeurs: attribute.valeurs.map(v => v.valeur)
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (attributeId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet attribut ?")) {
      deleteAttribute(attributeId, {
        onSuccess: () => {
          toast.success("Attribut supprimé avec succès")
        },
        onError: (error: Error) => {
          console.error("Erreur lors de la suppression:", error)
          toast.error("Erreur lors de la suppression de l'attribut")
        }
      })
    }
  }

  const resetForm = () => {
    setFormData({ nom: "", valeurs: [""] })
    setEditingAttribute(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const addValue = () => {
    setFormData(prev => ({
      ...prev,
      valeurs: [...prev.valeurs, ""]
    }))
  }

  const removeValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      valeurs: prev.valeurs.filter((_, i) => i !== index)
    }))
  }

  const updateValue = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      valeurs: prev.valeurs.map((v, i) => i === index ? value : v)
    }))
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Attributs</h1>
            <p className="text-muted-foreground">Gérez les attributs de vos produits</p>
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
          <h1 className="text-2xl font-bold">Attributs</h1>
          <p className="text-muted-foreground">Gérez les attributs et valeurs de vos produits</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un attribut
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un attribut ou une valeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAttributes.map((attribute: Attribute) => (
          <Card key={attribute.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-teal-600" />
                  <CardTitle className="text-lg cursor-pointer hover:text-teal-600 transition-colors"
                    onClick={() => router.push(`/attributs/${attribute.id}`)}>
                    {attribute.nom}
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(attribute)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(attribute.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                    {attribute.valeurs.length} valeur{attribute.valeurs.length !== 1 ? 's' : ''}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(attribute.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {attribute.valeurs.slice(0, 3).map((value) => (
                    <Badge 
                      key={value.id} 
                      variant="outline" 
                      className="text-xs"
                      style={value.hex_code ? { backgroundColor: value.hex_code, color: 'white' } : {}}
                    >
                      {value.valeur}
                    </Badge>
                  ))}
                  {attribute.valeurs.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{attribute.valeurs.length - 3} autres
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAttributes.length === 0 && (
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? "Aucun attribut trouvé" : "Aucun attribut"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? "Essayez de modifier vos critères de recherche"
              : "Commencez par créer votre premier attribut"
            }
          </p>
          {!searchTerm && (
            <Button onClick={openCreateDialog} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="mr-2 h-4 w-4" />
              Créer un attribut
            </Button>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAttribute ? "Modifier l'attribut" : "Créer un attribut"}
            </DialogTitle>
            <DialogDescription>
              {editingAttribute 
                ? "Modifiez les informations de l'attribut et ses valeurs"
                : "Ajoutez un nouvel attribut avec ses valeurs possibles"
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de l'attribut</Label>
                <Input
                  id="name"
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  placeholder="Ex: Couleur, Taille, Matériau"
                  required
                />
              </div>
              <div>
                <Label>Valeurs de l'attribut</Label>
                <div className="space-y-2">
                  {formData.valeurs.map((value, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={value}
                        onChange={(e) => updateValue(index, e.target.value)}
                        placeholder={`Valeur ${index + 1}`}
                        required
                      />
                      {formData.valeurs.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeValue(index)}
                          className="px-3"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addValue}
                    className="w-full"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une valeur
                  </Button>
                </div>
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
                {isCreating || isUpdating ? "Enregistrement..." : editingAttribute ? "Modifier" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 