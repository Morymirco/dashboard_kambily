import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id
    const formData = await request.formData()
    const config = getServerFetchConfig()

    // Assurez-vous que le productId est inclus dans le formData
    if (!formData.has("product")) {
      formData.append("product", productId)
    }

    const response = await fetch(`${API_BASE_URL}/products/images/`, {
      method: "POST",
      headers: {
        ...config.headers,
        "Content-Type": undefined as any,
      },
      body: formData,
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur lors du téléchargement de l'image" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API product images:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

