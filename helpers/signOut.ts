import { removeCookies } from "./cookies";

export const signOutUtil = () => {
    removeCookies(["accessToken", "accessToken_expiry" , "refreshToken", "refreshToken_expiry"])
  
    const callbackUrl = window !== undefined ? `/login?callbackUrl=${window.location.href}` : "/login";
    window.location.href = callbackUrl; // Redirige l'utilisateur vers /login
  };
  