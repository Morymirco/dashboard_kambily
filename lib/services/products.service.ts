import { API_ENDPOINTS } from "@/lib/constant";
import API from "@/service/api";
import { ProductsResponse } from "@/services/product-service";
import { CreateProductData, ProductDetail, UpdateProductData } from "../types/products";

export const ProductsService = {
  getProducts : async (page: number, search: string) => {
    const response = await API.get<ProductsResponse>(API_ENDPOINTS.products.base, {
      params: {
        page,
        search
      }
    });
    return response.data;
  },
  createProduct : async (data: FormData| CreateProductData) => {
    const response = await API.post(API_ENDPOINTS.products.add, data, {
      headers: {
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
      }
    });
    return response.data;
  },
  updateProduct : async (id: string, data: UpdateProductData) => {
    const response = await API.put(API_ENDPOINTS.products.detail(id), data);
    return response.data;
  },
  deleteProduct : async (id: string) => {
    const response = await API.delete(API_ENDPOINTS.products.detail(id));
    return response.data;
  },  
  getProduct : async (id: string) => {
    const response = await API.get<ProductDetail>(API_ENDPOINTS.products.detail(id));
    return response.data;
  },
  addVariantes : async (id: string, data: any) => {
    let config: any = {}
    
    if (data instanceof FormData) {
      // Pour FormData, ne pas définir Content-Type, laissez axios le gérer
      // Mais ajouter les headers nécessaires pour l'authentification
      config = {
        headers: {
          'Accept': 'application/json'
        }
      }
    } else {
      // Pour JSON, définir le Content-Type
      config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    }
    
    const response = await API.post(API_ENDPOINTS.products.addVariantes(id), data, config);
    console.log(response.data);
    return response.data;
  },
  addImages : async (id: string, data: any) => {
    const response = await API.post(API_ENDPOINTS.products.addImages(id), data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  deleteImages : async (data: any) => {
    const response = await API.delete(API_ENDPOINTS.products.deleteImages, {
      data: {
        product_image_id: data.product_image_id
      }
    });
    return response.data;
  },
  addVariantImages : async (variantId: string, data: FormData) => {
    const response = await API.post(API_ENDPOINTS.products.addVariantImages(variantId), data, {
      headers: {
        // Ne pas définir Content-Type pour FormData, laissez axios le gérer
        'Accept': 'application/json'
      }
    });
    return response.data;
  },
  deleteVariant : async (variantId: string) => {
    const response = await API.delete(API_ENDPOINTS.products.deleteVariant(variantId));
    return response.data;
  },
  reorderAttributs : async (data: {
    main_attribut: number;
    attribut_variante_ids: number[];
    product_variable: string;
  }) => {
    console.log('🔄 [ProductsService] reorderAttributs - Données reçues:', {
      main_attribut: data.main_attribut,
      attribut_variante_ids: data.attribut_variante_ids,
      product_variable: data.product_variable,
      total_attributs: data.attribut_variante_ids.length
    });
    
    const response = await API.post(
      `${API_ENDPOINTS.products.base}viewset/attributs/reorder-attributs/`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('✅ [ProductsService] reorderAttributs - Réponse reçue:', response.data);
    return response.data;
  }
}