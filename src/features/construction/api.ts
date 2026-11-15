import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";
import type {
  ConstructionInquiryInput,
  ConstructionLead,
  ConstructionProfile,
  ConstructionProject,
  ConstructionSave,
  ConstructionSearchParams,
  ConstructionSearchResponse,
  LeadStatus,
  MyConstruction,
} from "./types";

type Envelope<T> = { success: boolean; data: T; message?: string };
const unwrap = <T,>(r: Envelope<T>) => r.data;

const qs = (params?: object) => {
  const q = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
};

export const constructionApi = createApi({
  reducerPath: "constructionApi",
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 300,
  tagTypes: ["Mine", "Leads", "List"],
  endpoints: (b) => ({
    searchConstruction: b.query<ConstructionSearchResponse, ConstructionSearchParams | void>({
      query: (p) => ({ url: `${API_ENDPOINTS.construction.search}${qs(p || {})}` }),
      transformResponse: unwrap<ConstructionSearchResponse>,
      providesTags: ["List"],
    }),
    constructionCities: b.query<{ city: string; count: number }[], void>({
      query: () => ({ url: API_ENDPOINTS.construction.cities }),
      transformResponse: unwrap<{ city: string; count: number }[]>,
    }),
    constructionDetail: b.query<ConstructionProfile, string>({
      query: (slug) => ({ url: API_ENDPOINTS.construction.detail(slug) }),
      transformResponse: unwrap<ConstructionProfile>,
    }),
    sendConstructionInquiry: b.mutation<{ id: number }, { id: number; body: ConstructionInquiryInput }>({
      query: ({ id, body }) => ({ url: API_ENDPOINTS.construction.inquiry(id), method: "POST", body }),
      transformResponse: unwrap<{ id: number }>,
    }),
    revealConstructionContact: b.mutation<{ phone: string; whatsapp: string }, number>({
      query: (id) => ({ url: API_ENDPOINTS.construction.contact(id), method: "POST" }),
      transformResponse: unwrap<{ phone: string; whatsapp: string }>,
    }),

    // Owner
    myConstruction: b.query<MyConstruction, void>({
      query: () => ({ url: API_ENDPOINTS.construction.me }),
      transformResponse: unwrap<MyConstruction>,
      providesTags: ["Mine"],
    }),
    saveMyConstruction: b.mutation<MyConstruction, ConstructionSave>({
      query: (body) => ({ url: API_ENDPOINTS.construction.me, method: "PUT", body }),
      transformResponse: unwrap<MyConstruction>,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(constructionApi.util.updateQueryData("myConstruction", undefined, () => data));
        } catch {
          /* the form shows the error */
        }
      },
    }),
    submitMyConstruction: b.mutation<MyConstruction, void>({
      query: () => ({ url: API_ENDPOINTS.construction.submit, method: "POST" }),
      transformResponse: unwrap<MyConstruction>,
      invalidatesTags: ["Mine"],
    }),
    setMyConstructionStatus: b.mutation<MyConstruction, "PAUSED" | "PUBLISHED">({
      query: (status) => ({ url: API_ENDPOINTS.construction.status, method: "POST", body: { status } }),
      transformResponse: unwrap<MyConstruction>,
      invalidatesTags: ["Mine"],
    }),
    saveConstructionProject: b.mutation<ConstructionProject, Partial<ConstructionProject> & { id?: number }>({
      query: ({ id, ...body }) => ({
        url: id ? API_ENDPOINTS.construction.project(id) : API_ENDPOINTS.construction.projects,
        method: id ? "PUT" : "POST",
        body,
      }),
      transformResponse: unwrap<ConstructionProject>,
      invalidatesTags: ["Mine"],
    }),
    deleteConstructionProject: b.mutation<void, number>({
      query: (id) => ({ url: API_ENDPOINTS.construction.project(id), method: "DELETE" }),
      invalidatesTags: ["Mine"],
    }),
    myConstructionLeads: b.query<{ items: ConstructionLead[]; unlockCost: number }, void>({
      query: () => ({ url: API_ENDPOINTS.construction.leads }),
      transformResponse: unwrap<{ items: ConstructionLead[]; unlockCost: number }>,
      providesTags: ["Leads"],
    }),
    unlockConstructionLead: b.mutation<ConstructionLead, number>({
      query: (id) => ({ url: API_ENDPOINTS.construction.unlockLead(id), method: "POST" }),
      transformResponse: unwrap<ConstructionLead>,
      invalidatesTags: ["Leads"],
    }),
    updateConstructionLead: b.mutation<ConstructionLead, { id: number; status: LeadStatus; ownerNote?: string | null }>({
      query: ({ id, ...body }) => ({ url: API_ENDPOINTS.construction.lead(id), method: "PATCH", body }),
      transformResponse: unwrap<ConstructionLead>,
      invalidatesTags: ["Leads"],
    }),
  }),
});

export const {
  useSearchConstructionQuery,
  useLazySearchConstructionQuery,
  useConstructionCitiesQuery,
  useConstructionDetailQuery,
  useSendConstructionInquiryMutation,
  useRevealConstructionContactMutation,
  useMyConstructionQuery,
  useSaveMyConstructionMutation,
  useSubmitMyConstructionMutation,
  useSetMyConstructionStatusMutation,
  useSaveConstructionProjectMutation,
  useDeleteConstructionProjectMutation,
  useMyConstructionLeadsQuery,
  useUnlockConstructionLeadMutation,
  useUpdateConstructionLeadMutation,
} = constructionApi;
