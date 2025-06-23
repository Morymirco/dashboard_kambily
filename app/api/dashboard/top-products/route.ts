import { NextResponse } from "next/server"
import { getCookie } from "@/helpers/cookies"
import { API_URL } from "@/constants"

export async function GET() {
  try {
    const token = getCookie("accessToken")

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const response = await fetch(`${API_URL}/managers/dashboard/top-products/`, {
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
        { error: errorData.message || "Erreur lors de la récupération des produits populaires" },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Produits populaires récupérés:", data) // Log pour débogage
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur lors de la récupération des produits populaires:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des produits populaires" }, { status: 500 })
  }
}

