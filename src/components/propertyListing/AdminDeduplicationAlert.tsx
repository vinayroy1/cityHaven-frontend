"use client";

import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useSearchPropertiesQuery } from "@/features/propertyListing/api";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building,
  Bed,
  IndianRupee,
  Search,
} from "lucide-react";
import Link from "next/link";

export function AdminDeduplicationAlert() {
  const { watch } = useFormContext<PropertyListingFormValues>();

  const societyOrProjectName = watch("location.societyOrProjectName") || "";
  const locality = watch("location.locality") || "";
  const cityName = watch("location.cityName") || "";
  const address = watch("location.address") || "";
  const flatNumber = watch("location.flatNumber") || "";
  const bedrooms = watch("details.bedrooms");
  const listingType = watch("context.listingType") || "RENT";

  // Use the most specific query string available
  const queryTerm = societyOrProjectName.trim() || locality.trim() || address.trim();
  const shouldSearch = queryTerm.length >= 3;

  const { data: searchResults, isFetching } = useSearchPropertiesQuery(
    {
      q: queryTerm,
      cityName: cityName || undefined,
      listingType: listingType || undefined,
      pageSize: 5,
    },
    {
      skip: !shouldSearch,
    }
  );

  // Evaluate matching duplicates
  const potentialDuplicates = useMemo(() => {
    if (!searchResults?.items?.length) return [];

    const normQuery = queryTerm.toLowerCase();
    return searchResults.items.filter((item) => {
      const matchSoc = (item.societyOrProjectName || "").toLowerCase().includes(normQuery);
      const matchLoc = (item.locality || "").toLowerCase().includes(normQuery);
      const matchTitle = (item.title || "").toLowerCase().includes(normQuery);

      if (!matchSoc && !matchLoc && !matchTitle) return false;

      // High conflict if bedrooms match as well
      if (bedrooms && item.bedrooms && Number(bedrooms) === Number(item.bedrooms)) {
        return true;
      }

      // If flat number is supplied and in address or title
      if (flatNumber && item.address?.toLowerCase().includes(flatNumber.toLowerCase())) {
        return true;
      }

      return matchSoc;
    });
  }, [searchResults, queryTerm, bedrooms, flatNumber]);

  if (!shouldSearch) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <span>
          Enter a Project / Society name or Locality (at least 3 letters) to activate real-time portal redundancy check.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isFetching && (
        <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 animate-pulse">
          <Search className="h-3.5 w-3.5" />
          <span>Scanning portal for duplicate listings in &ldquo;{queryTerm}&rdquo;...</span>
        </div>
      )}

      {!isFetching && potentialDuplicates.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/[0.06] p-4 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:bg-amber-500/30 dark:text-amber-300 shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Potential Duplicate Listing Detected ({potentialDuplicates.length} found)
                </h4>
                <span className="rounded-full bg-amber-200/80 px-2 py-0.2 text-[10px] font-bold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                  Anti-Redundancy Alert
                </span>
              </div>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                One or more active properties already exist in <strong>{queryTerm}</strong>
                {bedrooms ? ` with ${bedrooms} BHK` : ""}. Please review the existing listings below before posting to avoid duplicate inventory:
              </p>
            </div>
          </div>

          <div className="mt-3 divide-y divide-amber-200/60 rounded-xl border border-amber-200/80 bg-white/90 dark:divide-amber-800/60 dark:border-amber-800/60 dark:bg-slate-900/90">
            {potentialDuplicates.slice(0, 3).map((dup) => (
              <div key={dup.id} className="flex items-center justify-between p-2.5 text-xs">
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white truncate">
                      {dup.title || `Property #${dup.id}`}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300 shrink-0">
                      ID: #{dup.id}
                    </span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    {dup.societyOrProjectName && (
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {dup.societyOrProjectName}
                      </span>
                    )}
                    {dup.bedrooms && (
                      <span className="flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        {dup.bedrooms} BHK
                      </span>
                    )}
                    {dup.price && (
                      <span className="flex items-center gap-0.5 font-medium text-slate-700 dark:text-slate-300">
                        <IndianRupee className="h-3 w-3" />
                        {dup.price.toLocaleString("en-IN")}
                      </span>
                    )}
                    <span className="capitalize text-emerald-600 dark:text-emerald-400 font-medium">
                      {dup.status || "ACTIVE"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/propertySearch?q=${encodeURIComponent(dup.title || queryTerm)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shrink-0"
                >
                  Inspect <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isFetching && potentialDuplicates.length === 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Anti-Redundancy Verified:</strong> No existing duplicate listings found in &ldquo;{queryTerm}&rdquo;. Safe to list on portal.
          </span>
        </div>
      )}
    </div>
  );
}
