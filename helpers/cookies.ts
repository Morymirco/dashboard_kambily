import Cookies from "js-cookie";

const ACCESS_KEYS_COOKIES_TTL_IN_MINUTES = 24 * 60;
export const setCookieUntilWindowClose = (key: string, value: string) => {
  // It will be deleted when the browser window is closed
  Cookies.set(key, value, {
    path: "/", // Available across the site
    sameSite: "strict", // Enhanced security
    secure: process.env.NODE_ENV === "production", // Secure in production
  });
};

export const setCookieWithExpiry = (
  key: string,
  value: string,
  expiryMinutes = ACCESS_KEYS_COOKIES_TTL_IN_MINUTES
) => {
  // Convert minutes to milliseconds for Date object
  const expiryDate = new Date(Date.now() + expiryMinutes * 60 * 1000);

  Cookies.set(key, value, {
    expires: expiryDate,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  // Also store the expiration timestamp for client-side checking
  const expiryTimestamp = expiryDate.getTime().toString();
  Cookies.set(`${key}_expiry`, expiryTimestamp, {
    expires: expiryDate,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
};

export const getCookie = (key: string) => {
  return Cookies.get(key);
};

export const removeCookie = (key: string) => {
  Cookies.remove(key, { path: "/" });
};

export const removeCookies = (keys: string[]) => {
  keys.forEach((key) => {
    removeCookie(key);
  });
};
