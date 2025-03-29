"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AuthErrorHandlerProps {
  children: React.ReactNode
}

export function AuthErrorHandler({ children }: AuthErrorHandlerProps) {
  const [hasAuthError, setHasAuthError] = useState(false)
  const router = useRouter()

  // Intercepter les erreurs d'authentification globales
  useEffect(() => {
    const handleAuthError = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes("401") ||
        event.error?.message?.includes("non authentifié") ||
        event.error?.message?.includes("token") ||
        event.error?.message?.includes("Authentication credentials")
      ) {
        setHasAuthError(true)
        toast.error("Session expirée. Veuillez vous reconnecter.")
      }
    }

    window.addEventListener("error", handleAuthError)
    return () => window.removeEventListener("error", handleAuthError)
  }, [router])

  const handleReconnect = () => {
    router.push("/login")
  }

  if (hasAuthError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Session expirée</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">Votre session a expiré ou vous n'êtes plus authentifié.</p>
            <Button onClick={handleReconnect}>Se reconnecter</Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}

