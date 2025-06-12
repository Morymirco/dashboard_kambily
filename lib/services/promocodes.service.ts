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

  getPromoCode: async (id: string) => {
    const response = await API.get<PromoCode>(API_ENDPOINTS.promocodes.detail(id))
    return response.data
  },

  createPromoCode: async (data: CreatePromoCodeData) => {
    // Validation des données
    if (!data.code) {
      throw new Error("Le code promo est requis")
    }

    if (!data.discount_type || !["percent", "fixed"].includes(data.discount_type)) {
      throw new Error("Type de remise invalide")
    }

    if (!data.discount_value || data.discount_value <= 0) {
      throw new Error("La valeur de la remise doit être supérieure à 0")
    }

    if (data.discount_type === "percent" && (!data.max_discount || data.max_discount <= 0)) {
      throw new Error("La remise maximale est requise pour les remises en pourcentage")
    }

    if (!data.start_date || !data.end_date) {
      throw new Error("Les dates de début et de fin sont requises")
    }

    if (new Date(data.start_date) >= new Date(data.end_date)) {
      throw new Error("La date de début doit être antérieure à la date de fin")
    }

    // Formatage des données pour l'API
    const formattedData = {
      ...data,
      start_date: new Date(data.start_date).toISOString(),
      end_date: new Date(data.end_date).toISOString(),
      discount_value: Number(data.discount_value),
      max_discount: data.max_discount ? Number(data.max_discount) : undefined,
      minimum_order_amount: data.minimum_order_amount ? Number(data.minimum_order_amount) : undefined,
      max_uses: data.max_uses ? Number(data.max_uses) : undefined,
      max_uses_per_user: data.max_uses_per_user ? Number(data.max_uses_per_user) : undefined,
    }

    try {
      const response = await API.post(API_ENDPOINTS.promocodes.base, formattedData)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error("Une erreur est survenue lors de la création du code promo")
    }
  },

  updatePromoCode: async (id: string, data: CreatePromoCodeData) => {
    // Validation des données
    if (!data.code) {
      throw new Error("Le code promo est requis")
    }

    if (!data.discount_type || !["percent", "fixed"].includes(data.discount_type)) {
      throw new Error("Type de remise invalide")
    }

    if (!data.discount_value || data.discount_value <= 0) {
      throw new Error("La valeur de la remise doit être supérieure à 0")
    }

    if (data.discount_type === "percent" && (!data.max_discount || data.max_discount <= 0)) {
      throw new Error("La remise maximale est requise pour les remises en pourcentage")
    }

    if (!data.start_date || !data.end_date) {
      throw new Error("Les dates de début et de fin sont requises")
    }

    if (new Date(data.start_date) >= new Date(data.end_date)) {
      throw new Error("La date de début doit être antérieure à la date de fin")
    }

    // Formatage des données pour l'API
    const formattedData = {
      ...data,
      start_date: new Date(data.start_date).toISOString(),
      end_date: new Date(data.end_date).toISOString(),
      discount_value: Number(data.discount_value),
      max_discount: data.max_discount ? Number(data.max_discount) : undefined,
      minimum_order_amount: data.minimum_order_amount ? Number(data.minimum_order_amount) : undefined,
      max_uses: data.max_uses ? Number(data.max_uses) : undefined,
      max_uses_per_user: data.max_uses_per_user ? Number(data.max_uses_per_user) : undefined,
    }

    try {
      const response = await API.put(API_ENDPOINTS.promocodes.update(id), formattedData)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error("Une erreur est survenue lors de la modification du code promo")
    }
  }
}



