import { bulkDeletePartners, deletePartner, fetchAllPartnerProducts, fetchPartnerById, fetchPartnerProducts, fetchPartners } from "@/lib/services/parteners"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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

export const useDeletePartner = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await deletePartner(id)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partners'] })
        }
    })
}

export const useBulkDeletePartners = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await bulkDeletePartners(id)
            return response.data
        },
        
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partners'] })
        }
    })
}