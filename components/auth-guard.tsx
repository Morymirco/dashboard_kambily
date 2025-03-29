"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté et que le chargement est terminé,
    // rediriger vers la page de connexion
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return <div>Chargement...</div>
  }

  // Si l'utilisateur est connecté, afficher les enfants
  return user ? <>{children}</> : null
}

