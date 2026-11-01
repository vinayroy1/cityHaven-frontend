import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/components/ui/utils";

/**
 * Layout-accurate loading skeletons for the interior flow.
 * Product rule: never show a blank screen or a full-page spinner while loading.
 */

const bone = "bg-slate-200 dark:bg-slate-800";
const boneSoft = "bg-slate-100 dark:bg-slate-800/60";
const card = "rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900";

function Status({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/* ---------------- Dashboard: My Interior Listings ---------------- */

export function InteriorListingCardSkeleton() {
  return (
    <div className={cn(card, "flex flex-col overflow-hidden shadow-xs")} aria-hidden>
      <div className="relative">
        <Skeleton className={cn("h-28 w-full rounded-none sm:h-32", boneSoft)} />
        <Skeleton className={cn("absolute right-3 top-3 h-5 w-14 rounded-full", bone)} />
        <Skeleton className={cn("absolute -bottom-6 left-4 h-14 w-14 rounded-2xl border-4 border-white dark:border-slate-900", bone)} />
      </div>
      <div className="p-4 pt-8">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className={cn("h-5 w-3/5", bone)} />
          <Skeleton className={cn("h-5 w-20 rounded-full", boneSoft)} />
        </div>
        <Skeleton className={cn("mt-2 h-3.5 w-1/2", boneSoft)} />
        <Skeleton className={cn("mt-5 h-3 w-full", boneSoft)} />
        <Skeleton className={cn("mt-2 h-1.5 w-full rounded-full", bone)} />
        <Skeleton className={cn("mt-4 h-3.5 w-2/5", boneSoft)} />
        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Skeleton className={cn("h-11 w-full rounded-full", bone)} />
        </div>
      </div>
    </div>
  );
}

export function InteriorListingStatsSkeleton() {
  return (
    <div className="mb-5 grid grid-cols-2 gap-2 sm:mb-6 sm:gap-3 lg:grid-cols-4" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={cn(card, "flex items-center gap-3 p-3 sm:p-4")}>
          <Skeleton className={cn("h-9 w-9 shrink-0 rounded-xl sm:h-10 sm:w-10", boneSoft)} />
          <div className="flex-1 space-y-1.5">
            <Skeleton className={cn("h-3 w-12", boneSoft)} />
            <Skeleton className={cn("h-6 w-8", bone)} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InteriorListingsGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Status label="Loading your interior listings…" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <InteriorListingCardSkeleton key={i} />
      ))}
    </Status>
  );
}

/** Full page (route-level loading.tsx for /dashboard/interior-profile). */
export function InteriorListingsPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-4 sm:px-6 sm:pt-8">
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between" aria-hidden>
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className={cn("h-3 w-32", boneSoft)} />
            <Skeleton className={cn("h-7 w-56 max-w-full sm:h-9", bone)} />
            <Skeleton className={cn("h-4 w-80 max-w-full", boneSoft)} />
          </div>
          <Skeleton className={cn("hidden h-11 w-36 rounded-full sm:block", bone)} />
        </div>
        <InteriorListingStatsSkeleton />
        <InteriorListingsGridSkeleton />
      </div>
    </div>
  );
}

/* ---------------- Wizard ---------------- */

