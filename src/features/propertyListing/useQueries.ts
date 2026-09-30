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

export function useMyPropertiesInfinite(params?: { pageSize?: number; status?: string; cityId?: number; listingType?: string }) {
  const query = useInfiniteQuery<CursorPage<any>, Error>({
    queryKey: ["myProperties", params],
    queryFn: ({ pageParam }) =>
      apiFetch<CursorPage<any>>({
        url: API_ENDPOINTS.propertyListing.my,
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

type SearchPage<T> = CursorPage<T> & { nextCursor?: string | number | null; total?: number };

export function usePropertySearchInfinite(params?: Record<string, any>) {
  const query = useInfiniteQuery<SearchPage<any>, Error>({
    queryKey: ["propertySearch", params],
    queryFn: ({ pageParam }) =>
      apiFetch<SearchPage<any>>({
        url: API_ENDPOINTS.propertyListing.search,
        params: { ...(params || {}), cursor: pageParam as string | number | null | undefined },
      }),
    initialPageParam: null,
    getNextPageParam: (last) =>
      last && "nextCursor" in last ? (last as SearchPage<any>).nextCursor ?? undefined : undefined,
  });
  const pages = query.data?.pages as SearchPage<any>[] | undefined;
  return {
    ...query,
    items: flattenPages(pages),
    total: pages?.[pages.length - 1]?.total,
  };
}
