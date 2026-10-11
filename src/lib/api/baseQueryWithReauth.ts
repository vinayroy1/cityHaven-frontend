import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";
import { APP_CONFIG } from "@/constants/app-config";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

let refreshPromise: Promise<string | null> | null = null;

const getAccessToken = () => (typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null);
const getRefreshToken = () => (typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY) : null);

const setTokens = (accessToken?: string | null, refreshToken?: string | null) => {
  if (typeof window === "undefined") return;
  if (accessToken) localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY, refreshToken);
};

const clearTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
  localStorage.removeItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
  localStorage.removeItem(APP_CONFIG.AUTH.USER_KEY);
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${APP_CONFIG.API.BASE_URL}/v1`,
  prepareHeaders: (headers) => {
    const token = getAccessToken();
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  const result = await rawBaseQuery(
    {
      url: API_ENDPOINTS.auth.refreshToken,
      method: "POST",
      body: { refreshToken },
    },
    {} as any,
    {} as any,
  );
  if (result.error) {
    clearTokens();
    return null;
  }
  const payload = result.data as any;
  const tokens = payload?.data ?? payload ?? {};
  if (tokens.accessToken) {
    setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens.accessToken;
  }
  return null;
};

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result?.error && result?.error?.status === 401) {
    const url = typeof args === "string" ? args : args.url;

    // Do NOT trigger reauth or window reload on login, register, verify-otp, or refresh endpoints
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/signup") ||
      url.includes("/auth/send-signup-otp") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password") ||
      url.includes("/auth/verify-otp") ||
      url.includes("/auth/request-otp");

    if (isAuthEndpoint) {
      return result;
    }

    // don't retry refresh endpoint itself
    if (url.includes("/auth/refresh")) {
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
      return result;
    }
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken();
    }
    const newToken = await refreshPromise;
    refreshPromise = null;
    if (newToken) {
      const retryArgs =
        typeof args === "string"
          ? { url: args, headers: { authorization: `Bearer ${newToken}` } }
          : {
              ...args,
              headers: { ...(args.headers || {}), authorization: `Bearer ${newToken}` },
            };
      result = await rawBaseQuery(retryArgs, api, extraOptions);
    } else {
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  }

  // Display user-friendly mobile toast popup for API errors that automatically disappears
  if (result?.error && typeof window !== "undefined") {
    const errorData = result.error.data as any;
    const message =
      errorData?.message ||
      errorData?.error ||
      (typeof result.error.data === "string" ? result.error.data : null) ||
      (result.error.status === "FETCH_ERROR" ? "Network error. Please check your connection." : "Something went wrong. Please try again.");

    // Ignore abort/silent cancellations
    if (result.error.status !== "PARSING_ERROR" && message) {
      toast.error(message, {
        duration: 3500,
      });
    }
  }

  // Display success toast popup on any POST, PUT, PATCH, or DELETE API response
  if (!result?.error && typeof window !== "undefined") {
    const method = (typeof args === "string" ? "GET" : (args.method || "GET")).toUpperCase();
    const url = typeof args === "string" ? args : args.url;

    // Filter mutation methods (POST, PUT, PATCH, DELETE) and avoid background heartbeats/refreshes
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && !url.includes("/auth/refresh-token")) {
      const responseData = result.data as any;
      const successMessage =
        responseData?.message ||
        (method === "DELETE"
          ? "Item deleted successfully"
          : method === "PUT" || method === "PATCH"
          ? "Updated successfully"
          : "Action completed successfully");

      toast.success(successMessage, {
        duration: 3500,
      });
    }
  }

  return result;
};
