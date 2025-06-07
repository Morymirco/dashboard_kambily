import API from "@/service/api"
import { API_ENDPOINTS } from "../constant/api"

export const getUsers = async () => {
    const response = await API.get(API_ENDPOINTS.users.base)
    return response.data
}