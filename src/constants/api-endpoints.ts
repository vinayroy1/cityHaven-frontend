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
  admin: {
    auth: {
      requestOtp: `${BASE}/admin/auth/request-otp`,
      login: `${BASE}/admin/auth/login`,
      verifyMfa: `${BASE}/admin/auth/verify-mfa`,
      me: `${BASE}/admin/auth/me`,
      invite: `${BASE}/admin/auth/invite`,
      acceptInvite: (token: string) => `${BASE}/admin/auth/invitations/${token}/accept`,
    },
    overview: `${BASE}/admin/overview`,
    analytics: {
      overview: `${BASE}/admin/overview`,
      kpis: `${BASE}/admin/analytics/kpis`,
    },
    staff: {
      list: `${BASE}/admin/staff`,
      invite: `${BASE}/admin/staff/invite`,
      detail: (id: number | string) => `${BASE}/admin/staff/${id}`,
      update: (id: number | string) => `${BASE}/admin/staff/${id}`,
      deactivate: (id: number | string) => `${BASE}/admin/staff/${id}/deactivate`,
    },
    properties: {
      queue: `${BASE}/admin/properties/qc-queue`,
      detail: (id: number | string) => `${BASE}/admin/properties/${id}`,
      review: (id: number | string) => `${BASE}/admin/properties/${id}/review`,
      suspend: (id: number | string) => `${BASE}/admin/properties/${id}/suspend`,
    },
    organizations: {
      queue: `${BASE}/admin/organizations/verification-queue`,
      detail: (id: number | string) => `${BASE}/admin/organizations/${id}`,
      verify: (id: number | string) => `${BASE}/admin/organizations/${id}/verify`,
      updateAllowance: (id: number | string) => `${BASE}/admin/organizations/${id}/allowance`,
    },
    users: {
      list: `${BASE}/admin/users`,
      detail: (id: number | string) => `${BASE}/admin/users/${id}`,
      status: (id: number | string) => `${BASE}/admin/users/${id}/status`,
    },
    billing: {
      orders: `${BASE}/admin/billing/orders`,
      transactions: `${BASE}/admin/billing/transactions`,
      plans: `${BASE}/admin/billing/plans`,
      refunds: `${BASE}/admin/billing/refunds`,
      approveRefund: (id: number | string) => `${BASE}/admin/billing/refunds/${id}/approve`,
      decideRefund: (id: number | string) => `${BASE}/admin/billing/refunds/${id}/decision`,
    },
    disputes: {
      list: `${BASE}/admin/disputes`,
      updateStatus: (id: number | string) => `${BASE}/admin/disputes/${id}/status`,
      assign: (id: number | string) => `${BASE}/admin/disputes/${id}/assign`,
    },
    fraud: {
      alerts: `${BASE}/admin/fraud/alerts`,
      resolve: (id: number | string) => `${BASE}/admin/fraud/alerts/${id}/resolve`,
    },
    unlocks: {
      list: `${BASE}/admin/audit/unlocks`,
    },
    workload: {
      autoDistribute: `${BASE}/admin/workload/auto-distribute`,
      assign: `${BASE}/admin/workload/assign`,
    },
    audit: {
      logs: `${BASE}/admin/audit-logs`,
    },
    governance: `${BASE}/admin/governance`,
  },
};
