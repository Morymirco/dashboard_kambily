import API from "@/service/api"
import { API_ENDPOINTS } from "../constant/api"

export const getDashboardStats = async () => {
    const response = await API.get(API_ENDPOINTS.dashboard.detailedStats)
    return response.data
}

export const getRecentOrders = async () => {
    const response = await API.get(API_ENDPOINTS.dashboard.recentOrders)
    return response.data
}

export const getTopProducts = async () => {
    const response = await API.get(API_ENDPOINTS.dashboard.topProducts)
    return response.data
}
