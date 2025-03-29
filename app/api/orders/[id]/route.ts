import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/constants"
import { getServerFetchConfig } from "@/lib/server-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id
    
    // Récupérer le token de l'en-tête Authorization
    const authHeader = request.headers.get("Authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[API] Token manquant ou format invalide")
      return NextResponse.json(
        { error: "Non autorisé - Token invalide" },
        { status: 401 }
      )
    }

    // Configurer les en-têtes pour l'API externe
    const config = getServerFetchConfig()
    
    // Vérifier la configuration
    if (!config.headers.Authorization) {
      console.error("[API] Token manquant dans la configuration serveur")
      return NextResponse.json(
        { error: "Erreur de configuration serveur" },
        { status: 500 }
      )
    }

    // Log pour debug
    console.log("[API] Requête order detail:", {
      orderId,
      hasAuthHeader: !!authHeader,
      hasConfigAuth: !!config.headers.Authorization
    })

    const response = await fetch(`${API_BASE_URL}/orders/show/admin/?number=${orderId}`, {
      method: "GET",
      headers: {
        ...config.headers,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorMessage = `Erreur ${response.status} lors de la récupération de la commande ${orderId}`
      console.error("[API] Erreur API externe:", {
        status: response.status,
        orderId,
        message: errorMessage
      })
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Erreur détaillée order detail:", {
      orderId: params.id,
      error: error instanceof Error ? error.message : "Erreur inconnue",
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la commande" },
      { status: 500 }
    )
  }
}

