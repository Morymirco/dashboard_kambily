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

    const response = await fetch(`${API_BASE_URL}/partenaire/viewset/?page=${page}${searchParam}`, {
      headers: config.headers,
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur lors de la récupération des partenaires" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API partners:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const config = getServerFetchConfig()

    const response = await fetch(`${API_BASE_URL}/partenaire/viewset/`, {
      method: "POST",
      headers: {
        ...config.headers,
        // Supprimer Content-Type pour permettre à fetch de définir le bon boundary pour FormData
        "Content-Type": undefined as any,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || "Erreur lors de la création du partenaire" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API partners POST:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

