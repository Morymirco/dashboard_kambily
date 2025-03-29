"use server"
import { API_BASE_URL } from "@/constants"

// Type pour les données d'authentification
export type User = {
  id: string
  name?: string
  email: string
  is_staff?: boolean
  is_superuser?: boolean
  role?: string
  token_expires_in?: number
  [key: string]: any
}

// Action de connexion
export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const remember = formData.get("remember") === "on"

  try {
    // Appel à l'API de connexion
    const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        message: errorData.message || "Identifiants incorrects",
      }
    }

    const data = await response.json()
    const { access_token, user, expires_in } = data

    // Retourner les données pour que le client puisse les stocker dans localStorage
    return {
      success: true,
      message: "Connexion réussie",
      data: {
        access_token,
        user: {
          ...user,
          token_expires_in: expires_in,
        },
      },
    }
  } catch (error) {
    console.error("Erreur de connexion:", error)
    return {
      success: false,
      message: "Une erreur est survenue lors de la connexion",
    }
  }
}

// Action de déconnexion
export async function logout() {
  // Redirection gérée côté client
  return { success: true }
}

// Fonction pour vérifier si l'utilisateur est connecté
// Cette fonction est utilisée côté serveur, mais nous n'avons plus accès au token
// car il est stocké dans localStorage (côté client uniquement)
export async function getSession(): Promise<User | null> {
  // Côté serveur, nous ne pouvons pas accéder à localStorage
  // Nous retournons donc null pour indiquer que l'utilisateur n'est pas connecté
  return null
}

// Action de refresh token
export async function refreshToken(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts/refresh-token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        message: errorData.message || "Impossible de rafraîchir le token",
      }
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error)
    return {
      success: false,
      message: "Une erreur est survenue lors du rafraîchissement du token",
    }
  }
}

