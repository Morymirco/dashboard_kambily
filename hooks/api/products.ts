import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProductsService } from '@/lib/services/products.service'
import { useApiErrorHandler } from '@/lib/api-interceptor'
import type { Product, CreateProductData, UpdateProductData } from '@/lib/types/products'

export function useProducts(page = 1, search = '') {
  const { handleError } = useApiErrorHandler()
  
  return useQuery({
    queryKey: ['products', page, search],
    queryFn: async () => {
      try {
        return await ProductsService.getProducts(page, search)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Ne pas retry si c'est une erreur d'auth
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false
      }
      return failureCount < 3
    }
  })
}

export function useProduct(id: string) {
  const { handleError } = useApiErrorHandler()
  
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        return await ProductsService.getProduct(id)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    }
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const { handleError } = useApiErrorHandler()
  
  return useMutation({
    mutationFn: async (data: CreateProductData) => {
      try {
        return await ProductsService.createProduct(data)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    onSuccess: () => {
      // Invalider le cache des produits pour refetch
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  const { handleError } = useApiErrorHandler()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: UpdateProductData }) => {
      try {
        return await ProductsService.updateProduct(id, data)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  const { handleError } = useApiErrorHandler()
  
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await ProductsService.deleteProduct(id)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}
