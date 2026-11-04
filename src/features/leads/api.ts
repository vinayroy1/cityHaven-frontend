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
  ownerNote?: string | null;
  followUpAt?: string | null;
  firstRespondedAt?: string | null;
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

/** "Needs action" counts across property, flatmate and interior leads (dashboard badges). */
export interface LeadInboxSummary {
  property: number;
  upcomingVisits: number;
  flatmate: number;
  interior: number;
  total: number;
  followUpsDue?: number;
}

export type InboxLeadKind = "property" | "flatmate" | "interior";

export interface ResponseStats {
  responded: number;
  total: number;
  rate: number;
  medianMinutes: number | null;
  label: string | null;
}

export const leadsApi = createApi({
  reducerPath: "leadsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Leads", "Visits", "LeadSummary", "ResponseStats"],
  endpoints: (builder) => ({
    getLeadInboxSummary: builder.query<LeadInboxSummary, void>({
      query: () => ({ url: API_ENDPOINTS.leads.inboxSummary, method: "GET" }),
      transformResponse: (response: { data: LeadInboxSummary }) => response.data,
      providesTags: ["LeadSummary"],
    }),
    getMyResponseStats: builder.query<ResponseStats, void>({
      query: () => ({ url: API_ENDPOINTS.leads.responseStats, method: "GET" }),
      transformResponse: (response: { data: ResponseStats }) => response.data,
      providesTags: ["ResponseStats"],
    }),
    /** Owner tapped Call/WhatsApp: counts as a reply. */
    touchInboxLead: builder.mutation<unknown, { kind: InboxLeadKind; id: number }>({
      query: ({ kind, id }) => ({ url: API_ENDPOINTS.leads.inboxTouch(kind, id), method: "POST" }),
      invalidatesTags: ["LeadSummary", "ResponseStats"],
    }),
    updateInboxLeadMeta: builder.mutation<
      { id: number; ownerNote: string | null; followUpAt: string | null },
      { kind: InboxLeadKind; id: number; ownerNote?: string | null; followUpAt?: string | null }
    >({
      query: ({ kind, id, ...body }) => ({ url: API_ENDPOINTS.leads.inboxMeta(kind, id), method: "PATCH", body }),
      transformResponse: (response: { data: { id: number; ownerNote: string | null; followUpAt: string | null } }) => response.data,
      invalidatesTags: ["LeadSummary"],
    }),
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
      invalidatesTags: ["Leads", "LeadSummary", "ResponseStats"],
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
      invalidatesTags: ["Visits", "Leads", "LeadSummary"],
    }),
  }),
});

export const {
  useGetAssignedLeadsQuery,
  useGetLeadInboxSummaryQuery,
  useGetMyResponseStatsQuery,
  useTouchInboxLeadMutation,
  useUpdateInboxLeadMetaMutation,
  useGetMyVisitsQuery,
  useUpdateLeadStatusMutation,
  useUpdateVisitStatusMutation,
} = leadsApi;
