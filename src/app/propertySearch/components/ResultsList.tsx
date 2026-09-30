"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, SearchX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { ResultCard } from "./ResultCard";
import type { PropertySearchItem } from "@/types/propertySearch.types";
import type { SearchResults } from "@/components/search/useSearchResults";

const money = (v?: number | null) =>
  v == null ? "Price on request" : `₹${v.toLocaleString("en-IN")}`;

const area = (item: PropertySearchItem) => {
  const value = item.plotArea ?? item.builtUpArea ?? item.carpetArea;
  const unit = item.plotAreaUnit ?? item.builtUpAreaUnit ?? item.carpetAreaUnit ?? item.areaUnit;
  if (value && unit) return `${value.toLocaleString("en-IN")} ${unit.replace(/_/g, " ").toLowerCase()}`;
  if (item.carpetArea) return `${item.carpetArea} sq.ft`;
  return "Area NA";
};

const postedAsLabel = (postedAs?: string | null) => {
  if (!postedAs) return "Listing";
  const normalized = postedAs.toUpperCase();
  if (normalized === "OWNER") return "Owner";
  if (normalized === "AGENT") return "Agent";
  if (normalized === "BUILDER") return "Builder";
  return postedAs[0] + postedAs.slice(1).toLowerCase();
};

const isFresh = (createdAt?: string) => {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return false;
  return Date.now() - created <= 1000 * 60 * 60 * 24 * 30;
};

const postedAtLabel = (createdAt?: string) => {
  if (!createdAt) return "Recently posted";
  const created = new Date(createdAt);
  const createdTime = created.getTime();
  if (!Number.isFinite(createdTime)) return "Recently posted";

  const diffDays = Math.max(0, Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24)));
  if (diffDays === 0) return "Posted today";
  if (diffDays === 1) return "Posted yesterday";
  if (diffDays < 30) return `Posted ${diffDays} days ago`;

  return `Posted on ${created.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
};

const isVerifiedListing = (item: PropertySearchItem) =>
  Boolean(item.price && (item.locality || item.cityName) && item.postedAs);

function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
          <Skeleton className="h-44 w-full rounded-xl" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ResultsList({ results }: { results: SearchResults }) {
  const {
    visible,
    fetchedCount,
    total,
    refining,
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
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <SearchX className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm font-semibold text-slate-800">No properties match your search</p>
        <p className="mt-1 text-xs text-slate-500">
          Try widening the area, raising the budget, or removing a filter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {refining && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span>
            {visible.length} of {fetchedCount} loaded {fetchedCount === 1 ? "listing" : "listings"}
            {total != null ? ` (of ${total})` : ""} match{hasNextPage ? ", keep scrolling for more" : ""}.
          </span>
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => (
          <ResultCard
            key={item.id}
            id={item.id}
            title={item.title}
            subtitle={[item.locality, item.subLocality, item.cityName].filter(Boolean).join(" · ")}
            price={money(item.price)}
            area={area(item)}
            postedAt={postedAtLabel(item.createdAt)}
            owner={postedAsLabel(item.postedAs)}
            bedrooms={item.bedrooms}
            bathrooms={item.bathrooms}
            type={item.propertySubType?.name || item.propertyType?.name}
            listingType={item.listingType}
            resCom={item.resCom}
            isNew={isFresh(item.createdAt)}
            isVerified={isVerifiedListing(item)}
            posterBadge={postedAsLabel(item.postedAs)}
            ownerId={item.ownerId ?? item.createdById ?? undefined}
            images={item.media?.map((m) => m.url).filter(Boolean) ?? []}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="h-1 w-full" />
      {isFetchingNextPage && <SkeletonGrid count={2} />}
    </div>
  );
}
