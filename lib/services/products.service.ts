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
  }
}