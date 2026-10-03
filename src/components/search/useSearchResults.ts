"use client";

import React from "react";
import { usePropertySearchInfinite } from "@/features/propertyListing/useQueries";
import type { PropertySearchItem } from "@/types/propertySearch.types";
import {
  applyClientRefinements,
  hasClientRefinements,
  toApiParams,
  type SearchState,
} from "./searchQuery";
import { subTypeSlugToId } from "./searchConfig";

const BASE_PAGE_SIZE = 12;
const REFINE_PAGE_SIZE = 30;
const MAX_AUTO_PAGES = 5;
const MIN_VISIBLE_TARGET = 6;

export type SearchResults = {
  visible: PropertySearchItem[];
  fetchedCount: number;
  total?: number;
  refining: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  isError: boolean;
  errorMessage?: string;
  fetchNextPage: () => void;
  refetch: () => void;
};

export function useSearchResults(state: SearchState): SearchResults {
  const refining = hasClientRefinements(state);
  const apiParams = React.useMemo(
    () => toApiParams(state, refining ? REFINE_PAGE_SIZE : BASE_PAGE_SIZE),
    [state, refining],
  );

  const query = usePropertySearchInfinite(apiParams);
  const {
    items,
    total,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
    refetch,
  } = query;

  const visible = React.useMemo(
    () =>
      refining
        ? applyClientRefinements(items as PropertySearchItem[], state, subTypeSlugToId)
        : (items as PropertySearchItem[]),
    [items, refining, state],
  );

  // When client refinement hides most of a page, pull more pages automatically
  // (bounded) so the user doesn't see a near-empty list.
  const autoPagesRef = React.useRef(0);
  React.useEffect(() => {
    autoPagesRef.current = 0;
  }, [apiParams]);

  React.useEffect(() => {
    if (!refining || !hasNextPage || isFetchingNextPage || isFetching) return;
    if (visible.length >= MIN_VISIBLE_TARGET) return;
    if (autoPagesRef.current >= MAX_AUTO_PAGES) return;
    autoPagesRef.current += 1;
    fetchNextPage();
  }, [refining, hasNextPage, isFetchingNextPage, isFetching, visible.length, fetchNextPage]);

  return {
    visible,
    fetchedCount: items.length,
    total,
    refining,
    isLoading: isFetching && !isFetchingNextPage && items.length === 0,
    isFetchingNextPage,
    hasNextPage,
    isError,
    errorMessage: error instanceof Error ? error.message : undefined,
    fetchNextPage,
    refetch,
  };
}
