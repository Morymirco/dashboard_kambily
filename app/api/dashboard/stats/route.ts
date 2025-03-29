import { NextResponse } from "next/server"
import { getAuthToken } from "@/lib/auth-utils"
import { API_URL } from "@/constants"

export async function GET() {
  try {
    const token = getAuthToken()

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Utilisation de l'URL complète fournie par l'utilisateur
    const response = await fetch(`${API_URL}/managers/dashboard/detailed-stats/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Erreur API:", response.status, errorData)
      return NextResponse.json(
        { error: errorData.message || "Erreur lors de la récupération des statistiques" },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Données récupérées:", data) // Log pour débogage
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des statistiques" }, { status: 500 })
  }
}

