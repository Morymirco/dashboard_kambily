import { getTags, getTagsOff } from "@/lib/services/tags.service"
import { useQuery } from "@tanstack/react-query"

export const useTags = () => {
    return useQuery({
        queryKey: ['tags'],
        queryFn: getTags
    })
}
