"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Paintbrush,
  Plus,
  Building2,
  MapPin,
  ExternalLink,
  ChevronRight,
  Briefcase,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useGetMyInteriorListingsQuery, useCreateInteriorListingMutation } from "@/features/interiors/api";
import { StatusBadge } from "@/components/interiors/manage/StatusBadge";
import { InteriorListingStatus } from "@/types/interior.types";

export default function MyInteriorListingsPage() {
  const router = useRouter();
  const { data: listings = [], isLoading, isError, refetch } = useGetMyInteriorListingsQuery();
  const [createListing, { isLoading: isCreating }] = useCreateInteriorListingMutation();

  const handleStartNewListing = async () => {
    try {
      const res = await createListing({}).unwrap();
      router.push(`/dashboard/interior-profile/setup?profileId=${res.id}`);
    } catch (err) {
      console.error("Failed to start interior listing", err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <Paintbrush className="h-4 w-4" />
            <span>Interior Business Marketplace</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            My Interior Listings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your interior design businesses, studios, and individual portfolios.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartNewListing}
          disabled={isCreating}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-700 active:scale-[0.99] disabled:opacity-60"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Starting Wizard…</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Add Interior Business / Studio</span>
            </>
          )}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading your interior listings…</p>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
          <AlertCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Failed to load listings. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && listings.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
            <Building2 className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No interior listings found</h2>
          <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
            You haven't listed any interior design studio, architecture firm, or freelance profile yet. Create your first listing to showcase your packages and receive client leads.
          </p>
          <button
            type="button"
            onClick={handleStartNewListing}
            disabled={isCreating}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-700 disabled:opacity-60"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Starting Wizard…</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Create Your First Listing</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Listing Cards */}
      {!isLoading && !isError && listings.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => {
            const isDraft = item.status === InteriorListingStatus.DRAFT;
            const targetUrl = isDraft
              ? `/dashboard/interior-profile/setup?profileId=${item.id}`
              : `/dashboard/interior-profile/manage?profileId=${item.id}`;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-purple-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-700"
              >
                <div>
                  {/* Top Bar: Type + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {item.providerType === "COMPANY" ? (
                        <>
                          <Building2 className="h-3 w-3" /> Company
                        </>
                      ) : (
                        <>
                          <Briefcase className="h-3 w-3" /> Individual
                        </>
                      )}
                    </span>
                    <StatusBadge profile={item} />
                  </div>

                  {/* Title & Location */}
                  <div className="mt-3.5">
                    <h3 className="line-clamp-1 text-base font-bold text-slate-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
                      {item.businessName || item.displayName || "Untitled Listing"}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{item.primaryCity || "Location unset"}</span>
                      {item.primaryLocality && <span>• {item.primaryLocality}</span>}
                    </p>
                  </div>

                  {/* Metrics / Counters */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-xs dark:border-slate-800">
                    <div className="rounded-lg bg-slate-50 p-1.5 dark:bg-slate-800/60">
                      <span className="block font-bold text-slate-800 dark:text-white">
                        {(item as any)._count?.projects ?? item.projects?.length ?? 0}
                      </span>
                      <span className="text-[10px] text-slate-500">Projects</span>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-1.5 dark:bg-slate-800/60">
                      <span className="block font-bold text-slate-800 dark:text-white">
                        {(item as any)._count?.packages ?? item.packages?.length ?? 0}
                      </span>
                      <span className="text-[10px] text-slate-500">Packages</span>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-1.5 dark:bg-slate-800/60">
                      <span className="block font-bold text-purple-600 dark:text-purple-400">
                        {(item as any)._count?.inquiries ?? 0}
                      </span>
                      <span className="text-[10px] text-slate-500">Leads</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800">
                  {item.isPublished && item.slug ? (
                    <Link
                      href={`/interior-designers/${item.primaryCity?.toLowerCase() || "india"}/${item.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>View Live</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Step {item.wizardStep ?? 1} of 9
                    </span>
                  )}

                  <Link
                    href={targetUrl}
                    className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 transition-colors hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/60"
                  >
                    <span>{isDraft ? "Continue Setup" : "Manage"}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
