import API from "@/service/api"
import { API_ENDPOINTS } from "@/lib/constant/api"

export const getTags = async () => {
    const response = await API.get(API_ENDPOINTS.tags.base)
    return response.data
}
export const getTagsOff = async () => {
    const response = await API.get(API_ENDPOINTS.tags.of)
    return response.data
}