import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ valid: false }, { status: 200 })
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

    return NextResponse.json({ valid: response.ok })
  } catch (error) {
    console.error("Erreur lors de la validation du token:", error)
    return NextResponse.json({ valid: false }, { status: 200 })
  }
}

