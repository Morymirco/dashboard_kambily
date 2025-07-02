export interface Product {
  id: string
  name: string
  sku: string
  regular_price: string
  quantity: number
  nombre_ventes: number
  etat_stock: string
  product_type: string
  created_at: string
  short_description: string
  images: { image: string }[]
  categories: Array<{
    id: number
    name: string
    description?: string
    slug: string
    is_main: boolean
    image?: string | null
    created_at: string
    updated_at: string
    parent_category: number | null
  }>
}

export type ProductsResponse = {
  count: number
  results: Product[]
}
  
export type CreateProductData = {
  name: string
  sku: string
  quantity: number
  supplier_price: number
  is_published: boolean
  product_type: string
  is_recommended: boolean
  is_vedette: boolean
  is_variable: boolean
  partenaire: number
  categories: number[]
  etiquettes: number[]
  images: File[]
  short_description: string
  long_description: string
}

export type UpdateProductData = {
  name: string
  sku: string
  quantity: number
}
interface ProductImage {
  id: number;
  image: string;
  product: number;
}

interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

interface ProductReview {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    image: string | null;
  };
}

export interface ProductStats {
  one_star: number;
  two_star: number;
  three_star: number;
  four_star: number;
  five_star: number;
  total_reviews: number;
  average_rating: number;
}

export interface ProductAttribute {
  id: number;
  attribut: {
    id: number;
    nom: string;
    valeur: string;
  };
  // autres propriétés si nécessaires
}

export interface ProductVariant {
  id: number;
  attributs: {
    id: number;
    attribut: {
      id: number;
      nom: string;
      valeur: string;
    };
  }[];
  regular_price: string | number;
  promo_price: string | number;
  quantity: number;
  images: ProductImage[];
  sku?: string;
}


export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  etat_stock: string;
  regular_price: string | number;
  promo_price: string | number;
  sku: string;
  stock_status: boolean;
  quantity: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  product_type: string;
  is_recommended: boolean;
  categories: ProductCategory[];
  etiquettes: any[];
  images: ProductImage[];
  variantes: ProductVariant[];
  reviews: ProductReview[];
  stats_star: ProductStats;
  created_at: string;
  updated_at: string;
}