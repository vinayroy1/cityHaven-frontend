import { APP_CONFIG } from "./app-config";

const BASE = `${APP_CONFIG.API.BASE_URL}/v1`;

export const API_ENDPOINTS = {
  auth: {
    requestOtp: `${BASE}/auth/request-otp`,
    verifyOtp: `${BASE}/auth/verify-otp`,
    refreshToken: `${BASE}/auth/refresh-token`,
    login: `${BASE}/auth/login`,
    register: `${BASE}/auth/register`,
    logout: `${BASE}/auth/logout`,
    changePassword: `${BASE}/auth/change-password`,
    forgotPassword: `${BASE}/auth/forgot-password`,
    resetPassword: `${BASE}/auth/reset-password`,
    me: `${BASE}/auth/me`,
    // Use users/me for profile updates
    profile: `${BASE}/users/me`,
  },
  propertyListing: {
    create: `${BASE}/propertyListing`,
    update: (id: number | string) => `${BASE}/propertyListing/${id}`,
    search: `${BASE}/propertyListing/search`,
    my: `${BASE}/propertyListing/my`,
    org: `${BASE}/propertyListing/org`,
    favorites: `${BASE}/propertyListing/me/favorites`,
    enquiries: `${BASE}/propertyListing/me/enquiries`,
    visits: `${BASE}/propertyListing/me/visits`,
  },
  properties: {
    list: `${BASE}/properties`,
    detail: `${BASE}/properties/:id`,
    search: `${BASE}/properties/search`,
    filter: `${BASE}/properties/filter`,
    create: `${BASE}/properties`,
    update: `${BASE}/properties/:id`,
    delete: `${BASE}/properties/:id`,
    uploadImage: `${BASE}/properties/:id/image`,
  },
  notifications: {
    list: `${BASE}/notifications`,
  },
};
