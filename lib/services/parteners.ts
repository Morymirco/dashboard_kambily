import axios from "axios"
import { API_ENDPOINTS } from "../constant/api"
import API from "@/service/api";
export const fetchPartners = async (page = 1, search = "") => {
    const response = await API.get(API_ENDPOINTS.parteners.base, {
        params: {
            page,
            search,
        },
    })
    return response.data
}
export const fetchPartnerById = async (id: string) => {
    const response = await API.get(API_ENDPOINTS.parteners.detail(id))
    return response.data
}
export const fetchPartnerProducts = async (id: string) => {
    const response = await API.get(API_ENDPOINTS.parteners.partnerProducts(id))
    return response.data
}
export const fetchAllPartnerProducts = async (page = 1, search = "") => {
    const response = await API.get(API_ENDPOINTS.parteners.allProducts, {
        params: {
            page,
            search,
        },
    })
    return response.data
}