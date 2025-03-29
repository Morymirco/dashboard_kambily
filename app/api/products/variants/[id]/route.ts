import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const variantId = params.id
    const config = getServerFetchConfig()

    const response = await fetch(`${API_BASE_URL}/products/viewset/variante/${variantId}/`, {
      method: "DELETE",
      headers: config.headers,
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur lors de la suppression de la variante" }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur API variant delete:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const variantId = params.id
    const formData = await request.formData()
    const config = getServerFetchConfig()

    const response = await fetch(`${API_BASE_URL}/products/viewset/variante/${variantId}/update-quantity/`, {
      method: "PUT",
      headers: {
        ...config.headers,
        // Ne pas définir Content-Type pour les requêtes multipart/form-data
      },
      body: formData,
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur lors de la mise à jour de la variante" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API variant update:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

