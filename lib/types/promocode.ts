export interface PromoCode {
    id: number
    code: string
    discount_type: string
    discount_value: string
    max_discount: string
    minimum_order_amount: string
    is_active: boolean
    start_date: string
    end_date: string
}




export interface CreatePromoCodeData {
    code: string
    discount_type: string
    discount_value: string
    max_discount: string
    minimum_order_amount: string
    is_active: boolean
    start_date: string
    end_date: string
}