"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, Building2, Clock, ExternalLink, MapPin, MessageSquare, Pencil } from "lucide-react";
import { StatusBadge, effectiveStatus } from "@/components/interiors/manage/StatusBadge";
import { InteriorListingStatus, type InteriorProfile } from "@/types/interior.types";
import { cn } from "@/components/ui/utils";

const TOTAL_STEPS = 9;

export const listingName = (p: InteriorProfile) => p.businessName || p.displayName || "Untitled listing";
export const listingLeads = (p: InteriorProfile) => p._count?.inquiries ?? p.inquiries?.length ?? 0;

export function listingCompleteness(p: InteriorProfile): number {
  if (typeof p.completenessPct === "number") return Math.max(0, Math.min(100, Math.round(p.completenessPct)));
  if (effectiveStatus(p) !== InteriorListingStatus.DRAFT) return 100;
  return Math.round((Math.min(p.wizardStep ?? 1, TOTAL_STEPS) / TOTAL_STEPS) * 100);
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "IN";
}

function relativeTime(iso?: string | null) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function ListingCard({ item }: { item: InteriorProfile }) {
  // Routing conditions intentionally mirror the original page (raw status / isPublished).
  const isDraft = item.status === InteriorListingStatus.DRAFT;
  const isLive = !!item.isPublished && !!item.slug;
  const name = listingName(item);
  const pct = listingCompleteness(item);
  const leads = listingLeads(item);
  const updated = relativeTime(item.updatedAt);
  const isCompany = item.providerType === "COMPANY";
  const target = isDraft
    ? `/dashboard/interior-profile/setup?profileId=${item.id}`
    : `/dashboard/interior-profile/manage?profileId=${item.id}`;
  const publicUrl = `/interior-designers/${item.primaryCity?.toLowerCase() || "india"}/${item.slug}`;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-rose-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-900/60">
      {/* Cover */}
      <Link href={target} tabIndex={-1} aria-hidden className="relative block h-28 sm:h-32">
        {item.coverBanner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.coverBanner} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-rose-100 via-rose-50 to-amber-50 dark:from-rose-950/60 dark:via-slate-900 dark:to-amber-950/30" />
        )}
        <div className="absolute right-3 top-3">
          <StatusBadge profile={item} className="shadow-xs ring-1 ring-white/60 dark:ring-slate-900/60" />
        </div>
        <div className="absolute -bottom-6 left-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-rose-600 text-base font-black text-white shadow-sm dark:border-slate-900">
          {item.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.logo} alt="" className="h-full w-full bg-white object-cover" />
          ) : (
            initials(name)
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 pt-8">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <h2 className="min-w-0 truncate text-base font-bold text-slate-900 dark:text-white">
            <Link href={target} className="hover:text-rose-600 dark:hover:text-rose-400">{name}</Link>
          </h2>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {isCompany ? <Building2 className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
            {isCompany ? "Company" : "Individual"}
          </span>
        </div>
        <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {item.primaryCity || "City not set"}
            {item.primaryLocality ? ` · ${item.primaryLocality}` : ""}
          </span>
        </p>

        {/* Completeness */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-600 dark:text-slate-300">
              {isDraft ? `Setup · step ${Math.min(item.wizardStep ?? 1, TOTAL_STEPS)} of ${TOTAL_STEPS}` : "Profile completeness"}
            </span>
            <span className="text-slate-900 dark:text-white">{pct}%</span>
          </div>
          <div
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile completeness"
          >
            <div
              className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-emerald-500" : "bg-rose-500 dark:bg-rose-400")}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">{leads}</span> {leads === 1 ? "lead" : "leads"}
          </span>
          {updated && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Updated {updated}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row">
          <Link
            href={target}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-rose-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-[0.98] dark:bg-rose-500 dark:hover:bg-rose-600"
          >
            {isDraft ? <Pencil className="h-4 w-4" /> : null}
            {isDraft ? "Continue setup" : "Manage"}
            {!isDraft && <ArrowRight className="h-4 w-4" />}
          </Link>
          {isLive && (
            <Link
              href={publicUrl}
              target="_blank"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ExternalLink className="h-4 w-4" /> View public page
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
