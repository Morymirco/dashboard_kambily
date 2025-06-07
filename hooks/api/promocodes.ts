import {
    createPromoCode,
    deletePromoCode,
    fetchPromoCodeById,
    fetchPromoCodes,
    togglePromoCode,
    updatePromoCode,
    type CreatePromoCodeData
} from "@/lib/services/promocodes.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"

export const usePromoCodes = (page = 1, search = "") => {
  return useQuery({
    queryKey: ["promocodes", page, search],
    queryFn: () => fetchPromoCodes(page, search),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const usePromoCodeById = (id: string) => {
  return useQuery({
    queryKey: ["promocode", id],
    queryFn: () => fetchPromoCodeById(id),
    enabled: !!id,
  })
}

export const useCreatePromoCode = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreatePromoCodeData) => createPromoCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promocodes'] })
      toast.success("Code promo créé avec succès")
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la création du code promo")
    }
  })
}

export const useUpdatePromoCode = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<CreatePromoCodeData> }) => 
      updatePromoCode(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['promocodes'] })
      queryClient.invalidateQueries({ queryKey: ['promocode', data.id.toString()] })
      toast.success("Code promo mis à jour avec succès")
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la mise à jour du code promo")
    }
  })
}

export const useDeletePromoCode = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => deletePromoCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promocodes'] })
      toast.success("Code promo supprimé avec succès")
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la suppression du code promo")
    }
  })
}

export const useTogglePromoCode = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => togglePromoCode(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['promocodes'] })
      queryClient.invalidateQueries({ queryKey: ['promocode', data.id.toString()] })
      toast.success(`Code promo ${data.is_active ? 'activé' : 'désactivé'} avec succès`)
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors du changement de statut")
    }
  })
}

export const useBulkDeletePromoCodes = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const deletePromises = ids.map(id => deletePromoCode(id))
      await Promise.all(deletePromises)
      return ids
    },
    onSuccess: (ids) => {
      queryClient.invalidateQueries({ queryKey: ['promocodes'] })
      toast.success(`${ids.length} code(s) promo supprimé(s) avec succès`)
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la suppression des codes promo")
    }
  })
} 