import { API_BASE_URL } from '@/constants'
import { useApiErrorHandler } from '@/lib/api-interceptor'
import { ProductsService } from '@/lib/services/products.service'
import { getAuthHeaders } from '@/lib/auth-utils'
import type { CreateProductData, UpdateProductData } from '@/lib/types/products'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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
    mutationFn: async (data: FormData | CreateProductData) => {
      try {
        return await ProductsService.createProduct(data)
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

//detail d'un produit
export function useProductDetail(id: string) {
  const { handleError } = useApiErrorHandler()
  
  return useQuery({
    queryKey: ['product-detail', id],
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

export function useAddVariantes() {
  const queryClient = useQueryClient()
  const { handleError } = useApiErrorHandler()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      try {
        return await ProductsService.addVariantes(id, data)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    //reponse de la mutation
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-detail'] })
    }
  })
} 
export function useAddImages() {
  const queryClient = useQueryClient()
  const { handleError } = useApiErrorHandler()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      try {
        return await ProductsService.addImages(id, data)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-detail'] })
    }
  })
}

export function useDeleteImages() {
  const queryClient = useQueryClient()
  const { handleError } = useApiErrorHandler()
  
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        return await ProductsService.deleteImages(data)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-detail'] })
    }
  })
}

export function useAddVariantImages() {
  const queryClient = useQueryClient()
  const { handleError } = useApiErrorHandler()
  
  return useMutation({
    mutationFn: async ({ variantId, data }: { variantId: string, data: FormData }) => {
      try {
        return await ProductsService.addVariantImages(variantId, data)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-detail'] })
    }
  })
}

export function useDeleteVariant() {
  const queryClient = useQueryClient()
  const { handleError } = useApiErrorHandler()
  
  return useMutation({
    mutationFn: async (variantId: string) => {
      try {
        return await ProductsService.deleteVariant(variantId)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-detail'] })
    }
  })
}