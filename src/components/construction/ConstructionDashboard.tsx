"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, CircleDot, Clock, ExternalLink, HardHat, Loader2, Pause, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/components/ui/utils";
import { useMyConstructionQuery, useSetMyConstructionStatusMutation, useSubmitMyConstructionMutation } from "@/features/construction/api";
import { constructionProfilePath } from "@/features/construction/options";
import type { MyConstruction } from "@/features/construction/types";
import { ConstructionWizard } from "./ConstructionWizard";
import { LeadsPanel } from "./LeadsPanel";
import { ProjectsPanel } from "./ProjectsPanel";
import { primaryBtn, secondaryBtn } from "./ui";

type Tab = "overview" | "edit" | "projects" | "leads";
const TABS: [Tab, string][] = [
  ["overview", "Overview"],
  ["edit", "Edit listing"],
  ["projects", "Projects"],
  ["leads", "Enquiries"],
];

const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

function StatusCard({ data }: { data: MyConstruction }) {
  const p = data.profile!;
  const [submit, { isLoading: submitting }] = useSubmitMyConstructionMutation();
  const [setStatus, { isLoading: changing }] = useSetMyConstructionStatusMutation();
  const err = (e: unknown, fallback: string) => toast.error((e as { data?: { message?: string } })?.data?.message || fallback);
  const resume = () => void setStatus("PUBLISHED").unwrap().then(() => toast.success("Your listing is live again")).catch((e) => err(e, "Couldn't resume"));

  const view: Record<string, { tone: string; icon: React.ReactNode; title: string; body: React.ReactNode; action?: React.ReactNode }> = {
    DRAFT: {
      tone: "border-slate-200 bg-white",
      icon: <CircleDot className="h-5 w-5 text-slate-500" />,
      title: "Draft: not submitted yet",
      body: data.readiness.canSubmit ? "Everything required is filled in. Submit for approval to go live." : "Finish the required details, then submit for approval.",
      action: data.readiness.canSubmit ? (
        <button type="button" className={primaryBtn} disabled={submitting} onClick={() => void submit().unwrap().then(() => toast.success("Submitted for approval")).catch((e) => err(e, "Couldn't submit"))}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit for approval
        </button>
      ) : undefined,
    },
    SUBMITTED: {
      tone: "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30",
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      title: "In review",
      body: "Our team usually reviews new construction listings within 24 hours. You'll get a notification.",
    },
    CHANGES_REQUESTED: {
      tone: "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30",
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      title: "Changes requested",
      body: <span className="whitespace-pre-line">{p.reviewNotes || "Please update your listing and submit again."}</span>,
    },
    PUBLISHED: {
      tone: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      title: "Live on Awasio",
      body: data.billing?.monthlyCredits ? `Paid until ${fmtDate(data.billing.paidUntil)}. Renews automatically for ${data.billing.monthlyCredits} credits / ${data.billing.periodDays} days.` : "Customers can find you and send enquiries.",
      action: (
        <div className="flex flex-wrap gap-2">
          <Link href={constructionProfilePath(p)} target="_blank" className={secondaryBtn}>
            <ExternalLink className="h-4 w-4" /> View public profile
          </Link>
          <button type="button" className={secondaryBtn} disabled={changing} onClick={() => void setStatus("PAUSED").unwrap().then(() => toast.success("Listing paused")).catch((e) => err(e, "Couldn't pause"))}>
            <Pause className="h-4 w-4" /> Pause
          </button>
        </div>
      ),
    },
    PAUSED: {
      tone: "border-slate-200 bg-white",
      icon: <Pause className="h-5 w-5 text-slate-500" />,
      title: data.billing?.pausedForPayment ? "Paused: payment due" : "Paused",
      body: data.billing?.pausedForPayment
        ? `Your listing is approved. Add ${data.billing.monthlyCredits} credits to go live for ${data.billing.periodDays} days.`
        : "Customers can't see your listing while it's paused.",
      action: (
        <div className="flex flex-wrap gap-2">
          {data.billing?.pausedForPayment && <Link href="/pricing" className={secondaryBtn}>Buy credits</Link>}
          <button type="button" className={primaryBtn} disabled={changing} onClick={resume}>
            {changing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Go live
          </button>
        </div>
      ),
    },
    REJECTED: {
      tone: "border-rose-200 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/30",
      icon: <AlertTriangle className="h-5 w-5 text-rose-600" />,
      title: "Not approved",
      body: p.reviewNotes || "Contact support for details.",
    },
  };
  const v = view[p.status] ?? view.DRAFT;
  return (
    <section className={cn("rounded-3xl border p-4 sm:p-5", v.tone)}>
      <div className="flex items-start gap-3">
        {v.icon}
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{v.title}</h2>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{v.body}</div>
          {v.action && <div className="mt-3">{v.action}</div>}
        </div>
      </div>
    </section>
  );
}

function Overview({ data, goTab }: { data: MyConstruction; goTab: (t: Tab) => void }) {
  const p = data.profile!;
  const todo = data.readiness.items.filter((i) => !i.done);
  const stepTab = (step: string): Tab => (step === "projects" ? "projects" : "edit");
  return (
    <div className="space-y-4">
      <StatusCard data={data} />
      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{todo.length ? "Complete your profile" : "Your profile is complete"}</h2>
          <span className="text-xs font-semibold text-slate-500">{data.readiness.pct}% complete</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={data.readiness.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${data.readiness.pct}%` }} />
        </div>
        {todo.length > 0 && <p className="mt-2 text-xs text-slate-500">Complete profiles rank higher and get more enquiries.</p>}
        <ul className="mt-3 space-y-1">
          {todo.map((i) => (
            <li key={i.id}>
              <button type="button" onClick={() => goTab(stepTab(i.step))} className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                <CircleDot className={cn("h-4 w-4 shrink-0", i.required ? "text-rose-600" : "text-sky-500")} />
                <span className="flex-1 text-slate-800 dark:text-slate-200">{i.label}</span>
                <span className={cn("text-[11px] font-semibold", i.required ? "text-rose-600" : "text-slate-400")}>{i.required ? "Required" : "Recommended"}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          ["Profile views", p.viewCount ?? 0],
          ["Projects", p.projectCount],
          ["Status", p.status === "PUBLISHED" ? "Live" : p.status.replace("_", " ").toLowerCase()],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[11px] text-slate-500">{k}</p>
            <p className="mt-0.5 truncate text-lg font-bold capitalize text-slate-900 dark:text-white">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConstructionDashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, isLoading, isError, refetch, isFetching } = useMyConstructionQuery();
  const tab = (params.get("tab") as Tab) || "overview";
  // Setup stays in the wizard until it's submitted or the owner leaves it (saving each step must not
  // flip the page to the overview half-way through).
  const [leftSetup, setLeftSetup] = React.useState(false);
  const goTab = (t: Tab) => {
    setLeftSetup(true);
    router.replace(`/dashboard/construction-profile${t === "overview" ? "" : `?tab=${t}`}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-3xl bg-white dark:bg-slate-900" />
        <div className="h-64 animate-pulse rounded-3xl bg-white dark:bg-slate-900" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-800">
        Couldn&apos;t load your listing.
        <button type="button" onClick={() => void refetch()} className="ml-2 inline-flex items-center gap-1 font-bold underline">
          <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} /> Retry
        </button>
      </div>
    );
  }

  // First-time setup: no listing yet, or a draft that was never submitted.
  const firstSetup = !data.profile || (data.profile.status === "DRAFT" && !data.profile.submittedAt && !data.profile.publishedAt);
  if (!data.profile || (firstSetup && !leftSetup && tab === "overview")) {
    return (
      <div>
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-900 to-rose-950 p-4 text-white">
          <HardHat className="h-8 w-8 shrink-0 text-amber-300" />
          <div>
            <p className="text-sm font-bold">List your construction business on Awasio</p>
            <p className="text-xs text-slate-300">About 5 minutes. Get enquiries from people building their homes.</p>
          </div>
        </div>
        <ConstructionWizard data={data} onDone={() => goTab("overview")} />
        {data.profile && (
          <p className="mt-2 text-center text-xs text-slate-500">
            <button type="button" className="font-semibold underline" onClick={() => goTab("overview")}>Finish later</button> — your progress is saved.
          </p>
        )}
      </div>
    );
  }

  const p = data.profile;
  return (
    <div className="space-y-5">
      <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Listing sections">
        {TABS.map(([t, l]) => (
          <button
            key={t}
            type="button"
            onClick={() => goTab(t)}
            aria-current={tab === t ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
              tab === t ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300",
            )}
          >
            {l}
          </button>
        ))}
      </nav>
      {tab === "overview" && <Overview data={data} goTab={goTab} />}
      {tab === "edit" && <ConstructionWizard key={p.id} data={data} mode={p.status === "DRAFT" || p.status === "CHANGES_REQUESTED" ? "setup" : "edit"} onDone={() => goTab("overview")} />}
      {tab === "projects" && <ProjectsPanel projects={p.projects} profileId={p.id} city={p.city} />}
      {tab === "leads" && <LeadsPanel />}
    </div>
  );
}
