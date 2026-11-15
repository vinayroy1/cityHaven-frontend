import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";
import type { MyPandit, PanditInquiryInput, PanditLead, PanditLeadStatus, PanditProfile, PanditReview, PanditSave, PanditSearchParams, PanditSearchResponse, Readiness } from "./types";

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

export type MyPanditListItem = PanditProfile & { readiness: Readiness };

export const panditApi = createApi({
  reducerPath: "panditApi",
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 300,
  tagTypes: ["Mine", "Leads", "Reviews", "MyReview"],
  endpoints: (b) => ({
    searchPandits: b.query<PanditSearchResponse, PanditSearchParams | void>({
      query: (p) => ({ url: `${API_ENDPOINTS.pandits.search}${qs(p || {})}` }),
      transformResponse: unwrap<PanditSearchResponse>,
    }),
    sendPanditInquiry: b.mutation<{ id: number }, { id: number; body: PanditInquiryInput }>({
      query: ({ id, body }) => ({ url: API_ENDPOINTS.pandits.inquiry(id), method: "POST", body }),
      transformResponse: unwrap<{ id: number }>,
      invalidatesTags: ["MyReview"],
    }),
    revealPanditContact: b.mutation<{ phone: string; whatsapp: string }, number>({
      query: (id) => ({ url: API_ENDPOINTS.pandits.contact(id), method: "POST" }),
      transformResponse: unwrap<{ phone: string; whatsapp: string }>,
      invalidatesTags: ["MyReview"],
    }),
    myPanditReview: b.query<{ canReview: boolean; isOwner: boolean; review: PanditReview | null }, number>({
      query: (id) => ({ url: API_ENDPOINTS.pandits.myReview(id) }),
      transformResponse: unwrap<{ canReview: boolean; isOwner: boolean; review: PanditReview | null }>,
      providesTags: ["MyReview"],
    }),
    savePanditReview: b.mutation<PanditReview, { id: number; rating: number; service?: string | null; comment?: string }>({
      query: ({ id, ...body }) => ({ url: API_ENDPOINTS.pandits.review(id), method: "PUT", body }),
      transformResponse: unwrap<PanditReview>,
      invalidatesTags: ["MyReview"],
    }),
    deletePanditReview: b.mutation<void, number>({
      query: (id) => ({ url: API_ENDPOINTS.pandits.review(id), method: "DELETE" }),
      invalidatesTags: ["MyReview"],
    }),

    // Owner
    myPanditList: b.query<MyPanditListItem[], void>({
      query: () => ({ url: API_ENDPOINTS.pandits.myList }),
      transformResponse: unwrap<MyPanditListItem[]>,
      providesTags: ["Mine"],
    }),
    myPandit: b.query<MyPandit, ListingId>({
      query: (id) => ({ url: `${API_ENDPOINTS.pandits.me}${pid(id)}` }),
      transformResponse: unwrap<MyPandit>,
      providesTags: ["Mine"],
    }),
    saveMyPandit: b.mutation<MyPandit, { profileId: ListingId; body: PanditSave }>({
      query: ({ profileId, body }) => ({ url: `${API_ENDPOINTS.pandits.me}${pid(profileId)}`, method: "PUT", body }),
      transformResponse: unwrap<MyPandit>,
      async onQueryStarted({ profileId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.profile) dispatch(panditApi.util.upsertQueryData("myPandit", data.profile.id, data));
          if (profileId !== data.profile?.id) dispatch(panditApi.util.invalidateTags(["Mine"]));
          else
            dispatch(
              panditApi.util.updateQueryData("myPanditList", undefined, (list) =>
                list.map((x) => (x.id === data.profile?.id ? { ...x, ...data.profile, readiness: data.readiness } : x)),
              ),
            );
        } catch {
          /* the form shows the error */
        }
      },
    }),
    submitMyPandit: b.mutation<MyPandit, number>({
      query: (id) => ({ url: `${API_ENDPOINTS.pandits.submit}${pid(id)}`, method: "POST" }),
      transformResponse: unwrap<MyPandit>,
      invalidatesTags: ["Mine"],
    }),
    setMyPanditStatus: b.mutation<MyPandit, { profileId: number; status: "PAUSED" | "PUBLISHED" }>({
      query: ({ profileId, status }) => ({ url: `${API_ENDPOINTS.pandits.status}${pid(profileId)}`, method: "POST", body: { status } }),
      transformResponse: unwrap<MyPandit>,
      invalidatesTags: ["Mine"],
    }),
    myPanditLeads: b.query<{ items: PanditLead[]; unlockCost: number }, number>({
      query: (id) => ({ url: `${API_ENDPOINTS.pandits.leads}${pid(id)}` }),
      transformResponse: unwrap<{ items: PanditLead[]; unlockCost: number }>,
      providesTags: ["Leads"],
    }),
    unlockPanditLead: b.mutation<PanditLead, number>({
      query: (id) => ({ url: API_ENDPOINTS.pandits.unlockLead(id), method: "POST" }),
      transformResponse: unwrap<PanditLead>,
      invalidatesTags: ["Leads"],
    }),
    updatePanditLead: b.mutation<PanditLead, { id: number; status: PanditLeadStatus; ownerNote?: string | null }>({
      query: ({ id, ...body }) => ({ url: API_ENDPOINTS.pandits.lead(id), method: "PATCH", body }),
      transformResponse: unwrap<PanditLead>,
      invalidatesTags: ["Leads"],
    }),
    myPanditReviews: b.query<PanditReview[], number>({
      query: (id) => ({ url: `${API_ENDPOINTS.pandits.myReviews}${pid(id)}` }),
      transformResponse: unwrap<PanditReview[]>,
      providesTags: ["Reviews"],
    }),
    replyPanditReview: b.mutation<PanditReview, { id: number; reply: string }>({
      query: ({ id, reply }) => ({ url: API_ENDPOINTS.pandits.replyReview(id), method: "PATCH", body: { reply } }),
      transformResponse: unwrap<PanditReview>,
      invalidatesTags: ["Reviews"],
    }),
  }),
});

export const {
  useSearchPanditsQuery,
  useLazySearchPanditsQuery,
  useSendPanditInquiryMutation,
  useRevealPanditContactMutation,
  useMyPanditReviewQuery,
  useSavePanditReviewMutation,
  useDeletePanditReviewMutation,
  useMyPanditListQuery,
  useMyPanditQuery,
  useSaveMyPanditMutation,
  useSubmitMyPanditMutation,
  useSetMyPanditStatusMutation,
  useMyPanditLeadsQuery,
  useUnlockPanditLeadMutation,
  useUpdatePanditLeadMutation,
  useMyPanditReviewsQuery,
  useReplyPanditReviewMutation,
} = panditApi;
