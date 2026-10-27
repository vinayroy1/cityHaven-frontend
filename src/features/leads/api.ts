"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";

export interface ApiLead {
  id: number;
  status?: string | null;
  guestName?: string | null;
  guestContact?: string | null;
  message?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  propertyId?: number | null;
  buyer?: { name?: string | null; mobileNumber?: string | null } | null;
  property?: {
    id?: number;
    title?: string | null;
    cityName?: string | null;
    locality?: string | null;
    listingType?: string | null;
    price?: number | string | null;
  } | null;
}

export interface GetAssignedLeadsParams {
  pageSize?: number;
  cursor?: number;
  status?: string;
}

export const leadsApi = createApi({
  reducerPath: "leadsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Leads"],
  endpoints: (builder) => ({
    getAssignedLeads: builder.query<ApiLead[], GetAssignedLeadsParams | void>({
      query: (params) => ({
        url: API_ENDPOINTS.leads.assigned,
        method: "GET",
        params: params || {},
      }),
      transformResponse: (response: { items?: ApiLead[]; data?: ApiLead[] } | ApiLead[]) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.items)) return response.items;
        return [];
      },
      providesTags: ["Leads"],
    }),
    updateLeadStatus: builder.mutation<
      { success: boolean; data?: any },
      { id: number | string; status: string }
    >({
      query: ({ id, status }) => ({
        url: API_ENDPOINTS.leads.status(id),
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Leads"],
    }),
  }),
});

export const { useGetAssignedLeadsQuery, useUpdateLeadStatusMutation } = leadsApi;
