import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function WithAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()
    
    const isAuthenticated = !!user

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/login')
      }
    }, [isAuthenticated, loading, router])

    if (loading) {
      return <div className="flex items-center justify-center min-h-screen">Chargement Z...</div>
    }

    if (!isAuthenticated) {
      return null // Ne rien afficher pendant la redirection
    }

    return <WrappedComponent {...props} />
  }
} 