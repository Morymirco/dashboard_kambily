import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id
    const config = getServerFetchConfig()

    const response = await fetch(`${API_BASE_URL}/products/${productId}/`, {
      headers: config.headers,
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API product detail:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id
    const config = getServerFetchConfig()

    const response = await fetch(`${API_BASE_URL}/products/viewset/${productId}/`, {
      method: "DELETE",
      headers: config.headers,
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur lors de la suppression du produit" }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur API product delete:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

