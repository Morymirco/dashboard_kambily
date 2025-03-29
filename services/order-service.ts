// services/order-service.ts

import { getAuthToken } from "@/lib/auth-utils"

export type OrderItem = {
  id: number
  product: {
    id: number
    name: string
    regular_price: string
    images: Array<{
      id: number
      image: string
    }>
  }
  quantity: number
}

export type OrderDelivery = {
  address: string
  ville: string
  pays?: string
  telephone?: string
  latitude?: number
  longitude?: number
}

export type OrderDeliverer = {
  user: {
    id: number
    first_name: string
    last_name: string
    phone: string
    image?: string
  }
}

export type Order = {
  id: number
  number: number
  created_at: string
  total_price: number
  status: string
  user: {
    first_name: string
    last_name: string
  }
  payement?: {
    payment_method?: string
    payment_status?: string
  }
  cash_on_delivery: boolean
  deliverer?: any
  total_products: number
  // Add other order properties here as needed
  [key: string]: any // Allow for other properties
}

export type OrderDetail = Order & {
  order_items: OrderItem[]
  delivery: OrderDelivery
  deliverer?: OrderDeliverer
  total_delivery: number
  discount: number
  payment_method: string
  payment_status: string
}

export type OrdersResponse = {
  orders: Order[]
}

export const fetchOrders = async (): Promise<OrdersResponse> => {
  try {
    const response = await fetch("/api/orders", {
      method: "GET",
    })


    
    if (!response.ok) {
      throw new Error("Failed to fetch orders")
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

// Modifier la fonction exportOrders pour ne plus exiger de dates
export const exportOrders = async (): Promise<any> => {
  try {
    const response = await fetch(`/api/orders/export`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error("Failed to export orders")
    }

    return response.json()
  } catch (error) {
    console.error("Error exporting orders:", error)
    throw error
  }
}

export const getStatusText = (status: string): string => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "prepared":
      return "En livraison"
    case "delivered":
      return "Livré"
    case "cancelled":
      return "Annulé"
    default:
      return "Inconnu"
  }
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "pending":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
    case "accepted":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
    case "prepared":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
  }
}

export const getPaymentMethodText = (method?: string): string => {
  switch (method) {
    case "paycard":
      return "Paiement par carte"
    case "om":
      return "Orange Money"
    case "momo":
      return "MTN Money"
    case "card":
      return "Carte bancaire"
    case "cash":
      return "Paiement à la livraison"
    default:
      return "Méthode inconnue"
  }
}

export const getPaymentStatusText = (status?: string): string => {
  switch (status) {
    case "pending":
      return "En attente"
    case "completed":
      return "Payé"
    default:
      return "Inconnu"
  }
}

export const fetchOrderDetail = async (id: string): Promise<OrderDetail> => {
  try {
    const token = getAuthToken()
    
    if (!token) {
      throw new Error("Token d'authentification manquant")
    }

    const response = await fetch(`/api/orders/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Non autorisé - Veuillez vous reconnecter")
      }
      throw new Error("Erreur lors de la récupération des détails de la commande")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching order detail:", error)
    throw error
  }
}

export const acceptOrder = async (orderNumber: string): Promise<void> => {
  // endpoint : /orders/accept/<str:number>/
  try {
    const response = await fetch(`/api/orders/${orderNumber}/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Erreur lors de l'acceptation de la commande")
    }

    return response.json()
  } catch (error) {
    console.error("Error accepting order:", error)
    throw error
  }
}

