"use client";
import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, CheckCircle2, ChevronDown, ChevronRight, Circle, Eye, Inbox, Unlock } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { ListingCard } from "@/components/interiors/listings/ListingCard";
import type { ReadinessItem } from "@/types/interior.types";
import { ListingStatusCard } from "./ListingStatusCard";
import { InteriorPlanCard } from "./InteriorPlanCard";
import { ListingSummary } from "./ListingSummary";
import { manageHref, MANAGE_SECTIONS, type ManageSectionId } from "./sections";
import { useManageListing } from "./useManageListing";
import { OverviewSkeleton } from "@/components/interiors/skeletons";

const hrefFor = (item: ReadinessItem, pid?: number | null) =>
  MANAGE_SECTIONS.some((s) => s.id === item.stepId) ? manageHref(item.stepId as ManageSectionId, pid) : manageHref("overview", pid);

type Step = { id: string; label: string; href: string; done: boolean; required: boolean };

function StepRow({ step }: { step: Step }) {
  return (
    <li>
      <Link
        href={step.href}
        className="flex min-h-11 items-center gap-2.5 rounded-xl px-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        {step.done ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-label="Done" />
        ) : (
          <Circle className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" aria-label="To do" />
        )}
        <span className={`min-w-0 flex-1 ${step.done ? "text-slate-400 line-through decoration-slate-300" : "text-slate-800 dark:text-slate-200"}`}>
          {step.label}
        </span>
        {!step.done && step.required && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Needed to go live
          </span>
        )}
        {!step.done && <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />}
      </Link>
    </li>
  );
}

export function OverviewPanel() {
  const { profile, readiness, score } = useManageListing();
  const [showAll, setShowAll] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  if (!profile) return <OverviewSkeleton />;

  const inquiries = profile.inquiries ?? [];
  const leadCount = profile._count?.inquiries ?? inquiries.length;
  const unlocked = inquiries.filter((i) => i.isUnlocked).length;
  const views = (profile as { viewCount?: number; views?: number }).viewCount ?? (profile as { views?: number }).views;
  const pct = Math.max(0, Math.min(100, typeof profile.completenessPct === "number" ? Math.round(profile.completenessPct) : score.pct));

  // One list: required items first, then helpful extras (projects, documents). No separate warning banners.
  const steps: Step[] = [
    // One row per rule (rules report SUBMIT and PUBLISH items separately). Required = blocks going live.
    ...readiness.items.map((i) => ({ id: i.id.split(":")[0], label: i.label, href: hrefFor(i, profile.id), done: i.done, required: i.level !== "RECOMMENDED" })),
    { id: "projects", label: "Add your recent projects", href: manageHref("portfolio", profile.id), done: (profile.projects ?? []).length > 0, required: false },
    { id: "verify", label: "Upload documents for a verified badge", href: manageHref("team", profile.id), done: !!profile.isVerified, required: false },
  ].filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);
  const todo = steps.filter((s) => !s.done).sort((a, b) => Number(b.required) - Number(a.required));
  const top = todo.slice(0, 3);

  const stats = [
    { label: "Profile views", value: views ?? "—", icon: Eye },
    { label: "Leads", value: leadCount, icon: Inbox },
    { label: "Unlocked", value: unlocked, icon: Unlock },
  ];

  return (
    <div className="space-y-4">
      {/* Your listing card + status, side by side on desktop */}
      <div className="grid gap-4 md:grid-cols-[300px_minmax(0,1fr)] md:items-start">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Your listing</p>
          <ListingCard item={profile} />
        </div>
        <div className="space-y-4">
          <ListingStatusCard profile={profile} readiness={readiness} />
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <s.icon className="h-4 w-4 text-slate-400" aria-hidden />
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-[11px] text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {todo.length ? "Complete your profile" : "Your profile is complete"}
          </h2>
          <span className="text-xs font-semibold text-slate-500">{pct}% complete</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        {todo.length > 0 && <p className="mt-2 text-xs text-slate-500">Complete profiles rank higher in search and get more enquiries.</p>}
        {todo.length === 0 ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
            <BadgeCheck className="h-4 w-4 shrink-0" /> Everything is filled in. Clients see your full profile.
          </p>
        ) : (
          <ul className="mt-3 space-y-0.5">
            {(showAll ? steps : top).map((s) => (
              <StepRow key={s.id} step={s} />
            ))}
          </ul>
        )}
        {steps.length > top.length && (
          <button type="button" onClick={() => setShowAll((v) => !v)} className="mt-2 text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400">
            {showAll ? "Show less" : `Show full checklist (${steps.length - todo.length}/${steps.length} done)`}
          </button>
        )}
      </section>

      <InteriorPlanCard profile={profile} />

      {/* Full read-only snapshot: collapsed so the overview stays short */}
      <section className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setShowSummary((v) => !v)}
          aria-expanded={showSummary}
          className="flex w-full items-center justify-between gap-3 p-4 text-left sm:p-5"
        >
          <span>
            <span className="block text-sm font-bold text-slate-900 dark:text-white">Everything on your listing</span>
            <span className="block text-xs text-slate-500">Services, pricing, projects, materials and contact, with quick edit links.</span>
          </span>
          <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition", showSummary && "rotate-180")} />
        </button>
        {showSummary && (
          <div className="border-t border-slate-100 p-3 sm:p-4 dark:border-slate-800">
            <ListingSummary profile={profile} />
          </div>
        )}
      </section>
    </div>
  );
}
