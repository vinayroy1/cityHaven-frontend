"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";
import type { PropertySearchParams, PropertySearchResponse } from "@/types/propertySearch.types";
import { mapFormToApiPayload } from "./mapper";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";

export const propertyListingApi = createApi({
  reducerPath: "propertyListingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Property"],
  endpoints: (builder) => ({
    submitProperty: builder.mutation<{ id?: number }, PropertyListingFormValues>({
      query: (formValues) => ({
        url: API_ENDPOINTS.propertyListing.create,
        method: "POST",
        body: mapFormToApiPayload(formValues),
      }),
      invalidatesTags: ["Property"],
    }),
    searchProperties: builder.query<PropertySearchResponse, PropertySearchParams>({
      query: (params) => ({
        url: API_ENDPOINTS.propertyListing.search,
        method: "GET",
        params,
      }),
      transformResponse: (response: { data?: PropertySearchResponse }) => response.data as PropertySearchResponse,
      providesTags: ["Property"],
    }),
  }),
});

export const { useSubmitPropertyMutation, useSearchPropertiesQuery, useLazySearchPropertiesQuery } = propertyListingApi;
