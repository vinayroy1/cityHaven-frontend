import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";

export type RequestOtpPayload = { mobileNumber: string };
export type VerifyOtpPayload = { mobileNumber: string; otp: string };
export type LoginPayload = { loginId: string; password: string };
export type SignupPayload = { name: string; email: string; mobileNumber: string; password: string; otp?: string; referralCode?: string };
export type SendSignupOtpPayload = { name: string; email: string; mobileNumber: string };
export type TokenResponse = { accessToken?: string; refreshToken?: string; user?: any; isNewUser?: boolean };
export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  mobileNumber?: string;
  profileImage?: string | null;
  address?: string | null;
  otp?: string;
};

export type ForgotPasswordPayload = { email: string };
export type ResetPasswordPayload = { email: string; otp: string; newPassword: string };

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Me"],
  endpoints: (builder) => ({
    me: builder.query<{
      id?: number;
      email?: string;
      name?: string;
      credits?: number;
      mobileNumber?: string;
      profileImage?: string | null;
      address?: string | null;
      isVerified?: boolean;
      kycVerified?: boolean;
      systemRole?: any;
      organizations?: any[];
      createdAt?: string;
    }, void>({
      query: () => ({
        url: API_ENDPOINTS.auth.me,
        method: "GET",
      }),
      providesTags: ["Me"],
    }),
    loginWithPassword: builder.mutation<TokenResponse, LoginPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.login,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data?: TokenResponse }) => response.data ?? {},
    }),
    sendSignupOtp: builder.mutation<{ success?: boolean; message?: string; email?: string }, SendSignupOtpPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.sendSignupOtp,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data?: any; message?: string }) => ({
        ...(response.data ?? {}),
        message: response.message,
      }),
    }),
    signup: builder.mutation<TokenResponse, SignupPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.register,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data?: TokenResponse }) => response.data ?? {},
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
    forgotPassword: builder.mutation<{ success?: boolean; message?: string; email?: string }, ForgotPasswordPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.forgotPassword,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data?: any; message?: string }) => ({
        ...(response.data ?? {}),
        message: response.message,
      }),
    }),
    resetPassword: builder.mutation<{ success?: boolean; message?: string }, ResetPasswordPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.resetPassword,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data?: any; message?: string }) => ({
        ...(response.data ?? {}),
        message: response.message,
      }),
    }),
    requestProfileOtp: builder.mutation<
      { success: boolean; message: string; targetEmail?: string; devOtp?: string },
      { newEmail?: string; newMobileNumber?: string }
    >({
      query: (body) => ({
        url: `${API_ENDPOINTS.auth.me}/request-otp`,
        method: "POST",
        body,
      }),
    }),
    updateProfile: builder.mutation<
      { success?: boolean; user?: any; data?: any; message?: string },
      UpdateProfilePayload
    >({
      query: (body) => ({
        url: API_ENDPOINTS.auth.profile,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Me"],
      transformResponse: (response: { data?: any; user?: any; message?: string }) => ({
        success: true,
        user: response.data || response.user,
        data: response.data || response.user,
        message: response.message,
      }),
    }),
    logout: builder.mutation<{ success?: boolean; message?: string }, { refreshToken?: string } | void>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.logout,
        method: "POST",
        body: body ?? {},
      }),
      transformResponse: (response: { data?: any; message?: string }) => ({
        ...(response.data ?? {}),
        message: response.message,
      }),
    }),
    changePassword: builder.mutation<
      { success: boolean; message?: string },
      { currentPassword?: string; newPassword: string }
    >({
      query: (body) => ({
        url: API_ENDPOINTS.auth.changePassword,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginWithPasswordMutation,
  useSendSignupOtpMutation,
  useSignupMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRequestProfileOtpMutation,
  useUpdateProfileMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useMeQuery,
  useLazyMeQuery,
} = authApi;

