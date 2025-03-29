import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const config = getServerFetchConfig()

    const response = await fetch(`${API_BASE_URL}/partenaire/viewset/${partnerId}/`, {
      headers: config.headers,
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Partenaire non trouvé" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API partner detail:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const formData = await request.formData()
    const config = getServerFetchConfig()

    const response = await fetch(`${API_BASE_URL}/partenaire/viewset/${partnerId}/`, {
      method: "PUT",
      headers: {
        ...config.headers,
        "Content-Type": undefined as any,
      },
      body: formData,
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur lors de la mise à jour du partenaire" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API partner update:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const data = await request.json()
    const config = getServerFetchConfig()

    const response = await fetch(`${API_BASE_URL}/partenaire/viewset/${partnerId}/`, {
      method: "PATCH",
      headers: {
        ...config.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour partielle du partenaire" },
        { status: response.status },
      )
    }

    const responseData = await response.json()
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Erreur API partner patch:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const config = getServerFetchConfig()

    const response = await fetch(`${API_BASE_URL}/partenaire/viewset/${partnerId}/`, {
      method: "DELETE",
      headers: config.headers,
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur lors de la suppression du partenaire" }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur API partner delete:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

