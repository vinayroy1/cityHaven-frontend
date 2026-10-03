"use client";

import React, { useEffect, useRef } from "react";
import { SearchX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { ResultCard } from "./ResultCard";
import { toResultCardProps } from "./propertyCardAdapter";
import type { SearchResults } from "@/components/search/useSearchResults";

function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <Skeleton className="h-44 w-full rounded-xl dark:bg-slate-800" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-5 w-2/3 dark:bg-slate-800" />
            <Skeleton className="h-4 w-1/2 dark:bg-slate-800" />
            <Skeleton className="h-4 w-1/3 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ResultsList({ results }: { results: SearchResults }) {
  const {
    visible,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    errorMessage,
    fetchNextPage,
    refetch,
  } = results;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) return <SkeletonGrid />;

  if (isError) {
    const looksOffline =
      errorMessage?.includes("Failed to fetch") ||
      errorMessage?.includes("NetworkError") ||
      errorMessage?.includes("ERR_CONNECTION_REFUSED");
    return (
      <StateMessage
        tone="error"
        title="We hit a snag loading properties"
        description={
          looksOffline
            ? "The property API is not reachable. Start the backend or check NEXT_PUBLIC_API_URL, then retry."
            : errorMessage || "This section could not refresh. Your filters are still applied, please retry."
        }
        action={{ label: "Retry", onClick: () => refetch() }}
      />
    );
  }

  if (!visible.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <SearchX className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">No properties match your search</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Try widening the area, raising the budget, or removing a filter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => (
          <ResultCard key={item.id} {...toResultCardProps(item)} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-1 w-full" />
      {isFetchingNextPage && <SkeletonGrid count={2} />}
    </div>
  );
}
