import { PromoCodesService } from "@/lib/services/promocodes.service"
import { CreatePromoCodeData } from "@/lib/types/promocode"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const usePromoCodes = (page = 1, search = "") => {
  return useQuery({
    queryKey: ["promocodes", page, search],
    queryFn: () => PromoCodesService.getPromoCodes(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const usePromoCode = (id: string) => {
  return useQuery({
    queryKey: ["promocode", id],
    queryFn: () => PromoCodesService.getPromoCode(id),
    enabled: !!id,
  })
}

export const useCreatePromoCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePromoCodeData) => PromoCodesService.createPromoCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promocodes"] })
      toast.success("Code promo créé avec succès")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Une erreur est survenue lors de la création du code promo")
    }
  })
}

export const useUpdatePromoCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreatePromoCodeData }) => 
      PromoCodesService.updatePromoCode(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["promocodes"] })
      queryClient.invalidateQueries({ queryKey: ["promocode", id] })
      toast.success("Code promo modifié avec succès")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Une erreur est survenue lors de la modification du code promo")
    }
  })
}

