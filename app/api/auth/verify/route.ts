import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"

export async function GET(request: NextRequest) {
  console.log("%c[API] Verifying authentication token", "color: #9C27B0")

  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("%c[API] No bearer token provided", "color: #F44336")
      return NextResponse.json({ error: "Token non fourni" }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the token with your backend
    const response = await fetch(`${API_BASE_URL}/auth/verify/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })

    if (!response.ok) {
      console.error("%c[API] Token verification failed", "color: #F44336")
      return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }

    console.log("%c[API] Token verified successfully", "color: #4CAF50")
    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("%c[API] Error verifying token:", "color: #F44336", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

