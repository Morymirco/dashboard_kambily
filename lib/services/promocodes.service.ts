import { fetchWithAuth } from "@/lib/api"
import { API_ENDPOINTS } from "@/lib/constant/api"

export interface PromoCode {
  id: number
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount?: number
  max_discount_amount?: number
  usage_limit?: number
  used_count: number
  is_active: boolean
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

export interface CreatePromoCodeData {
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount?: number
  max_discount_amount?: number
  usage_limit?: number
  is_active?: boolean
  start_date: string
  end_date: string
}

export interface UpdatePromoCodeData extends Partial<CreatePromoCodeData> {
  id: number
}

export interface PromoCodesResponse {
  count: number
  next: string | null
  previous: string | null
  results: PromoCode[]
}

// Récupérer tous les codes promo avec pagination et recherche
export const fetchPromoCodes = async (page = 1, search = ""): Promise<PromoCodesResponse> => {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  if (search) {
    params.append('search', search)
  }
  
  const url = `${API_ENDPOINTS.promocodes.base}?${params.toString()}`
  return await fetchWithAuth(url)
}

// Récupérer un code promo par ID
export const fetchPromoCodeById = async (id: string): Promise<PromoCode> => {
  return await fetchWithAuth(API_ENDPOINTS.promocodes.detail(id))
}

// Créer un nouveau code promo
export const createPromoCode = async (data: CreatePromoCodeData): Promise<PromoCode> => {
  return await fetchWithAuth(API_ENDPOINTS.promocodes.add, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

// Mettre à jour un code promo
export const updatePromoCode = async (id: string, data: Partial<CreatePromoCodeData>): Promise<PromoCode> => {
  return await fetchWithAuth(API_ENDPOINTS.promocodes.update(id), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

// Supprimer un code promo
export const deletePromoCode = async (id: string): Promise<void> => {
  await fetchWithAuth(API_ENDPOINTS.promocodes.delete(id), {
    method: 'DELETE',
  })
}

// Activer/désactiver un code promo
export const togglePromoCode = async (id: string): Promise<PromoCode> => {
  return await fetchWithAuth(API_ENDPOINTS.promocodes.toggle(id), {
    method: 'POST',
  })
} 