import { useQuery } from "@tanstack/react-query"
import { fetchReviews } from "@/lib/services/reviews.service"

export const useReviews = () => {
    return useQuery({
        queryKey: ["reviews"],
        queryFn: fetchReviews,
    })
}