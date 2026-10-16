"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";
import type {
  FlatmateListing,
  FlatmateListingInput,
  FlatmateProfile,
  FlatmateSearchParams,
  FlatmateSearchResponse,
  FlatmateInterest,
  FlatmateInterestStatus,
} from "@/types/flatmate.types";

export interface FlatmateInterestsResponse {
  received: FlatmateInterest[];
  sent: FlatmateInterest[];
}

export const flatmatesApi = createApi({
  reducerPath: "flatmatesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["FlatmateListing", "MyFlatmateListings", "FlatmateProfile", "FlatmateInterests"],
  endpoints: (builder) => ({
    searchFlatmates: builder.query<FlatmateSearchResponse, FlatmateSearchParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.mode) queryParams.set("mode", params.mode);
        if (params?.city) queryParams.set("city", params.city);
        if (params?.locality) queryParams.set("locality", params.locality);
        if (params?.budgetMin !== undefined) queryParams.set("budgetMin", String(params.budgetMin));
        if (params?.budgetMax !== undefined) queryParams.set("budgetMax", String(params.budgetMax));
        if (params?.gender) queryParams.set("gender", params.gender);
        if (params?.occupation) queryParams.set("occupation", params.occupation);
        if (params?.roomType) queryParams.set("roomType", params.roomType);
        if (params?.furnishing) queryParams.set("furnishing", params.furnishing);
        if (params?.bhk !== undefined) queryParams.set("bhk", String(params.bhk));
        if (params?.smokingAllowed !== undefined) queryParams.set("smokingAllowed", String(params.smokingAllowed));
        if (params?.drinkingAllowed !== undefined) queryParams.set("drinkingAllowed", String(params.drinkingAllowed));
        if (params?.petsAllowed !== undefined) queryParams.set("petsAllowed", String(params.petsAllowed));
        if (params?.preferredDiet) queryParams.set("preferredDiet", params.preferredDiet);
        if (params?.availableBy) queryParams.set("availableBy", params.availableBy);
        if (params?.page !== undefined) queryParams.set("page", String(params.page));
        if (params?.pageSize !== undefined) queryParams.set("pageSize", String(params.pageSize));

        const qs = queryParams.toString();
        return {
          url: `${API_ENDPOINTS.flatmates.search}${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (response: { success: boolean; data: FlatmateSearchResponse }) => response.data,
      providesTags: ["FlatmateListing"],
    }),

    getFlatmateListing: builder.query<FlatmateListing, string>({
      query: (slug) => ({
        url: API_ENDPOINTS.flatmates.detail(slug),
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: FlatmateListing }) => response.data,
      providesTags: (_res, _err, slug) => [{ type: "FlatmateListing", id: slug }],
    }),

    getMyFlatmateListings: builder.query<FlatmateListing[], void>({
      query: () => ({
        url: API_ENDPOINTS.flatmates.myListings,
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: FlatmateListing[] }) => response.data || [],
      providesTags: ["MyFlatmateListings"],
    }),

    getFlatmateProfile: builder.query<FlatmateProfile | null, void>({
      query: () => ({
        url: API_ENDPOINTS.flatmates.myProfile,
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: FlatmateProfile | null }) => response.data,
      providesTags: ["FlatmateProfile"],
    }),

    updateFlatmateProfile: builder.mutation<FlatmateProfile, Partial<FlatmateProfile>>({
      query: (body) => ({
        url: API_ENDPOINTS.flatmates.updateMyProfile,
        method: "PUT",
        body,
      }),
      transformResponse: (response: { success: boolean; data: FlatmateProfile }) => response.data,
      invalidatesTags: ["FlatmateProfile", "MyFlatmateListings", "FlatmateListing"],
    }),

    createFlatmateListing: builder.mutation<FlatmateListing, FlatmateListingInput>({
      query: (body) => ({
        url: API_ENDPOINTS.flatmates.create,
        method: "POST",
        body,
      }),
      transformResponse: (response: { success: boolean; data: FlatmateListing }) => response.data,
      invalidatesTags: ["FlatmateListing", "MyFlatmateListings", "FlatmateProfile"],
    }),

    updateFlatmateListing: builder.mutation<FlatmateListing, { id: number; data: Partial<FlatmateListingInput> }>({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.flatmates.update(id),
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: FlatmateListing }) => response.data,
      invalidatesTags: ["FlatmateListing", "MyFlatmateListings"],
    }),

    archiveFlatmateListing: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: API_ENDPOINTS.flatmates.delete(id),
        method: "DELETE",
      }),
      invalidatesTags: ["FlatmateListing", "MyFlatmateListings"],
    }),

    expressFlatmateInterest: builder.mutation<FlatmateInterest, { listingId: number; message?: string }>({
      query: ({ listingId, message }) => ({
        url: API_ENDPOINTS.flatmates.expressInterest(listingId),
        method: "POST",
        body: { message },
      }),
      transformResponse: (response: { success: boolean; data: FlatmateInterest }) => response.data,
      invalidatesTags: ["FlatmateInterests", "FlatmateListing"],
    }),

    getMyFlatmateInterests: builder.query<FlatmateInterestsResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.flatmates.myInterests,
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: FlatmateInterestsResponse }) => response.data,
      providesTags: ["FlatmateInterests"],
    }),

    updateFlatmateInterestStatus: builder.mutation<FlatmateInterest, { id: number; status: FlatmateInterestStatus }>({
      query: ({ id, status }) => ({
        url: API_ENDPOINTS.flatmates.updateInterestStatus(id),
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: { success: boolean; data: FlatmateInterest }) => response.data,
      invalidatesTags: ["FlatmateInterests"],
    }),
  }),
});

export const {
  useSearchFlatmatesQuery,
  useGetFlatmateListingQuery,
  useGetMyFlatmateListingsQuery,
  useGetFlatmateProfileQuery,
  useUpdateFlatmateProfileMutation,
  useCreateFlatmateListingMutation,
  useUpdateFlatmateListingMutation,
  useArchiveFlatmateListingMutation,
  useExpressFlatmateInterestMutation,
  useGetMyFlatmateInterestsQuery,
  useUpdateFlatmateInterestStatusMutation,
} = flatmatesApi;
