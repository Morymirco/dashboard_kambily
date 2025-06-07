
import { PromoCodesService } from "@/lib/services/promocodes.service"
import { CreatePromoCodeData } from "@/lib/types/promocode"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"


export const usePromoCodes = (page = 1, search = "") => {
  return useQuery({
    queryKey: ["promocodes", page, search],
    queryFn: () => PromoCodesService.getPromoCodes(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
// useCreatePromoCode
export const useCreatePromoCode = () => {
  return useMutation({
    mutationFn: (data: CreatePromoCodeData) => PromoCodesService.createPromoCode(data),
  })
}

