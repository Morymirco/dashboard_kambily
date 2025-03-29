"use client"

import { useAuthLogger } from "@/hooks/use-auth-logger"

export function AuthLogger() {
  // Utiliser le hook pour logger la disponibilité du token
  useAuthLogger()

  // Ce composant ne rend rien visuellement
  return null
}

