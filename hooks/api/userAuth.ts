import { useMutation } from '@tanstack/react-query'
import { UserAuthService } from '@/lib/services/user-auth.service'
import { useApiErrorHandler } from '@/lib/api-interceptor'
import { useQueryClient } from '@tanstack/react-query'

export function useLogin() {
  const queryClient = useQueryClient()
  const { handleError } = useApiErrorHandler()
  
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      return await UserAuthService.login(data.email, data.password)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}