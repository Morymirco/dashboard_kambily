import { getAuthHeaders, getAuthToken } from "@/lib/auth-utils"

// Types pour les produits
export type ProductImage = {
  id: number
  image: string
  image_url: string | null
  created_at: string
  updated_at: string
  product: number
}

export type Product = {
  id: number
  slug: string
  name: string
  short_description: string
  long_description: string
  etat_stock: string
  regular_price: string
  promo_price: string
  sku: string
  stock_status: boolean
  quantity: number
  nombre_ventes: number
  product_type: "simple" | "variable"
  is_recommended: boolean
  images: ProductImage[]
  reviews: any[]
  created_at: string
  updated_at: string
}

export type ProductsResponse = {
  count: number
  next: string | null
  previous: string | null
  results: Product[]
}

// Service côté client uniquement
export const fetchProducts = async (page = 1, search = "") => {
  try {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ""
    const url = `/api/products?page=${page}${searchParam}`

    // Logger la requête et le token
    const token = getAuthToken()
    console.log(
      `%c[API] Requête GET ${url} | Token: ${token ? "Disponible" : "Non disponible"}`,
      "background: #9C27B0; color: white; padding: 2px 5px; border-radius: 3px;",
    )

    const headers = getAuthHeaders()
    console.log("[API] Headers:", headers)

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    })

    console.log(`[API] Réponse: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des produits")
    }

    const data = await response.json()
    console.log("[API] Données reçues:", data)

    return data as ProductsResponse
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const createProduct = async (productData: FormData) => {
  try {
    // Pour FormData, ne pas définir Content-Type
    const headers = getAuthHeaders()
    delete headers["Content-Type"]

    const response = await fetch("/api/products", {
      method: "POST",
      headers,
      body: productData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erreur lors de la création du produit")
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const uploadProductImage = async (productId: number, imageFile: File) => {
  try {
    const formData = new FormData()
    formData.append("image", imageFile)
    formData.append("product", productId.toString())

    // Pour FormData, ne pas définir Content-Type
    const headers = getAuthHeaders()
    delete headers["Content-Type"]

    const response = await fetch(`/api/products/${productId}/images`, {
      method: "POST",
      headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Erreur lors du téléchargement de l'image")
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const formatPrice = (price: string) => {
  const numPrice = Number.parseFloat(price)
  if (isNaN(numPrice)) return price

  return new Intl.NumberFormat("fr-GN", {
    style: "currency",
    currency: "GNF",
    maximumFractionDigits: 0,
  }).format(numPrice)
}

export async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`https://api.kambily.com/products/${id}/`)

    if (!response.ok) {
      throw new Error(`Error fetching product: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching product:", error)
    throw error
  }
}

export async function createVariant(productId: number, data: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/variants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Erreur lors de la création de la variante")
  }

  return response.json()
}

