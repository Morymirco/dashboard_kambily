import { fetchProduct } from "@/services/product-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

// Ajout des interfaces
interface ProductImage {
  id: number
  image: string
  image_url: string | null
}

interface Category {
  id: number
  name: string
  description: string
  slug: string
}

interface Attribut {
  id: number
  attribut: {
    id: number
    nom: string
  }
  valeur: string
  hex_code: string | null
}

interface Variante {
  id: number
  attributs: Attribut[]
  regular_price: string
  promo_price: string
  quantity: number
  images: ProductImage[]
}

interface Product {
  id: number
  name: string
  slug: string
  short_description: string
  long_description: string
  etat_stock: string
  regular_price: string
  promo_price: string
  sku: string
  stock_status: boolean
  quantity: number
  product_type: string
  is_recommended: boolean
  nombre_ventes: number
  categories: Category[]
  images: ProductImage[]
  variantes: Variante[]
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const productId = params.id

  try {
    const product: Product = await fetchProduct(productId)

    if (!product) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-lg text-muted-foreground">Produit non trouvé</p>
        </div>
      )
    }

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Détails du Produit</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.images && product.images.length > 0 ? (
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  <Image
                    src={product.images[0].image || "/placeholder.svg?height=400&width=400"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                  <Image src="/placeholder.svg?height=400&width=400" alt="Placeholder" fill className="object-cover" />
                </div>
              )}

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1).map((image, index) => (
                    <div key={index} className="aspect-square relative overflow-hidden rounded-lg">
                      <Image
                        src={image.image || "/placeholder.svg?height=100&width=100"}
                        alt={`${product.name} ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{product.name}</h2>
                <p className="text-muted-foreground">{product.slug}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={product.stock_status ? "default" : "secondary"}>
                  {product.etat_stock || (product.stock_status ? "En stock" : "Rupture de stock")}
                </Badge>
                <Badge variant="outline">{product.product_type}</Badge>
                {product.is_recommended && <Badge variant="outline">Recommandé</Badge>}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Prix</p>
                  <p className="text-lg font-medium">{formatPrice(product.regular_price)}</p>
                </div>

                {product.promo_price && Number(product.promo_price) > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Prix promotionnel</p>
                    <p className="text-lg font-medium">{formatPrice(product.promo_price)}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Quantité</p>
                  <p className="text-lg font-medium">{product.quantity}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="text-lg font-medium">{product.sku || "N/A"}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Ventes</p>
                  <p className="text-lg font-medium">{product.nombre_ventes || 0}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Description courte</h3>
                <p>{product.short_description}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Description longue</h3>
                <p>{product.long_description}</p>
              </div>

              {product.categories && product.categories.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Catégories</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.categories.map((category, index) => (
                      <Badge key={index} variant="outline">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {product.product_type === "variable" && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Variantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {product.variantes.map((variante) => (
                  <div key={variante.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    {/* Image de la variante */}
                    <div className="h-24 w-24 relative rounded-md overflow-hidden">
                      <Image
                        src={variante.images[0]?.image || product.images[0]?.image || "/placeholder.svg"}
                        alt={`Variante ${variante.id}`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Détails de la variante */}
                    <div className="flex-1 space-y-2">
                      {/* Attributs */}
                      <div className="flex flex-wrap gap-3">
                        {variante.attributs.map((attr) => (
                          <div key={attr.id} className="flex items-center gap-2">
                            <span className="text-sm font-medium capitalize">
                              {attr.attribut.nom}:
                            </span>
                            {attr.hex_code ? (
                              <div className="flex items-center gap-1">
                                <div
                                  className="h-4 w-4 rounded-full border"
                                  style={{ backgroundColor: attr.hex_code }}
                                />
                                <span className="text-sm">{attr.valeur}</span>
                              </div>
                            ) : (
                              <span className="text-sm">{attr.valeur}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Prix et stock */}
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Prix:</span>
                          <span className="ml-1 font-medium">
                            {formatPrice(variante.regular_price)}
                          </span>
                        </div>
                        {Number(variante.promo_price) > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground">
                              Prix promo:
                            </span>
                            <span className="ml-1 font-medium">
                              {formatPrice(variante.promo_price)}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-sm text-muted-foreground">Stock:</span>
                          <span className="ml-1 font-medium">{variante.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  } catch (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-red-500">Erreur: Erreur lors du chargement du produit</p>
      </div>
    )
  }
}

