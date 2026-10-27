"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";

export interface RequestContactOtpPayload {
  name?: string;
  mobileNumber: string;
}

export interface VerifyContactOtpPayload {
  name?: string;
  mobileNumber?: string;
  otp?: string;
  password?: string;
  propertyId?: number;
  email?: string;
  source?: string;
  city?: string;
  locality?: string;
}

export interface VerifyContactOtpResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: {
    id: number;
    name: string;
    mobileNumber: string;
    credits: number;
  };
}

export interface UnlockContactResponse {
  ownerName: string | null;
  ownerPhone: string | null;
}

export interface CheckUnlockedContactResponse {
  unlocked: boolean;
  scope?: "PERSONAL" | "ORGANIZATION";
  organizationId?: number;
  isOwner?: boolean;
  ownerName?: string | null;
  ownerPhone?: string | null;
}

export interface PurchaseCreditsPayload {
  credits: number;
  reason?: string;
}

export type PlanCategory =
  | "BUYER_TENANT"
  | "FLATMATE"
  | "OWNER_LANDLORD"
  | "AGENCY_BROKER"
  | "BUILDER_PROJECT";

export interface PlanFeatureItem {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface Plan {
  id: number;
  code?: string;
  category?: PlanCategory;
  name: string;
  badge?: string | null;
  tagline?: string | null;
  description: string | null;
  ctaText?: string | null;
  sortOrder?: number;
  isPopular?: boolean;
  isActive?: boolean;
  price: number;
  originalPrice?: number | null;
  currencyCode: string;
  billingCycle: string;
  durationDays: number | null;
  contactCredits?: number;
  activeListings?: number;
  teamSeats?: number;
  localityBoosts?: number;
  kycVerification?: boolean;
  legalAgreement?: boolean;
  prioritySupport?: boolean;
  featureList?: PlanFeatureItem[] | null;
  features: {
    creditsIncluded?: number;
    contactsLabel?: string;
    code?: string;
    popular?: boolean;
    maxActiveListings?: number;
    maxSeats?: number;
    featuredBoosts?: number;
    verificationAssistance?: boolean;
    [key: string]: any;
  } | null;
}

export interface BillingSummary {
  scope: "PERSONAL" | "ORGANIZATION";
  userId?: number;
  userName?: string;
  organizationId?: number;
  organizationName?: string;
  userRole?: string;
  credits: number;
  isVerified?: boolean;
  kycVerified?: boolean;
  activeSubscription?: {
    id: number;
    planId: number;
    startsAt: string;
    endsAt: string;
    status: string;
    plan?: Plan;
  } | null;
  allowances: {
    seats?: {
      used: number;
      activeMembers: number;
      pendingInvites: number;
      limit: number;
      available: number;
      freeLimit?: number;
      costPerAdditionalMember?: number;
      billableMembers?: number;
      monthlyCreditBurn?: number;
    };
    listings: {
      current: number;
      limit: number;
      available: number;
    };
    contactCredits: number;
    boostsRemaining: number;
    verificationAssistance?: boolean;
  };
  permissions: {
    canManageBilling: boolean;
    canUseAllowance: boolean;
  };
}

export interface OrgCreditTransaction {
  id: number;
  userId?: number | null;
  organizationId?: number | null;
  creditChange: number;
  reason: string;
  createdAt: string;
  meta?: {
    propertyId?: number;
    actorId?: number;
    actorName?: string;
    propertyTitle?: string;
    planName?: string;
    [key: string]: any;
  } | null;
  user?: {
    id: number;
    name?: string | null;
    email?: string | null;
    mobileNumber?: string | null;
  } | null;
}

export interface UnlockPropertyContactPayload {
  propertyId: number | string;
  organizationId?: number;
}

export interface PurchaseCreditsByPlanPayload {
  planId: number;
  target?: "USER" | "ORG";
  organizationId?: number;
  paymentRef?: string;
}

export interface CreateOrderPayload {
  planId: number;
  target?: "USER" | "ORG";
  organizationId?: number;
  returnUrl?: string;
}

export interface VerifyPaymentPayload {
  orderId?: string;
  paymentRef?: string;
  cfPaymentId?: string;
  planId?: number;
  target?: "USER" | "ORG";
  organizationId?: number;
}

export interface CreditActionConfig {
  id: number;
  key: string;
  label: string;
  description?: string | null;
  creditAmount: number;
  durationDays?: number | null;
  isEnabled: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface PlatformFeatureFlag {
  id: number;
  key: string;
  label: string;
  description?: string | null;
  isEnabled: boolean;
}

export interface CreditPlatformConfig {
  actions: CreditActionConfig[];
  flags: PlatformFeatureFlag[];
  plans: Plan[];
}

export interface CreditPromotion {
  id: number;
  actionKey: string;
  targetType: "PROPERTY" | "FLATMATE" | "ADVISOR";
  targetId: number;
  startsAt: string;
  endsAt: string;
  creditCost: number;
  isActive: boolean;
}

export interface CreditCoupon {
  id: number;
  code: string;
  description?: string | null;
  credits: number;
  maxRedemptions?: number | null;
  maxPerUser: number;
  redemptionCount: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
}

export const contactVerifyApi = createApi({
  reducerPath: "contactVerifyApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ContactVerify", "Credits", "UnlockedContact", "Plans", "BillingSummary", "OrgCredits", "CreditConfig", "Promotions", "Coupons"],
  endpoints: (builder) => ({
    getPlans: builder.query<{ success: boolean; data: Plan[] }, { category?: string; all?: boolean } | void>({
      query: (params) => ({
        url: API_ENDPOINTS.billing.plans,
        method: "GET",
        params: params ? { category: params.category, all: params.all } : undefined,
      }),
      providesTags: ["Plans"],
    }),
    getCreditPlatformConfig: builder.query<{ success: boolean; data: CreditPlatformConfig }, { admin?: boolean } | void>({
      query: (params) => ({
        url: params?.admin ? API_ENDPOINTS.admin.billing.platformConfig : API_ENDPOINTS.billing.platformConfig,
        method: "GET",
        params: params?.admin ? { all: true } : undefined,
      }),
      providesTags: ["CreditConfig", "Plans"],
    }),
    activateCreditPromotion: builder.mutation<
      { success: boolean; data: { promotion: CreditPromotion; credits: number } },
      { actionKey: string; targetType: "PROPERTY" | "FLATMATE" | "ADVISOR"; targetId: number; organizationId?: number }
    >({
      query: (body) => ({ url: API_ENDPOINTS.billing.promotions, method: "POST", body }),
      invalidatesTags: ["Promotions", "Credits", "BillingSummary"],
    }),
    getMyPromotions: builder.query<{ success: boolean; data: CreditPromotion[] }, void>({
      query: () => ({ url: API_ENDPOINTS.billing.myPromotions, method: "GET" }),
      providesTags: ["Promotions"],
    }),
    redeemCreditCoupon: builder.mutation<
      { success: boolean; data: { credits: number; creditsAdded: number; code: string } },
      { code: string; organizationId?: number }
    >({
      query: (body) => ({ url: API_ENDPOINTS.billing.redeemCoupon, method: "POST", body }),
      invalidatesTags: ["Credits", "BillingSummary", "Coupons"],
    }),
    adminUpdateCreditAction: builder.mutation<CreditActionConfig, { key: string; data: Omit<CreditActionConfig, "id" | "key"> }>({
      query: ({ key, data }) => ({ url: API_ENDPOINTS.admin.billing.creditAction(key), method: "PUT", body: data }),
      transformResponse: (response: { success: boolean; data: CreditActionConfig }) => response.data,
      invalidatesTags: ["CreditConfig"],
    }),
    adminUpdateFeatureFlag: builder.mutation<PlatformFeatureFlag, { key: string; data: Omit<PlatformFeatureFlag, "id" | "key"> }>({
      query: ({ key, data }) => ({ url: API_ENDPOINTS.admin.billing.featureFlag(key), method: "PUT", body: data }),
      transformResponse: (response: { success: boolean; data: PlatformFeatureFlag }) => response.data,
      invalidatesTags: ["CreditConfig"],
    }),
    adminGetCoupons: builder.query<{ success: boolean; data: CreditCoupon[] }, void>({
      query: () => ({ url: API_ENDPOINTS.admin.billing.coupons, method: "GET" }),
      providesTags: ["Coupons"],
    }),
    adminCreateCoupon: builder.mutation<CreditCoupon, Partial<CreditCoupon> & Pick<CreditCoupon, "code" | "credits">>({
      query: (body) => ({ url: API_ENDPOINTS.admin.billing.coupons, method: "POST", body }),
      transformResponse: (response: { success: boolean; data: CreditCoupon }) => response.data,
      invalidatesTags: ["Coupons"],
    }),
    adminUpdateCoupon: builder.mutation<CreditCoupon, { id: number; data: Partial<CreditCoupon> }>({
      query: ({ id, data }) => ({ url: API_ENDPOINTS.admin.billing.coupon(id), method: "PATCH", body: data }),
      transformResponse: (response: { success: boolean; data: CreditCoupon }) => response.data,
      invalidatesTags: ["Coupons"],
    }),
    getBillingSummary: builder.query<{ success: boolean; data: BillingSummary }, { target?: "USER" | "ORG"; organizationId?: number } | void>({
      query: (params) => ({
        url: API_ENDPOINTS.billing.summary,
        method: "GET",
        params: params ? { target: params.target, organizationId: params.organizationId } : undefined,
      }),
      providesTags: ["BillingSummary", "Credits"],
    }),
    requestContactOtp: builder.mutation<{ success: boolean; message: string; otp?: string }, RequestContactOtpPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.contactVerify.requestOtp,
        method: "POST",
        body,
      }),
    }),
    verifyContactOtp: builder.mutation<{ success: boolean; data: VerifyContactOtpResponse }, VerifyContactOtpPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.contactVerify.verifyOtp,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Credits", "BillingSummary"],
    }),
    getMyCredits: builder.query<{ success: boolean; data: { credits: number } }, void>({
      query: () => ({
        url: API_ENDPOINTS.billing.myCredits,
        method: "GET",
      }),
      providesTags: ["Credits"],
    }),
    getMyCreditTransactions: builder.query<
      { success: boolean; data: { items: any[]; total: number; page: number; pageSize: number } },
      { page?: number; pageSize?: number } | void
    >({
      query: (params) => ({
        url: API_ENDPOINTS.billing.myCreditTransactions,
        method: "GET",
        params: params || { page: 1, pageSize: 20 },
      }),
      providesTags: ["Credits"],
    }),
    getOrgCreditTransactions: builder.query<{ success: boolean; data: { items: OrgCreditTransaction[]; total: number; page: number; pageSize: number } }, { organizationId: number | string; page?: number; pageSize?: number }>({
      query: ({ organizationId, page = 1, pageSize = 20 }) => ({
        url: API_ENDPOINTS.billing.orgCredits(organizationId),
        method: "GET",
        params: { page, pageSize },
      }),
      providesTags: (_result, _err, args) => [{ type: "OrgCredits", id: args.organizationId }],
    }),
    checkUnlockedContact: builder.query<{ success: boolean; unlocked: boolean; credits?: number; data: CheckUnlockedContactResponse }, number | string>({
      query: (propertyId) => ({
        url: API_ENDPOINTS.propertyListing.unlockedContact(propertyId),
        method: "GET",
      }),
      transformResponse: (res: any) => {
        const isUnlocked = Boolean(res?.unlocked || res?.data?.unlocked);
        return {
          success: Boolean(res?.success),
          unlocked: isUnlocked,
          credits: typeof res?.credits === "number" ? res.credits : typeof res?.data?.credits === "number" ? res.data.credits : undefined,
          data: {
            unlocked: isUnlocked,
            scope: res?.scope || res?.data?.scope,
            organizationId: res?.organizationId || res?.data?.organizationId,
            isOwner: Boolean(res?.isOwner || res?.data?.isOwner),
            ownerName: res?.data?.ownerName ?? res?.ownerName ?? null,
            ownerPhone: res?.data?.ownerPhone ?? res?.ownerPhone ?? null,
          },
        };
      },
      providesTags: (_result, _err, id) => [{ type: "UnlockedContact", id }],
    }),
    unlockPropertyContact: builder.mutation<
      { success: boolean; alreadyUnlocked?: boolean; scope?: string; organizationId?: number; credits?: number; data: UnlockContactResponse },
      UnlockPropertyContactPayload | number | string
    >({
      query: (arg) => {
        const propertyId = typeof arg === "object" ? arg.propertyId : arg;
        const organizationId = typeof arg === "object" ? arg.organizationId : undefined;
        return {
          url: API_ENDPOINTS.propertyListing.unlockContact(propertyId),
          method: "POST",
          body: organizationId ? { organizationId } : {},
        };
      },
      invalidatesTags: ["Credits", "BillingSummary", "OrgCredits"],
    }),
    purchaseCredits: builder.mutation<{ success: boolean; data: { credits: number } }, PurchaseCreditsPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.billing.purchaseCredits,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Credits", "BillingSummary"],
    }),
    purchaseCreditsByPlan: builder.mutation<
      { success: boolean; data: { credits: number; planName?: string; activeSubscription?: any } },
      PurchaseCreditsByPlanPayload | { planId: number }
    >({
      query: (body) => ({
        url: API_ENDPOINTS.billing.purchaseCreditsByPlan,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Credits", "BillingSummary", "OrgCredits"],
    }),
    createBillingOrder: builder.mutation<
      {
        success: boolean;
        data: {
          orderId: string;
          paymentSessionId: string | null;
          cfOrderId?: string | null;
          plan: Plan;
          target: string;
          organizationId?: number | null;
        };
      },
      CreateOrderPayload
    >({
      query: (body) => ({
        url: API_ENDPOINTS.billing.createOrder,
        method: "POST",
        body,
      }),
    }),
    verifyBillingPayment: builder.mutation<
      {
        success: boolean;
        data: {
          success: boolean;
          alreadyActivated?: boolean;
          credits: number;
          planName?: string;
          activeSubscription?: any;
          creditsAdded?: number;
        };
      },
      VerifyPaymentPayload
    >({
      query: (body) => ({
        url: API_ENDPOINTS.billing.verifyPayment,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Credits", "BillingSummary", "OrgCredits"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetCreditPlatformConfigQuery,
  useActivateCreditPromotionMutation,
  useGetMyPromotionsQuery,
  useRedeemCreditCouponMutation,
  useAdminUpdateCreditActionMutation,
  useAdminUpdateFeatureFlagMutation,
  useAdminGetCouponsQuery,
  useAdminCreateCouponMutation,
  useAdminUpdateCouponMutation,
  useGetBillingSummaryQuery,
  useLazyGetBillingSummaryQuery,
  useRequestContactOtpMutation,
  useVerifyContactOtpMutation,
  useGetMyCreditsQuery,
  useLazyGetMyCreditsQuery,
  useGetMyCreditTransactionsQuery,
  useLazyGetMyCreditTransactionsQuery,
  useGetOrgCreditTransactionsQuery,
  useCheckUnlockedContactQuery,
  useLazyCheckUnlockedContactQuery,
  useUnlockPropertyContactMutation,
  usePurchaseCreditsMutation,
  usePurchaseCreditsByPlanMutation,
  useCreateBillingOrderMutation,
  useVerifyBillingPaymentMutation,
} = contactVerifyApi;
