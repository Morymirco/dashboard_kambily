import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"
import type { ProductsResponse, Product } from "./product-service"

// Service côté serveur uniquement
export const getProducts = async (page = 1, search = "") => {
  try {
    const config = getServerFetchConfig()
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ""
    const response = await fetch(`${API_BASE_URL}/products/viewset/?page=${page}${searchParam}`, {
      headers: config.headers,
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des produits")
    }

    return (await response.json()) as ProductsResponse
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const getProductById = async (id: number) => {
  try {
    const config = getServerFetchConfig()
    const response = await fetch(`${API_BASE_URL}/products/viewset/${id}/`, {
      headers: config.headers,
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Produit non trouvé")
    }

    return (await response.json()) as Product
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const createProductServer = async (formData: FormData) => {
  try {
    const config = getServerFetchConfig()
    const response = await fetch(`${API_BASE_URL}/products/viewset/`, {
      method: "POST",
      headers: {
        ...config.headers,
        "Content-Type": undefined as any,
      },
      body: formData,
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

export const uploadProductImageServer = async (productId: number, formData: FormData) => {
  try {
    const config = getServerFetchConfig()
    const response = await fetch(`${API_BASE_URL}/products/images/`, {
      method: "POST",
      headers: {
        ...config.headers,
        "Content-Type": undefined as any,
      },
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

