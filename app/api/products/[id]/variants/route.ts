import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id
    const formData = await request.formData()
    const config = getServerFetchConfig()

    const response = await fetch(`${API_BASE_URL}/products/viewset/${productId}/variante/`, {
      method: "POST",
      headers: {
        ...config.headers,
        // Ne pas définir Content-Type pour les requêtes multipart/form-data
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || "Erreur lors de l'ajout de la variante" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API variant add:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

