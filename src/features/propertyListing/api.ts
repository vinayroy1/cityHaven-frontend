"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { APP_CONFIG } from "@/constants/app-config";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";
import { mapFormToApiPayload } from "./mapper";

export const propertyListingApi = createApi({
  reducerPath: "propertyListingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${APP_CONFIG.API.BASE_URL}/v1`,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
        if (token) headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
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
  }),
});

export const { useSubmitPropertyMutation } = propertyListingApi;
