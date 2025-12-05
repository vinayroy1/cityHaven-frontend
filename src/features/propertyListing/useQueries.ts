"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { apiFetch } from "@/lib/api/query";

type CursorPage<T> = {
  items: T[];
  nextCursor?: number | null;
  hasMore?: boolean;
};

const flattenPages = <T,>(pages?: CursorPage<T>[]): T[] => pages?.flatMap((p) => p.items ?? []) ?? [];

export function useOrgListingsInfinite(params?: { orgId?: number | string; assignedToMe?: boolean; status?: string; cityId?: number; listingType?: string }) {
  const query = useInfiniteQuery<CursorPage<any>, Error>({
    queryKey: ["orgListings", params],
    queryFn: ({ pageParam }) =>
      apiFetch<CursorPage<any>>({
        url: API_ENDPOINTS.propertyListing.org,
        params: { ...(params || {}), cursor: pageParam },
      }),
    initialPageParam: null,
    getNextPageParam: (last) => (last && "nextCursor" in last ? (last as CursorPage<any>).nextCursor ?? undefined : undefined),
  });

  return {
    ...query,
    items: flattenPages(query.data?.pages as CursorPage<any>[] | undefined),
  };
}

export function useFavoritesInfinite(params?: { pageSize?: number }) {
  const query = useInfiniteQuery<CursorPage<any>, Error>({
    queryKey: ["favorites", params],
    queryFn: ({ pageParam }) =>
      apiFetch<CursorPage<any>>({
        url: API_ENDPOINTS.propertyListing.favorites,
        params: { ...(params || {}), cursor: pageParam },
      }),
    initialPageParam: null,
    getNextPageParam: (last) => (last && "nextCursor" in last ? (last as CursorPage<any>).nextCursor ?? undefined : undefined),
  });
  return { ...query, items: flattenPages(query.data?.pages as CursorPage<any>[] | undefined) };
}

export function useEnquiriesInfinite(params?: { pageSize?: number }) {
  const query = useInfiniteQuery<CursorPage<any>, Error>({
    queryKey: ["enquiries", params],
    queryFn: ({ pageParam }) =>
      apiFetch<CursorPage<any>>({
        url: API_ENDPOINTS.propertyListing.enquiries,
        params: { ...(params || {}), cursor: pageParam },
      }),
    initialPageParam: null,
    getNextPageParam: (last) => (last && "nextCursor" in last ? (last as CursorPage<any>).nextCursor ?? undefined : undefined),
  });
  return { ...query, items: flattenPages(query.data?.pages as CursorPage<any>[] | undefined) };
}

export function useVisitsInfinite(params?: { pageSize?: number }) {
  const query = useInfiniteQuery<CursorPage<any>, Error>({
    queryKey: ["visits", params],
    queryFn: ({ pageParam }) =>
      apiFetch<CursorPage<any>>({
        url: API_ENDPOINTS.propertyListing.visits,
        params: { ...(params || {}), cursor: pageParam },
      }),
    initialPageParam: null,
    getNextPageParam: (last) => (last && "nextCursor" in last ? (last as CursorPage<any>).nextCursor ?? undefined : undefined),
  });
  return { ...query, items: flattenPages(query.data?.pages as CursorPage<any>[] | undefined) };
}

export function usePropertySearchInfinite(params?: Record<string, any>) {
  const query = useInfiniteQuery<CursorPage<any>, Error>({
    queryKey: ["propertySearch", params],
    queryFn: ({ pageParam }) =>
      apiFetch<CursorPage<any>>({
        url: API_ENDPOINTS.propertyListing.search,
        params: { ...(params || {}), cursor: pageParam },
      }),
    initialPageParam: null,
    getNextPageParam: (last) => (last && "nextCursor" in last ? (last as CursorPage<any>).nextCursor ?? undefined : undefined),
  });
  return { ...query, items: flattenPages(query.data?.pages as CursorPage<any>[] | undefined) };
}
