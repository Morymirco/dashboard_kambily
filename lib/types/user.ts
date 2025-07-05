export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  phone_number: string
  address: string
  is_active: boolean
  status: boolean
  bio: string
  image: string
  is_confirmed: boolean
  is_accept_mail: boolean
  total_orders: number
  total_favorites: number
  total_reviews: number
  
}

export interface UserToken {
  access_token: string
  refresh_token: string
  user: User
}

// Type pour les détails d'un utilisateur spécifique
export interface UserDetail {
  id: number
  email: string
  first_name: string
  last_name: string
  phone_number: string
  role: string
  is_active: boolean
  is_confirmed: boolean
  date_joined: string
}