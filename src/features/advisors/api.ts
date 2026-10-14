"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";
import type { Agent } from "@/data/agents";

export interface GetAdvisorsParams {
  city?: string;
  limit?: number;
  featured?: boolean;
}

export interface AdvisorsApiResponse {
  success: boolean;
  data: Agent[];
  count: number;
}

export interface CreateAdvisorInput {
  name: string;
  title?: string;
  bio?: string;
  agency?: string;
  experienceYears?: number;
  responseTimeText?: string;
  city: string;
  primaryArea: string;
  avatar?: string;
  coverImage?: string;
  phone?: string;
  email?: string;
  badge?: string;
  reraId?: string;
  availableForTours?: boolean;
  services?: string[];
  languages?: string[];
}

export interface UpdateAdvisorInput extends Partial<CreateAdvisorInput> {}

export interface ContactAdvisorInput {
  advisorId: string | number;
  name: string;
  phone: string;
  email?: string;
  intent?: "BUY" | "RENT" | "SELL" | "INVEST";
  preferredTime?: string;
  message?: string;
  propertyId?: number;
}

export interface SubmitReviewInput {
  advisorId: string | number;
  rating: number;
  comment: string;
}

export const advisorsApi = createApi({
  reducerPath: "advisorsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Advisor", "MyAdvisorProfile", "AdvisorLeads"],
  endpoints: (builder) => ({
    getAdvisors: builder.query<Agent[], GetAdvisorsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.city) queryParams.set("city", params.city);
        if (params?.limit) queryParams.set("limit", String(params.limit));
        if (params?.featured !== undefined) queryParams.set("featured", String(params.featured));

        const qs = queryParams.toString();
        return {
          url: `${API_ENDPOINTS.advisors.list}${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (response: AdvisorsApiResponse) => response.data || [],
      providesTags: ["Advisor"],
    }),

    getAdvisorBySlug: builder.query<Agent, string>({
      query: (slug) => ({
        url: API_ENDPOINTS.advisors.detail(slug),
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: Agent }) => response.data,
      providesTags: (_result, _err, slug) => [{ type: "Advisor", id: slug }],
    }),

    getMyAdvisorProfile: builder.query<Agent, void>({
      query: () => ({
        url: API_ENDPOINTS.advisors.me,
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: Agent }) => response.data,
      providesTags: ["MyAdvisorProfile"],
    }),

    createAdvisorProfile: builder.mutation<Agent, CreateAdvisorInput>({
      query: (body) => ({
        url: API_ENDPOINTS.advisors.create,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Advisor", "MyAdvisorProfile"],
    }),

    updateMyAdvisorProfile: builder.mutation<Agent, UpdateAdvisorInput>({
      query: (body) => ({
        url: API_ENDPOINTS.advisors.updateMe,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Advisor", "MyAdvisorProfile"],
    }),

    toggleTourAvailability: builder.mutation<{ availableForTours: boolean }, boolean>({
      query: (availableForTours) => ({
        url: API_ENDPOINTS.advisors.toggleAvailability,
        method: "PATCH",
        body: { availableForTours },
      }),
      invalidatesTags: ["Advisor", "MyAdvisorProfile"],
    }),

    contactAdvisor: builder.mutation<{ requestId: number; advisorName: string }, ContactAdvisorInput>({
      query: ({ advisorId, ...body }) => ({
        url: API_ENDPOINTS.advisors.contact(advisorId),
        method: "POST",
        body,
      }),
    }),

    submitAdvisorReview: builder.mutation<{ rating: number; reviewCount: number }, SubmitReviewInput>({
      query: ({ advisorId, ...body }) => ({
        url: API_ENDPOINTS.advisors.review(advisorId),
        method: "POST",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: "Advisor", id: String(arg.advisorId) }],
    }),
  }),
});

export const {
  useGetAdvisorsQuery,
  useGetAdvisorBySlugQuery,
  useGetMyAdvisorProfileQuery,
  useCreateAdvisorProfileMutation,
  useUpdateMyAdvisorProfileMutation,
  useToggleTourAvailabilityMutation,
  useContactAdvisorMutation,
  useSubmitAdvisorReviewMutation,
} = advisorsApi;

