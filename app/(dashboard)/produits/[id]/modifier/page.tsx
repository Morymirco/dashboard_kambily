"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { toast } from "react-hot-toast"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import WithAuth from "@/app/hoc/WithAuth"

import { HOST_IP, PORT, PROTOCOL_HTTP } from "@/constants"
import { getAuthToken } from "@/utils/auth"
import { getAxiosConfig } from "@/constants/client"
import { getAuthHeaders } from "@/lib/auth-utils"

// Interfaces (reprendre les mêmes que dans la page de détail)
interface Product {
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  quantity: number;
  regular_price: number;
  promo_price: number;
  width: number;
  length: number;
  height: number;
  weight: number;
  is_published: boolean;
  product_type: 'simple' | 'variable';
  etat_stock: string;
  is_recommended: boolean;
  is_vedette: boolean;
  is_variable: boolean;
  partenaire?: number;
}

const EditProductPage = () => {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${PROTOCOL_HTTP}://${HOST_IP}${PORT}/products/${id}/`,
          getAxiosConfig()
        )
        setProduct(response.data)
      } catch (error) {
        toast.error("Erreur lors du chargement du produit")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Créer une copie du produit pour la modification
      const productToUpdate = {
        ...product,
        partenaire: product?.partenaire?.id || product?.partenaire // Envoie l'ID au lieu de l'objet complet
      }

      const response = await fetch(
        `${PROTOCOL_HTTP}://${HOST_IP}${PORT}/products/viewset/${id}/`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(productToUpdate)
        }
      )

      if (response.ok) {
        toast.success("Produit mis à jour avec succès")
        router.push(`/produits/${id}`)
      } else {
        const errorData = await response.json()
        toast.error(errorData?.message || "Erreur lors de la mise à jour")
        throw new Error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du produit")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
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
          <h1 className="text-2xl font-bold">Modifier le produit</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">Informations générales</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="variants">Variantes</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du produit</Label>
                    <Input
                      id="name"
                      value={product?.name || ''}
                      onChange={(e) => setProduct(prev => ({
                        ...prev!,
                        name: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={product?.slug || ''}
                      onChange={(e) => setProduct(prev => ({
                        ...prev!,
                        slug: e.target.value
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Description courte</Label>
                  <Textarea
                    id="short_description"
                    value={product?.short_description || ''}
                    onChange={(e) => setProduct(prev => ({
                      ...prev!,
                      short_description: e.target.value
                    }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="long_description">Description détaillée</Label>
                  <Textarea
                    id="long_description"
                    value={product?.long_description || ''}
                    onChange={(e) => setProduct(prev => ({
                      ...prev!,
                      long_description: e.target.value
                    }))}
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="regular_price">Prix régulier (FCFA)</Label>
                    <Input
                      id="regular_price"
                      type="number"
                      value={product?.regular_price || ''}
                      onChange={(e) => setProduct(prev => ({
                        ...prev!,
                        regular_price: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promo_price">Prix promotionnel (FCFA)</Label>
                    <Input
                      id="promo_price"
                      type="number"
                      value={product?.promo_price || ''}
                      onChange={(e) => setProduct(prev => ({
                        ...prev!,
                        promo_price: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantité</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={product?.quantity || ''}
                      onChange={(e) => setProduct(prev => ({
                        ...prev!,
                        quantity: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="etat_stock">État du stock</Label>
                    <Input
                      id="etat_stock"
                      value={product?.etat_stock || ''}
                      onChange={(e) => setProduct(prev => ({
                        ...prev!,
                        etat_stock: e.target.value
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dimensions (cm)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Largeur"
                        type="number"
                        value={product?.width || ''}
                        onChange={(e) => setProduct(prev => ({
                          ...prev!,
                          width: parseInt(e.target.value)
                        }))}
                      />
                      <Input
                        placeholder="Longueur"
                        type="number"
                        value={product?.length || ''}
                        onChange={(e) => setProduct(prev => ({
                          ...prev!,
                          length: parseInt(e.target.value)
                        }))}
                      />
                      <Input
                        placeholder="Hauteur"
                        type="number"
                        value={product?.height || ''}
                        onChange={(e) => setProduct(prev => ({
                          ...prev!,
                          height: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Poids (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={product?.weight || ''}
                      onChange={(e) => setProduct(prev => ({
                        ...prev!,
                        weight: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_published"
                      checked={product?.is_published || false}
                      onCheckedChange={(checked) => setProduct(prev => ({
                        ...prev!,
                        is_published: checked
                      }))}
                    />
                    <Label htmlFor="is_published">Publié</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_recommended"
                      checked={product?.is_recommended || false}
                      onCheckedChange={(checked) => setProduct(prev => ({
                        ...prev!,
                        is_recommended: checked
                      }))}
                    />
                    <Label htmlFor="is_recommended">Recommandé</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_vedette"
                      checked={product?.is_vedette || false}
                      onCheckedChange={(checked) => setProduct(prev => ({
                        ...prev!,
                        is_vedette: checked
                      }))}
                    />
                    <Label htmlFor="is_vedette">En vedette</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_variable"
                      checked={product?.is_variable || false}
                      onCheckedChange={(checked) => setProduct(prev => ({
                        ...prev!,
                        is_variable: checked
                      }))}
                    />
                    <Label htmlFor="is_variable">Produit variable</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ajouter les autres TabsContent */}
        </Tabs>

        <div className="mt-6 flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/produits/${id}`)}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={saving}
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default WithAuth(EditProductPage) 