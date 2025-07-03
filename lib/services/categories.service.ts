import API from "@/service/api"
import { API_ENDPOINTS } from "../constant/api"
import { Category } from "../types/categories"

export const getCategories = async () => {
    const response = await API.get<Category[]>(API_ENDPOINTS.categories.base)
    return response.data
}

export const getCategory = async (id: string) => {
    const response = await API.get<Category>(API_ENDPOINTS.categories.detail(id))
    return response.data
}

export const deleteCategory = async (id: string) => {
    const response = await API.delete(API_ENDPOINTS.categories.delete(id))
    return response.data
}

export const updateCategory = async (id: string, data: Category) => {
    const response = await API.put(API_ENDPOINTS.categories.update(id), data,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    )
    
    return response.data
}

export const addCategory = async (data: Category) => {
    const response = await API.post(API_ENDPOINTS.categories.add, data,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    )
    return response.data
}
export const getParentCategories = async () => {
    const response = await API.get(API_ENDPOINTS.categories.parent)
    return response.data
}

export const getCategoriesOff = async () => {
    const response = await API.get(API_ENDPOINTS.categories.of)
    return response.data
}

export const getCategoryProducts = async (id: string, page: number = 1) => {
    const response = await API.get(`${API_ENDPOINTS.categories.detail(id)}?page=${page}`)
    return response.data
}