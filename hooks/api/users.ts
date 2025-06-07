import { useQuery } from "@tanstack/react-query"
import { getUsers } from "@/lib/services/users.service"

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: getUsers
    })
}