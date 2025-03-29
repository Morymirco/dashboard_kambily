"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { getAuthToken } from "@/lib/auth-utils"

/**
 * Hook pour logger la disponibilité du token d'authentification sur chaque page
 */
export function useAuthLogger() {
  const pathname = usePathname()

  useEffect(() => {
    // Récupérer le token
    const token = getAuthToken()

    // Créer un style pour les logs
    const logStyle = token
      ? "background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;"
      : "background: #F44336; color: white; padding: 2px 5px; border-radius: 3px;"

    // Logger la disponibilité du token
    console.log(`%c[Auth] Page: ${pathname} | Token: ${token ? "Disponible" : "Non disponible"}`, logStyle)

    // Si le token est disponible, afficher les premiers caractères
    if (token) {
      console.log(
        `%c[Auth] Token (premiers caractères): ${token.substring(0, 15)}...`,
        "background: #2196F3; color: white; padding: 2px 5px; border-radius: 3px;",
      )
    }
  }, [pathname])
}

