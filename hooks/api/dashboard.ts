import { useQuery } from "@tanstack/react-query"
import { getDashboardStats, getRecentOrders, getTopProducts } from "@/lib/services/dashboard.service"

export const useDashboardStats = () => {
    return useQuery({
        queryKey: ['dashboardStats'],
        queryFn: getDashboardStats
    })
}

export const useRecentOrders = () => {
    return useQuery({
        queryKey: ['recentOrders'],
        queryFn: getRecentOrders
    })
}

export const useTopProducts = () => {
    return useQuery({
        queryKey: ['topProducts'],
        queryFn: getTopProducts
    })
}