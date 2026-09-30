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
  contactVerify: {
    requestOtp: `${BASE}/contact-verify/request-otp`,
    verifyOtp: `${BASE}/contact-verify/verify-otp`,
  },
  billing: {
    plans: `${BASE}/billing/plans`,
    summary: `${BASE}/billing/summary`,
    myCredits: `${BASE}/billing/credits/my`,
    purchaseCredits: `${BASE}/billing/credits/purchase`,
    purchaseCreditsByPlan: `${BASE}/billing/credits/purchase-plan`,
    createOrder: `${BASE}/billing/orders/create`,
    verifyPayment: `${BASE}/billing/orders/verify`,
    orgCredits: (orgId: number | string) => `${BASE}/billing/credit-transactions/organization/${orgId}`,
    myTransactions: `${BASE}/billing/transactions/my`,
    myCreditTransactions: `${BASE}/billing/credit-transactions/my`,
  },
  organizations: {
    create: `${BASE}/organizations`,
    my: `${BASE}/organizations/my`,
    detail: (id: number | string) => `${BASE}/organizations/${id}`,
    members: (id: number | string) => `${BASE}/organizations/${id}/members`,
    member: (id: number | string, memberId: number | string) => `${BASE}/organizations/${id}/members/${memberId}`,
    invitations: (id: number | string) => `${BASE}/organizations/${id}/invitations`,
    invitation: (id: number | string, invitationId: number | string) => `${BASE}/organizations/${id}/invitations/${invitationId}`,
    acceptInvitation: (token: string) => `${BASE}/organizations/invitations/${token}/accept`,
    rejectInvitation: (token: string) => `${BASE}/organizations/invitations/${token}/reject`,
    transferOwner: (id: number | string) => `${BASE}/organizations/${id}/transfer-owner`,
    activity: (id: number | string) => `${BASE}/organizations/${id}/activity`,
    properties: (id: number | string) => `${BASE}/organizations/${id}/properties`,
  },
  propertyListing: {
    create: `${BASE}/propertyListing`,
    update: (id: number | string) => `${BASE}/propertyListing/${id}`,
    // Associates media URLs with a listing: POST { items: [{ url, type }] }.
    media: (id: number | string) => `${BASE}/propertyListing/${id}/media`,
    unlockContact: (id: number | string) => `${BASE}/propertyListing/${id}/unlock-contact`,
    unlockedContact: (id: number | string) => `${BASE}/propertyListing/${id}/unlocked-contact`,
    favorite: (id: number | string) => `${BASE}/propertyListing/${id}/favorite`,
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
  contact: {
    submit: `${BASE}/contact`,
  },
};
