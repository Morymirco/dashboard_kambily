import { cookies, headers } from "next/headers"
import { API_BASE_URL } from "@/constants"

// Fonction pour récupérer la configuration pour les requêtes fetch côté serveur
export const getServerFetchConfig = () => {
  // Essayer de récupérer le token depuis les headers de la requête
  const headersList = headers()
  const authHeader = headersList.get("Authorization")

  // Si le token est présent dans les headers, l'utiliser
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
      },
    }
  }

  // Sinon, essayer de récupérer le token depuis les cookies
  const token = cookies().get("access_token")

  return {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token.value}` } : {}),
    },
  }
}

// Fonction pour récupérer l'URL complète de l'API
export const getApiUrl = (path: string) => {
  return `${API_BASE_URL}${path}`
}

