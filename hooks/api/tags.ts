import { getTags, getTagsOff } from "@/lib/services/tags.service"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { API_BASE_URL } from "@/constants"
import { getAuthHeaders } from "@/lib/auth-utils"

export const useTags = () => {
    return useQuery({
        queryKey: ['tags'],
        queryFn: getTags
    })
}

export const useTagsOff = () => {
    return useQuery({
        queryKey: ['tags-off'],
        queryFn: getTagsOff
    })
}

export const useCreateTag = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async (data: { name: string; description?: string }) => {
            const response = await fetch(`${API_BASE_URL}/tags/`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            
            if (!response.ok) {
                throw new Error('Erreur lors de la création de l\'étiquette')
            }
            
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] })
            queryClient.invalidateQueries({ queryKey: ['tags-off'] })
        },
    })
}

export const useUpdateTag = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: { name: string; description?: string } }) => {
            const response = await fetch(`${API_BASE_URL}/tags/${id}/`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            
            if (!response.ok) {
                throw new Error('Erreur lors de la modification de l\'étiquette')
            }
            
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] })
            queryClient.invalidateQueries({ queryKey: ['tags-off'] })
        },
    })
}

export const useDeleteTag = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await fetch(`${API_BASE_URL}/tags/${id}/`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            })
            
            if (!response.ok) {
                throw new Error('Erreur lors de la suppression de l\'étiquette')
            }
            
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] })
            queryClient.invalidateQueries({ queryKey: ['tags-off'] })
        },
    })
}

export const useTagDetail = (id: string) => {
    return useQuery({
        queryKey: ['tag-detail', id],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/tags/${id}/`, {
                headers: getAuthHeaders(),
            })
            
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des détails de l\'étiquette')
            }
            
            return response.json()
        },
        enabled: !!id,
    })
}
