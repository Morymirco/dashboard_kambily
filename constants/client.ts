"use client"

import { getCookie } from "@/helpers/cookies"

// Configuration de l'API
export const HOST_IP = "api.kambily.com"
export const PORT = ""
export const PROTOCOL_HTTP = "https"
// export const HOST_IP = '192.168.1.133'
// export const PORT = ':8000'
// export const PROTOCOL_HTTP = 'http'
export const PROTOCOL_WS = "ws"
export const API_BASE_URL = `${PROTOCOL_HTTP}://${HOST_IP}${PORT}`

// Modifier la fonction getAuthToken pour qu'elle utilise localStorage
export const getAuthToken = () => {
  // Récupérer depuis localStorage
  if (typeof localStorage !== "undefined") {
    const token = localStorage.getItem("access_token")
    if (token) {
      return token
    }
  }

  // Fallback vers les cookies pour la compatibilité pendant la transition
  const token = getCookie("accessToken")
  if (token) {
    // Migrer vers localStorage
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("access_token", token)
    }
    return token
  }

  return ""
}

// Fonction utilitaire pour les configurations Axios
export const getAxiosConfig = () => {
  const token = getAuthToken()

  return {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
}

// Version client de la vérification de token
export const isTokenValid = async () => {
  try {
    // Utiliser notre nouvelle API route pour vérifier le token
    const response = await fetch("/api/auth/validate", {
      method: "GET",
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.valid
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error)
    return false
  }
}

export const IsAuthenticated = async () => {
  return isTokenValid()
}

