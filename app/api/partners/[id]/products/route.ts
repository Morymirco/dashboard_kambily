import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const search = searchParams.get("search") || ""

    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ""
    const config = getServerFetchConfig()

    // Use the exact URL as specified
    const response = await fetch(
      `${API_BASE_URL}/partenaire/viewset/products/${partnerId}/?page=${page}${searchParam}`,
      {
        headers: config.headers,
        cache: "no-store",
      },
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération des produits du partenaire" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API partner specific products:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

