import { useQuery } from "@tanstack/react-query"
import { getUsers } from "@/lib/services/users.service"
import { API_BASE_URL } from "@/constants"
import { getAxiosConfig } from "@/constants/client"

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: getUsers
    })
}

// Hook pour récupérer les détails d'un utilisateur spécifique
export const useUserDetail = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/accounts/admin/user/${userId}/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getAxiosConfig().headers.Authorization}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      return response.json()
    },
    enabled: !!userId,
  })
}