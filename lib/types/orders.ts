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

// Types pour les détails de commande
export interface ProductImage {
  id: number
  image: string
}

export interface Product {
  id: number
  name: string
  regular_price: string
  product_type?: string
  short_description?: string
  images: ProductImage[]
}

export interface Attribut {
  attribut: {
    nom: string
  }
  valeur: string
  hex_code: string | null
}

export interface Variante {
  id: number
  attributs: Attribut[]
  quantity: number
  regular_price: string
  image?: string
  product: Product
}

export interface OrderItem {
  id: number
  pk: number
  quantity: number
  price: string
  product: Product
  variante?: Variante
  is_variante: boolean
  product_variante?: Variante
}

export interface OrderDelivery {
  pk?: number
  address: string
  ville: string
  pays?: string
  telephone?: string
  location_url?: string
  latitude?: number | null
  longitude?: number | null
  is_default?: boolean
}

export interface OrderDeliverer {
  user: {
    id: number
    first_name: string
    last_name: string
    phone: string
    email: string
    image?: string | null
  }
  total_orders?: number
  collected_payments?: string
}

export interface OrderUser {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  image?: string | null
}

export interface OrderPayment {
  id: number
  payment_status: string
  payment_method: string
  transaction_id: string
  transaction_ref?: string | null
  paycard_amount?: string | null
  paycard_card_number?: string | null
  paycard_account_name?: string | null
  ecommReference?: string | null
  paycard_transaction_description?: string | null
  paycard_payment_method?: string | null
  created_at: string
  updated_at: string
  order: number
}

export interface PromoCode {
  code: string
  discount_type: string
  discount_value: string | number
  end_date: string
}

export interface OrderDetail {
  id: number
  number: number
  status: string
  created_at: string
  updated_at: string
  total_price: number
  total_products: number
  total_delivery: number
  discount: number
  cash_on_delivery: boolean
  payment_method: string
  payment_status: string
  code_bar_image?: string | null
  link?: string | null
  recu?: string | null
  buyer_name?: string | null
  buyer_phone?: string | null
  buyer_email?: string | null
  order_items: OrderItem[]
  delivery: OrderDelivery
  deliverer?: OrderDeliverer | null
  user: OrderUser
  payement?: OrderPayment
  promo_code?: PromoCode | null
}