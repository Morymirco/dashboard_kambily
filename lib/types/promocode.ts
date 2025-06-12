export interface PromoCodeResponse {
    results: PromoCode[]
    count: number
    next: string
    previous: string
}

export interface PromoCode {
    id: number
    code: string
    discount_type: "percent" | "fixed"
    discount_value: number
    max_discount?: number
    minimum_order_amount?: number
    max_uses?: number
    max_uses_per_user?: number
    is_active: boolean
    start_date: string
    end_date: string
    eligible_users?: number[]
    usage_count: {
        current: number
        max?: number
    }
}

interface UsageCount {
    current: number
    max: string
}

export interface CreatePromoCodeData {
    code: string
    discount_type: "percent" | "fixed"
    discount_value: number
    max_discount?: number
    minimum_order_amount?: number
    max_uses?: number
    max_uses_per_user?: number
    is_active: boolean
    start_date: Date | string
    end_date: Date | string
    eligible_users?: number[]
}