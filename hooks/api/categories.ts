import { useMutation, useQuery } from "@tanstack/react-query"
import { addCategory, deleteCategory, getCategories, getParentCategories, updateCategory } from "@/lib/services/categories.service"
import { Category } from "@/lib/types/categories"
import { toast } from "sonner"


export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: getCategories
    })
}
export const useDeleteCategory = () => {
    return useMutation({
        mutationFn: deleteCategory
    })
}
export const useUpdateCategory = (id: string) => {
    return useMutation({
        mutationFn: (data: Category) => updateCategory(id, data),
        onSuccess: () => {
            toast.success("Catégorie mise à jour avec succès")
        },
        onError: () => {
            toast.error("Erreur lors de la mise à jour de la catégorie")
        }
    })
}

export const useAddCategory = () => {
    return useMutation({
        mutationFn: addCategory
    })
}

export const useParentCategories = () => {
    return useQuery({
        queryKey: ['parent-categories'],
        queryFn: getParentCategories
    })
}