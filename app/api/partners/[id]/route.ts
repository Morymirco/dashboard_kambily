import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const config = getServerFetchConfig()

    console.log(`Fetching partner with ID: ${partnerId}`)
    console.log(`API URL: ${API_BASE_URL}/partenaire/${partnerId}/`)

    const response = await fetch(`${API_BASE_URL}/partenaire/${partnerId}/`, {
      headers: config.headers,
      cache: "no-store",
    })

    console.log(`Response status: ${response.status}`)

    if (!response.ok) {
      console.error(`Error response: ${response.statusText}`)
      return NextResponse.json({ error: "Partenaire non trouvé" }, { status: response.status })
    }

    const data = await response.json()
    
    console.log("Partner data received successfully")
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API partner detail:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur inconnue"
    console.error("Message d'erreur:", errorMessage)
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const formData = await request.formData()
    const config = getServerFetchConfig()

    console.log(`Updating partner with ID: ${partnerId}`)
    console.log("FormData keys:", [...formData.keys()])

    // Extraire les en-têtes d'authentification uniquement
    const authHeaders = {
      Authorization: config.headers.Authorization,
      // Ajouter d'autres en-têtes nécessaires, mais pas Content-Type
    }

    const response = await fetch(`${API_BASE_URL}/partenaire/${partnerId}/`, {
      method: "PUT",
      headers: authHeaders,
      body: formData,
    })

    console.log(`Response status: ${response.status}`)

    if (!response.ok) {
      let errorMessage = "Erreur lors de la mise à jour du partenaire"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.detail || errorMessage
        console.error("Error details:", errorData)
      } catch (e) {
        console.error("Impossible de parser la réponse d'erreur")
      }
      
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur API partner update:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur inconnue"
    console.error("Message d'erreur:", errorMessage)
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const data = await request.json()
    const config = getServerFetchConfig()

    const response = await fetch(`${API_BASE_URL}/partenaire/${partnerId}/`, {
      method: "PUT",
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

    const response = await fetch(`${API_BASE_URL}/partenaire/${partnerId}/`, {
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

