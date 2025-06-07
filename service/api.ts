import { getCookie, setCookieWithExpiry } from "@/helpers/cookies";
import { signOutUtil } from "@/helpers/signOut";
import { API_ENDPOINTS } from "@/lib/constant/api";
import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
export const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kambily.com";

const API = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const ApiWithoutToken = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

//Je veux signaler que je nai pas utilise next-auth/react parce que jai pas encore une maitrise parfaite de cela
//ulterieurement le middleware sera modifie ainsi que la fonction refreshAccessToken
//voils pourquoi beaucoup de chose ont ete commente dans ce fichier

export const refreshAccessToken = async () => {
  const refreshToken = getCookie("refreshToken");

  try {
    const { data } = await ApiWithoutToken.post<{ access: string }>(
      API_ENDPOINTS.revokeToken,
      {
        refresh: refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

    return data.access;
  } catch (error: unknown) {
    return null;
  }
};

API.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = getCookie("accessToken");
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const { response } = error;

    if (response) {
      const { status } = response;
      if (status === 401) {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
          setCookieWithExpiry("accessToken", newAccessToken);
        } else {
          signOutUtil();
        }
      } else {
        // Toast any global error to the user
        if (response.data) {
          const errorEntry = Object.entries(response.data).find(([field]) =>
            ["detail", "non_field_errors", "message"].includes(field)
          );

          if (errorEntry) {
            const [_, error] = errorEntry;

            if (typeof error === "string") {
              toast.warning(error, { delay: 2000 });
            } else if (Array.isArray(error)) {
              toast.warning(error[0], { delay: 2000 });
            }
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export { ApiWithoutToken, axios };
export default API;
export const fetcher = (url: string) => API.get(url).then((res) => res.data);
export const defaultQueryFn = ({ queryKey }: { queryKey: string[] }) =>
  API.get(queryKey[0]).then((res) => res.data);
