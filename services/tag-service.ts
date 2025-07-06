import { API_ENDPOINTS } from "@/lib/constant";
import API from "@/service/api";

export interface Tag {
  id: number;
  name: string;
  description?: string;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTagData {
  name: string;
  description?: string;
}

export interface UpdateTagData {
  name?: string;
  description?: string;
}

export const TagService = {
  // Récupérer tous les tags
  getTags: async (): Promise<Tag[]> => {
    const response = await API.get(API_ENDPOINTS.tags.base);
    return response.data;
  },

  // Récupérer un tag par ID
  getTag: async (id: string): Promise<Tag> => {
    const response = await API.get(API_ENDPOINTS.tags.detail(id));
    return response.data;
  },

  // Créer un nouveau tag
  createTag: async (data: CreateTagData): Promise<Tag> => {
    const response = await API.post(API_ENDPOINTS.tags.add, data);
    return response.data;
  },

  // Mettre à jour un tag
  updateTag: async (id: string, data: UpdateTagData): Promise<Tag> => {
    const response = await API.put(API_ENDPOINTS.tags.update(id), data);
    return response.data;
  },

  // Mettre à jour partiellement un tag
  patchTag: async (id: string, data: UpdateTagData): Promise<Tag> => {
    const response = await API.patch(API_ENDPOINTS.tags.update(id), data);
    return response.data;
  },

  // Supprimer un tag
  deleteTag: async (id: string): Promise<void> => {
    await API.delete(API_ENDPOINTS.tags.delete(id));
  },

  // Récupérer les produits d'une étiquette
  getTagProducts: async (id: string, page = 1, page_size = 10) => {
    const response = await API.get(API_ENDPOINTS.tags.products(id), {
      params: { page, page_size }
    });
    return response.data;
  },

  // Retirer une étiquette d'un produit
  removeTagFromProduct: async (tagId: string, productId: number) => {
    const response = await API.delete(API_ENDPOINTS.tags.removeFromProduct(tagId), {
      data: { product_id: productId }
    });
    return response.data;
  },

  // Ajouter une étiquette à un produit
  addTagToProduct: async (tagId: string, productId: number) => {
    const response = await API.post(API_ENDPOINTS.tags.addToProduct(tagId), {
      product_id: productId
    });
    return response.data;
  }
}; 