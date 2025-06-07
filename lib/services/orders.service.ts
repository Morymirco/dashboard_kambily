import { API_ENDPOINTS } from "@/lib/constant";
import API from "@/service/api";

export const OrdersService = {
  getOrders : async (page: number, search: string, status: string) => {
    const response = await API.get(API_ENDPOINTS.orders.base, {
      params: {
        page,
        search,
        status
      }
    });
    return response.data;
  },

  getOrder : async (id: string) => {
    const response = await API.get(API_ENDPOINTS.orders.show(id));
    return response.data;
  },

  acceptOrder : async (id: string) => {
    const response = await API.post(API_ENDPOINTS.orders.accept(id));
    return response.data;
  },

  exportOrders : async () => {
    const response = await API.get(API_ENDPOINTS.orders.export);
    return response.data;
  }
}