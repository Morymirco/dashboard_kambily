// Types pour les partenaires
export type Partner = {
    id: number
    name: string
    email: string
    phone: string | null
    address: string
    latitude: number
    longitude: number
    website: string | null
    created_at: string
    updated_at: string
  }
  
  export type PartnersResponse = {
    count: number
    next: string | null
    previous: string | null
    results: Partner[]
  }
  
  // Type for a product
  export type PartnerProduct = {
    id: number
    name: string
    slug: string
    
    short_description: string
    long_description: string
    regular_price: string
    promo_price: string
    quantity: number
    sku: string
    stock_status: boolean
    etat_stock: string
    product_type: string
    is_recommended: boolean
    is_vedette: boolean
    is_variable: boolean
    images:
      | Array<{
          id: number
          image: string
          image_url: string | null
          created_at: string
          updated_at: string
          product: number
        }>
      | []
    categories:
      | Array<{
          id: number
          name: string
          description: string
          slug: string
          is_main: boolean
          image: string | null
          created_at: string
          updated_at: string
          parent_category: number | null
        }>
      | []
    partenaire: {
      id: number
      name: string
      email: string
      phone: string
      address: string
      latitude: number
      longitude: number
      website: string
      created_at: string
      updated_at: string
    }
    
    // Autres propriétés
    [key: string]: any
  }
  
  // Response for all partner products (paginated)
  export type PartnerProductsResponse = {
    count: number
    next: string | null
    previous: string | null
    results: PartnerProduct[]
    products: {
      count: number
      next: string | null
      previous: string | null
      results: PartnerProduct[]
    }
  }
  
  // Response for a specific partner's products
  export type PartnerWithProductsResponse = {
    id: number
    name: string
    email: string
    phone: string
    address: string
    latitude: number
    longitude: number
    website: string
    created_at: string
    updated_at: string
    products: PartnerProduct[]
  }
  
  // Update the type for all partner products response
  export type AllPartnerProductsResponse = Array<{
    id: number // Partner ID
    products: PartnerProduct[]
  }>
  
  // Modifions le type ProductsResponse pour inclure la propriété products
  export interface ProductsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: PartnerProduct[];
    // Ajout de la propriété products qui peut être présente dans certaines réponses
    products?: {
      count: number;
      next: string | null;
      previous: string | null;
      results: PartnerProduct[];
    };
  }
  
  // Maintenant PartnerWithProducts peut étendre Partner sans conflit
  export interface PartnerWithProducts extends Partner {
    products: ProductsResponse;
  }