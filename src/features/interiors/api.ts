"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { baseQueryWithReauth } from "@/lib/api/baseQueryWithReauth";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type {
  CredentialDocType,
  CredentialDocument,
  InteriorBranch,
  InteriorInquiry,
  InteriorPackage,
  InteriorProfile,
  InteriorProject,
  InteriorSearchParams,
  InteriorSearchResponse,
  InteriorTeamMember,
  InteriorWizardSection,
  ReadinessReport,
  InteriorBilling,
  InteriorBoostOption,
} from "@/types/interior.types";

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

/** Error envelope (CONTRACT.md §5). `fieldErrors` keys are wizard form paths. */
export type InteriorApiError = { success: false; message?: string; fieldErrors?: Record<string, string> };

export type InteriorStatusAction = "PAUSED" | "TEMP_UNAVAILABLE" | "ARCHIVED" | "PUBLISHED";

export type InteriorInquiriesResponse = {
  items: InteriorInquiry[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type PatchSectionArgs = {
  section: InteriorWizardSection;
  data: Partial<InteriorProfile>;
  wizardStep?: number;
};

/**
 * The listing the owner is currently editing/managing. A user can own several interior
 * listings; every `/interiors/me/*` call is scoped to this one via `?profileId=` so actions
 * (save, publish, pause, billing…) never land on a different listing.
 * Set by the wizard and the manage area from the `profileId` in the URL.
 */
let activeInteriorProfileId: number | undefined;
export function setActiveInteriorProfileId(id: number | null | undefined) {
  activeInteriorProfileId = id && Number.isInteger(id) && id > 0 ? id : undefined;
}

type BaseQueryArgs = Parameters<typeof baseQueryWithReauth>[0];
const scopeToActiveProfile = (args: BaseQueryArgs): BaseQueryArgs => {
  if (!activeInteriorProfileId) return args;
  const url = typeof args === "string" ? args : args.url;
  // /me/listings lists or creates listings, so it is never scoped to one.
  if (!/\/interiors\/me(\/|\?|$)/.test(url) || /\/interiors\/me\/listings/.test(url) || /[?&]profileId=/.test(url)) return args;
  const scoped = `${url}${url.includes("?") ? "&" : "?"}profileId=${activeInteriorProfileId}`;
  return typeof args === "string" ? scoped : { ...args, url: scoped };
};
const interiorBaseQuery: typeof baseQueryWithReauth = (args, api, extra) => baseQueryWithReauth(scopeToActiveProfile(args), api, extra);

/** Set once PATCH /sections returns 404 — later saves go straight to the legacy endpoint. */
let sectionPatchUnsupported = false;
/** test hook */
export const __resetSectionPatchFallback = () => {
  sectionPatchUnsupported = false;
};

/** Pull `{ message, fieldErrors }` out of an RTK Query error for UI / form.setError. */
export function parseInteriorApiError(err: unknown): { status?: number | string; message: string; fieldErrors: Record<string, string> } {
  const e = err as { status?: number | string; data?: Partial<InteriorApiError> & { error?: string } } | undefined;
  const data = e?.data && typeof e.data === "object" ? e.data : undefined;
  return {
    status: e?.status,
    message: data?.message || data?.error || (e as { message?: string } | undefined)?.message || "Something went wrong. Please try again.",
    fieldErrors: data?.fieldErrors ?? {},
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const readCachedMyProfile = (state: any): InteriorProfile | null => {
  const q = state?.interiorsApi?.queries?.["getMyInteriorProfile(undefined)"];
  return (q?.data as InteriorProfile | null | undefined) ?? null;
};

const unwrap = <T,>(r: { data?: unknown }) => (r.data as ApiEnvelope<T>)?.data;

const queryString = (params?: InteriorSearchParams) => {
  const query = new URLSearchParams();
  if (!params) return "";
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
};

export const interiorsApi = createApi({
  reducerPath: "interiorsApi",
  baseQuery: interiorBaseQuery,
  keepUnusedDataFor: 300, // 5 minutes cache retention
  tagTypes: [
    "InteriorProfile",
    "InteriorList",
    "InteriorProjects",
    "InteriorInquiries",
    "InteriorReadiness",
    "InteriorBranch",
    "InteriorPackage",
    "InteriorProject",
    "InteriorTeam",
    "InteriorDocs",
    "InteriorInquiry",
    "InteriorBilling",
  ],
  endpoints: (builder) => ({
    searchInteriorDesigners: builder.query<InteriorSearchResponse, InteriorSearchParams | void>({
      query: (params) => {
        const qs = queryString(params || undefined);
        return {
          url: `${API_ENDPOINTS.interiors.search}${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (response: ApiEnvelope<InteriorSearchResponse>) => response.data,
      providesTags: ["InteriorList"],
    }),

    getInteriorProfileDetail: builder.query<InteriorProfile, string | number>({
      query: (slugOrId) => ({
        url: API_ENDPOINTS.interiors.detail(slugOrId),
        method: "GET",
      }),
      transformResponse: (response: ApiEnvelope<InteriorProfile>) => response.data,
      providesTags: (_res, _err, slugOrId) => [{ type: "InteriorProfile", id: slugOrId }],
    }),

    getMyInteriorListings: builder.query<InteriorProfile[], void>({
      query: () => ({
        url: API_ENDPOINTS.interiors.myListings,
        method: "GET",
      }),
      transformResponse: (response: ApiEnvelope<InteriorProfile[]>) => response.data || [],
      providesTags: ["InteriorList", "InteriorProfile"],
    }),

    createInteriorListing: builder.mutation<InteriorProfile, Partial<InteriorProfile>>({
      query: (body) => ({
        url: API_ENDPOINTS.interiors.createListing,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiEnvelope<InteriorProfile>) => response.data,
      invalidatesTags: ["InteriorList", "InteriorProfile"],
    }),

    getMyInteriorProfile: builder.query<InteriorProfile | null, number | void>({
      query: (profileId) => ({
        url: profileId ? `${API_ENDPOINTS.interiors.me}?profileId=${profileId}` : API_ENDPOINTS.interiors.me,
        method: "GET",
      }),
      transformResponse: (response: ApiEnvelope<InteriorProfile | null>) => response.data,
      providesTags: (_res, _err, profileId) => (profileId ? [{ type: "InteriorProfile", id: profileId }] : ["InteriorProfile"]),
    }),

    saveMyInteriorProfile: builder.mutation<InteriorProfile, Partial<InteriorProfile>>({
      query: (body) => ({
        url: API_ENDPOINTS.interiors.saveMe,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiEnvelope<InteriorProfile>) => response.data,
      invalidatesTags: ["InteriorProfile", "InteriorList"],
    }),

    publishMyInteriorProfile: builder.mutation<InteriorProfile, void>({
      query: () => ({
        url: API_ENDPOINTS.interiors.publishMe,
        method: "POST",
      }),
      transformResponse: (response: ApiEnvelope<InteriorProfile>) => response.data,
      invalidatesTags: ["InteriorProfile", "InteriorList", "InteriorReadiness", "InteriorBilling"],
    }),

    addCompanyBranch: builder.mutation<InteriorBranch, Partial<InteriorBranch>>({
      query: (body) => ({
        url: API_ENDPOINTS.interiors.branches,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiEnvelope<InteriorBranch>) => response.data,
      invalidatesTags: ["InteriorProfile", "InteriorBranch", "InteriorReadiness"],
    }),

    saveInteriorPackage: builder.mutation<InteriorPackage, { id?: number; data: Partial<InteriorPackage> }>({
      query: ({ id, data }) => ({
        url: id ? API_ENDPOINTS.interiors.packageDetail(id) : API_ENDPOINTS.interiors.packages,
        method: id ? "PUT" : "POST",
        body: data,
      }),
      transformResponse: (response: ApiEnvelope<InteriorPackage>) => response.data,
      invalidatesTags: ["InteriorProfile", "InteriorPackage", "InteriorReadiness"],
    }),

    savePortfolioProject: builder.mutation<InteriorProject, { id?: number; data: Partial<InteriorProject> }>({
      query: ({ id, data }) => ({
        url: id ? API_ENDPOINTS.interiors.projectDetail(id) : API_ENDPOINTS.interiors.projects,
        method: id ? "PUT" : "POST",
        body: data,
      }),
      transformResponse: (response: ApiEnvelope<InteriorProject>) => response.data,
      invalidatesTags: ["InteriorProfile", "InteriorProjects", "InteriorProject", "InteriorReadiness", "InteriorList"],
    }),

    submitInteriorInquiry: builder.mutation<void, { profileId: number | string; data: Partial<InteriorInquiry> }>({
      query: ({ profileId, data }) => ({
        url: API_ENDPOINTS.interiors.submitInquiry(profileId),
        method: "POST",
        body: data,
      }),
    }),

    revealInteriorContact: builder.mutation<InteriorRevealedContact, number | string>({
      query: (profileId) => ({ url: API_ENDPOINTS.interiors.revealContact(profileId), method: "POST" }),
      transformResponse: (response: ApiEnvelope<InteriorRevealedContact>) => response.data,
    }),

    updateInteriorInquiryStatus: builder.mutation<InteriorInquiry, { id: number; status: InteriorInquiry["status"] }>({
      query: ({ id, status }) => ({ url: API_ENDPOINTS.interiors.inquiryStatus(id), method: "PATCH", body: { status } }),
      transformResponse: (response: ApiEnvelope<InteriorInquiry>) => response.data,
      invalidatesTags: ["InteriorInquiries"],
    }),

    unlockInteriorInquiry: builder.mutation<InteriorInquiry, number | string>({
      query: (inquiryId) => ({
        url: API_ENDPOINTS.interiors.unlockInquiry(inquiryId),
        method: "POST",
      }),
      transformResponse: (response: ApiEnvelope<InteriorInquiry>) => response.data,
      invalidatesTags: ["InteriorProfile", "InteriorInquiries"],
    }),

    // ======================= v2 wizard / manage =======================

    patchMyInteriorSection: builder.mutation<InteriorProfile, PatchSectionArgs>({
      async queryFn({ section, data, wizardStep }, api, _extra, baseQuery) {
        const body = wizardStep !== undefined ? { data, wizardStep } : { data };
        if (!sectionPatchUnsupported) {
          const res = await baseQuery({ url: API_ENDPOINTS.interiors.section(section), method: "PATCH", body });
          if (!res.error) return { data: unwrap<InteriorProfile>(res) };
          if ((res.error as FetchBaseQueryError).status !== 404) return { error: res.error as FetchBaseQueryError };
          sectionPatchUnsupported = true;
        }
        // Fallback: legacy full save with the cached profile merged with this section.
        const cached = readCachedMyProfile(api.getState());
        const merged: Partial<InteriorProfile> = { ...(cached ?? {}), ...data };
        if (wizardStep !== undefined) merged.wizardStep = wizardStep;
        // never echo nested relations / server-controlled data back
        for (const k of ["branches", "packages", "projects", "teamMembers", "inquiries", "credentials", "_count"] as const) {
          delete (merged as Record<string, unknown>)[k];
        }
        const res = await baseQuery({ url: API_ENDPOINTS.interiors.saveMe, method: "POST", body: merged });
        if (res.error) return { error: res.error as FetchBaseQueryError };
        return { data: unwrap<InteriorProfile>(res) };
      },
      async onQueryStarted({ data, wizardStep }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          interiorsApi.util.updateQueryData("getMyInteriorProfile", undefined, (draft) => {
            if (!draft) return;
            Object.assign(draft, data);
            if (wizardStep !== undefined) draft.wizardStep = wizardStep;
          }),
        );
        try {
          const { data: saved } = await queryFulfilled;
          if (saved) {
            dispatch(
              interiorsApi.util.updateQueryData("getMyInteriorProfile", undefined, (draft) => {
                // keep relations the section endpoint may not return
                if (!draft) return saved;
                Object.assign(draft, { ...saved, branches: saved.branches ?? draft.branches, packages: saved.packages ?? draft.packages, projects: saved.projects ?? draft.projects, teamMembers: saved.teamMembers ?? draft.teamMembers, credentials: saved.credentials ?? draft.credentials });
              }),
            );
          }
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_r, err) => (err ? [] : ["InteriorReadiness"]),
    }),

    getMyInteriorReadiness: builder.query<ReadinessReport, void>({
      query: () => ({ url: API_ENDPOINTS.interiors.readiness, method: "GET" }),
      transformResponse: (response: ApiEnvelope<ReadinessReport>) => response.data,
      providesTags: ["InteriorReadiness"],
    }),

    submitMyInteriorProfile: builder.mutation<InteriorProfile, void>({
      query: () => ({ url: API_ENDPOINTS.interiors.submitMe, method: "POST", body: {} }),
      transformResponse: (response: ApiEnvelope<InteriorProfile>) => response.data,
      invalidatesTags: ["InteriorProfile", "InteriorReadiness"],
    }),

    getMyInteriorBilling: builder.query<InteriorBilling, void>({
      query: () => API_ENDPOINTS.interiors.billingMe,
      transformResponse: (response: ApiEnvelope<InteriorBilling>) => response.data,
      providesTags: ["InteriorBilling"],
    }),

    /** Buys a boost for one listing (credits from the owner's wallet). */
    boostInteriorListing: builder.mutation<unknown, { profileId: number; actionKey: InteriorBoostOption["key"] }>({
      query: ({ profileId, actionKey }) => ({
        url: API_ENDPOINTS.billing.promotions,
        method: "POST",
        body: { actionKey, targetType: "INTERIOR", targetId: profileId },
      }),
      invalidatesTags: ["InteriorBilling", "InteriorProfile", "InteriorList"],
    }),

    updateMyInteriorStatus: builder.mutation<
      InteriorProfile,
      { status: InteriorStatusAction; until?: string | null; reason?: string }
    >({
      query: (body) => ({ url: API_ENDPOINTS.interiors.statusMe, method: "POST", body }),
      transformResponse: (response: ApiEnvelope<InteriorProfile>) => response.data,
      invalidatesTags: ["InteriorProfile", "InteriorList", "InteriorReadiness", "InteriorBilling"],
    }),

    updateCompanyBranch: builder.mutation<InteriorBranch, { id: number; data: Partial<InteriorBranch> }>({
      query: ({ id, data }) => ({ url: API_ENDPOINTS.interiors.branchDetail(id), method: "PUT", body: data }),
      transformResponse: (response: ApiEnvelope<InteriorBranch>) => response.data,
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          interiorsApi.util.updateQueryData("getMyInteriorProfile", undefined, (draft) => {
            const b = draft?.branches?.find((x) => x.id === id);
            if (b) Object.assign(b, data);
          }),
        );
        queryFulfilled.catch(() => patch.undo());
      },
      invalidatesTags: ["InteriorBranch", "InteriorReadiness"],
    }),

    deleteCompanyBranch: builder.mutation<{ id: number }, number>({
      query: (id) => ({ url: API_ENDPOINTS.interiors.branchDetail(id), method: "DELETE" }),
      transformResponse: (response: ApiEnvelope<{ id: number }>) => response.data,
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          interiorsApi.util.updateQueryData("getMyInteriorProfile", undefined, (draft) => {
            if (draft?.branches) draft.branches = draft.branches.filter((x) => x.id !== id);
          }),
        );
        queryFulfilled.catch(() => patch.undo());
      },
      invalidatesTags: ["InteriorBranch", "InteriorReadiness"],
    }),

    deleteInteriorPackage: builder.mutation<{ id: number }, number>({
      query: (id) => ({ url: API_ENDPOINTS.interiors.packageDetail(id), method: "DELETE" }),
      transformResponse: (response: ApiEnvelope<{ id: number }>) => response.data,
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          interiorsApi.util.updateQueryData("getMyInteriorProfile", undefined, (draft) => {
            if (draft?.packages) draft.packages = draft.packages.filter((x) => x.id !== id);
          }),
        );
        queryFulfilled.catch(() => patch.undo());
      },
      invalidatesTags: ["InteriorPackage", "InteriorReadiness"],
    }),

    reorderInteriorPackages: builder.mutation<InteriorPackage[], { ids: number[] }>({
      query: (body) => ({ url: API_ENDPOINTS.interiors.packagesOrder, method: "PUT", body }),
      transformResponse: (response: ApiEnvelope<InteriorPackage[]>) => response.data,
      async onQueryStarted({ ids }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          interiorsApi.util.updateQueryData("getMyInteriorProfile", undefined, (draft) => {
            if (!draft?.packages) return;
            const pos = new Map(ids.map((id, i) => [id, i]));
            draft.packages.forEach((p) => {
              if (pos.has(p.id)) p.orderIndex = pos.get(p.id)!;
            });
            draft.packages.sort((a, b) => a.orderIndex - b.orderIndex);
          }),
        );
        queryFulfilled.catch(() => patch.undo());
      },
      invalidatesTags: ["InteriorPackage"],
    }),

    deletePortfolioProject: builder.mutation<{ id: number }, number>({
      query: (id) => ({ url: API_ENDPOINTS.interiors.projectDetail(id), method: "DELETE" }),
      transformResponse: (response: ApiEnvelope<{ id: number }>) => response.data,
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          interiorsApi.util.updateQueryData("getMyInteriorProfile", undefined, (draft) => {
            if (draft?.projects) draft.projects = draft.projects.filter((x) => x.id !== id);
          }),
        );
        queryFulfilled.catch(() => patch.undo());
      },
      invalidatesTags: ["InteriorProject", "InteriorProjects", "InteriorReadiness", "InteriorList"],
    }),

    listInteriorTeam: builder.query<InteriorTeamMember[], void>({
      query: () => ({ url: API_ENDPOINTS.interiors.team, method: "GET" }),
      transformResponse: (response: ApiEnvelope<InteriorTeamMember[]>) => response.data ?? [],
      providesTags: ["InteriorTeam"],
    }),

    saveInteriorTeamMember: builder.mutation<InteriorTeamMember, { id?: number; data: Partial<InteriorTeamMember> }>({
      query: ({ id, data }) => ({
        url: id ? API_ENDPOINTS.interiors.teamDetail(id) : API_ENDPOINTS.interiors.team,
        method: id ? "PUT" : "POST",
        body: data,
      }),
      transformResponse: (response: ApiEnvelope<InteriorTeamMember>) => response.data,
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data: saved } = await queryFulfilled;
          dispatch(
            interiorsApi.util.updateQueryData("listInteriorTeam", undefined, (draft) => {
              const i = draft.findIndex((m) => m.id === saved.id);
              if (i >= 0) draft[i] = saved;
              else draft.push(saved);
            }),
          );
        } catch {
          /* surfaced by caller */
        }
      },
      invalidatesTags: ["InteriorProfile"],
    }),

    deleteInteriorTeamMember: builder.mutation<{ id: number }, number>({
      query: (id) => ({ url: API_ENDPOINTS.interiors.teamDetail(id), method: "DELETE" }),
      transformResponse: (response: ApiEnvelope<{ id: number }>) => response.data,
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patches = [
          dispatch(interiorsApi.util.updateQueryData("listInteriorTeam", undefined, (draft) => draft.filter((m) => m.id !== id))),
          dispatch(
            interiorsApi.util.updateQueryData("getMyInteriorProfile", undefined, (draft) => {
              if (draft?.teamMembers) draft.teamMembers = draft.teamMembers.filter((m) => m.id !== id);
            }),
          ),
        ];
        queryFulfilled.catch(() => patches.forEach((p) => p.undo()));
      },
    }),

    presignInteriorDocument: builder.mutation<{ uploadUrl: string; key: string }, { fileName: string; contentType: string }>({
      query: (body) => ({ url: API_ENDPOINTS.interiors.documentPresign, method: "POST", body }),
      transformResponse: (response: ApiEnvelope<{ uploadUrl: string; key: string }>) => response.data,
    }),

    /** Short-lived signed GET for the owner's private document (never cached). */
    getInteriorDocumentViewUrl: builder.mutation<{ url: string; expiresIn: number }, string>({
      query: (id) => ({ url: API_ENDPOINTS.interiors.documentViewUrl(id), method: "GET" }),
      transformResponse: (response: ApiEnvelope<{ url: string; expiresIn: number }>) => response.data,
    }),

    uploadInteriorDocument: builder.mutation<CredentialDocument, { type: CredentialDocType; fileKey: string; number?: string }>({
      query: (body) => ({ url: API_ENDPOINTS.interiors.documents, method: "POST", body }),
      transformResponse: (response: ApiEnvelope<CredentialDocument>) => response.data,
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data: doc } = await queryFulfilled;
          dispatch(
            interiorsApi.util.updateQueryData("getMyInteriorProfile", undefined, (draft) => {
              if (!draft) return;
              draft.credentials = [...(draft.credentials ?? []).filter((d) => d.id !== doc.id), doc];
            }),
          );
        } catch {
          /* surfaced by caller */
        }
      },
      invalidatesTags: ["InteriorDocs", "InteriorReadiness"],
    }),

    deleteInteriorDocument: builder.mutation<{ id: string }, string>({
      query: (id) => ({ url: API_ENDPOINTS.interiors.documentDetail(id), method: "DELETE" }),
      transformResponse: (response: ApiEnvelope<{ id: string }>) => response.data,
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          interiorsApi.util.updateQueryData("getMyInteriorProfile", undefined, (draft) => {
            if (draft?.credentials) draft.credentials = draft.credentials.filter((d) => String(d.id) !== String(id));
          }),
        );
        queryFulfilled.catch(() => patch.undo());
      },
      invalidatesTags: ["InteriorDocs", "InteriorReadiness"],
    }),

    getMyInteriorInquiries: builder.query<InteriorInquiriesResponse, { status?: string; page?: number; limit?: number; scope?: "all" } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.scope) q.set("scope", params.scope);
        if (params?.status) q.set("status", params.status);
        if (params?.page) q.set("page", String(params.page));
        if (params?.limit) q.set("limit", String(params.limit));
        const qs = q.toString();
        return { url: `${API_ENDPOINTS.interiors.myInquiries}${qs ? `?${qs}` : ""}`, method: "GET" };
      },
      transformResponse: (response: ApiEnvelope<InteriorInquiriesResponse>) => response.data,
      providesTags: ["InteriorInquiries", "InteriorInquiry"],
    }),
  }),
});

export type InteriorRevealedContact = { phone: string | null; whatsapp: string | null; email: string | null; contactName: string | null };

export const {
  useRevealInteriorContactMutation,
  useSearchInteriorDesignersQuery,
  useGetInteriorProfileDetailQuery,
  useGetMyInteriorListingsQuery,
  useCreateInteriorListingMutation,
  useGetMyInteriorProfileQuery,
  useSaveMyInteriorProfileMutation,
  usePublishMyInteriorProfileMutation,
  useAddCompanyBranchMutation,
  useSaveInteriorPackageMutation,
  useSavePortfolioProjectMutation,
  useSubmitInteriorInquiryMutation,
  useUnlockInteriorInquiryMutation,
  usePatchMyInteriorSectionMutation,
  useGetMyInteriorReadinessQuery,
  useSubmitMyInteriorProfileMutation,
  useUpdateMyInteriorStatusMutation,
  useGetMyInteriorBillingQuery,
  useBoostInteriorListingMutation,
  useUpdateInteriorInquiryStatusMutation,
  useUpdateCompanyBranchMutation,
  useDeleteCompanyBranchMutation,
  useDeleteInteriorPackageMutation,
  useReorderInteriorPackagesMutation,
  useDeletePortfolioProjectMutation,
  useListInteriorTeamQuery,
  useSaveInteriorTeamMemberMutation,
  useDeleteInteriorTeamMemberMutation,
  useUploadInteriorDocumentMutation,
  usePresignInteriorDocumentMutation,
  useGetInteriorDocumentViewUrlMutation,
  useDeleteInteriorDocumentMutation,
  useGetMyInteriorInquiriesQuery,
} = interiorsApi;

