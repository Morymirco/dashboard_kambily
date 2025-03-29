import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  try {
    const config = getServerFetchConfig()

    const response = await fetch(`${API_BASE_URL}/products/attributes/of/`, {
      headers: config.headers,
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur lors de la récupération des attributs" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API attributes:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

