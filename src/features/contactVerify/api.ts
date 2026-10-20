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
  target: "USER" | "ORG";
  organizationId?: number;
}

export interface VerifyPaymentPayload {
  planId: number;
  target: "USER" | "ORG";
  organizationId?: number;
  paymentRef: string;
}

export const contactVerifyApi = createApi({
  reducerPath: "contactVerifyApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ContactVerify", "Credits", "UnlockedContact", "Plans", "BillingSummary", "OrgCredits"],
  endpoints: (builder) => ({
    getPlans: builder.query<{ success: boolean; data: Plan[] }, { category?: string; all?: boolean } | void>({
      query: (params) => ({
        url: API_ENDPOINTS.billing.plans,
        method: "GET",
        params: params ? { category: params.category, all: params.all } : undefined,
      }),
      providesTags: ["Plans"],
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
      invalidatesTags: (_result, _err, arg) => {
        const id = typeof arg === "object" ? arg.propertyId : arg;
        return [{ type: "UnlockedContact", id }, "Credits", "BillingSummary", "OrgCredits"];
      },
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
    createBillingOrder: builder.mutation<{ success: boolean; data: { orderId: string; plan: Plan; target: string } }, CreateOrderPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.billing.createOrder,
        method: "POST",
        body,
      }),
    }),
    verifyBillingPayment: builder.mutation<{ success: boolean; data: { credits: number; planName?: string; activeSubscription?: any } }, VerifyPaymentPayload>({
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
  useGetBillingSummaryQuery,
  useLazyGetBillingSummaryQuery,
  useRequestContactOtpMutation,
  useVerifyContactOtpMutation,
  useGetMyCreditsQuery,
  useLazyGetMyCreditsQuery,
  useGetOrgCreditTransactionsQuery,
  useCheckUnlockedContactQuery,
  useLazyCheckUnlockedContactQuery,
  useUnlockPropertyContactMutation,
  usePurchaseCreditsMutation,
  usePurchaseCreditsByPlanMutation,
  useCreateBillingOrderMutation,
  useVerifyBillingPaymentMutation,
} = contactVerifyApi;
