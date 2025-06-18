"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HOST_IP, PORT, PROTOCOL_HTTP } from "@/constants"
import { getAxiosConfig } from "@/constants/client"
import { useAddVariantes, useProductDetail } from "@/hooks/api/products"
import axios from "axios"
import { ChevronLeft, Plus, Save, Trash2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

interface Variant {
  main_attribut: number
  attributs: number[]
  images: any[]
  images_url: any[]
  image: string | null
  image_url: string | null
  quantities: { [key: number]: number } // Quantité par ID d'attribut
}

interface AttributeValue {
  id: number
  attribut: {
    id: number
    nom: string
  }
  valeur: string
  hex_code: string | null
}

interface GroupedAttribute {
  id: number
  nom: string
  valeurs: AttributeValue[]
}

export default function AddVariantesPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: product, isLoading } = useProductDetail(id)
  const { mutate: addVariantes, isPending } = useAddVariantes()
  const [variants, setVariants] = useState<Variant[]>([])
  const [availableAttributes, setAvailableAttributes] = useState<GroupedAttribute[]>([])

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await axios.get(
          `${PROTOCOL_HTTP}://${HOST_IP}${PORT}/products/attributes/of/`,
          getAxiosConfig()
        )
        
        // Grouper les attributs par nom
        const groupedAttributes = groupAttributesByNom(response.data.attributs)
        setAvailableAttributes(groupedAttributes)
      } catch (error) {
        console.error("Erreur lors de la récupération des attributs:", error)
        toast.error("Erreur lors de la récupération des attributs")
      }
    }

    if (id) {
      fetchAttributes()
    }
  }, [id])

  // Fonction pour grouper les attributs par nom
  const groupAttributesByNom = (attributes: AttributeValue[]): GroupedAttribute[] => {
    const grouped: { [key: string]: GroupedAttribute } = {}

    attributes.forEach((attr) => {
      const nom = attr.attribut.nom
      if (!grouped[nom]) {
        grouped[nom] = {
          id: attr.attribut.id,
          nom: nom,
          valeurs: []
        }
      }
      grouped[nom].valeurs.push(attr)
    })

    return Object.values(grouped)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    addVariantes(
      { 
        id, 
        data: { variantes: variants } 
      },
      {
        onSuccess: () => {
          toast.success("Variantes ajoutées avec succès")
          router.push(`/produits/${id}`)
        },
        onError: (error) => {
          console.error("Erreur lors de l'ajout des variantes:", error)
          toast.error("Erreur lors de l'ajout des variantes")
        }
      }
    )
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (!product) {
    return <div>Produit non trouvé</div>
  }

  if (product.product_type !== "variable") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">
              Ce produit n'est pas de type variable. Impossible d'ajouter des variantes.
            </p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => router.push(`/produits/${id}`)}>
                Retour au produit
              </Button>
            </div>
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
            onClick={() => router.push(`/produits/${id}`)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Ajouter des variantes</h1>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Enregistrement..." : "Enregistrer les variantes"}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Variantes du produit</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ajoutez des variantes à votre produit variable
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {variants.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Aucune variante n'a été ajoutée. Cliquez sur le bouton ci-dessous pour commencer.
                </div>
              )}
              
              {variants.map((variant, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Variante {index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newVariants = [...variants]
                        newVariants.splice(index, 1)
                        setVariants(newVariants)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Attribut principal */}
                    <div>
                      <Label>Attribut principal</Label>
                      <Select
                        value={variant.main_attribut.toString()}
                        onValueChange={(value) => {
                          const newVariants = [...variants]
                          newVariants[index] = {
                            ...newVariants[index],
                            main_attribut: parseInt(value),
                            attributs: [],
                            quantities: {}
                          }
                          setVariants(newVariants)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un attribut principal" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAttributes.map((attr) => (
                            <SelectItem key={attr.id} value={attr.id.toString()}>
                              {attr.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Valeur de l'attribut principal */}
                    {variant.main_attribut > 0 && (
                      <div>
                        <Label>Valeur de l'attribut principal</Label>
                        <Select
                          value={variant.attributs[0]?.toString() || ""}
                          onValueChange={(value) => {
                            const newVariants = [...variants]
                            newVariants[index] = {
                              ...newVariants[index],
                              attributs: [parseInt(value)]
                            }
                            setVariants(newVariants)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une valeur" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableAttributes
                              .find(attr => attr.id === variant.main_attribut)
                              ?.valeurs.map((val) => (
                                <SelectItem key={val.id} value={val.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    {val.hex_code && (
                                      <div 
                                        className="w-4 h-4 rounded border"
                                        style={{ backgroundColor: val.hex_code }}
                                      />
                                    )}
                                    {val.valeur}
                                  </div>
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Autres attributs en grille de checkboxes */}
                    {variant.main_attribut > 0 && (
                      <div>
                        <Label>Autres attributs</Label>
                        <div className="space-y-4">
                          {availableAttributes
                            .filter(attr => attr.id !== variant.main_attribut)
                            .map((attr) => (
                              <div key={attr.id} className="border rounded-lg p-4">
                                <h4 className="font-medium mb-3">{attr.nom}</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                  {attr.valeurs.map((val) => {
                                    const isSelected = variant.attributs.includes(val.id)
                                    return (
                                      <div key={val.id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`variant-${index}-attr-${val.id}`}
                                          checked={isSelected}
                                          onCheckedChange={(checked) => {
                                            const newVariants = [...variants]
                                            const currentAttributs = [...newVariants[index].attributs]
                                            
                                            if (checked) {
                                              // Ajouter l'attribut
                                              newVariants[index] = {
                                                ...newVariants[index],
                                                attributs: [...currentAttributs, val.id],
                                                quantities: {
                                                  ...newVariants[index].quantities,
                                                  [val.id]: 0
                                                }
                                              }
                                            } else {
                                              // Supprimer l'attribut et sa quantité
                                              const { [val.id]: removed, ...remainingQuantities } = newVariants[index].quantities
                                              newVariants[index] = {
                                                ...newVariants[index],
                                                attributs: currentAttributs.filter(id => id !== val.id),
                                                quantities: remainingQuantities
                                              }
                                            }
                                            setVariants(newVariants)
                                          }}
                                        />
                                        <Label 
                                          htmlFor={`variant-${index}-attr-${val.id}`}
                                          className="flex items-center gap-2 cursor-pointer"
                                        >
                                          {val.hex_code && (
                                            <div 
                                              className="w-4 h-4 rounded border"
                                              style={{ backgroundColor: val.hex_code }}
                                            />
                                          )}
                                          <span className="text-sm">{val.valeur}</span>
                                        </Label>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}

                    {/* Quantités pour les attributs sélectionnés */}
                    {variant.attributs.length > 1 && (
                      <div>
                        <Label>Quantités</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {variant.attributs.slice(1).map((attrId) => {
                            const attribute = availableAttributes.find(attr => 
                              attr.valeurs.some(v => v.id === attrId)
                            )
                            const value = attribute?.valeurs.find(v => v.id === attrId)
                            
                            return (
                              <div key={attrId} className="space-y-2">
                                <Label className="text-sm font-medium">
                                  {attribute?.nom}: {value?.valeur}
                                </Label>
                                <Input
                                  type="number"
                                  placeholder="Quantité"
                                  value={variant.quantities[attrId] || ""}
                                  onChange={(e) => {
                                    const newVariants = [...variants]
                                    newVariants[index] = {
                                      ...newVariants[index],
                                      quantities: {
                                        ...newVariants[index].quantities,
                                        [attrId]: parseInt(e.target.value) || 0
                                      }
                                    }
                                    setVariants(newVariants)
                                  }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setVariants([
                    ...variants,
                    {
                      main_attribut: 0,
                      attributs: [],
                      images: [],
                      images_url: [],
                      image: null,
                      image_url: null,
                      quantities: {}
                    }
                  ])
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une variante
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
} 