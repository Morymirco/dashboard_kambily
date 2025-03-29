"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "react-hot-toast"
import type { User } from "@/lib/auth-actions"
import { API_BASE_URL } from "@/constants"
import { setAuthToken, removeAuthToken, getAuthToken } from "@/lib/auth-utils"

// Clés utilisées pour le localStorage
const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>
  logout: () => void
  hasRole: (role: string) => boolean
  getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Effet pour charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY)
        const storedUser = localStorage.getItem(USER_KEY)

        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error)
        // En cas d'erreur, nettoyer le localStorage
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      } finally {
        setLoading(false)
      }
    }

    loadUserFromStorage()
  }, [])

  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY)
  }

  const login = async (email: string, password: string, remember = false): Promise<boolean> => {
    setLoading(true)

    try {
      console.log(
        "%c[Auth] Tentative de connexion...",
        "background: #2196F3; color: white; padding: 2px 5px; border-radius: 3px;",
      )

      // Appel direct à l'API
      const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log(`[Auth] Réponse de l'API: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[Auth] Erreur de connexion:", errorData)
        toast.error(errorData.message || "Identifiants incorrects")
        setLoading(false)
        return false
      }

      const data = await response.json()
      console.log("[Auth] Connexion réussie, données reçues:", { ...data, access_token: "***" })

      const { access_token, user, expires_in } = data

      // Stocker dans localStorage
      localStorage.setItem(TOKEN_KEY, access_token)
      setAuthToken(access_token)

      const userWithExpiry = {
        ...user,
        token_expires_in: expires_in,
      }

      localStorage.setItem(USER_KEY, JSON.stringify(userWithExpiry))

      // Mettre à jour l'état
      setUser(userWithExpiry)

      // Vérifier que le token est bien stocké
      const storedToken = getAuthToken()
      console.log(
        `%c[Auth] Token stocké: ${storedToken ? "Oui" : "Non"}`,
        storedToken
          ? "background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;"
          : "background: #F44336; color: white; padding: 2px 5px; border-radius: 3px;",
      )

      toast.success("Connexion réussie")

      // Redirection après un court délai
      setTimeout(() => {
        console.log("[Auth] Redirection vers la page d'accueil...")
        window.location.href = "/"
      }, 1500)

      return true
    } catch (error) {
      console.error("[Auth] Erreur de connexion:", error)
      toast.error("Une erreur est survenue lors de la connexion")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log("%c[Auth] Déconnexion...", "background: #FF9800; color: white; padding: 2px 5px; border-radius: 3px;")

    // Supprimer les données du localStorage
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    removeAuthToken()

    // Mettre à jour l'état
    setUser(null)

    // Vérifier que le token est bien supprimé
    const storedToken = getAuthToken()
    console.log(
      `%c[Auth] Token supprimé: ${!storedToken ? "Oui" : "Non"}`,
      !storedToken
        ? "background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;"
        : "background: #F44336; color: white; padding: 2px 5px; border-radius: 3px;",
    )

    toast.success("Déconnexion réussie")

    // Redirection après un court délai
    setTimeout(() => {
      console.log("[Auth] Redirection vers la page de connexion...")
      window.location.href = "/login"
    }, 1500)
  }

  // Fonction pour vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role: string) => {
    if (!user) return false

    // Vérifier si l'utilisateur est admin
    if (role === "admin") {
      return !!user.is_staff || !!user.is_superuser
    }

    // Vérifier d'autres rôles si nécessaire
    return user.role === role
  }

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    getToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

