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
import { ChevronLeft, Plus, Save, Trash2, Upload, X } from "lucide-react"
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
  quantities: number[] // Quantité par ID d'attribut en tableau
  promo_price: string
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

    // Convertir les variantes pour correspondre au format attendu par l'API
    const formattedVariants = variants.map((variant, variantIndex) => {
      // Séparer l'attribut principal des attributs secondaires
      const mainAttributValue = variant.attributs[0]
      // Ne garder que les attributs secondaires dans le tableau attributs
      const secondaryAttributes = variant.attributs.slice(1)
      
      // S'assurer que nous avons une quantité supérieure à 0 pour chaque attribut secondaire
      const quantities = secondaryAttributes.map((attrId) => {
        // Convertir explicitement en nombre et s'assurer que c'est supérieur à 0
        const quantity = Number(variant.quantities[attrId]) || 0
        return quantity
      })

      // Vérification des quantités
      const hasInvalidQuantities = quantities.some(q => q <= 0)
      if (hasInvalidQuantities) {
        console.error("Quantités invalides détectées:", {
          secondaryAttributes,
          quantities,
          rawQuantities: variant.quantities
        })
      }

      return {
        main_attribut: mainAttributValue,
        attributs: secondaryAttributes,
        images_url: variant.images_url || [],
        image: variant.image,
        image_url: variant.image_url,
        quantities: quantities,
        promo_price: variant.promo_price
      }
    })

    // Vérification des données avant envoi
    const validVariants = formattedVariants.every(variant => {
      // Vérifier que chaque variante a le même nombre d'attributs et de quantités
      const hasMatchingLength = variant.attributs.length === variant.quantities.length
      // Vérifier que toutes les quantités sont supérieures à 0
      const hasValidQuantities = variant.quantities.every(q => q > 0)
      
      if (!hasValidQuantities) {
        console.error("Validation échouée:", {
          variant,
          quantities: variant.quantities
        })
      }
      
      return hasMatchingLength && hasValidQuantities
    })

    if (!validVariants) {
      toast.error("Veuillez définir une quantité supérieure à 0 pour chaque attribut secondaire")
      return
    }

    // Vérifier s'il y a des images à uploader
    const hasImages = variants.some(variant => variant.images && variant.images.length > 0)

    if (hasImages) {
      // Créer un FormData pour envoyer les images
      const formData = new FormData()
      
      // Ajouter les données des variantes au FormData de manière structurée
      formattedVariants.forEach((variant, variantIndex) => {
        // Ajouter les données de base de la variante
        formData.append(`variantes[${variantIndex}][main_attribut]`, variant.main_attribut.toString())
        formData.append(`variantes[${variantIndex}][promo_price]`, variant.promo_price)
        
        // Ajouter les attributs
        variant.attributs.forEach((attr, attrIndex) => {
          formData.append(`variantes[${variantIndex}][attributs][${attrIndex}]`, attr.toString())
        })
        
        // Ajouter les quantités
        variant.quantities.forEach((qty, qtyIndex) => {
          formData.append(`variantes[${variantIndex}][quantities][${qtyIndex}]`, qty.toString())
        })
        
        // Ajouter les images pour cette variante
        if (variants[variantIndex].images && variants[variantIndex].images.length > 0) {
          variants[variantIndex].images.forEach((image, imageIndex) => {
            if (image instanceof File) {
              formData.append(`variantes[${variantIndex}][images][${imageIndex}]`, image)
            }
          })
        }
      })

      console.log("Données envoyées avec FormData:", formattedVariants)

      addVariantes(
        { 
          id, 
          data: formData 
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
    } else {
      // Pas d'images, envoyer comme JSON simple
      console.log("Données envoyées en JSON:", formattedVariants)

      addVariantes(
        { 
          id, 
          data: { variantes: formattedVariants } 
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
                            quantities: [],
                            promo_price: ""
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

                    {/* Prix */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor={`promo-price-${index}`}>
                          Prix promotionnel <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`promo-price-${index}`}
                          type="number"
                          placeholder="0"
                          value={variant.promo_price || ""}
                          onChange={(e) => {
                            const newVariants = [...variants]
                            newVariants[index] = {
                              ...newVariants[index],
                              promo_price: e.target.value
                            }
                            setVariants(newVariants)
                          }}
                          required
                        />
                      </div>
                    </div>

                    {/* Upload d'images */}
                    <div>
                      <Label>Images de la variante</Label>
                      <div className="mt-2">
                        {/* Zone de drop pour les images */}
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 hover:bg-teal-50 transition-all duration-200 cursor-pointer"
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.currentTarget.classList.add('border-teal-400', 'bg-teal-50', 'scale-105')
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault()
                            e.currentTarget.classList.remove('border-teal-400', 'bg-teal-50', 'scale-105')
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            e.currentTarget.classList.remove('border-teal-400', 'bg-teal-50', 'scale-105')
                            
                            const files = Array.from(e.dataTransfer.files).filter(file => 
                              file.type.startsWith('image/')
                            )
                            
                            if (files.length > 0) {
                              // Vérifier la taille des fichiers (max 10MB)
                              const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024)
                              const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024)
                              
                              if (invalidFiles.length > 0) {
                                toast.error(`${invalidFiles.length} fichier(s) trop volumineux (max 10MB)`)
                              }
                              
                              if (validFiles.length > 0) {
                                const newVariants = [...variants]
                                newVariants[index] = {
                                  ...newVariants[index],
                                  images: [...(newVariants[index].images || []), ...validFiles]
                                }
                                setVariants(newVariants)
                                toast.success(`${validFiles.length} image(s) ajoutée(s)`)
                              }
                            } else {
                              toast.error("Aucune image valide trouvée")
                            }
                          }}
                          onClick={() => {
                            document.getElementById(`image-upload-${index}`)?.click()
                          }}
                        >
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            id={`image-upload-${index}`}
                            onChange={(e) => {
                              const files = Array.from(e.target.files || [])
                              
                              if (files.length > 0) {
                                // Vérifier la taille des fichiers (max 10MB)
                                const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024)
                                const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024)
                                
                                if (invalidFiles.length > 0) {
                                  toast.error(`${invalidFiles.length} fichier(s) trop volumineux (max 10MB)`)
                                }
                                
                                if (validFiles.length > 0) {
                                  const newVariants = [...variants]
                                  newVariants[index] = {
                                    ...newVariants[index],
                                    images: [...(newVariants[index].images || []), ...validFiles]
                                  }
                                  setVariants(newVariants)
                                  toast.success(`${validFiles.length} image(s) ajoutée(s)`)
                                }
                              }
                              
                              // Réinitialiser l'input
                              e.target.value = ''
                            }}
                          />
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                              <Upload className="h-8 w-8 text-teal-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              Glissez vos images ici
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              ou cliquez pour sélectionner des fichiers
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>Formats acceptés: PNG, JPG, JPEG</span>
                              <span>•</span>
                              <span>Max 10MB par fichier</span>
                            </div>
                          </div>
                        </div>

                        {/* Prévisualisation des images */}
                        {variant.images && variant.images.length > 0 && (
                          <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                              <Label className="text-sm font-medium">
                                Images sélectionnées ({variant.images.length})
                              </Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newVariants = [...variants]
                                  newVariants[index] = {
                                    ...newVariants[index],
                                    images: []
                                  }
                                  setVariants(newVariants)
                                  toast.success("Toutes les images ont été supprimées")
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Tout supprimer
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                              {variant.images.map((image, imageIndex) => (
                                <div key={imageIndex} className="relative group">
                                  <div className="aspect-square rounded-lg border-2 border-gray-200 overflow-hidden hover:border-teal-300 transition-colors">
                                    <img
                                      src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                                      alt={`Image ${imageIndex + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newVariants = [...variants]
                                        newVariants[index] = {
                                          ...newVariants[index],
                                          images: newVariants[index].images.filter((_, i) => i !== imageIndex)
                                        }
                                        setVariants(newVariants)
                                        toast.success("Image supprimée")
                                      }}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <div className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                                    {imageIndex + 1}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Indicateur de progression */}
                        {variant.images && variant.images.length > 0 && (
                          <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-teal-700">
                              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                              <span>{variant.images.length} image(s) prête(s) à être uploadée(s)</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

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
                                  min="1"
                                  required
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
                      quantities: [],
                      promo_price: ""
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