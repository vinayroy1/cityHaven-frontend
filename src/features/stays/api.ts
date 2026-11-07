import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { APP_CONFIG } from "@/constants/app-config";
import { apiFetch } from "@/lib/api/query";
import type { Stay, StayEnquiryInput, StayInput, StaySearchParams } from "./types";

const BASE = `${APP_CONFIG.API.BASE_URL}/v1/stays`;

type Page = { items: Stay[]; total: number; page: number; pageSize: number; hasNextPage: boolean };

/** Turn the backend's JSON error body into a readable message. */
export function stayErrorMessage(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e ?? "");
  try {
    const j = JSON.parse(raw);
    return j?.errors?.[0]?.message || j?.message || "Something went wrong";
  } catch {
    return raw || "Something went wrong";
  }
}

const toParams = (p: StaySearchParams = {}) => ({
  ...p,
  ac: p.ac ? "true" : undefined,
  coupleFriendly: p.coupleFriendly ? "true" : undefined,
  familyFriendly: p.familyFriendly ? "true" : undefined,
  free: p.free ? "true" : undefined,
});

export type StaySearchPage = Page;

/** `initial` is a server-rendered first page; used only when its params match the current ones. */
export function useStaySearch(params: StaySearchParams, enabled = true, initial?: { params: StaySearchParams; page: Page } | null) {
  const useInitial = !!initial && JSON.stringify(initial.params) === JSON.stringify(params);
  return useInfiniteQuery<Page, Error>({
    queryKey: ["stays", params],
    initialPageParam: 1,
    enabled,
    ...(useInitial ? { initialData: { pages: [initial!.page], pageParams: [1] }, staleTime: 60_000 } : {}),
    queryFn: ({ pageParam }) => apiFetch<Page>({ url: BASE, params: { ...toParams(params), page: pageParam as number } }),
    getNextPageParam: (last) => (last.hasNextPage ? last.page + 1 : undefined),
  });
}

export const useStay = (slug?: string) =>
  useQuery<Stay, Error>({ queryKey: ["stay", slug], enabled: !!slug, queryFn: () => apiFetch<Stay>({ url: `${BASE}/${slug}` }) });

export const useMyStays = () => useQuery<Stay[], Error>({ queryKey: ["myStays"], queryFn: () => apiFetch<Stay[]>({ url: `${BASE}/me` }) });

export const useMyStayEnquiries = () =>
  useQuery<Array<{ id: number; name: string; phone: string; checkIn?: string; checkOut?: string; guests?: number; message?: string; createdAt: string; stay: { id: number; name: string; slug: string } }>, Error>({
    queryKey: ["myStayEnquiries"],
    queryFn: () => apiFetch({ url: `${BASE}/me/enquiries` }),
  });

export function useSaveStay() {
  const qc = useQueryClient();
  return useMutation<Stay, Error, { id?: number; body: Partial<StayInput> }>({
    mutationFn: ({ id, body }) =>
      apiFetch<Stay>({ url: id ? `${BASE}/${id}` : BASE, init: { method: id ? "PATCH" : "POST", body: JSON.stringify(body) } }),
    onSuccess: (s) => {
      void qc.invalidateQueries({ queryKey: ["myStays"] });
      void qc.invalidateQueries({ queryKey: ["stay", s.slug] });
      void qc.invalidateQueries({ queryKey: ["stays"] });
    },
  });
}

export function useArchiveStay() {
  const qc = useQueryClient();
  return useMutation<unknown, Error, number>({
    mutationFn: (id) => apiFetch({ url: `${BASE}/${id}`, init: { method: "DELETE" } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["myStays"] }),
  });
}

export const useStayEnquiry = (stayId: number) =>
  useMutation<{ id: number }, Error, StayEnquiryInput>({
    mutationFn: (body) => apiFetch({ url: `${BASE}/${stayId}/enquiries`, init: { method: "POST", body: JSON.stringify(body) } }),
  });

/** Fire-and-forget click counter for external booking buttons. */
export function trackBookingClick(stayId: number, platform: string, roomTypeId?: number) {
  try {
    void fetch(`${BASE}/${stayId}/booking-click`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ platform, ...(roomTypeId ? { roomTypeId } : {}) }),
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}
