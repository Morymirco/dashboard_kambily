import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Avec localStorage, le middleware ne peut pas vérifier l'authentification
  // car localStorage n'est pas accessible côté serveur.
  // Nous désactivons donc la vérification d'authentification dans le middleware.

  return NextResponse.next()
}

// Configurer les chemins qui doivent être protégés
export const config = {
  matcher: [
    /*
     * Match tous les chemins sauf:
     * 1. /api/auth (routes d'authentification API)
     * 2. /_next (fichiers Next.js)
     * 3. /_vercel (fichiers Vercel)
     * 4. /favicon.ico, /robots.txt, etc.
     */
    "/((?!api/auth|_next|_vercel|favicon.ico|robots.txt).*)",
  ],
}

