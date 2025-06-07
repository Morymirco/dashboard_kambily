// Type pour les catégories
export interface Category {
    id: number
    name: string
    description: string
    slug: string
    is_main: boolean
    image: string | null
    created_at: string
    updated_at: string
    parent_category: number | null
  }