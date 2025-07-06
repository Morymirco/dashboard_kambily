import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { OrdersService } from '@/lib/services/orders.service'
import { useApiErrorHandler } from '@/lib/api-interceptor'

export function useOrders(page = 1, search = '', status = '') {
  const { handleError } = useApiErrorHandler()
  
  return useQuery({
    queryKey: ['orders', page, search, status],
    queryFn: async () => {
      try {
        return await OrdersService.getOrders(page, search, status)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      // Ne pas retry si c'est une erreur d'auth
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false
      }
      return failureCount < 3
    }
  })
}

export function useOrder(id: string) {
  const { handleError } = useApiErrorHandler()
  
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      try {
        return await OrdersService.getOrder(id)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    }
  })
}

export function useAcceptOrder() {
  return useMutation({
    mutationFn: async (id: string) => {
      return await OrdersService.acceptOrder(id)
    }
  })
}

export function useExportOrders() {
  return useMutation({
    mutationFn: async () => {
      return await OrdersService.exportOrders()
    }
  })
}

export function useCheckOrder() {
  return useMutation({
    mutationFn: async (ref: string) => {
      return await OrdersService.checkOrder(ref)
    }
  })
}
