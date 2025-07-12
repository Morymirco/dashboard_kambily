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
import { API_ENDPOINTS } from "@/lib/constant/api"

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
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false)
  const [typeNom, setTypeNom] = useState("")
  const [isTypeLoading, setIsTypeLoading] = useState(false)

  // Liste des types d'attributs
  const [attributeTypes, setAttributeTypes] = useState<any[]>([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)
  const [errorTypes, setErrorTypes] = useState<string | null>(null)

  const [editTypeDialogOpen, setEditTypeDialogOpen] = useState(false)
  const [editTypeId, setEditTypeId] = useState<number | null>(null)
  const [editTypeNom, setEditTypeNom] = useState("")
  const [isEditTypeLoading, setIsEditTypeLoading] = useState(false)

  // Ajout : état pour le type sélectionné
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null)

  // Formulaire d'ajout d'attribut : un seul champ valeur + hex_code
  const [attributeValue, setAttributeValue] = useState("")
  const [attributeHex, setAttributeHex] = useState("")

  // État pour la modification d'une valeur d'attribut
  const [editValueDialogOpen, setEditValueDialogOpen] = useState(false)
  const [editValueId, setEditValueId] = useState<number | null>(null)
  const [editValueAttributId, setEditValueAttributId] = useState<number | null>(null)
  const [editValueValeur, setEditValueValeur] = useState("")
  const [editValueHex, setEditValueHex] = useState("")
  const [isEditValueLoading, setIsEditValueLoading] = useState(false)

  // Fonction pour rafraîchir la liste des types
  const fetchTypes = async () => {
    setIsLoadingTypes(true)
    setErrorTypes(null)
    try {
      const res = await fetch(API_ENDPOINTS.attributeTypes.add, {
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error("Erreur lors du chargement des types d'attributs")
      const data = await res.json()
      setAttributeTypes(data)
    } catch (err) {
      setErrorTypes("Erreur lors du chargement des types d'attributs")
    } finally {
      setIsLoadingTypes(false)
    }
  }

  useEffect(() => {
    fetchTypes()
  }, [])

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
    mutationFn: async () => {
      if (!selectedTypeId) throw new Error("Veuillez sélectionner un type d'attribut")
      const response = await fetch(API_ENDPOINTS.attributeValues.add, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attribut: selectedTypeId,
          valeur: attributeValue,
          hex_code: attributeHex || undefined
        }),
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la valeur d\'attribut')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] })
      // Rafraîchir la liste des valeurs d'attributs
      const refreshValues = async () => {
        try {
          const res = await fetch(API_ENDPOINTS.attributeValues.list, {
            headers: getAuthHeaders(),
          })
          if (res.ok) {
            const data = await res.json()
            setAttributeValuesList(Array.isArray(data) ? data : (data.results || []))
          }
        } catch (err) {
          console.error("Erreur lors du rafraîchissement des valeurs:", err)
        }
      }
      refreshValues()
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

  // Liste des valeurs d'attributs
  const [attributeValuesList, setAttributeValuesList] = useState<any[]>([])
  const [isLoadingValues, setIsLoadingValues] = useState(true)
  const [errorValues, setErrorValues] = useState<string | null>(null)

  useEffect(() => {
    const fetchValues = async () => {
      setIsLoadingValues(true)
      setErrorValues(null)
      try {
        const res = await fetch(API_ENDPOINTS.attributeValues.list, {
          headers: getAuthHeaders(),
        })
        if (!res.ok) throw new Error("Erreur lors du chargement des attributs")
        const data = await res.json()
        setAttributeValuesList(Array.isArray(data) ? data : (data.results || []))
      } catch (err) {
        setErrorValues("Erreur lors du chargement des attributs")
      } finally {
        setIsLoadingValues(false)
      }
    }
    fetchValues()
  }, [])

  const filteredAttributes = attributes?.filter((attr: Attribute) =>
    (typeof attr.nom === "string" && attr.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (Array.isArray(attr.valeurs) && attr.valeurs.some(
      (val: AttributeValue) => typeof val.valeur === "string" && val.valeur.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  ) || []

  // Recherche pour types d'attributs
  const [searchType, setSearchType] = useState("")
  const filteredAttributeTypes = attributeTypes.filter(type =>
    type.nom.toLowerCase().includes(searchType.toLowerCase())
  )

  // Recherche pour valeurs d'attributs
  const [searchValue, setSearchValue] = useState("")
  const filteredAttributeValuesList = attributeValuesList.filter(val =>
    (val.attribut?.nom?.toLowerCase() || "").includes(searchValue.toLowerCase()) ||
    (val.valeur?.toLowerCase() || "").includes(searchValue.toLowerCase())
  )

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
      createAttribute(undefined, {
          onSuccess: () => {
            toast.success("Attribut créé avec succès")
            setIsDialogOpen(false)
            resetForm()
          },
          onError: (error: Error) => {
            console.error("Erreur lors de la création:", error)
            toast.error("Erreur lors de la création de l'attribut")
          }
      })
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
    // Réinitialiser aussi les champs de création de valeur d'attribut
    setAttributeValue("")
    setAttributeHex("")
    setSelectedTypeId(null)
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
        <div className="flex gap-2 items-center">
          <span className="font-semibold text-base mr-2">Actions :</span>
          <Button onClick={() => setIsTypeDialogOpen(true)} variant="outline" className="border-teal-600 text-teal-700">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un type d'attribut
          </Button>
          <Button onClick={openCreateDialog} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un attribut
          </Button>
        </div>
      </div>

      {/* Liste des types d'attributs */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Types d'attributs</h2>
        <div className="mb-2">
          <Input
            placeholder="Rechercher un type d'attribut..."
            value={searchType}
            onChange={e => setSearchType(e.target.value)}
            className="w-full max-w-xs"
          />
        </div>
        {isLoadingTypes ? (
          <div className="text-muted-foreground">Chargement...</div>
        ) : errorTypes ? (
          <div className="text-red-600">{errorTypes}</div>
        ) : filteredAttributeTypes.length === 0 ? (
          <div className="text-muted-foreground">Aucun type d'attribut trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left">Nom</th>
                  <th className="px-3 py-2 text-left">Créé le</th>
                  <th className="px-3 py-2 text-left">Modifié le</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttributeTypes.map(type => (
                  <tr key={type.id} className="border-b">
                    <td className="px-3 py-2 font-medium">{type.nom}</td>
                    <td className="px-3 py-2">{type.created_at ? new Date(type.created_at).toLocaleDateString('fr-FR') : '-'}</td>
                    <td className="px-3 py-2">{type.updated_at ? new Date(type.updated_at).toLocaleDateString('fr-FR') : '-'}</td>
                    <td className="px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditTypeId(type.id)
                          setEditTypeNom(type.nom)
                          setEditTypeDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="ml-2"
                        onClick={async () => {
                          if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce type d'attribut ?")) return;
                          try {
                            const res = await fetch(API_ENDPOINTS.attributeTypes.delete(type.id), {
                              method: "DELETE",
                              headers: getAuthHeaders(),
                            });
                            if (!res.ok) throw new Error("Erreur lors de la suppression du type d'attribut");
                            toast.success("Type d'attribut supprimé avec succès");
                            fetchTypes();
                          } catch (err) {
                            toast.error("Erreur lors de la suppression du type d'attribut");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/*<div className="mb-6">
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
      )}*/}

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
                <Label htmlFor="name">Nom de la valeur</Label>
                <Input
                  id="name"
                  value={attributeValue}
                  onChange={(e) => setAttributeValue(e.target.value)}
                  placeholder="Ex: Rouge, Bleu, XL, etc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="type-attribut">Type d'attribut</Label>
                <select
                  id="type-attribut"
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={selectedTypeId ?? ''}
                  onChange={e => setSelectedTypeId(Number(e.target.value))}
                  required
                >
                  <option value="">Sélectionner un type d'attribut</option>
                  {attributeTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="hex">Code couleur (hexadécimal, optionnel)</Label>
                <Input
                  id="hex"
                  value={attributeHex}
                  onChange={(e) => setAttributeHex(e.target.value)}
                  placeholder="#ff0000"
                  type="text"
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
                disabled={isCreating}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isCreating ? "Enregistrement..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un type d'attribut</DialogTitle>
            <DialogDescription>
              Saisissez le nom du type d'attribut à créer.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsTypeLoading(true);
              try {
                const res = await fetch(API_ENDPOINTS.attributeTypes.add, {
                  method: "POST",
                  headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ nom: typeNom }),
                });
                if (!res.ok) throw new Error("Erreur lors de la création du type d'attribut");
                toast.success("Type d'attribut créé avec succès");
                setIsTypeDialogOpen(false);
                setTypeNom("");
                fetchTypes();
              } catch (err) {
                toast.error("Erreur lors de la création du type d'attribut");
              } finally {
                setIsTypeLoading(false);
              }
            }}
          >
            <div className="space-y-4">
              <Label htmlFor="type-nom">Nom du type d'attribut</Label>
              <Input
                id="type-nom"
                value={typeNom}
                onChange={e => setTypeNom(e.target.value)}
                placeholder="Ex: Couleur, Taille, etc."
                required
              />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsTypeDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isTypeLoading}>
                {isTypeLoading ? "Enregistrement..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog modification type d'attribut */}
      <Dialog open={editTypeDialogOpen} onOpenChange={setEditTypeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le type d'attribut</DialogTitle>
            <DialogDescription>
              Modifiez le nom du type d'attribut.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editTypeId) return;
              setIsEditTypeLoading(true);
              try {
                const res = await fetch(API_ENDPOINTS.attributeTypes.update(editTypeId), {
                  method: "PUT",
                  headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ nom: editTypeNom }),
                });
                if (!res.ok) throw new Error("Erreur lors de la modification du type d'attribut");
                toast.success("Type d'attribut modifié avec succès");
                setEditTypeDialogOpen(false);
                setEditTypeId(null);
                setEditTypeNom("");
                fetchTypes();
              } catch (err) {
                toast.error("Erreur lors de la modification du type d'attribut");
              } finally {
                setIsEditTypeLoading(false);
              }
            }}
          >
            <div className="space-y-4">
              <Label htmlFor="edit-type-nom">Nom du type d'attribut</Label>
              <Input
                id="edit-type-nom"
                value={editTypeNom}
                onChange={e => setEditTypeNom(e.target.value)}
                placeholder="Ex: Couleur, Taille, etc."
                required
              />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditTypeDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isEditTypeLoading}>
                {isEditTypeLoading ? "Enregistrement..." : "Modifier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Liste des valeurs d'attributs */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Valeurs d'attributs</h2>
        <div className="mb-2">
          <Input
            placeholder="Rechercher une valeur ou un type..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="w-full max-w-xs"
          />
        </div>
        {isLoadingValues ? (
          <div className="text-muted-foreground">Chargement...</div>
        ) : errorValues ? (
          <div className="text-red-600">{errorValues}</div>
        ) : filteredAttributeValuesList.length === 0 ? (
          <div className="text-muted-foreground">Aucune valeur d'attribut trouvée.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Valeur</th>
                  <th className="px-3 py-2 text-left">Code couleur</th>
                  <th className="px-3 py-2 text-left">Créé le</th>
                  <th className="px-3 py-2 text-left">Modifié le</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttributeValuesList.map(val => (
                  <tr key={val.id} className="border-b">
                    <td className="px-3 py-2 font-medium">{val.attribut?.nom}</td>
                    <td className="px-3 py-2">{val.valeur}</td>
                    <td className="px-3 py-2">{val.hex_code || '-'}</td>
                    <td className="px-3 py-2">{val.created_at ? new Date(val.created_at).toLocaleDateString('fr-FR') : '-'}</td>
                    <td className="px-3 py-2">{val.updated_at ? new Date(val.updated_at).toLocaleDateString('fr-FR') : '-'}</td>
                    <td className="px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="mr-2"
                        onClick={() => {
                          setEditValueId(val.id)
                          setEditValueAttributId(val.attribut?.id ?? null)
                          setEditValueValeur(val.valeur)
                          setEditValueHex(val.hex_code || "")
                          setEditValueDialogOpen(true)
                        }}
                      >
                        Modifier
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={async () => {
                          if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette valeur d'attribut ?")) return;
                          try {
                            const res = await fetch(API_ENDPOINTS.attributeValues.delete(val.id), {
                              method: "DELETE",
                              headers: getAuthHeaders(),
                            });
                            if (!res.ok) throw new Error("Erreur lors de la suppression de la valeur d'attribut");
                            toast.success("Valeur d'attribut supprimée avec succès");
                            // Rafraîchir la liste
                            const refresh = await fetch(API_ENDPOINTS.attributeValues.list, { headers: getAuthHeaders() });
                            const refreshData = await refresh.json();
                            setAttributeValuesList(Array.isArray(refreshData) ? refreshData : (refreshData.results || []));
                          } catch (err) {
                            toast.error("Erreur lors de la suppression de la valeur d'attribut");
                          }
                        }}
                      >
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog modification valeur d'attribut */}
      <Dialog open={editValueDialogOpen} onOpenChange={setEditValueDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la valeur d'attribut</DialogTitle>
            <DialogDescription>
              Modifiez la valeur, le type ou le code couleur de l'attribut.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editValueId || !editValueAttributId) return;
              setIsEditValueLoading(true);
              try {
                const res = await fetch(API_ENDPOINTS.attributeValues.update(editValueId), {
                  method: "PUT",
                  headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    attribut: editValueAttributId,
                    valeur: editValueValeur,
                    hex_code: editValueHex || undefined
                  }),
                });
                if (!res.ok) throw new Error("Erreur lors de la modification de la valeur d'attribut");
                toast.success("Valeur d'attribut modifiée avec succès");
                setEditValueDialogOpen(false);
                setEditValueId(null);
                setEditValueAttributId(null);
                setEditValueValeur("");
                setEditValueHex("");
                // Rafraîchir la liste
                setIsLoadingValues(true);
                const refresh = await fetch(API_ENDPOINTS.attributeValues.list, { headers: getAuthHeaders() });
                const refreshData = await refresh.json();
                setAttributeValuesList(Array.isArray(refreshData) ? refreshData : (refreshData.results || []));
                setIsLoadingValues(false);
              } catch (err) {
                toast.error("Erreur lors de la modification de la valeur d'attribut");
              } finally {
                setIsEditValueLoading(false);
              }
            }}
          >
            <div className="space-y-4">
              <Label htmlFor="edit-value-attribut">Type d'attribut</Label>
              <select
                id="edit-value-attribut"
                className="w-full border rounded px-3 py-2 mt-1"
                value={editValueAttributId ?? ''}
                onChange={e => setEditValueAttributId(Number(e.target.value))}
                required
              >
                <option value="">Sélectionner un type d'attribut</option>
                {attributeTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.nom}</option>
                ))}
              </select>
              <Label htmlFor="edit-value-valeur">Valeur</Label>
              <Input
                id="edit-value-valeur"
                value={editValueValeur}
                onChange={e => setEditValueValeur(e.target.value)}
                required
              />
              <Label htmlFor="edit-value-hex">Code couleur (hexadécimal, optionnel)</Label>
              <Input
                id="edit-value-hex"
                value={editValueHex}
                onChange={e => setEditValueHex(e.target.value)}
                placeholder="#ff0000"
                type="text"
              />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditValueDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isEditValueLoading}>
                {isEditValueLoading ? "Enregistrement..." : "Modifier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 