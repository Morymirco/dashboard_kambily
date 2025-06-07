// Types pour les partenaires
export type Partner = {
  id: number
  name: string
  email: string
  phone: string | null
  address: string
  latitude: number
  longitude: number
  website: string | null
  created_at: string
  updated_at: string
}

export type PartnersResponse = {
  count: number
  next: string | null
  previous: string | null
  results: Partner[]
}

// Type for a product
export type PartnerProduct = {
  id: number
  name: string
  slug: string
  
  short_description: string
  long_description: string
  regular_price: string
  promo_price: string
  quantity: number
  sku: string
  stock_status: boolean
  etat_stock: string
  product_type: string
  is_recommended: boolean
  is_vedette: boolean
  is_variable: boolean
  images:
    | Array<{
        id: number
        image: string
        image_url: string | null
        created_at: string
        updated_at: string
        product: number
      }>
    | []
  categories:
    | Array<{
        id: number
        name: string
        description: string
        slug: string
        is_main: boolean
        image: string | null
        created_at: string
        updated_at: string
        parent_category: number | null
      }>
    | []
  partenaire: {
    id: number
    name: string
    email: string
    phone: string
    address: string
    latitude: number
    longitude: number
    website: string
    created_at: string
    updated_at: string
  }
  
  // Autres propriétés
  [key: string]: any
}

// Response for all partner products (paginated)
export type PartnerProductsResponse = {
  count: number
  next: string | null
  previous: string | null
  results: PartnerProduct[]
  products: {
    count: number
    next: string | null
    previous: string | null
    results: PartnerProduct[]
  }
}

// Response for a specific partner's products
export type PartnerWithProductsResponse = {
  id: number
  name: string
  email: string
  phone: string
  address: string
  latitude: number
  longitude: number
  website: string
  created_at: string
  updated_at: string
  products: PartnerProduct[]
}

// Update the type for all partner products response
export type AllPartnerProductsResponse = Array<{
  id: number // Partner ID
  products: PartnerProduct[]
}>

// Modifions le type ProductsResponse pour inclure la propriété products
export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PartnerProduct[];
  // Ajout de la propriété products qui peut être présente dans certaines réponses
  products?: {
    count: number;
    next: string | null;
    previous: string | null;
    results: PartnerProduct[];
  };
}

// Maintenant PartnerWithProducts peut étendre Partner sans conflit
export interface PartnerWithProducts extends Partner {
  products: ProductsResponse;
}

// Fonction pour récupérer tous les partenaires
export const fetchPartners = async (page = 1, search = "") => {
  try {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ""
    const response = await fetch(`/api/partners?page=${page}${searchParam}`, {
      method: "GET",
    })

    console.log("response partners", response)

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des partenaires")
    }

    return (await response.json()) as PartnersResponse
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

// Fonction pour récupérer un partenaire spécifique
export async function fetchPartnerById(id: number): Promise<PartnerWithProducts> {
  const response = await fetch(`/api/partners/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération du partenaire");
  }

  return response.json();
}

// Fonction pour créer un partenaire
export const createPartner = async (partnerData: FormData) => {
  try {
    const response = await fetch("/api/partners", {
      method: "POST",
      body: partnerData,
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

// Fonction pour mettre à jour un partenaire
export const updatePartner = async (id: number, partnerData: FormData) => {
  try {
    const response = await fetch(`/api/partners/${id}`, {
      method: "PUT",
      body: partnerData,
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

// Fonction pour mettre à jour partiellement un partenaire
export const patchPartner = async (id: number, partnerData: any) => {
  try {
    const response = await fetch(`/api/partners/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(partnerData),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour partielle du partenaire")
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

// Fonction pour supprimer un partenaire
export const deletePartner = async (id: number) => {
  try {
    const response = await fetch(`/api/partners/${id}`, {
      method: "DELETE",
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

// Fonction pour récupérer tous les produits de tous les partenaires
export const fetchAllPartnerProducts = async (page = 1, search = "") => {
  try {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ""
    const response = await fetch(`/api/partners/products?page=${page}${searchParam}`, {
      method: "GET",
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
          name: product.partenaire?.name,
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

// Fonction pour récupérer les produits d'un partenaire spécifique
export async function fetchPartnerProducts(partnerId: number): Promise<ProductsResponse> {
  const response = await fetch(`/api/partners/${partnerId}/products`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des produits du partenaire");
  }

  return response.json();
}

