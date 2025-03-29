import { getAuthHeaders, getAuthToken } from "@/lib/auth-utils"
import { API_BASE_URL } from "@/constants"

// Fonction pour effectuer une requête GET authentifiée
export const authenticatedGet = async (url: string, params = {}) => {
  const token = getAuthToken()
  if (!token) {
    throw new Error("Non authentifié")
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token expiré ou invalide")
      }
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur lors de la requête authentifiée:", error)
    throw error
  }
}

// Fonction pour effectuer une requête POST authentifiée
export const authenticatedPost = async (url: string, data: any) => {
  const token = getAuthToken()
  if (!token) {
    throw new Error("Non authentifié")
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token expiré ou invalide")
      }
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur lors de la requête authentifiée:", error)
    throw error
  }
}

// Fonction pour effectuer une requête POST avec FormData authentifiée
export const authenticatedPostFormData = async (url: string, formData: FormData) => {
  const token = getAuthToken()
  if (!token) {
    throw new Error("Non authentifié")
  }

  try {
    // Pour FormData, ne pas définir Content-Type
    const headers = getAuthHeaders()
    delete headers["Content-Type"]

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers,
      body: formData,
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token expiré ou invalide")
      }
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur lors de la requête authentifiée:", error)
    throw error
  }
}

// Fonction pour effectuer une requête PUT authentifiée
export const authenticatedPut = async (url: string, data: any) => {
  const token = getAuthToken()
  if (!token) {
    throw new Error("Non authentifié")
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token expiré ou invalide")
      }
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur lors de la requête authentifiée:", error)
    throw error
  }
}

// Fonction pour effectuer une requête DELETE authentifiée
export const authenticatedDelete = async (url: string) => {
  const token = getAuthToken()
  if (!token) {
    throw new Error("Non authentifié")
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token expiré ou invalide")
      }
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    // Pour les requêtes DELETE, la réponse peut être vide
    if (response.status === 204) {
      return { success: true }
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur lors de la requête authentifiée:", error)
    throw error
  }
}

