import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  try {
    const config = getServerFetchConfig()

    // Récupérer tous les produits en une seule fois
    const response = await fetch(`${API_BASE_URL}/products/`, {
      headers: config.headers,
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération des produits" }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API products:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const config = getServerFetchConfig()

    const response = await fetch(`${API_BASE_URL}/products/viewset/`, {
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
        { error: errorData.message || "Erreur lors de la création du produit" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API products POST:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

