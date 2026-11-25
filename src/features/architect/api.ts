import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";
import type {
  ArchitectInquiryInput,
  ArchitectLead,
  ArchitectProfile,
  ArchitectProject,
  ArchitectSave,
  ArchitectSearchParams,
  ArchitectSearchResponse,
  LeadStatus,
  MyArchitect,
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

export const architectApi = createApi({
  reducerPath: "architectApi",
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 300,
  tagTypes: ["Mine", "Leads", "List"],
  endpoints: (b) => ({
    searchArchitect: b.query<ArchitectSearchResponse, ArchitectSearchParams | void>({
      query: (p) => ({ url: `${API_ENDPOINTS.architect.search}${qs(p || {})}` }),
      transformResponse: unwrap<ArchitectSearchResponse>,
      providesTags: ["List"],
    }),
    architectCities: b.query<{ city: string; count: number }[], void>({
      query: () => ({ url: API_ENDPOINTS.architect.cities }),
      transformResponse: unwrap<{ city: string; count: number }[]>,
    }),
    architectDetail: b.query<ArchitectProfile, string>({
      query: (slug) => ({ url: API_ENDPOINTS.architect.detail(slug) }),
      transformResponse: unwrap<ArchitectProfile>,
    }),
    sendArchitectInquiry: b.mutation<{ id: number }, { id: number; body: ArchitectInquiryInput }>({
      query: ({ id, body }) => ({ url: API_ENDPOINTS.architect.inquiry(id), method: "POST", body }),
      transformResponse: unwrap<{ id: number }>,
    }),
    revealArchitectContact: b.mutation<{ phone: string; whatsapp: string }, number>({
      query: (id) => ({ url: API_ENDPOINTS.architect.contact(id), method: "POST" }),
      transformResponse: unwrap<{ phone: string; whatsapp: string }>,
    }),

    // Owner. An account can run several listings; every call names the listing (`"new"` = create one).
    myArchitectList: b.query<(ArchitectProfile & { readiness: MyArchitect["readiness"] })[], void>({
      query: () => ({ url: API_ENDPOINTS.architect.myList }),
      transformResponse: unwrap<(ArchitectProfile & { readiness: MyArchitect["readiness"] })[]>,
      providesTags: ["Mine"],
    }),
    myArchitect: b.query<MyArchitect, ListingId>({
      query: (id) => ({ url: `${API_ENDPOINTS.architect.me}${pid(id)}` }),
      transformResponse: unwrap<MyArchitect>,
      providesTags: ["Mine"],
    }),
    saveMyArchitect: b.mutation<MyArchitect, { profileId: ListingId; body: ArchitectSave }>({
      query: ({ profileId, body }) => ({ url: `${API_ENDPOINTS.architect.me}${pid(profileId)}`, method: "PUT", body }),
      transformResponse: unwrap<MyArchitect>,
      async onQueryStarted({ profileId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Seed the cache under the real id so moving from "new" to the created listing doesn't reload.
          if (data.profile) dispatch(architectApi.util.upsertQueryData("myArchitect", data.profile.id, data));
          if (profileId !== data.profile?.id) dispatch(architectApi.util.invalidateTags(["Mine"]));
          else dispatch(architectApi.util.updateQueryData("myArchitectList", undefined, (list) => list.map((x) => (x.id === data.profile?.id ? { ...x, ...data.profile, readiness: data.readiness } : x))));
        } catch {
          /* the form shows the error */
        }
      },
    }),
    submitMyArchitect: b.mutation<MyArchitect, number>({
      query: (id) => ({ url: `${API_ENDPOINTS.architect.submit}${pid(id)}`, method: "POST" }),
      transformResponse: unwrap<MyArchitect>,
      invalidatesTags: ["Mine"],
    }),
    setMyArchitectStatus: b.mutation<MyArchitect, { profileId: number; status: "PAUSED" | "PUBLISHED" }>({
      query: ({ profileId, status }) => ({ url: `${API_ENDPOINTS.architect.status}${pid(profileId)}`, method: "POST", body: { status } }),
      transformResponse: unwrap<MyArchitect>,
      invalidatesTags: ["Mine"],
    }),
    saveArchitectProject: b.mutation<ArchitectProject, Partial<ArchitectProject> & { id?: number; profileId: number }>({
      query: ({ id, profileId, ...body }) => ({
        url: `${id ? API_ENDPOINTS.architect.project(id) : API_ENDPOINTS.architect.projects}${pid(profileId)}`,
        method: id ? "PUT" : "POST",
        body,
      }),
      transformResponse: unwrap<ArchitectProject>,
      invalidatesTags: ["Mine"],
    }),
    deleteArchitectProject: b.mutation<void, number>({
      query: (id) => ({ url: API_ENDPOINTS.architect.project(id), method: "DELETE" }),
      invalidatesTags: ["Mine"],
    }),
    myArchitectLeads: b.query<{ items: ArchitectLead[]; unlockCost: number }, number | void>({
      query: (id) => ({ url: `${API_ENDPOINTS.architect.leads}${id ? pid(id) : ""}` }),
      transformResponse: unwrap<{ items: ArchitectLead[]; unlockCost: number }>,
      providesTags: ["Leads"],
    }),
    unlockArchitectLead: b.mutation<ArchitectLead, number>({
      query: (id) => ({ url: API_ENDPOINTS.architect.unlockLead(id), method: "POST" }),
      transformResponse: unwrap<ArchitectLead>,
      invalidatesTags: ["Leads"],
    }),
    updateArchitectLead: b.mutation<ArchitectLead, { id: number; status: LeadStatus; ownerNote?: string | null }>({
      query: ({ id, ...body }) => ({ url: API_ENDPOINTS.architect.lead(id), method: "PATCH", body }),
      transformResponse: unwrap<ArchitectLead>,
      invalidatesTags: ["Leads"],
    }),
  }),
});

export const {
  useSearchArchitectQuery,
  useLazySearchArchitectQuery,
  useArchitectCitiesQuery,
  useArchitectDetailQuery,
  useSendArchitectInquiryMutation,
  useRevealArchitectContactMutation,
  useMyArchitectListQuery,
  useMyArchitectQuery,
  useSaveMyArchitectMutation,
  useSubmitMyArchitectMutation,
  useSetMyArchitectStatusMutation,
  useSaveArchitectProjectMutation,
  useDeleteArchitectProjectMutation,
  useMyArchitectLeadsQuery,
  useUnlockArchitectLeadMutation,
  useUpdateArchitectLeadMutation,
} = architectApi;
