import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const variantId = params.id
    const formData = await request.formData()
    const config = getServerFetchConfig()

    // S'assurer que les images sont envoyées comme un tableau
    // Le formData contient déjà les images avec la clé 'images'
    // L'API backend s'attend à recevoir un tableau d'images dans le body

    // Pour FormData, ne pas définir Content-Type, laissez le navigateur le gérer
    const { headers: { "Content-Type": _, ...authHeaders } } = config

    const response = await fetch(`${API_BASE_URL}/products/viewset/add-image-variante/${variantId}/`, {
      method: "POST",
      headers: {
        ...authHeaders,
        Accept: "application/json",
        // Ne pas définir Content-Type pour les requêtes multipart/form-data
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || "Erreur lors de l'ajout d'images à la variante" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API variant images:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
} 