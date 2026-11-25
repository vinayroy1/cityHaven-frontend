"use client";

import { submitCopy, toastSubmitOutcome } from "@/lib/listingReview";
import { UnderReviewHero } from "@/components/common/UnderReviewHero";
import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, CircleDot, Clock, ExternalLink, Flame, Inbox, Loader2, PenLine, Pause, Play, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/components/ui/utils";
import { ConstructionSkeleton } from "@/components/construction/ConstructionSkeleton";
import { primaryBtn, secondaryBtn } from "@/components/construction/ui";
import { type ListingId, useMyPanditListQuery, useMyPanditQuery, useSetMyPanditStatusMutation, useSubmitMyPanditMutation } from "@/features/pandit/api";
import { panditProfilePath } from "@/features/pandit/options";
import type { MyPandit } from "@/features/pandit/types";
import { PanditCard } from "./public/PanditCard";
import { PanditLeadsPanel, PanditReviewsPanel } from "./PanditPanels";
import { PanditWizard } from "./PanditWizard";

type Tab = "overview" | "edit" | "leads" | "reviews";
const TABS: [Tab, string][] = [
  ["overview", "Overview"],
  ["edit", "Edit listing"],
  ["leads", "Enquiries"],
  ["reviews", "Reviews"],
];
const BASE = "/dashboard/pandit-profile";
const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");
const errMsg = (e: unknown, fallback: string) => toast.error((e as { data?: { message?: string } })?.data?.message || fallback);

const STATUS_LABEL: Record<string, string> = { DRAFT: "Draft", SUBMITTED: "In review", CHANGES_REQUESTED: "Changes requested", PUBLISHED: "Live", PAUSED: "Paused", REJECTED: "Rejected", ARCHIVED: "Archived" };
const STATUS_TONE: Record<string, string> = {
  DRAFT: "bg-white text-slate-700",
  SUBMITTED: "bg-sky-100 text-sky-800",
  CHANGES_REQUESTED: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  PAUSED: "bg-slate-200 text-slate-700",
  REJECTED: "bg-rose-100 text-rose-800",
};

