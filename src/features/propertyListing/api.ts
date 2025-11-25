"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";

export const propertyListingApi = createApi({
  reducerPath: "propertyListingApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Property"],
  endpoints: (builder) => ({
    submitProperty: builder.mutation<PropertyListingFormValues, PropertyListingFormValues>({
      query: (body) => ({
        url: "/properties/submit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Property"],
    }),
  }),
});

export const { useSubmitPropertyMutation } = propertyListingApi;
