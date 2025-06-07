
export interface OrderData {
    id: number
    number: number
    status: string
    created_at: string
    total_price: number
    total_products: number
    cash_on_delivery: boolean
    user: {
      first_name: string
      last_name: string
    }
    payement?: {
      payment_method?: string
      payment_status?: string
    }
  }