"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  FileEdit,
  LayoutGrid,
  Loader2,
  MessageSquare,
  Paintbrush,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
  Images,
} from "lucide-react";
import { useGetMyInteriorListingsQuery, useCreateInteriorListingMutation } from "@/features/interiors/api";
import { effectiveStatus } from "@/components/interiors/manage/StatusBadge";
import { InteriorListingsGridSkeleton, InteriorListingStatsSkeleton } from "@/components/interiors/skeletons";
import { ListingCard, listingLeads } from "@/components/interiors/listings/ListingCard";
import { InteriorListingStatus } from "@/types/interior.types";
import { cn } from "@/components/ui/utils";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { BackButton } from "@/components/common/BackButton";

const IN_PROGRESS = new Set<InteriorListingStatus>([
  InteriorListingStatus.DRAFT,
  InteriorListingStatus.SUBMITTED,
  InteriorListingStatus.IN_REVIEW,
  InteriorListingStatus.CHANGES_REQUESTED,
]);

function AddButton({ onClick, busy, label, className }: { onClick: () => void; busy: boolean; label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-rose-600 px-5 text-sm font-bold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700 hover:shadow-md active:scale-[0.98] disabled:opacity-60 dark:bg-rose-500 dark:shadow-none dark:hover:bg-rose-600",
        className,
      )}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      <span>{busy ? "Starting…" : label}</span>
    </button>
  );
}

export default function MyInteriorListingsPage() {
  const router = useRouter();
  const { data: listings = [], isLoading, isError, isFetching, refetch } = useGetMyInteriorListingsQuery();
  const [createListing, { isLoading: isCreating }] = useCreateInteriorListingMutation();

  const handleStartNewListing = async () => {
    try {
      const res = await createListing({}).unwrap();
      router.push(`/dashboard/interior-profile/setup?profileId=${res.id}`);
    } catch (err) {
      console.error("Failed to start interior listing", err);
    }
  };

  const stats = React.useMemo(() => {
    let live = 0;
    let inProgress = 0;
    let leads = 0;
    for (const l of listings) {
      const s = effectiveStatus(l);
      if (s === InteriorListingStatus.PUBLISHED) live++;
      else if (IN_PROGRESS.has(s)) inProgress++;
      leads += listingLeads(l);
    }
    return { total: listings.length, live, inProgress, leads };
  }, [listings]);

  const hasListings = !isLoading && !isError && listings.length > 0;
  const isEmpty = !isLoading && !isError && listings.length === 0;

  const statTiles = [
    { label: "Total", value: stats.total, hint: "All listings", icon: LayoutGrid, cls: "text-slate-900 dark:text-white", iconCls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
    { label: "Live", value: stats.live, hint: "Visible to clients", icon: CheckCircle2, cls: "text-emerald-700 dark:text-emerald-300", iconCls: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
    { label: "In progress", value: stats.inProgress, hint: "Drafts & in review", icon: FileEdit, cls: "text-amber-700 dark:text-amber-300", iconCls: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" },
    { label: "Leads", value: stats.leads, hint: "Client enquiries", icon: MessageSquare, cls: "text-rose-700 dark:text-rose-300", iconCls: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-8">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex min-w-0 items-center gap-2">
              <BackButton variant="icon" fallbackHref="/dashboard" ariaLabel="Back to dashboard" className="sm:hidden" />
              <PageBreadcrumbs
                items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Interior listings" }]}
                includeHome={false}
                renderJsonLd={false}
                className="min-w-0"
              />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 sm:text-xs">
              <Paintbrush className="h-3.5 w-3.5" />
              <span>Interior business</span>
            </div>
            <h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Interior listings</h1>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
              Showcase your studio or practice and get enquiries from homeowners.
            </p>
          </div>
          {hasListings && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => refetch()}
                aria-label="Refresh listings"
                className="hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 sm:inline-flex"
              >
                <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              </button>
              <AddButton onClick={handleStartNewListing} busy={isCreating} label="Add listing" className="hidden sm:inline-flex" />
            </div>
          )}
        </div>

        {isLoading && (
          <>
            <InteriorListingStatsSkeleton />
            <InteriorListingsGridSkeleton />
          </>
        )}

        {isError && (
          <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
            <AlertCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Couldn&apos;t load your listings. Please try again.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="min-h-11 rounded-full bg-rose-600 px-5 text-sm font-bold text-white shadow-sm hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {isEmpty && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 px-5 py-10 text-center dark:from-rose-950/30 dark:via-slate-900 dark:to-amber-950/20 sm:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-200 dark:shadow-none">
                <Paintbrush className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white sm:text-xl">List your interior business</h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600 dark:text-slate-400">
                Studios, firms and independent designers can create a profile in a few minutes and start receiving client leads.
              </p>
              <ul className="mx-auto mt-6 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
                {[
                  { icon: Images, title: "Showcase work", text: "Portfolio projects & packages" },
                  { icon: Users, title: "Reach homeowners", text: "Get found in your city" },
                  { icon: Sparkles, title: "Free to start", text: "Save a draft, finish anytime" },
                ].map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900 dark:text-white">{title}</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <AddButton onClick={handleStartNewListing} busy={isCreating} label="Create your first listing" className="mt-7 w-full sm:w-auto" />
            </div>
          </div>
        )}

        {hasListings && (
          <>
            <div className="mb-5 grid grid-cols-2 gap-2 sm:mb-6 sm:gap-3 lg:grid-cols-4">
              {statTiles.map(({ label, value, hint, icon: Icon, cls, iconCls }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900 sm:p-4">
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10", iconCls)}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-[11px]">{label}</div>
                    <div className={cn("text-lg font-black leading-tight sm:text-2xl", cls)}>{value}</div>
                    <div className="hidden truncate text-[11px] text-slate-500 dark:text-slate-400 sm:block">{hint}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((item) => (
                <ListingCard key={item.id} item={item} />
              ))}
            </div>

            {/* Mobile sticky CTA */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:hidden">
              <AddButton onClick={handleStartNewListing} busy={isCreating} label="Add listing" className="w-full" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
