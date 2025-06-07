import API from "@/service/api"
import { API_ENDPOINTS } from "../constant/api"

export const fetchReviews = async () => {
    const response = await API.get(API_ENDPOINTS.reviews.base)
    return response.data
}

// export const fetchReview = async (id: string) => {
//     const response = await API.get(API_ENDPOINTS.reviews.detail(id))
//     return response.data
// }