// Fonction pour récupérer le token d'authentification
/**
 * Récupère le token d'authentification depuis le localStorage
 * @returns {string|null} Le token d'authentification ou null s'il n'existe pas
 */
export function getAuthToken(): string | null {
  // Vérifier si nous sommes côté client
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken')
  }
  return null
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
/**
 * Vérifie si un token d'authentification existe
 * @returns {boolean} True si un token existe, false sinon
 */
export function hasAuthToken(): boolean {
  return !!getAuthToken()
}

// Fonction pour stocker le token d'authentification
/**
 * Enregistre le token d'authentification dans le localStorage
 * @param {string} token - Le token d'authentification à enregistrer
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token)
  }
}

// Fonction pour supprimer le token d'authentification
/**
 * Supprime le token d'authentification du localStorage
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken')
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

