"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";
import type { CityItem } from "@/components/search/CitySelectorDropdown";

export interface GetCitiesParams {
  popular?: boolean;
  search?: string;
  limit?: number;
}

export interface CitiesApiResponse {
  success: boolean;
  data: CityItem[];
  count?: number;
}

export const locationsApi = createApi({
  reducerPath: "locationsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Cities"],
  keepUnusedDataFor: 300, // Cache for 5 minutes
  endpoints: (builder) => ({
    getCities: builder.query<CityItem[], GetCitiesParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.popular !== undefined) queryParams.set("popular", String(params.popular));
        if (params?.search) queryParams.set("search", params.search);
        if (params?.limit) queryParams.set("limit", String(params.limit));
        const qs = queryParams.toString();
        return `${API_ENDPOINTS.locations.cities}${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: CitiesApiResponse) => response.data || [],
      providesTags: ["Cities"],
    }),
  }),
});

export const { useGetCitiesQuery, useLazyGetCitiesQuery } = locationsApi;
