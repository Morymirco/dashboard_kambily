import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TagService, type CreateTagData, type UpdateTagData } from '@/services/tag-service'
import { useApiErrorHandler } from '@/lib/api-interceptor'

// Hook pour récupérer tous les tags
export function useTags() {
  const { handleError } = useApiErrorHandler()
  
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      try {
        return await TagService.getTags()
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Hook pour récupérer un tag spécifique
export function useTag(id: string) {
  const { handleError } = useApiErrorHandler()
  
  return useQuery({
    queryKey: ['tag', id],
    queryFn: async () => {
      try {
        return await TagService.getTag(id)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook pour créer un tag
export function useCreateTag() {
  const queryClient = useQueryClient()
  const { handleError } = useApiErrorHandler()
  
  return useMutation({
    mutationFn: async (data: CreateTagData) => {
      try {
        return await TagService.createTag(data)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    onSuccess: () => {
      // Invalider et refetch la liste des tags
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    }
  })
}

// Hook pour mettre à jour un tag
export function useUpdateTag() {
  const queryClient = useQueryClient()
  const { handleError } = useApiErrorHandler()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTagData }) => {
      try {
        return await TagService.updateTag(id, data)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    onSuccess: (data, variables) => {
      // Invalider et refetch la liste des tags et le tag spécifique
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tag', variables.id] })
    }
  })
}

// Hook pour mettre à jour partiellement un tag
export function usePatchTag() {
  const queryClient = useQueryClient()
  const { handleError } = useApiErrorHandler()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTagData }) => {
      try {
        return await TagService.patchTag(id, data)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    onSuccess: (data, variables) => {
      // Invalider et refetch la liste des tags et le tag spécifique
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tag', variables.id] })
    }
  })
}

// Hook pour supprimer un tag
export function useDeleteTag() {
  const queryClient = useQueryClient()
  const { handleError } = useApiErrorHandler()
  
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await TagService.deleteTag(id)
      } catch (error: any) {
        handleError(error, error.response)
        throw error
      }
    },
    onSuccess: () => {
      // Invalider et refetch la liste des tags
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    }
  })
}

// Hook pour récupérer les produits d'une étiquette
export function useTagProducts(id: string, page = 1, page_size = 10) {
  const { handleError } = useApiErrorHandler();
  return useQuery({
    queryKey: ['tag-products', id, page, page_size],
    queryFn: async () => {
      try {
        return await TagService.getTagProducts(id, page, page_size);
      } catch (error: any) {
        handleError(error, error.response);
        throw error;
      }
    },
    enabled: !!id,
  });
}

// Hook pour retirer une étiquette d'un produit
export function useRemoveTagFromProduct() {
  const queryClient = useQueryClient();
  const { handleError } = useApiErrorHandler();
  return useMutation({
    mutationFn: async ({ tagId, productId }: { tagId: string, productId: number }) => {
      try {
        return await TagService.removeTagFromProduct(tagId, productId);
      } catch (error: any) {
        handleError(error, error.response);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      // On refetch la liste des produits de l'étiquette
      queryClient.invalidateQueries({ queryKey: ['tag-products', variables.tagId] });
    }
  });
}

// Hook pour ajouter une étiquette à un produit
export function useAddTagToProduct() {
  const queryClient = useQueryClient();
  const { handleError } = useApiErrorHandler();
  return useMutation({
    mutationFn: async ({ tagId, productId }: { tagId: string, productId: number }) => {
      try {
        return await TagService.addTagToProduct(tagId, productId);
      } catch (error: any) {
        handleError(error, error.response);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tag-products', variables.tagId] });
    }
  });
}
