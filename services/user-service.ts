import { getAuthHeaders, getAuthToken } from "@/lib/auth-utils"
import { API_BASE_URL } from "@/constants"

// Mettre à jour les types pour correspondre au format des données reçues
export type UserAddress = {
  pk: number
  address: string
  ville: string
  pays: string
  telephone: string
  location_url: string
  latitude: number
  longitude: number
  is_default: boolean
}

export type UserOrder = {
  number: string
  status: string
  total_price: string
  deliverer: any
  cash_on_delivery: boolean
  total_products: number
  total_delivery: string
  delivery: any
  code_bar_image: string
  link: string
  recu: string
  promo_code: any
  order_items: any[]
  buyer_name: string | null
  buyer_phone: string | null
  buyer_email: string | null
  payement: any
  created_at: string
  updated_at: string
  user: {
    first_name: string
    last_name: string
    email: string
    phone_number: string
    role: string
    status: boolean
    is_active: boolean
    image: string | null
  }
}

export type UserOrdersInfo = {
  total_orders: number
  total_prices: number | null
  cart: any[]
  favorites: any[]
  average_orders: number | null
  orders: UserOrder[]
}

export type User = {
  id?: number
  first_name: string
  last_name: string
  email: string
  phone_number: string
  role: string
  address?: string
  is_active: boolean
  status: boolean
  bio?: string | null
  image: string | null
  is_confirmed?: boolean
  is_accept_mail?: boolean
  total_orders?: number
  total_favorites?: number
  total_reviews?: number
  addresses?: UserAddress[]
  orders?: UserOrdersInfo
  created_at?: string
  updated_at?: string
  last_login?: string | null
}

export const fetchUsers = async (page = 1, search = "", role = "", status = ""): Promise<User[]> => {
  try {
    let url = `${API_BASE_URL}/accounts/admin/?page=${page}`

    if (search) {
      url += `&search=${search}`
    }

    if (role && role !== "all") {
      url += `&role=${role}`
    }

    if (status && status !== "all") {
      url += `&status=${status}`
    }

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
      console.error(`Erreur HTTP: ${response.status} ${response.statusText}`)
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[API] Données reçues:", data)

    // Vérifier si la réponse est un tableau
    if (!Array.isArray(data)) {
      console.error("Format de réponse invalide (pas un tableau):", data)
      return []
    }

    // Ajouter des IDs temporaires basés sur l'email si nécessaire
    return data.map((user: User) => ({
      ...user,
      id: Math.random(), // ID temporaire pour React
    }))
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    return []
  }
}

// Mettre à jour les autres fonctions pour correspondre au nouveau format
export const fetchUserById = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts/admin/${userId}/`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    throw error
  }
}

export const deleteUser = async (userId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts/admin/${userId}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error)
    throw error
  }
}

export const updateUserStatus = async (userId: number, status: boolean): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts/admin/${userId}/`, {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de l'utilisateur:", error)
    throw error
  }
}

