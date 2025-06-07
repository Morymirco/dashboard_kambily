export interface User {
    id: number
    first_name: string
    last_name: string
    email: string
    phone_number: string
    role: string
    status: boolean
    is_active: boolean
    is_confirmed: boolean
    is_accept_mail: boolean
    bio: string | null
    image: string | null
    address: string
    addresses: any[] // Vous pouvez définir une interface plus précise si nécessaire
    created_at: string
    updated_at: string
    last_login: string | null
    orders: {
      total_orders: number
      total_prices: number
      cart: any[]
      favorites: any[]
      average_orders: number
    }
    total_favorites: number
    total_orders: number
    total_reviews: number
  }

  
export interface SortConfig {
    key: keyof User | 'name'
    direction: 'asc' | 'desc'
  }
  