function StatusCard({ data }: { data: MyPandit }) {
  const p = data.profile!;
  const [submit, { isLoading: submitting }] = useSubmitMyPanditMutation();
  const [setStatus, { isLoading: changing }] = useSetMyPanditStatusMutation();
  const resume = () => void setStatus({ profileId: p.id, status: "PUBLISHED" }).unwrap().then(() => toast.success("Your listing is live again")).catch((e) => errMsg(e, "Couldn't resume"));
  const view: Record<string, { tone: string; icon: React.ReactNode; title: string; body: React.ReactNode; action?: React.ReactNode }> = {
    DRAFT: {
      tone: "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
      icon: <CircleDot className="h-5 w-5 text-slate-500" />,
      title: "Draft: not submitted yet",
      body: data.readiness.canSubmit
        ? data.reviewRequired === false ? "Everything required is filled in. Publish to go live." : "Everything required is filled in. Submit for approval to go live."
        : data.reviewRequired === false ? "Finish the required details, then publish." : "Finish the required details, then submit for approval.",
      action: data.readiness.canSubmit ? (
        <button type="button" className={primaryBtn} disabled={submitting} onClick={() => void submit(p.id).unwrap().then(toastSubmitOutcome).catch((e) => errMsg(e, "Couldn't submit"))}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />} {submitCopy(data.reviewRequired).button}
        </button>
      ) : undefined,
    },
    SUBMITTED: { tone: "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30", icon: <Clock className="h-5 w-5 text-amber-600" />, title: "In review", body: "Our team usually reviews new listings within 24 hours. You'll get a notification." },
    CHANGES_REQUESTED: { tone: "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30", icon: <AlertTriangle className="h-5 w-5 text-amber-600" />, title: "Changes requested", body: <span className="whitespace-pre-line">{p.reviewNotes || "Please update your listing and submit again."}</span> },
    PUBLISHED: {
      tone: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      title: "Live on Awasio",
      body: data.billing?.monthlyCredits ? `Paid until ${fmtDate(data.billing.paidUntil)}. Renews automatically for ${data.billing.monthlyCredits} credits / ${data.billing.periodDays} days.` : "Families can find you and send enquiries.",
      action: (
        <div className="flex flex-wrap gap-2">
          <Link href={panditProfilePath(p)} target="_blank" className={secondaryBtn}><ExternalLink className="h-4 w-4" /> View public profile</Link>
          <button type="button" className={secondaryBtn} disabled={changing} onClick={() => void setStatus({ profileId: p.id, status: "PAUSED" }).unwrap().then(() => toast.success("Listing paused")).catch((e) => errMsg(e, "Couldn't pause"))}>
            <Pause className="h-4 w-4" /> Pause
          </button>
        </div>
      ),
    },
    PAUSED: {
      tone: "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
      icon: <Pause className="h-5 w-5 text-slate-500" />,
      title: data.billing?.pausedForPayment ? "Paused: payment due" : "Paused",
      body: data.billing?.pausedForPayment ? `Your listing is approved. Add ${data.billing.monthlyCredits} credits to go live for ${data.billing.periodDays} days.` : "People can't see your listing while it's paused.",
      action: (
        <div className="flex flex-wrap gap-2">
          {data.billing?.pausedForPayment && <Link href="/pricing" className={secondaryBtn}>Buy credits</Link>}
          <button type="button" className={primaryBtn} disabled={changing} onClick={resume}>
            {changing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Go live
          </button>
        </div>
      ),
    },
    REJECTED: { tone: "border-rose-200 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/30", icon: <AlertTriangle className="h-5 w-5 text-rose-600" />, title: "Not approved", body: p.reviewNotes || "Contact support for details." },
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

function Overview({ data, goTab }: { data: MyPandit; goTab: (t: Tab) => void }) {
  const p = data.profile!;
  const todo = data.readiness.items.filter((i) => !i.done);
  return (
    <div className="space-y-4">
      {p.status === "SUBMITTED" && (
        <UnderReviewHero
          accent="orange"
          noun="pandit profile"
          name={p.displayName}
          submittedAt={p.submittedAt}
          checks={["Name, photo & contact", "Pujas & services offered", "Languages & areas served", "Experience & dakshina"]}
          actions={[
            { label: "Polish your profile", hint: "Add more pujas, languages and a warm introduction.", onClick: () => goTab("edit"), icon: PenLine },
            { label: "Prepare for enquiries", hint: "Families will call or WhatsApp you directly once you're live.", onClick: () => goTab("leads"), icon: Inbox },
          ]}
        />
      )}
      <div className="grid gap-4 md:grid-cols-[300px_1fr] md:items-start">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Your listing</p>
          <PanditCard p={p} completeness={data.readiness.pct} />
        </div>
        <div className="space-y-4">
          {p.status !== "SUBMITTED" && <StatusCard data={data} />}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              ["Profile views", p.viewCount ?? 0],
              ["Enquiries", p.inquiryCount ?? 0],
              ["Rating", p.ratingCount ? `${p.ratingAvg.toFixed(1)} ★` : "—"],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-[11px] text-slate-500">{k}</p>
                <p className="mt-0.5 truncate text-lg font-bold text-slate-900 dark:text-white">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {todo.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Complete your profile</h2>
            <span className="text-xs font-semibold text-slate-500">{data.readiness.pct}% complete</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Complete profiles rank higher and get more enquiries.</p>
          <ul className="mt-3 space-y-1">
            {todo.map((i) => (
              <li key={i.id}>
                <button type="button" onClick={() => goTab("edit")} className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                  <CircleDot className={cn("h-4 w-4 shrink-0", i.required ? "text-rose-600" : "text-sky-500")} />
                  <span className="flex-1 text-slate-800 dark:text-slate-200">{i.label}</span>
                  <span className={cn("text-[11px] font-semibold", i.required ? "text-rose-600" : "text-slate-400")}>{i.required ? "Required" : "Recommended"}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function LoadError({ onRetry, spinning }: { onRetry: () => void; spinning: boolean }) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-800">
      Couldn&apos;t load your listing.
      <button type="button" onClick={() => void onRetry()} className="ml-2 inline-flex items-center gap-1 font-bold underline">
        <RefreshCw className={cn("h-3.5 w-3.5", spinning && "animate-spin")} /> Retry
      </button>
    </div>
  );
}

/** Entry: `?id=` opens one listing, `?id=new` creates another, no id shows all of the owner's listings. */
export function PanditDashboard() {
  const params = useSearchParams();
  const id = params.get("id");
  const flowKey = id === "new" || params.get("setup") === "1" ? "setup-flow" : `listing-${id}`;
  if (id === "new") return <ListingDashboard key={flowKey} listingId="new" />;
  const n = Number(id);
  if (id && Number.isInteger(n) && n > 0) return <ListingDashboard key={flowKey} listingId={n} />;
  return <MyListings />;
}

function MyListings() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isFetching } = useMyPanditListQuery();
  const empty = !isLoading && !isError && (data?.length ?? 0) === 0;
  React.useEffect(() => {
    if (empty) router.replace(`${BASE}?id=new${typeof window !== "undefined" && window.location.search.includes("segment=VASTU") ? "&segment=VASTU" : ""}`, { scroll: false });
  }, [empty, router]);
  if (isLoading || empty) return <ConstructionSkeleton />;
  if (isError || !data) return <LoadError onRetry={refetch} spinning={isFetching} />;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your listings ({data.length})</h2>
          <p className="text-sm text-slate-500">E.g. one for puja services and one for vastu, each with its own enquiries.</p>
        </div>
        <Link href={`${BASE}?id=new`} className={primaryBtn}><Plus className="h-4 w-4" /> Add another listing</Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((p) => (
          <li key={p.id} className="flex flex-col">
            <PanditCard
              p={p}
              completeness={p.readiness.pct}
              badge={<span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm", STATUS_TONE[p.status] ?? "bg-slate-100 text-slate-600")}>{STATUS_LABEL[p.status] ?? p.status}</span>}
              actions={
                <>
                  <Link href={panditProfilePath(p)} target="_blank" className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                    Preview <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <Link href={`${BASE}?id=${p.id}`} className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 text-sm font-bold text-white hover:bg-rose-700">Manage</Link>
                </>
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ListingDashboard({ listingId }: { listingId: ListingId }) {
  const router = useRouter();
  const params = useSearchParams();
  const { data, isLoading, isError, refetch, isFetching } = useMyPanditQuery(listingId);
  const { data: all } = useMyPanditListQuery();
  const tab = (params.get("tab") as Tab) || "overview";
  const [inSetup, setInSetup] = React.useState(listingId === "new" || params.get("setup") === "1");
  const goTab = (t: Tab) => {
    setInSetup(false);
    const id = data?.profile?.id ?? listingId;
    router.replace(`${BASE}?id=${id}${t === "overview" ? "" : `&tab=${t}`}`, { scroll: false });
  };

  if (isLoading) return <ConstructionSkeleton />;
  if (isError || !data) return <LoadError onRetry={refetch} spinning={isFetching} />;
  if (listingId !== "new" && !data.profile) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm dark:border-slate-800 dark:bg-slate-900">
        This listing doesn&apos;t exist or isn&apos;t yours. <Link href={BASE} className="font-bold text-rose-600 underline">See your listings</Link>
      </div>
    );
  }
  const backToAll = (all?.length ?? 0) > 0 && (
    <Link href={BASE} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-rose-600 dark:text-slate-300">
      <ArrowLeft className="h-4 w-4" /> All listings ({all!.length})
    </Link>
  );

  if (!data.profile || (inSetup && tab === "overview")) {
    return (
      <div>
        {backToAll}
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-700 to-rose-900 p-4 text-white">
          <Flame className="h-8 w-8 shrink-0 text-amber-300" />
          <div>
            <p className="text-sm font-bold">{(all?.length ?? 0) > 0 && listingId === "new" ? "Add another listing" : "List your puja or vastu services on Awasio"}</p>
            <p className="text-xs text-orange-100">About 5 minutes. Get enquiries from families moving into new homes and building on plots.</p>
          </div>
        </div>
        <PanditWizard data={data} onCreated={(newId) => router.replace(`${BASE}?id=${newId}&setup=1`, { scroll: false })} onDone={() => goTab("overview")} />
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
      {backToAll}
      <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Listing sections">
        {TABS.map(([t, l]) => (
          <button key={t} type="button" onClick={() => goTab(t)} aria-current={tab === t ? "page" : undefined} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition", tab === t ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300")}>
            {l}
          </button>
        ))}
      </nav>
      {tab === "overview" && <Overview data={data} goTab={goTab} />}
      {tab === "edit" && <PanditWizard key={p.id} data={data} mode={p.status === "DRAFT" || p.status === "CHANGES_REQUESTED" ? "setup" : "edit"} onDone={() => goTab("overview")} />}
      {tab === "leads" && <PanditLeadsPanel profileId={p.id} />}
      {tab === "reviews" && <PanditReviewsPanel profileId={p.id} avg={p.ratingAvg} count={p.ratingCount} />}
    </div>
  );
}
