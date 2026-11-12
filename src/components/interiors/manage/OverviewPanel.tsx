"use client";
import Link from "next/link";
import { BadgeCheck, CheckCircle2, Circle, Eye, Images, Inbox, ShieldAlert, Unlock } from "lucide-react";
import { interiorSteps } from "@/features/interiors/wizard/steps";
import type { ReadinessItem } from "@/types/interior.types";
import { ListingStatusCard } from "./ListingStatusCard";
import { InteriorPlanCard } from "./InteriorPlanCard";
import { ListingSummary } from "./ListingSummary";
import { manageHref, MANAGE_SECTIONS, type ManageSectionId } from "./sections";
import { useManageListing } from "./useManageListing";
import { OverviewSkeleton } from "@/components/interiors/skeletons";

const stepLabel = (id: string) => interiorSteps.find((s) => s.id === id)?.label ?? id;
const hrefFor = (item: ReadinessItem, pid?: number | null) =>
  MANAGE_SECTIONS.some((s) => s.id === item.stepId) ? manageHref(item.stepId as ManageSectionId, pid) : manageHref("overview", pid);

function Checklist({ title, items, pid }: { title: string; items: ReadinessItem[]; pid?: number | null }) {
  if (!items.length) return null;
  const done = items.filter((i) => i.done).length;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{done}/{items.length}</span>
      </div>
      <ul className="space-y-1">
        {/* Outstanding first so the next action is on top. */}
        {[...items].sort((a, b) => Number(a.done) - Number(b.done)).map((i) => (
          <li key={i.id}>
            <Link href={hrefFor(i, pid)}
              className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
              {i.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />}
              <span className={i.done ? "text-slate-500 line-through decoration-slate-300" : "text-slate-800 dark:text-slate-200"}>{i.label}</span>
              <span className="ml-auto shrink-0 text-[11px] text-slate-400">{stepLabel(i.stepId)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OverviewPanel() {
  const { profile, readiness, score } = useManageListing();
  if (!profile) return <OverviewSkeleton />;

  const inquiries = profile.inquiries ?? [];
  const leadCount = profile._count?.inquiries ?? inquiries.length;
  const unlocked = inquiries.filter((i) => i.isUnlocked).length;
  const views = (profile as { viewCount?: number; views?: number }).viewCount ?? (profile as { views?: number }).views;
  // Same number as the listings card (server-computed), falling back to the client score.
  const pct = Math.max(0, Math.min(100, typeof profile.completenessPct === "number" ? Math.round(profile.completenessPct) : score.pct));
  const submitItems = readiness.items.filter((i) => i.level === "SUBMIT");
  const publishItems = readiness.items.filter((i) => i.level === "PUBLISH");

  const stats = [
    { label: "Profile views", value: views ?? "—", icon: Eye },
    { label: "Leads", value: leadCount, icon: Inbox },
    { label: "Unlocked", value: unlocked, icon: Unlock },
  ];

  return (
    <div className="space-y-4">
      <ListingStatusCard profile={profile} readiness={readiness} />
      <InteriorPlanCard profile={profile} />

      {!(profile.projects ?? []).length && (
        <Link
          href={manageHref("portfolio", profile.id)}
          className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
        >
          <Images className="h-5 w-5 shrink-0" />
          <span className="min-w-0">
            <span className="block font-semibold">Add your recent projects</span>
            <span className="block text-xs opacity-80">
              {(profile.workGallery ?? []).length
                ? "Group your best photos into projects. Profiles with projects get more enquiries."
                : "Upload photos of homes you've done. Profiles with projects get more enquiries."}
            </span>
          </span>
          <span className="ml-auto shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">Add projects</span>
        </Link>
      )}

      {profile.isVerified ? (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          <BadgeCheck className="h-4 w-4 shrink-0" /> Verified business. Clients see a verified badge on your listing.
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Not verified yet. Upload your business documents to get a verified badge.{" "}
            <Link href={manageHref("team", profile.id)} className="font-semibold underline underline-offset-2">Add documents</Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <s.icon className="h-4 w-4 text-slate-400" aria-hidden />
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-[11px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Profile completeness</h2>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">Complete profiles get more enquiries. Tap any item to jump to it.</p>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <Checklist title="Required to submit" items={submitItems} pid={profile.id} />
          <Checklist title="Required to publish" items={publishItems} pid={profile.id} />
        </div>
        {!readiness.items.length && <p className="mt-3 text-xs text-slate-500">Checklist unavailable right now.</p>}
      </section>

      <ListingSummary profile={profile} />
    </div>
  );
}
