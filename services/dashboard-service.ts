import { getAuthHeaders, getAuthToken } from "@/lib/auth-utils"
import { API_BASE_URL } from "@/constants"
// Types pour les statistiques du tableau de bord
export type DashboardStats = {
  total: {
    products: number
    users: number
    orders: number
    revenue: number
  }
  today: {
    products: number
    users: number
    orders: number
    revenue: number
  }
  this_week: {
    products: number
    users: number
    orders: number
    revenue: number
  }
  this_month: {
    products: number
    users: number
    orders: number
    revenue: number
  }
  this_year: {
    products: number
    users: number
    orders: number
    revenue: number
  }
}

// Type pour les commandes récentes
export type RecentOrder = {
  id: number
  number: number
  created_at: string
  total_price: number
  status: string
  user: {
    first_name: string
    last_name: string
  }
  // Autres propriétés
  [key: string]: any
}

export type RecentOrdersResponse = {
  orders: RecentOrder[]
}

// Type pour les produits populaires
export type TopProduct = {
  product__name: string
  total_quantity: number
  total_revenue: number
}

export type TopProductsResponse = {
  top_products: TopProduct[]
}

// Fonction pour récupérer les statistiques détaillées
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/managers/dashboard/detailed-stats/`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store", // Désactiver le cache pour toujours obtenir les données les plus récentes
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Erreur API:", response.status, errorData)
      throw new Error(errorData.error || "Erreur lors de la récupération des statistiques")
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

// Fonction pour récupérer les commandes récentes
export const fetchRecentOrders = async (): Promise<RecentOrdersResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/managers/dashboard/recent-orders`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des commandes récentes")
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

// Fonction pour récupérer les produits populaires
export const fetchTopProducts = async (): Promise<TopProductsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/managers/dashboard/top-products`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    })
    
    const data = await response.json()
    console.log("Data:", data)
    console.log("Response:", response)
    
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des produits populaires")
    }

    return data // Retourner data au lieu de faire response.json() une deuxième fois
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

// Fonction pour formater le prix
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-GN", {
    style: "currency",
    currency: "GNF",
    maximumFractionDigits: 0,
  }).format(price)
}

