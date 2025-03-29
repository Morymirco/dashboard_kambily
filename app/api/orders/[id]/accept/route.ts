import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderNumber = params.id
    const config = getServerFetchConfig()

    if (!config.headers.Authorization) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    // Appel à l'API externe pour accepter la commande
    const response = await fetch(`${API_BASE_URL}/orders/accept/${orderNumber}/`, {
      method: "POST",
      headers: {
        ...config.headers,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || "Erreur lors de l'acceptation de la commande" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Erreur acceptation commande:", {
      orderNumber: params.id,
      error: error instanceof Error ? error.message : "Erreur inconnue"
    })

    return NextResponse.json(
      { error: "Erreur lors de l'acceptation de la commande" },
      { status: 500 }
    )
  }
}

