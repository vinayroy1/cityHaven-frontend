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
    updateProperty: builder.mutation<{ id?: number }, { id: number | string; formValues: PropertyListingFormValues }>({
      query: ({ id, formValues }) => ({
        url: API_ENDPOINTS.propertyListing.update(id),
        method: "PUT",
        body: mapFormToApiPayload(formValues),
      }),
      invalidatesTags: (_result, _err, args) => [{ type: "Property", id: args.id }, "Property"],
    }),
    getProperty: builder.query<any, number | string>({
      query: (id) => ({
        url: API_ENDPOINTS.propertyListing.update(id),
        method: "GET",
      }),
      transformResponse: (response: { data?: any }) => response.data,
      providesTags: (_res, _err, id) => [{ type: "Property", id }],
    }),
    deleteProperty: builder.mutation<{ success: boolean }, number | string>({
      query: (id) => ({
        url: API_ENDPOINTS.propertyListing.update(id),
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [{ type: "Property", id }, "Property"],
    }),
    myProperties: builder.query<any, void>({
      query: () => ({
        url: API_ENDPOINTS.propertyListing.my,
        method: "GET",
      }),
      transformResponse: (response: { data?: any }) => response.data ?? [],
      providesTags: ["Property"],
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

export const {
  useSubmitPropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetPropertyQuery,
  useMyPropertiesQuery,
  useSearchPropertiesQuery,
  useLazySearchPropertiesQuery,
} = propertyListingApi;
