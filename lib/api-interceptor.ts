import { redirect } from 'next/navigation'

// Intercepteur global pour toutes les requêtes fetch
export function setupGlobalFetchInterceptor() {
  // Sauvegarder la fonction fetch originale
  const originalFetch = global.fetch

  // Remplacer fetch globalement
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const response = await originalFetch(input, init)
      
      // Intercepter les erreurs 401 et 403
      if (response.status === 401 || response.status === 403) {
        // Si nous sommes côté client, rediriger
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
          return response
        }
        // Si nous sommes côté serveur, lancer une erreur spéciale
        throw new Error('REDIRECT_TO_LOGIN')
      }
      
      return response
    } catch (error) {
      // Si c'est notre erreur de redirection, la relancer
      if (error instanceof Error && error.message === 'REDIRECT_TO_LOGIN') {
        throw error
      }
      // Pour les autres erreurs, les laisser passer
      throw error
    }
  }
}

// Fonction utilitaire pour les routes API
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, options)
    
    if (response.status === 401 || response.status === 403) {
      throw new Error('REDIRECT_TO_LOGIN')
    }
    
    return response
  } catch (error) {
    if (error instanceof Error && error.message === 'REDIRECT_TO_LOGIN') {
      // Dans les routes API, on ne peut pas faire de redirect() direct
      // On retourne une réponse spéciale que le client peut gérer
      throw error
    }
    throw error
  }
}

// Intercepteur côté client pour gérer les erreurs d'authentification
export function setupClientFetchInterceptor() {
  if (typeof window === 'undefined') return

  const originalFetch = window.fetch

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const response = await originalFetch(input, init)
      
      // Si c'est une erreur d'authentification, rediriger vers login
      if (response.status === 401 || response.status === 403) {
        // Vérifier si la réponse contient requiresAuth
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const clone = response.clone()
          try {
            const data = await clone.json()
            if (data.requiresAuth) {
              window.location.href = '/login'
            }
          } catch (e) {
            // Si on ne peut pas parser le JSON, rediriger quand même
            window.location.href = '/login'
          }
        } else {
          window.location.href = '/login'
        }
      }
      
      return response
    } catch (error) {
      throw error
    }
  }
}

// Hook pour gérer les erreurs côté client dans les composants React
export function useApiErrorHandler() {
  return {
    handleError: (error: any, response?: Response) => {
      if (response && (response.status === 401 || response.status === 403)) {
        window.location.href = '/login'
      }
    }
  }
} 