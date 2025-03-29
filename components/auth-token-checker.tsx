"use client"

import { useEffect } from "react"
import { getAuthToken, setAuthToken } from "@/lib/auth-utils"

export function AuthTokenChecker() {
  useEffect(() => {
    // Vérifier le token au chargement
    const checkToken = () => {
      console.log("%c[AuthTokenChecker] Vérification du token au démarrage...", "color: #3b82f6; font-weight: bold;")

      // Essayer de récupérer le token
      const token = getAuthToken()

      if (token) {
        console.log("%c[AuthTokenChecker] Token trouvé au démarrage", "color: #10b981; font-weight: bold;")

        // S'assurer que le token est bien stocké partout
        setAuthToken(token)
      } else {
        console.warn("%c[AuthTokenChecker] Aucun token trouvé au démarrage", "color: #f59e0b; font-weight: bold;")
      }
    }

    checkToken()

    // Vérifier le token périodiquement (toutes les 30 secondes)
    const intervalId = setInterval(checkToken, 30000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  // Ce composant ne rend rien
  return null
}