export function InteriorWizardSkeleton() {
  return (
    <Status
      label="Loading your listing…"
      className="min-h-screen overflow-x-clip bg-slate-50 pb-24 dark:bg-slate-950"
    >
      <div aria-hidden>
        {/* Top bar */}
        <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className={cn("h-5 w-56 max-w-full", bone)} />
              <Skeleton className={cn("h-3.5 w-72 max-w-full", boneSoft)} />
            </div>
            <Skeleton className={cn("h-8 w-20 shrink-0 rounded-full", boneSoft)} />
          </div>
          {/* Mobile segment bar */}
          <div className="flex gap-1.5 px-4 pb-3 lg:hidden">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className={cn("h-1.5 flex-1 rounded-full", i === 0 ? bone : boneSoft)} />
            ))}
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:py-8">
          {/* Desktop phase rail */}
          <aside className="hidden w-60 shrink-0 space-y-5 lg:block">
            {[3, 3, 3].map((n, p) => (
              <div key={p} className="space-y-2">
                <Skeleton className={cn("h-3 w-24", boneSoft)} />
                {Array.from({ length: n }, (_, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Skeleton className={cn("size-6 shrink-0 rounded-full", bone)} />
                    <Skeleton className={cn("h-4 flex-1", boneSoft)} />
                  </div>
                ))}
              </div>
            ))}
          </aside>

          {/* Step */}
          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-2">
              <Skeleton className={cn("h-3.5 w-28", boneSoft)} />
              <Skeleton className={cn("h-7 w-72 max-w-full", bone)} />
              <Skeleton className={cn("h-4 w-96 max-w-full", boneSoft)} />
            </div>
            {[3, 2, 2].map((fields, i) => (
              <div key={i} className={cn(card, "space-y-4 p-4 sm:p-6")}>
                <Skeleton className={cn("h-5 w-40", bone)} />
                {Array.from({ length: fields }, (_, f) => (
                  <div key={f} className="space-y-2">
                    <Skeleton className={cn("h-3.5 w-28", boneSoft)} />
                    <Skeleton className={cn("h-11 w-full rounded-xl", boneSoft)} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Sticky footer */}
        <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <Skeleton className={cn("h-10 w-20 rounded-xl", boneSoft)} />
            <Skeleton className={cn("h-10 w-32 rounded-xl", bone)} />
          </div>
        </div>
      </div>
    </Status>
  );
}

/* ---------------- Manage ---------------- */

/** Content-area skeleton for a manage section (form cards). */
export function ManageSectionSkeleton({ cards = 2 }: { cards?: number }) {
  return (
    <Status label="Loading section…" className="space-y-4">
      <div aria-hidden className="space-y-4">
        <div className="space-y-2">
          <Skeleton className={cn("h-6 w-48 max-w-full", bone)} />
          <Skeleton className={cn("h-4 w-80 max-w-full", boneSoft)} />
        </div>
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className={cn(card, "space-y-4 p-4 sm:p-6")}>
            <Skeleton className={cn("h-5 w-40", bone)} />
            {[0, 1, 2].map((f) => (
              <div key={f} className="space-y-2">
                <Skeleton className={cn("h-3.5 w-28", boneSoft)} />
                <Skeleton className={cn("h-11 w-full rounded-xl", boneSoft)} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Status>
  );
}

/** Overview panel: stat tiles + checklist + status card. */
export function OverviewSkeleton() {
  return (
    <Status label="Loading overview…" className="space-y-4">
      <div aria-hidden className="space-y-4">
        <div className={cn(card, "space-y-3 p-4 sm:p-6")}>
          <Skeleton className={cn("h-5 w-40", bone)} />
          <Skeleton className={cn("h-2.5 w-full rounded-full", boneSoft)} />
          <Skeleton className={cn("h-4 w-64 max-w-full", boneSoft)} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn(card, "space-y-2 p-4")}>
              <Skeleton className={cn("h-3 w-16", boneSoft)} />
              <Skeleton className={cn("h-7 w-12", bone)} />
            </div>
          ))}
        </div>
        <div className={cn(card, "space-y-3 p-4 sm:p-6")}>
          <Skeleton className={cn("h-5 w-36", bone)} />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className={cn("size-5 shrink-0 rounded-full", bone)} />
              <Skeleton className={cn("h-4 flex-1", boneSoft)} />
            </div>
          ))}
        </div>
      </div>
    </Status>
  );
}

/** Leads list rows. */
export function LeadsListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Status label="Loading leads…" className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} aria-hidden className={cn(card, "space-y-3 p-4")}>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className={cn("h-5 w-40 max-w-[60%]", bone)} />
            <Skeleton className={cn("h-5 w-16 rounded-full", boneSoft)} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className={cn("h-3.5 w-28", boneSoft)} />
            <Skeleton className={cn("h-3.5 w-24", boneSoft)} />
            <Skeleton className={cn("h-3.5 w-20", boneSoft)} />
          </div>
          <Skeleton className={cn("h-9 w-full rounded-xl sm:w-36", bone)} />
        </div>
      ))}
    </Status>
  );
}

