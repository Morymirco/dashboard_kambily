import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

export async function middleware(request: NextRequest) {
  // Récupérer le token d'authentification
  const authCookie = request.cookies.get("authToken")?.value
  
  // Si l'URL contient /dashboard et que l'utilisateur n'a pas de token
  if (request.nextUrl.pathname.startsWith('/dashboard') && !authCookie) {
    // Rediriger vers la page de connexion
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Si l'utilisateur a un token, vérifier sa validité
  if (authCookie) {
    try {
      // Utiliser la clé secrète depuis les variables d'environnement
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      
      // Vérifier le token
      await jwtVerify(authCookie, secret)
      
      // Si la vérification réussit, permettre l'accès
      return NextResponse.next()
    } catch (error) {
      // Si le token est invalide, rediriger vers la page de connexion
      console.error("Token invalide:", error)
      // Supprimer le cookie invalide
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete("authToken")
      return response
    }
  }
  
  return NextResponse.next()
}

// Configurer les chemins qui doivent être protégés
export const config = {
  matcher: [
    // Protéger uniquement les routes du groupe dashboard
    "/dashboard/:path*",
  ],
}

