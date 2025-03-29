import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const search = searchParams.get("search") || ""

    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ""
    const config = getServerFetchConfig()

    // Utiliser l'URL correcte pour récupérer tous les produits des partenaires
    const response = await fetch(`${API_BASE_URL}/partenaire/viewset/products/?page=${page}${searchParam}`, {
      headers: config.headers,
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération des produits des partenaires" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API partner products:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

