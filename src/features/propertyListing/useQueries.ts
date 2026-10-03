"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { apiFetch } from "@/lib/api/query";

type CursorPage<T> = {
  items: T[];
  nextCursor?: number | null;
  hasMore?: boolean;
  total?: number;
};

export const normalizePage = <T,>(page: CursorPage<T> | { data?: CursorPage<T> } | T[] | undefined | null): CursorPage<T> => {
  if (Array.isArray(page)) return { items: page };
  const nested: CursorPage<T> | undefined =
    page && "data" in page && !("items" in page) ? page.data : (page as CursorPage<T> | undefined | null) ?? undefined;
  return {
    ...(nested || {}),
    items: Array.isArray(nested?.items) ? nested.items : [],
  };
};

const flattenPages = <T,>(pages?: (CursorPage<T> | { data?: CursorPage<T> } | T[])[]): T[] =>
  pages?.flatMap((p) => normalizePage(p).items) ?? [];

export function useMyPropertiesInfinite(params?: { pageSize?: number; status?: string; cityId?: number; listingType?: string }) {
  const query = useInfiniteQuery<CursorPage<any>, Error>({
    queryKey: ["myProperties", params],
    queryFn: ({ pageParam }) =>
      apiFetch<CursorPage<any>>({
        url: API_ENDPOINTS.propertyListing.my,
        params: { ...(params || {}), cursor: pageParam },
      }),
    initialPageParam: null,
    getNextPageParam: (last) => normalizePage(last).nextCursor ?? undefined,
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
    getNextPageParam: (last) => normalizePage(last).nextCursor ?? undefined,
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
    getNextPageParam: (last) => normalizePage(last).nextCursor ?? undefined,
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
    getNextPageParam: (last) => normalizePage(last).nextCursor ?? undefined,
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
    getNextPageParam: (last) => normalizePage(last).nextCursor ?? undefined,
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
    getNextPageParam: (last) => normalizePage(last).nextCursor ?? undefined,
  });
  const pages = query.data?.pages as SearchPage<any>[] | undefined;
  const normalizedPages = pages?.map((page) => normalizePage(page) as SearchPage<any>);
  return {
    ...query,
    items: flattenPages(pages),
    total: normalizedPages?.[normalizedPages.length - 1]?.total,
  };
}
