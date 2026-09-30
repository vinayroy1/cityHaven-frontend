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
  mobileNumber: string;
  otp: string;
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
  ownerName?: string | null;
  ownerPhone?: string | null;
}

export interface PurchaseCreditsPayload {
  credits: number;
  reason?: string;
}

export interface Plan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  currencyCode: string;
  billingCycle: string;
  durationDays: number;
  features: {
    creditsIncluded?: number;
    contactsLabel?: string;
    code?: string;
    popular?: boolean;
    [key: string]: any;
  } | null;
}

export const contactVerifyApi = createApi({
  reducerPath: "contactVerifyApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ContactVerify", "Credits", "UnlockedContact", "Plans"],
  endpoints: (builder) => ({
    getPlans: builder.query<{ success: boolean; data: Plan[] }, void>({
      query: () => ({
        url: API_ENDPOINTS.billing.plans,
        method: "GET",
      }),
      providesTags: ["Plans"],
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
      invalidatesTags: ["Credits"],
    }),
    getMyCredits: builder.query<{ success: boolean; data: { credits: number } }, void>({
      query: () => ({
        url: API_ENDPOINTS.billing.myCredits,
        method: "GET",
      }),
      providesTags: ["Credits"],
    }),
    checkUnlockedContact: builder.query<{ success: boolean; data: CheckUnlockedContactResponse }, number | string>({
      query: (propertyId) => ({
        url: API_ENDPOINTS.propertyListing.unlockedContact(propertyId),
        method: "GET",
      }),
      providesTags: (_result, _err, id) => [{ type: "UnlockedContact", id }],
    }),
    unlockPropertyContact: builder.mutation<
      { success: boolean; alreadyUnlocked?: boolean; credits?: number; data: UnlockContactResponse },
      number | string
    >({
      query: (propertyId) => ({
        url: API_ENDPOINTS.propertyListing.unlockContact(propertyId),
        method: "POST",
      }),
      invalidatesTags: (_result, _err, id) => [{ type: "UnlockedContact", id }, "Credits"],
    }),
    purchaseCredits: builder.mutation<{ success: boolean; data: { credits: number } }, PurchaseCreditsPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.billing.purchaseCredits,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Credits"],
    }),
    purchaseCreditsByPlan: builder.mutation<{ success: boolean; data: { credits: number; planName?: string } }, { planId: number }>({
      query: (body) => ({
        url: API_ENDPOINTS.billing.purchaseCreditsByPlan,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Credits"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useRequestContactOtpMutation,
  useVerifyContactOtpMutation,
  useGetMyCreditsQuery,
  useLazyGetMyCreditsQuery,
  useCheckUnlockedContactQuery,
  useLazyCheckUnlockedContactQuery,
  useUnlockPropertyContactMutation,
  usePurchaseCreditsMutation,
  usePurchaseCreditsByPlanMutation,
} = contactVerifyApi;
