import { API_ENDPOINTS } from "../constant/api"
import API from "@/service/api"
import { Category } from "../types/categories"

export const getCategories = async () => {
    const response = await API.get<Category[]>(API_ENDPOINTS.categories.base)
    return response.data
}

export const deleteCategory = async (id: string) => {
    const response = await API.delete(API_ENDPOINTS.categories.delete(id))
    return response.data
}

export const updateCategory = async (id: string, data: Category) => {
    const response = await API.put(API_ENDPOINTS.categories.update(id), data)
    return response.data
}

export const addCategory = async (data: Category) => {
    const response = await API.post(API_ENDPOINTS.categories.add, data)
    return response.data
}
export const getParentCategories = async () => {
    const response = await API.get(API_ENDPOINTS.categories.parent)
    return response.data
}