import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";

export type RequestOtpPayload = { mobileNumber: string };
export type VerifyOtpPayload = { mobileNumber: string; otp: string };
export type TokenResponse = { accessToken?: string; refreshToken?: string; user?: unknown; isNewUser?: boolean };
export type UpdateProfilePayload = { name?: string; email?: string };

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    me: builder.query<{ id?: number; email?: string; name?: string }, void>({
      query: () => ({
        url: API_ENDPOINTS.auth.me,
        method: "GET",
      }),
    }),
    requestOtp: builder.mutation<{ success?: boolean }, RequestOtpPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.requestOtp,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data?: any }) => response.data ?? {},
    }),
    verifyOtp: builder.mutation<TokenResponse, VerifyOtpPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.verifyOtp,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data?: TokenResponse }) => response.data ?? {},
    }),
    updateProfile: builder.mutation<{ success?: boolean; user?: any }, UpdateProfilePayload>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.profile,
        method: "PUT",
        body,
      }),
      transformResponse: (response: { data?: any }) => response.data ?? {},
    }),
  }),
});

export const { useRequestOtpMutation, useVerifyOtpMutation, useUpdateProfileMutation, useMeQuery, useLazyMeQuery } = authApi;
