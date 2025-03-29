"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ImagePlus, Loader2, Plus, X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AddVariantDialogProps {
  productId: number
  onSuccess: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
  availableAttributes: any[]
  availableColors: any[]
  availableSizes: any[]
  groupedAttributes: Record<string, any[]>
}

export default function AddVariantDialog({
  productId,
  onSuccess,
  open,
  onOpenChange,
  availableAttributes,
  availableColors,
  availableSizes,
  groupedAttributes
}: AddVariantDialogProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    attributs: [] as number[],
    regular_price: 0,
    promo_price: 0,
    quantity: 0
  })

  // Gestion des images
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    
    const validFiles = files.filter(file => validImageTypes.includes(file.type))
    if (validFiles.length !== files.length) {
      toast.error("Certains fichiers ne sont pas des images valides")
      return
    }

    setImageFiles(prev => [...prev, ...validFiles])
    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    setImagesPreviews(prev => [...prev, ...newPreviews])
  }

  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(imagesPreviews[index])
    setImagesPreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Gestion des attributs
  const handleAttributeChange = (attrId: number) => {
    setFormData(prev => ({
      ...prev,
      attributs: prev.attributs.includes(attrId)
        ? prev.attributs.filter(id => id !== attrId)
        : [...prev.attributs, attrId]
    }))
  }

  // Soumission du formulaire
  const handleSubmit = async () => {
    if (formData.attributs.length === 0) {
      toast.error("Veuillez sélectionner au moins un attribut")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push("/login")
        return
      }

      const submitData = new FormData()
      formData.attributs.forEach(attrId => {
        submitData.append("attributs", attrId.toString())
      })
      submitData.append("regular_price", formData.regular_price.toString())
      submitData.append("promo_price", formData.promo_price.toString())
      submitData.append("quantity", formData.quantity.toString())

      if (imageFiles.length > 0) {
        submitData.append("image", imageFiles[0])
        imageFiles.slice(1).forEach(file => {
          submitData.append("images", file)
        })
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/viewset/${productId}/variante/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData
      })

      if (!response.ok) throw new Error("Erreur lors de l'ajout de la variante")

      toast.success("Variante ajoutée avec succès")
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'ajout de la variante")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      attributs: [],
      regular_price: 0,
      promo_price: 0,
      quantity: 0
    })
    setImageFiles([])
    setImagesPreviews([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une variante</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section des attributs */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-700">Attributs de la variante</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Couleurs */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Couleurs</label>
                <div className="h-32 overflow-y-auto border rounded-md p-4 bg-gray-50">
                  {availableColors.length > 0 ? (
                    availableColors.map((color) => (
                      <div key={color.id} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          id={`color-${color.id}`}
                          checked={formData.attributs.includes(color.id)}
                          onChange={() => handleAttributeChange(color.id)}
                          className="rounded border-gray-300 text-[#048B9A] focus:ring-[#048B9A]"
                        />
                        <label htmlFor={`color-${color.id}`} className="text-sm flex items-center">
                          {color.hex_code && (
                            <span
                              className="inline-block w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: color.hex_code }}
                            />
                          )}
                          {color.valeur}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">Aucune couleur disponible</p>
                  )}
                </div>
              </div>

              {/* Tailles */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Tailles</label>
                <div className="h-32 overflow-y-auto border rounded-md p-4 bg-gray-50">
                  {availableSizes.length > 0 ? (
                    availableSizes.map((size) => (
                      <div key={size.id} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          id={`size-${size.id}`}
                          checked={formData.attributs.includes(size.id)}
                          onChange={() => handleAttributeChange(size.id)}
                          className="rounded border-gray-300 text-[#048B9A] focus:ring-[#048B9A]"
                        />
                        <label htmlFor={`size-${size.id}`} className="text-sm">
                          {size.valeur}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">Aucune taille disponible</p>
                  )}
                </div>
              </div>

              {/* Autres attributs groupés */}
              {Object.entries(groupedAttributes).map(([groupName, attributes]) => (
                <div key={groupName} className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {groupName}
                  </label>
                  <div className="h-32 overflow-y-auto border rounded-md p-4 bg-gray-50">
                    {attributes.length > 0 ? (
                      attributes.map((attr) => (
                        <div key={attr.id} className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            id={`attr-${attr.id}`}
                            checked={formData.attributs.includes(attr.id)}
                            onChange={() => handleAttributeChange(attr.id)}
                            className="rounded border-gray-300 text-[#048B9A] focus:ring-[#048B9A]"
                          />
                          <label htmlFor={`attr-${attr.id}`} className="text-sm">
                            {attr.valeur}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm italic">Aucun attribut disponible</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Attributs sélectionnés */}
            <div className="mt-4">
              <label className="block text-sm text-gray-700 mb-2">Attributs sélectionnés :</label>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-dashed border-gray-300 rounded-md">
                {formData.attributs.length > 0 ? (
                  formData.attributs.map((attrId) => {
                    const attr = [...availableColors, ...availableSizes, ...Object.values(groupedAttributes).flat()].find(
                      (a) => a.id === attrId
                    )
                    return attr ? (
                      <span
                        key={attrId}
                        className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-[#048B9A] bg-opacity-10 text-[#048B9A]"
                      >
                        {attr.valeur}
                        <button
                          type="button"
                          onClick={() => handleAttributeChange(attrId)}
                          className="ml-1 p-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ) : null
                  })
                ) : (
                  <p className="text-gray-500 text-sm italic">Aucun attribut sélectionné</p>
                )}
              </div>
            </div>
          </div>

          {/* Prix et quantité */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="regular_price" className="block text-sm font-medium text-gray-700">
                Prix régulier
              </label>
              <input
                id="regular_price"
                type="number"
                value={formData.regular_price}
                onChange={(e) => setFormData((prev) => ({ ...prev, regular_price: Number(e.target.value) }))}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#048B9A] focus:border-[#048B9A] sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="promo_price" className="block text-sm font-medium text-gray-700">
                Prix promotionnel
              </label>
              <input
                id="promo_price"
                type="number"
                value={formData.promo_price}
                onChange={(e) => setFormData((prev) => ({ ...prev, promo_price: Number(e.target.value) }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#048B9A] focus:border-[#048B9A] sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantité
              </label>
              <input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#048B9A] focus:border-[#048B9A] sm:text-sm"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-700">Images de la variante</h3>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Ajouter des images
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-sm text-gray-500">
                La première image sera utilisée comme image principale
              </p>
            </div>

            {imagesPreviews.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagesPreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square">
                    <Image
                      src={preview}
                      alt={`Aperçu ${index + 1}`}
                      fill
                      className="object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#048B9A] text-white text-xs py-1 text-center">
                        Image principale
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Cliquez sur "Ajouter des images" pour télécharger des images
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Formats acceptés: JPG, PNG, GIF, WEBP
                </p>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter la variante
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 