"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";
import type {
  InteriorBranch,
  InteriorInquiry,
  InteriorPackage,
  InteriorProfile,
  InteriorProject,
  InteriorSearchParams,
  InteriorSearchResponse,
} from "@/types/interior.types";

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

const queryString = (params?: InteriorSearchParams) => {
  const query = new URLSearchParams();
  if (!params) return "";
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
};

export const interiorsApi = createApi({
  reducerPath: "interiorsApi",
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 300, // 5 minutes cache retention
  tagTypes: ["InteriorProfile", "InteriorList", "InteriorProjects", "InteriorInquiries"],
  endpoints: (builder) => ({
    searchInteriorDesigners: builder.query<InteriorSearchResponse, InteriorSearchParams | void>({
      query: (params) => {
        const qs = queryString(params || undefined);
        return {
          url: `${API_ENDPOINTS.interiors.search}${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (response: ApiEnvelope<InteriorSearchResponse>) => response.data,
      providesTags: ["InteriorList"],
    }),

    getInteriorProfileDetail: builder.query<InteriorProfile, string | number>({
      query: (slugOrId) => ({
        url: API_ENDPOINTS.interiors.detail(slugOrId),
        method: "GET",
      }),
      transformResponse: (response: ApiEnvelope<InteriorProfile>) => response.data,
      providesTags: (_res, _err, slugOrId) => [{ type: "InteriorProfile", id: slugOrId }],
    }),

    getMyInteriorProfile: builder.query<InteriorProfile | null, void>({
      query: () => ({
        url: API_ENDPOINTS.interiors.me,
        method: "GET",
      }),
      transformResponse: (response: ApiEnvelope<InteriorProfile | null>) => response.data,
      providesTags: ["InteriorProfile"],
    }),

    saveMyInteriorProfile: builder.mutation<InteriorProfile, Partial<InteriorProfile>>({
      query: (body) => ({
        url: API_ENDPOINTS.interiors.saveMe,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiEnvelope<InteriorProfile>) => response.data,
      invalidatesTags: ["InteriorProfile", "InteriorList"],
    }),

    publishMyInteriorProfile: builder.mutation<InteriorProfile, void>({
      query: () => ({
        url: API_ENDPOINTS.interiors.publishMe,
        method: "POST",
      }),
      transformResponse: (response: ApiEnvelope<InteriorProfile>) => response.data,
      invalidatesTags: ["InteriorProfile", "InteriorList"],
    }),

    addCompanyBranch: builder.mutation<InteriorBranch, Partial<InteriorBranch>>({
      query: (body) => ({
        url: API_ENDPOINTS.interiors.branches,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiEnvelope<InteriorBranch>) => response.data,
      invalidatesTags: ["InteriorProfile"],
    }),

    saveInteriorPackage: builder.mutation<InteriorPackage, { id?: number; data: Partial<InteriorPackage> }>({
      query: ({ id, data }) => ({
        url: id ? API_ENDPOINTS.interiors.packageDetail(id) : API_ENDPOINTS.interiors.packages,
        method: id ? "PUT" : "POST",
        body: data,
      }),
      transformResponse: (response: ApiEnvelope<InteriorPackage>) => response.data,
      invalidatesTags: ["InteriorProfile"],
    }),

    savePortfolioProject: builder.mutation<InteriorProject, { id?: number; data: Partial<InteriorProject> }>({
      query: ({ id, data }) => ({
        url: id ? API_ENDPOINTS.interiors.projectDetail(id) : API_ENDPOINTS.interiors.projects,
        method: id ? "PUT" : "POST",
        body: data,
      }),
      transformResponse: (response: ApiEnvelope<InteriorProject>) => response.data,
      invalidatesTags: ["InteriorProfile", "InteriorProjects", "InteriorList"],
    }),

    submitInteriorInquiry: builder.mutation<void, { profileId: number | string; data: Partial<InteriorInquiry> }>({
      query: ({ profileId, data }) => ({
        url: API_ENDPOINTS.interiors.submitInquiry(profileId),
        method: "POST",
        body: data,
      }),
    }),

    unlockInteriorInquiry: builder.mutation<InteriorInquiry, number | string>({
      query: (inquiryId) => ({
        url: API_ENDPOINTS.interiors.unlockInquiry(inquiryId),
        method: "POST",
      }),
      transformResponse: (response: ApiEnvelope<InteriorInquiry>) => response.data,
      invalidatesTags: ["InteriorProfile", "InteriorInquiries"],
    }),
  }),
});

export const {
  useSearchInteriorDesignersQuery,
  useGetInteriorProfileDetailQuery,
  useGetMyInteriorProfileQuery,
  useSaveMyInteriorProfileMutation,
  usePublishMyInteriorProfileMutation,
  useAddCompanyBranchMutation,
  useSaveInteriorPackageMutation,
  useSavePortfolioProjectMutation,
  useSubmitInteriorInquiryMutation,
  useUnlockInteriorInquiryMutation,
} = interiorsApi;