/** Manage layout chrome (header + section nav) with shimmering content. */
export function InteriorManageLayoutSkeleton({ children }: { children?: ReactNode }) {
  return (
    <Status label="Loading your listing…" className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      <div aria-hidden className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Skeleton className={cn("h-3.5 w-32", boneSoft)} />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className={cn("h-7 w-56 max-w-full", bone)} />
            <Skeleton className={cn("h-5 w-16 rounded-full", boneSoft)} />
          </div>
          <Skeleton className={cn("h-3 w-36", boneSoft)} />
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <div aria-hidden className="-mx-4 lg:mx-0 lg:w-60 lg:shrink-0">
          <div className="flex gap-2 overflow-hidden px-4 pb-1 lg:flex-col lg:gap-1.5 lg:px-0">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton
                key={i}
                className={cn("h-9 w-24 shrink-0 rounded-full lg:w-full lg:rounded-xl", i === 0 ? bone : boneSoft)}
              />
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1">{children ?? <ManageSectionSkeleton />}</div>
      </div>
    </Status>
  );
}

/* ---------------- Public directory + profile ---------------- */

export function DesignerCardSkeleton() {
  return (
    <div aria-hidden className={cn(card, "overflow-hidden")}>
      <Skeleton className={cn("h-44 w-full rounded-none", bone)} />
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className={cn("size-11 shrink-0 rounded-xl", bone)} />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className={cn("h-4 w-3/4", bone)} />
            <Skeleton className={cn("h-3 w-1/2", boneSoft)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className={cn("h-5 w-16 rounded-full", boneSoft)} />
          <Skeleton className={cn("h-5 w-20 rounded-full", boneSoft)} />
        </div>
        <Skeleton className={cn("h-10 w-full rounded-xl", bone)} />
      </div>
    </div>
  );
}

export function DesignerGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Status label="Loading interior designers…" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <DesignerCardSkeleton key={i} />
      ))}
    </Status>
  );
}

export function DesignerDirectorySkeleton() {
  return (
    <div className="min-h-screen overflow-x-clip bg-stone-50 dark:bg-slate-950">
      <div aria-hidden className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-8 sm:px-6 lg:py-12">
          <Skeleton className={cn("h-4 w-40", boneSoft)} />
          <Skeleton className={cn("h-9 w-[28rem] max-w-full", bone)} />
          <Skeleton className={cn("h-4 w-[34rem] max-w-full", boneSoft)} />
          <Skeleton className={cn("mt-4 h-12 w-full max-w-3xl rounded-2xl", boneSoft)} />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div aria-hidden className="mb-6 flex gap-2 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className={cn("h-9 w-28 shrink-0 rounded-full", boneSoft)} />
          ))}
        </div>
        <DesignerGridSkeleton />
      </div>
    </div>
  );
}

export function DesignerProfileSkeleton() {
  return (
    <Status label="Loading designer profile…" className="min-h-screen overflow-x-clip bg-stone-50 dark:bg-slate-950">
      <div aria-hidden>
        <Skeleton className={cn("h-40 w-full rounded-none sm:h-56 lg:h-72", bone)} />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Skeleton className={cn("-mt-12 size-24 shrink-0 rounded-2xl border-4 border-stone-50 sm:-mt-16 sm:size-32 dark:border-slate-950", bone)} />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className={cn("h-8 w-2/3 max-w-sm", bone)} />
              <Skeleton className={cn("h-4 w-1/2 max-w-xs", boneSoft)} />
            </div>
            <Skeleton className={cn("h-11 w-full rounded-xl sm:w-40", bone)} />
          </div>
          <div className="mt-6 flex gap-2 overflow-hidden border-b border-slate-200 pb-3 dark:border-slate-800">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className={cn("h-8 w-24 shrink-0 rounded-full", boneSoft)} />
            ))}
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:py-10">
          <div className="min-w-0 space-y-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn(card, "space-y-3 rounded-3xl p-5 sm:p-6")}>
                <Skeleton className={cn("h-6 w-40", bone)} />
                <Skeleton className={cn("h-4 w-full", boneSoft)} />
                <Skeleton className={cn("h-4 w-5/6", boneSoft)} />
                <Skeleton className={cn("h-4 w-2/3", boneSoft)} />
              </div>
            ))}
          </div>
          <div className="hidden lg:block">
            <div className={cn(card, "space-y-3 rounded-3xl p-5")}>
              <Skeleton className={cn("h-6 w-32", bone)} />
              <Skeleton className={cn("h-11 w-full rounded-xl", boneSoft)} />
              <Skeleton className={cn("h-11 w-full rounded-xl", boneSoft)} />
              <Skeleton className={cn("h-11 w-full rounded-xl", bone)} />
            </div>
          </div>
        </div>
      </div>
    </Status>
  );
}
