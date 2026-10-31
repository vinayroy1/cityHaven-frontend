"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";

export interface ApiLead {
  id: number;
  status?: string | null;
  tag?: string | null;
  guestName?: string | null;
  guestContact?: string | null;
  message?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  propertyId?: number | null;
  buyer?: { name?: string | null; mobileNumber?: string | null; email?: string | null } | null;
  assignedTo?: { id?: number; name?: string | null; mobileNumber?: string | null } | null;
  property?: {
    id?: number;
    title?: string | null;
    cityName?: string | null;
    locality?: string | null;
    listingType?: string | null;
    price?: number | string | null;
  } | null;
  visits?: Array<{
    id: number;
    scheduledAt: string;
    status: string;
    notes?: string | null;
  }>;
}

export interface ApiPropertyVisit {
  id: number;
  scheduledAt: string;
  status: string;
  notes?: string | null;
  createdAt?: string;
  propertyId?: number;
  property?: {
    id: number;
    title?: string | null;
    cityName?: string | null;
    locality?: string | null;
    price?: number | string | null;
    media?: Array<{ url: string; order?: number }>;
    owner?: { id: number; name?: string | null; mobileNumber?: string | null };
  };
  buyer?: {
    id: number;
    name?: string | null;
    mobileNumber?: string | null;
    email?: string | null;
  };
  lead?: ApiLead | null;
}

export interface GetAssignedLeadsParams {
  pageSize?: number;
  cursor?: number;
  status?: string;
}

export const leadsApi = createApi({
  reducerPath: "leadsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Leads", "Visits"],
  endpoints: (builder) => ({
    getAssignedLeads: builder.query<ApiLead[], GetAssignedLeadsParams | void>({
      query: (params) => ({
        url: API_ENDPOINTS.leads.assigned,
        method: "GET",
        params: params || {},
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data?.items)) return response.data.items;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.items)) return response.items;
        return [];
      },
      providesTags: ["Leads"],
    }),
    getMyVisits: builder.query<ApiPropertyVisit[], void>({
      query: () => ({
        url: API_ENDPOINTS.leads.visits,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: ["Visits"],
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
    updateVisitStatus: builder.mutation<
      { success: boolean; data?: any },
      { id: number | string; status: string; notes?: string }
    >({
      query: ({ id, status, notes }) => ({
        url: API_ENDPOINTS.leads.visit(id),
        method: "PATCH",
        body: { status, notes },
      }),
      invalidatesTags: ["Visits", "Leads"],
    }),
  }),
});

export const {
  useGetAssignedLeadsQuery,
  useGetMyVisitsQuery,
  useUpdateLeadStatusMutation,
  useUpdateVisitStatusMutation,
} = leadsApi;
