import { API_ENDPOINTS } from "@/lib/constant";
import API from "@/service/api";
import { UserToken } from "../types/user";

export const UserAuthService = {
 login : async (email: string, password: string) => {
    const response = await API.post<UserToken>(API_ENDPOINTS.LOGIN, {
      email,
      password
    });
    return response.data;
  }
}