import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"
import type {
  Partner,
  PartnersResponse,
  PartnerProductsResponse,
  PartnerWithProductsResponse,
  AllPartnerProductsResponse,
} from "./partner-service"

// Service côté serveur uniquement
export const getPartners = async (page = 1, search = "") => {
  try {
    const config = getServerFetchConfig()
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ""
    const response = await fetch(`${API_BASE_URL}/partenaire/viewset/?page=${page}${searchParam}`, {
      headers: config.headers,
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des partenaires")
    }

    return (await response.json()) as PartnersResponse
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const getPartnerById = async (id: number) => {
  try {
    const config = getServerFetchConfig()
    const response = await fetch(`${API_BASE_URL}/partenaire/viewset/${id}/`, {
      headers: config.headers,
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Partenaire non trouvé")
    }

    return (await response.json()) as Partner
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

// Update the getAllPartnerProducts function to handle the new format
export const getAllPartnerProducts = async (page = 1, search = "") => {
  try {
    const config = getServerFetchConfig()
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ""
    const response = await fetch(`${API_BASE_URL}/partenaire/viewset/products/?page=${page}${searchParam}`, {
      headers: config.headers,
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des produits des partenaires")
    }

    // The API returns an array of partners with their products
    const partnersWithProducts = (await response.json()) as AllPartnerProductsResponse

    // Flatten all products from all partners into a single array
    const allProducts = partnersWithProducts.flatMap((partner) =>
      partner.products.map((product) => ({
        ...product,
        partenaire: {
          id: partner.id,
          name: product.partenaire?.name || partner.name || "",
          email: product.partenaire?.email || "",
          phone: product.partenaire?.phone || "",
          address: product.partenaire?.address || "",
          latitude: product.partenaire?.latitude || 0,
          longitude: product.partenaire?.longitude || 0,
          website: product.partenaire?.website || "",
          created_at: product.partenaire?.created_at || "",
          updated_at: product.partenaire?.updated_at || "",
        },
      })),
    )

    // Return in a format compatible with the existing code
    return {
      count: allProducts.length,
      next: null,
      previous: null,
      results: allProducts,
    } as PartnerProductsResponse
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

// Update the getPartnerProducts function to use the exact URL and handle the different response format
export const getPartnerProducts = async (partnerId: number, page = 1, search = "") => {
  try {
    const config = getServerFetchConfig()
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ""
    const response = await fetch(
      `${API_BASE_URL}/partenaire/viewset/products/${partnerId}/?page=${page}${searchParam}`,
      {
        headers: config.headers,
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des produits du partenaire")
    }

    // The API returns a partner object with a products array
    const partnerWithProducts = (await response.json()) as PartnerWithProductsResponse

    // Return the products in a format compatible with the existing code
    return {
      count: partnerWithProducts.products.length,
      next: null,
      previous: null,
      results: partnerWithProducts.products,
    } as PartnerProductsResponse
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const createPartnerServer = async (formData: FormData) => {
  try {
    const config = getServerFetchConfig()
    const response = await fetch(`${API_BASE_URL}/partenaire/viewset/`, {
      method: "POST",
      headers: {
        ...config.headers,
        "Content-Type": undefined as any,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erreur lors de la création du partenaire")
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const updatePartnerServer = async (id: number, formData: FormData) => {
  try {
    const config = getServerFetchConfig()
    const response = await fetch(`${API_BASE_URL}/partenaire/viewset/${id}/`, {
      method: "PUT",
      headers: {
        ...config.headers,
        "Content-Type": undefined as any,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour du partenaire")
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const deletePartnerServer = async (id: number) => {
  try {
    const config = getServerFetchConfig()
    const response = await fetch(`${API_BASE_URL}/partenaire/viewset/${id}/`, {
      method: "DELETE",
      headers: config.headers,
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression du partenaire")
    }

    return { success: true }
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

