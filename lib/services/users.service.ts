import API from "@/service/api"
import { API_ENDPOINTS } from "../constant/api"
import { API_BASE_URL } from "@/constants"
import { getAuthHeaders } from "@/lib/utils"

export const getUsers = async () => {
    const response = await API.get(API_ENDPOINTS.users.base)
    return response.data
}

// Fonction pour récupérer les détails d'un utilisateur spécifique
export const getUserDetail = async (userId: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/accounts/admin/user/${userId}/`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    )

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de l'utilisateur:", error)
    throw error
  }
}