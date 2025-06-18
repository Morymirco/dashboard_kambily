import { API_ENDPOINTS } from "@/lib/constant";
import API from "@/service/api";

export const AttributesService = {
  getAttributes : async () => {
    const response = await API.get(API_ENDPOINTS.attributes.base);
    return response.data;
  }
}

