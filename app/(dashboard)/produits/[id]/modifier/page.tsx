"use client"

import { Editor } from "@/app/components/editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCategoriesOff } from "@/hooks/api/categories"
import { usePartnersOff } from "@/hooks/api/parteners"
import { useProductDetail, useUpdateProduct } from "@/hooks/api/products"
import { useTags } from "@/hooks/api/tags"
import { ChevronLeft, Save } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: product, isLoading } = useProductDetail(id)
  const { mutate: updateProduct, isPending } = useUpdateProduct()
  const { data: categoriesData } = useCategoriesOff()
  const { data: partnersData } = usePartnersOff()
  const { data: tagsData } = useTags()

  const [productData, setProductData] = useState({
    name: "",
    sku: "",
    regular_price: "",
    quantity: 0,
    supplier_price: 0,
    is_published: true,
    product_type: "simple",
    is_recommended: false,
    is_vedette: false,
    is_variable: false,
    categories: [] as number[],
    etiquettes: [] as number[],
    // images: [] as any[],
    short_description: "",
    long_description: ""
  })

  useEffect(() => {
    if (product) {
      setProductData({
        name: product.name,
        sku: product.sku,
        regular_price: product.regular_price.toString(),
        quantity: product.quantity,
        supplier_price: 0,
        is_published: true,
        product_type: product.product_type,
        is_recommended: false,
        is_vedette: false,
        is_variable: product.product_type === "variable",
        categories: product.categories?.map((cat: any) => cat.id) || [],
        etiquettes: product.etiquettes?.map((tag: any) => tag.id) || [],
        // images: product.images || [],
        short_description: product.short_description || "",
        long_description: product.long_description || ""
      })
    }
  }, [product])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProductData(prev => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setProductData(prev => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      updateProduct(
        { id, data: productData },
        {
          onSuccess: () => {
            toast.success("Produit modifié avec succès")
            router.push(`/produits/${id}`)
          },
          onError: (error) => {
            console.error("Erreur lors de la modification:", error)
            toast.error("Erreur lors de la modification du produit")
          }
        }
      )
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Une erreur est survenue")
    }
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (!product) {
    return <div>Produit non trouvé</div>
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
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="pricing">Prix & Stock</TabsTrigger>
            <TabsTrigger value="attributes">Attributs</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du produit</Label>
                    <Input
                      id="name"
                      name="name"
                      value={productData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={productData.sku}
                      readOnly={true}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Description courte</Label>
                  <Editor
                    value={productData.short_description}
                    onChange={(content) =>
                      setProductData(prev => ({ ...prev, short_description: content }))
                    }
                    height={150}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="long_description">Description complète</Label>
                  <Editor
                    value={productData.long_description}
                    onChange={(content) =>
                      setProductData(prev => ({ ...prev, long_description: content }))
                    }
                    height={400}
                  />
                </div>

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
                      <p className="text-sm text-muted-foreground">
                        Rendre ce produit visible sur le site
                      </p>
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
                      <p className="text-sm text-muted-foreground">
                        Mettre ce produit en avant sur la page d'accueil
                      </p>
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

          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Prix et stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="supplier_price">Prix fournisseur</Label>
                    <Input
                      id="supplier_price"
                      name="supplier_price"
                      type="number"
                      value={productData.supplier_price}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regular_price">Prix de vente</Label>
                    <Input
                      id="regular_price"
                      name="regular_price"
                      type="number"
                      readOnly
                      value={productData.regular_price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantité en stock</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={productData.quantity}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attributes">
            <Card>
              <CardHeader>
                <CardTitle>Catégories et étiquettes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Catégories */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Catégories</h3>
                    </div>

                    <ScrollArea className="h-64 border rounded-lg p-4">
                      <div className="space-y-2">
                        {categoriesData?.map((category: any) => (
                          <div key={category.id} className="flex items-center">
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={productData.categories.includes(category.id)}
                              onCheckedChange={(checked) => {
                                const isChecked = Boolean(checked)
                                const updatedCategories = isChecked
                                  ? [...productData.categories, category.id]
                                  : productData.categories.filter((id) => id !== category.id)
                                setProductData(prev => ({ ...prev, categories: updatedCategories }))
                              }}
                            />
                            <Label
                              htmlFor={`category-${category.id}`}
                              className="ml-2 cursor-pointer text-sm flex-1 p-2 hover:bg-muted rounded-md transition-colors"
                            >
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Étiquettes */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Étiquettes</h3>
                    </div>

                    <ScrollArea className="h-64 border rounded-lg p-4">
                      <div className="space-y-2">
                        {tagsData?.map((tag: any) => (
                          <div key={tag.id} className="flex items-center">
                            <Checkbox
                              id={`tag-${tag.id}`}
                              checked={productData.etiquettes.includes(tag.id)}
                              onCheckedChange={(checked) => {
                                const isChecked = Boolean(checked)
                                const updatedTags = isChecked
                                  ? [...productData.etiquettes, tag.id]
                                  : productData.etiquettes.filter((id) => id !== tag.id)
                                setProductData(prev => ({ ...prev, etiquettes: updatedTags }))
                              }}
                            />
                            <Label
                              htmlFor={`tag-${tag.id}`}
                              className="ml-2 cursor-pointer text-sm flex-1 p-2 hover:bg-muted rounded-md transition-colors"
                            >
                              {tag.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
} 