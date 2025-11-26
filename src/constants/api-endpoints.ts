import { APP_CONFIG } from "./app-config";

const BASE = `${APP_CONFIG.API.BASE_URL}/v1`;

export const API_ENDPOINTS = {
  auth: {
    requestOtp: `${BASE}/auth/request-otp`,
    verifyOtp: `${BASE}/auth/verify-otp`,
    refreshToken: `${BASE}/auth/refresh-token`,
  },
  propertyListing: {
    create: `${BASE}/propertyListing`,
    update: (id: number | string) => `${BASE}/propertyListing/${id}`,
    search: `${BASE}/propertyListing/search`,
    my: `${BASE}/propertyListing/my`,
  },
  notifications: {
    list: `${BASE}/notifications`,
  },
};
