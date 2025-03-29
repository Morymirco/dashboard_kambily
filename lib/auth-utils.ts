// Fonction pour récupérer le token d'authentification
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return localStorage.getItem("auth_token")
  } catch (error) {
    console.error("Erreur lors de la récupération du token:", error)
    return null
  }
}

// Fonction pour récupérer les headers d'authentification
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

// Fonction pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

// Fonction pour stocker le token d'authentification
export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem("auth_token", token)
  } catch (error) {
    console.error("Erreur lors du stockage du token:", error)
  }
}

// Fonction pour supprimer le token d'authentification
export const removeAuthToken = (): void => {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.removeItem("auth_token")
  } catch (error) {
    console.error("Erreur lors de la suppression du token:", error)
  }
}

// Fonction pour stocker les informations de l'utilisateur
export const setAuthUser = (user: any): void => {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem("auth_user", JSON.stringify(user))
  } catch (error) {
    console.error("Erreur lors du stockage des informations de l'utilisateur:", error)
  }
}

// Fonction pour récupérer les informations de l'utilisateur
export const getAuthUser = (): any | null => {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const user = localStorage.getItem("auth_user")
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error("Erreur lors de la récupération des informations de l'utilisateur:", error)
    return null
  }
}

// Fonction pour supprimer les informations de l'utilisateur
export const removeAuthUser = (): void => {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.removeItem("auth_user")
  } catch (error) {
    console.error("Erreur lors de la suppression des informations de l'utilisateur:", error)
  }
}

