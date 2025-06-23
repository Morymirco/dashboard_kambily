"use client"

import type React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth()
  const [isClient, setIsClient] = useState(false)

  console.log("auth guard")
  console.log("user",user)
  console.log("loading",loading)
  console.log("isAuthenticated",isAuthenticated())
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté et que le chargement est terminé,
    // rediriger vers la page de connexion
    if (isClient && !loading && !user) {
      console.log("redirection vers la page de connexion")
      router.push("/login")
    }
  }, [user, loading, router, isClient])

  // Pendant le rendu côté serveur ou avant l'hydratation, afficher un skeleton
  if (!isClient || loading) {
    return (
      <div className="p-6 space-y-6 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-3 w-[200px]" />
            </div>
          </div>
          <Skeleton className="h-10 w-[120px]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-[100px] w-full rounded-lg" />
              <Skeleton className="h-[100px] w-full rounded-lg" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-[120px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  // Si l'utilisateur est connecté, afficher les enfants
  return user ? <>{children}</> : null
}

