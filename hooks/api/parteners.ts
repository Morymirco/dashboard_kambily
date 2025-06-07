import { useQuery } from "@tanstack/react-query"
import { fetchAllPartnerProducts, fetchPartnerById, fetchPartnerProducts, fetchPartners } from "@/lib/services/parteners"

export const usePartners = (page = 1, search = "") => {
    return useQuery({
        queryKey: ["partners", page, search],
        queryFn: () => fetchPartners(page, search),
    })
}
export const usePartnerById = (id: string) => {
    return useQuery({
        queryKey: ["partner", id],
        queryFn: () => fetchPartnerById(id),
    })
}
export const usePartnerProducts = (id: string) => {
    return useQuery({
        queryKey: ["partnerProducts", id],
        queryFn: () => fetchPartnerProducts(id),
    })
}
export const useAllPartnerProducts = (page = 1, search = "") => {
    return useQuery({
        queryKey: ["allPartnerProducts", page, search],
        queryFn: () => fetchAllPartnerProducts(page, search),
    })
}