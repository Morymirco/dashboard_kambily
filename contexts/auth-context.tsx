"use client"

import { API_BASE_URL } from "@/constants"
import { getCookie, removeCookie, setCookieWithExpiry } from "@/helpers/cookies"
import { getAuthToken, removeAuthToken } from "@/lib/auth-utils"
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { toast } from "react-hot-toast"

// Clés utilisées pour le localStorage
const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

// Mettre à jour le type User pour inclure toutes les propriétés nécessaires
export type User = {
  id?: string
  first_name?: string
  last_name?: string
  email?: string
  role?: string
  phone_number?: string
  address?: string
  is_active?: boolean
  status?: boolean
  bio?: string
  image?: string  // Ajout de la propriété image
  is_confirmed?: boolean
  is_accept_mail?: boolean
  total_orders?: number
  total_favorites?: number
  total_reviews?: number
  addresses?: Array<{
    pk: number
    address: string
    ville: string
    pays: string
    telephone: string
    location_url: string
    latitude: number
    longitude: number
    is_default: boolean
  }>
  orders?: {
    total_orders: number
    total_prices: number
    cart: any[]
    favorites: any[]
    average_orders: number
    orders: Array<{
      number: string
      status: string
      total_price: string
      deliverer: {
        user: {
          first_name: string
          last_name: string
          email: string
          phone_number: string
          role: string
          status: boolean
          is_active: boolean
          image: string | null
        }
        total_orders: number
        collected_payments: string
      } | null
      cash_on_delivery: boolean
      total_products: number
      total_delivery: string
      delivery: {
        pk?: number
        address: string
        ville: string
        pays: string
        telephone: string
        location_url: string
        latitude: number | null
        longitude: number | null
        is_default: boolean
      }
      code_bar_image: string | null
      link: string | null
      recu: string | null
      promo_code: string | null
      order_items: Array<{
        pk: number
        product: any | null
        product_variante: any | null
        is_variante: boolean
        quantity: number
        created_at: string
        updated_at: string
      }>
      buyer_name: string | null
      buyer_phone: string | null
      buyer_email: string | null
      payement: {
        id: number
        payment_status: string
        payment_method: string
        transaction_id: string
        transaction_ref: string | null
        paycard_amount: string | null
        paycard_card_number: string | null
        paycard_account_name: string | null
        ecommReference: string | null
        paycard_transaction_description: string | null
        paycard_payment_method: string | null
        created_at: string
        updated_at: string
        order: number
      }
      created_at: string
      updated_at: string
    }>
  }
  created_at?: string
  updated_at?: string
  last_login?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>
  logout: () => void
  hasRole: (role: string) => boolean
  getToken: () => string | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  updateUserData: (userData: Partial<User>) => void
  fetchUserProfile: () => Promise<boolean>
  isLoadingProfile: boolean
  isAuthenticated: () => boolean
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
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  
  
  // Référence pour éviter les appels multiples
  const profileFetchedRef = useRef(false)

  // Effet pour charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedToken = getCookie("accessToken")
        let storedUser = getCookie("user")
        
       
        if (storedToken && storedUser) {
          console.log("Parsing user data...")
          const parsedUser = JSON.parse(storedUser)
          console.log("Parsed user:", parsedUser)
          setUser(parsedUser)
        } else {
          console.log("Données manquantes - pas de chargement")
          console.log("Token exists:", !!storedToken, "User exists:", !!storedUser)
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error)
        // En cas d'erreur, nettoyer le localStorage
        removeCookie("accessToken")
        removeCookie("user")
      } finally {
        setLoading(false)
      }
    }

    loadUserFromStorage()
  }, [])

  const getToken = () => {
    return getCookie("accessToken")
  }

  // Fonction pour récupérer le profil complet de l'utilisateur
  const fetchUserProfile = async (): Promise<boolean> => {
    // Si le profil a déjà été chargé ou si l'utilisateur n'est pas connecté, ne rien faire
    if (profileFetchedRef.current || !user) {
      return false
    }
    
    setIsLoadingProfile(true)
    
    try {
      console.log("%c[Auth] Récupération du profil utilisateur...", 
        "background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;")
      
      const token = getToken()
      
      const response = await fetch(`${API_BASE_URL}/accounts/getuser/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const userData = await response.json()
      console.log("[Auth] Profil utilisateur récupéré:", userData)
      
      // Mettre à jour l'utilisateur avec les données complètes
      setUser(userData)
      
      // Mettre à jour le localStorage
      setCookieWithExpiry("user", JSON.stringify(userData))
      
      // Marquer que le profil a été chargé
      profileFetchedRef.current = true
      
      return true
    } catch (error) {
      console.error("[Auth] Erreur lors de la récupération du profil:", error)
      return false
    } finally {
      setIsLoadingProfile(false)
    }
  }

  // Fonction pour mettre à jour les données utilisateur et le localStorage
  const updateUserData = (userData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null
      
      const updatedUser = { ...prevUser, ...userData }
      
      // Mettre à jour le localStorage
      setCookieWithExpiry("user", JSON.stringify(updatedUser))
      
      return updatedUser
    })
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

      console.log("data",data)
      console.log("user",user)
      console.log("access_token",access_token)
    

      // setIsAuthenticated(true)

      // Stocker dans localStorage
      console.log("=== STORING COOKIES ===")
      console.log("Setting accessToken cookie...")
      setCookieWithExpiry("accessToken", access_token)
      
      console.log("Setting user cookie...")
      const userString = JSON.stringify(user)
      console.log("User string length:", userString.length)
      console.log("User string preview:", userString.substring(0, 200) + "...")
      
      // Essayer avec localStorage aussi comme fallback
      try {
        setCookieWithExpiry("user", userString)
      
        console.log("User data stored in both cookie and localStorage")
      } catch (error) {
        console.error("Error storing user data:", error)
        // Si le cookie échoue, utiliser localStorage uniquement
        setCookieWithExpiry("user", userString)
        console.log("Fallback: User data stored only in localStorage")
      }
      
      // Vérifier immédiatement
      setTimeout(() => {
        console.log("=== VERIFICATION COOKIES ===")
        console.log("accessToken cookie:", getCookie("accessToken") ? "SET" : "NOT SET")
        console.log("user cookie:", getCookie("user") ? "SET" : "NOT SET")
      }, 100)

      // Mettre à jour l'état
      setUser(user)

      // Vérifier que le token est bien stocké
      const storedToken = getCookie("accessToken")
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
    removeCookie("accessToken")
    removeCookie("user")
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
      return !!user.role?.includes("admin")
    }

    // Vérifier d'autres rôles si nécessaire
    return !!user.role?.includes(role)
  } 

  const isAuthenticated = () => {
    const token = getCookie("accessToken")
    let userCookie = getCookie("user")
    
    // Si pas de cookie, essayer localStorage  
  
    console.log("=== isAuthenticated CHECK ===")
    console.log("accessToken:", token ? "YES" : "NO")
    console.log("user data:", userCookie ? "YES" : "NO")
    console.log("current user state:", user ? "YES" : "NO")
    
    // Vérifier d'abord si on a un utilisateur en mémoire ET un token
    if (user && token) {
      console.log("Auth: User in memory + token = TRUE")
      return true
    }
    
    // Sinon vérifier les données stockées
    const result = !!token && !!userCookie
    console.log("Auth: Storage check result =", result)
    return result
  }

  useEffect(() => {
    console.log("isAuthenticated",isAuthenticated())
  }, [user])

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    getToken,
    setUser,
    updateUserData,
    fetchUserProfile,
    isLoadingProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

