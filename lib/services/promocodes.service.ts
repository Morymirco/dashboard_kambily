import API from "@/service/api"
import { API_ENDPOINTS } from "../constant/api"
import { PromoCode } from "../types/promocode"

export const PromoCodesService = {
  getPromoCodes: async (page: number) => {
    const response = await API.get<PromoCode[]>(API_ENDPOINTS.promocodes.base, {
      params: { page }
    })
    return response.data
  }
}



