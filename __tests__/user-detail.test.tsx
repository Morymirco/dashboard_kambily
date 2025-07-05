import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import UserDetailPage from '@/app/(dashboard)/utilisateurs/[id]/page'

// Mock des hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(() => ({ id: '1' }))
}))

jest.mock('@/hooks/api/users', () => ({
  useUserDetail: jest.fn()
}))

jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(() => ({
    hasPermission: jest.fn(() => true),
    hasRole: jest.fn(() => false),
    hasAnyRole: jest.fn(() => false),
    hasAllPermissions: jest.fn(() => true),
    hasAnyPermission: jest.fn(() => true),
    userRole: 'admin',
    userPermissions: ['users:view', 'users:manage']
  }))
}))

const mockUser = {
  id: 1,
  email: "user@example.com",
  first_name: "John",
  last_name: "Doe",
  phone_number: "0612345678",
  role: "Client",
  is_active: true,
  is_confirmed: true,
  date_joined: "2025-01-15T10:30:00Z"
}

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('UserDetailPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn()
  }

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('affiche les détails de l\'utilisateur quand les données sont chargées', async () => {
    const { useUserDetail } = require('@/hooks/api/users')
    useUserDetail.mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null
    })

    renderWithQueryClient(<UserDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('user@example.com')).toBeInTheDocument()
      expect(screen.getByText('0612345678')).toBeInTheDocument()
      expect(screen.getByText('Client')).toBeInTheDocument()
      expect(screen.getByText('Actif')).toBeInTheDocument()
      expect(screen.getByText('Confirmé')).toBeInTheDocument()
    })
  })

  it('affiche un état de chargement', () => {
    const { useUserDetail } = require('@/hooks/api/users')
    useUserDetail.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null
    })

    renderWithQueryClient(<UserDetailPage />)

    expect(screen.getByText('Vérification des permissions...')).toBeInTheDocument()
  })

  it('affiche une erreur quand le chargement échoue', async () => {
    const { useUserDetail } = require('@/hooks/api/users')
    useUserDetail.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: { message: 'Erreur de chargement' }
    })

    renderWithQueryClient(<UserDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument()
      expect(screen.getByText('Réessayer')).toBeInTheDocument()
    })
  })

  it('affiche un message quand l\'utilisateur n\'existe pas', async () => {
    const { useUserDetail } = require('@/hooks/api/users')
    useUserDetail.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null
    })

    renderWithQueryClient(<UserDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Utilisateur non trouvé')).toBeInTheDocument()
      expect(screen.getByText('L\'utilisateur que vous recherchez n\'existe pas ou a été supprimé.')).toBeInTheDocument()
    })
  })

  it('affiche le bouton modifier seulement avec les bonnes permissions', async () => {
    const { useUserDetail } = require('@/hooks/api/users')
    useUserDetail.mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null
    })

    renderWithQueryClient(<UserDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Modifier')).toBeInTheDocument()
    })
  })
}) 