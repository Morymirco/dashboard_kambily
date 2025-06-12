import API from "@/service/api"
import { API_ENDPOINTS } from "../constant/api"
import { CreatePromoCodeData, PromoCode } from "../types/promocode"

export const PromoCodesService = {
  getPromoCodes: async (page: number) => {
    const response = await API.get<{ results: PromoCode[] }>(API_ENDPOINTS.promocodes.base, {
      params: { page }
    })
    return response.data.results
  },
  createPromoCode: async (data: CreatePromoCodeData) => {
    const response = await API.post(API_ENDPOINTS.promocodes.base, data)
    return response.data
  }
}



