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

/** A listing id, or "new" for the one being created. */
export type ListingId = number | "new";
const pid = (id: ListingId) => `?profileId=${id}`;

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

    // Owner. An account can run several listings; every call names the listing (`"new"` = create one).
    myConstructionList: b.query<(ConstructionProfile & { readiness: MyConstruction["readiness"] })[], void>({
      query: () => ({ url: API_ENDPOINTS.construction.myList }),
      transformResponse: unwrap<(ConstructionProfile & { readiness: MyConstruction["readiness"] })[]>,
      providesTags: ["Mine"],
    }),
    myConstruction: b.query<MyConstruction, ListingId>({
      query: (id) => ({ url: `${API_ENDPOINTS.construction.me}${pid(id)}` }),
      transformResponse: unwrap<MyConstruction>,
      providesTags: ["Mine"],
    }),
    saveMyConstruction: b.mutation<MyConstruction, { profileId: ListingId; body: ConstructionSave }>({
      query: ({ profileId, body }) => ({ url: `${API_ENDPOINTS.construction.me}${pid(profileId)}`, method: "PUT", body }),
      transformResponse: unwrap<MyConstruction>,
      async onQueryStarted({ profileId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Seed the cache under the real id so moving from "new" to the created listing doesn't reload.
          if (data.profile) dispatch(constructionApi.util.upsertQueryData("myConstruction", data.profile.id, data));
          if (profileId !== data.profile?.id) dispatch(constructionApi.util.invalidateTags(["Mine"]));
          else dispatch(constructionApi.util.updateQueryData("myConstructionList", undefined, (list) => list.map((x) => (x.id === data.profile?.id ? { ...x, ...data.profile, readiness: data.readiness } : x))));
        } catch {
          /* the form shows the error */
        }
      },
    }),
    submitMyConstruction: b.mutation<MyConstruction, number>({
      query: (id) => ({ url: `${API_ENDPOINTS.construction.submit}${pid(id)}`, method: "POST" }),
      transformResponse: unwrap<MyConstruction>,
      invalidatesTags: ["Mine"],
    }),
    setMyConstructionStatus: b.mutation<MyConstruction, { profileId: number; status: "PAUSED" | "PUBLISHED" }>({
      query: ({ profileId, status }) => ({ url: `${API_ENDPOINTS.construction.status}${pid(profileId)}`, method: "POST", body: { status } }),
      transformResponse: unwrap<MyConstruction>,
      invalidatesTags: ["Mine"],
    }),
    saveConstructionProject: b.mutation<ConstructionProject, Partial<ConstructionProject> & { id?: number; profileId: number }>({
      query: ({ id, profileId, ...body }) => ({
        url: `${id ? API_ENDPOINTS.construction.project(id) : API_ENDPOINTS.construction.projects}${pid(profileId)}`,
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
    myConstructionLeads: b.query<{ items: ConstructionLead[]; unlockCost: number }, number | void>({
      query: (id) => ({ url: `${API_ENDPOINTS.construction.leads}${id ? pid(id) : ""}` }),
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
  useMyConstructionListQuery,
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
