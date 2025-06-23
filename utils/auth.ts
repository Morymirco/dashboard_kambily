import { getCookie, setCookieWithExpiry } from "@/helpers/cookies"
import type { NextRequest } from "next/server"
// import { getAuthToken } from "@/lib/auth-utils" // Removed this import as getAuthToken is now defined in this file

export const setAuthToken = (token: string) => {
  console.log("%c[Auth] Setting auth token", "color: #2196F3")

  // Store in localStorage
  setCookieWithExpiry("accessToken", token) 

  // Store in cookies (expires in 7 days)
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 7)
  document.cookie = `authToken=${token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`

  // Store in sessionStorage as a fallback
  sessionStorage.setItem("authToken", token)

  console.log("%c[Auth] Auth token stored in multiple locations", "color: #4CAF50")
  return true
}

export const getAuthToken = () => {
  // Try to get token from localStorage
  const localStorageToken = getCookie("accessToken")
  if (localStorageToken) {
    return localStorageToken
  }

  // Try to get token from cookies
  const cookies = document.cookie.split(";")
  const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith("authToken="))
  if (tokenCookie) {
    const cookieToken = tokenCookie.split("=")[1]
    if (cookieToken) {
      return cookieToken
    }
  }

  // Try to get token from sessionStorage as a fallback
  const sessionToken = sessionStorage.getItem("authToken")
  if (sessionToken) {
    return sessionToken
  }

  return null
}

export const clearAuthToken = () => {
  
  sessionStorage.removeItem("authToken")
  document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
}

// Function to verify authentication based on the token
export async function verifyAuth(request: NextRequest): Promise<{ success: boolean; error?: string }> {
  try {
    const token = getAuthToken()

    if (!token) {
      return { success: false, error: "Non authentifié: Aucun token trouvé" }
    }

    // Add your token verification logic here.
    // For example, you can decode the token and check its expiration date.
    // Or you can make a request to your backend to verify the token.

    // Mock verification logic (replace with your actual verification)
    // This example always returns true for simplicity
    return { success: true }
  } catch (error) {
    console.error("Erreur lors de la vérification de l'authentification:", error)
    return { success: false, error: "Erreur lors de la vérification de l'authentification" }
  }
}

