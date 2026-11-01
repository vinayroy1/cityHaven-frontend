"use client";
/**
 * Name-based bridge to Chunk B hooks. Hooks are resolved once at module load
 * (stable across renders), so D builds and runs even before B lands; missing
 * hooks degrade to safe fallbacks.
 */
import * as interiorApi from "@/features/interiors/api";
import { useGetMyInteriorProfileQuery } from "@/features/interiors/api";
import type { InteriorInquiry, InteriorInquiryStatus, InteriorProfile } from "@/types/interior.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = interiorApi as unknown as Record<string, any>;

export type StatusChange = {
  status: "PAUSED" | "TEMP_UNAVAILABLE" | "ARCHIVED" | "PUBLISHED";
  until?: string | null;
  reason?: string;
};

type MutationTuple<A, R> = [(arg: A) => { unwrap: () => Promise<R> }, { isLoading: boolean }];

const missing = (name: string) =>
  function useMissing(): MutationTuple<unknown, never> {
    return [
      () => ({ unwrap: () => Promise.reject({ data: { message: `${name} is not available yet.` } }) }),
      { isLoading: false },
    ];
  };

export const useUpdateStatus: () => MutationTuple<StatusChange, InteriorProfile> =
  api.useUpdateMyInteriorStatusMutation ?? missing("Status update");

export const useSubmitProfile: () => MutationTuple<void, InteriorProfile> =
  api.useSubmitMyInteriorProfileMutation ?? missing("Submit");

export const usePublishProfile: () => MutationTuple<void, InteriorProfile> = api.usePublishMyInteriorProfileMutation;

export const useUnlockInquiry: () => MutationTuple<number, InteriorInquiry> = api.useUnlockInteriorInquiryMutation;

type InquiryList = { items: InteriorInquiry[]; isLoading: boolean; isError: boolean; total?: number };

const useInquiriesFromEndpoint = (status: InteriorInquiryStatus | "", page: number): InquiryList => {
  const q = api.useGetMyInteriorInquiriesQuery({ status: status || undefined, page });
  const data = q.data as { items?: InteriorInquiry[]; pagination?: { total?: number } } | InteriorInquiry[] | undefined;
  const items = Array.isArray(data) ? data : (data?.items ?? []);
  return { items, isLoading: q.isLoading, isError: q.isError, total: Array.isArray(data) ? undefined : data?.pagination?.total };
};

const useInquiriesFromProfile = (status: InteriorInquiryStatus | ""): InquiryList => {
  const { data, isLoading, isError } = useGetMyInteriorProfileQuery();
  const all = data?.inquiries ?? [];
  return { items: status ? all.filter((i) => i.status === status) : all, isLoading, isError };
};

export const useMyInquiries: (status: InteriorInquiryStatus | "", page: number) => InquiryList =
  api.useGetMyInteriorInquiriesQuery ? useInquiriesFromEndpoint : useInquiriesFromProfile;

export const errorMessage = (err: unknown, fallback: string) =>
  (err as { data?: { message?: string } })?.data?.message || fallback;
