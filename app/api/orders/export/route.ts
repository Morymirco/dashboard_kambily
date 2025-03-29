import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  try {
    const config = getServerFetchConfig()

    // Appeler l'endpoint directement sans paramètres de date
    const url = `${API_BASE_URL}/orders/export/orders/`

    const response = await fetch(url, {
      headers: config.headers,
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur lors de l'exportation des commandes" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API export orders:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

