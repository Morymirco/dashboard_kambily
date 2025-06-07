
import { PromoCodesService } from "@/lib/services/promocodes.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"


export const usePromoCodes = (page = 1, search = "") => {
  return useQuery({
    queryKey: ["promocodes", page, search],
    queryFn: () => PromoCodesService.getPromoCodes(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

