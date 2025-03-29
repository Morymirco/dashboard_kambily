import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    // Vérifier le token auprès de l'API
    const response = await fetch(`${API_BASE_URL}/accounts/verify-token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }

    const userData = await response.json()
    return NextResponse.json(userData.user)
  } catch (error) {
    console.error("Erreur lors de la récupération des données utilisateur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

