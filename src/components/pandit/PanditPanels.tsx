"use client";

import React from "react";
import Link from "next/link";
import { CalendarDays, Inbox, Loader2, Lock, MessageCircle, Phone, Star, Unlock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/components/ui/utils";
import { useMyPanditLeadsQuery, useMyPanditReviewsQuery, useReplyPanditReviewMutation, useUnlockPanditLeadMutation, useUpdatePanditLeadMutation } from "@/features/pandit/api";
import { LANGUAGE_OPTIONS, LEAD_STATUS_OPTIONS, label, serviceLabel } from "@/features/pandit/options";
import type { PanditLead, PanditLeadStatus, PanditReview } from "@/features/pandit/types";
import { ReviewItem } from "./public/ReviewSection";

const timeAgo = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${Math.max(1, m)} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};
const fmtDay = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

function LeadCard({ lead, unlockCost }: { lead: PanditLead; unlockCost: number }) {
  const [unlock, { isLoading: unlocking }] = useUnlockPanditLeadMutation();
  const [update, { isLoading: updating }] = useUpdatePanditLeadMutation();
  const facts = [
    lead.service ? serviceLabel(lead.service) : "",
    lead.mode === "ONLINE" ? "Online" : "",
    lead.language ? label(LANGUAGE_OPTIONS, lead.language) : "",
    [lead.locality, lead.city].filter(Boolean).join(", "),
  ].filter(Boolean);
  const status = LEAD_STATUS_OPTIONS.find((s) => s.value === lead.status);
  const wa = lead.phone.replace(/\D/g, "").slice(-10);
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{lead.name}</p>
          <p className="text-xs text-slate-500">{timeAgo(lead.createdAt)}</p>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold", status?.tone)}>{status?.label}</span>
      </div>
      {lead.eventDate && (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <CalendarDays className="h-3.5 w-3.5" /> {fmtDay(lead.eventDate)}
        </p>
      )}
      {facts.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {facts.map((f) => <span key={f} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">{f}</span>)}
        </div>
      )}
      {lead.message && <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{lead.message}</p>}
      {lead.isUnlocked ? (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            <a href={`tel:+91${wa}`} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white hover:bg-emerald-700"><Phone className="h-4 w-4" /> {lead.phone}</a>
            <a href={`https://wa.me/91${wa}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-emerald-200 px-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
          </div>
          {lead.email && <p className="text-xs text-slate-500">{lead.email}</p>}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            Status
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={lead.status} disabled={updating} onChange={(e) => void update({ id: lead.id, status: e.target.value as PanditLeadStatus }).unwrap().catch(() => toast.error("Couldn't update"))}>
              {LEAD_STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500"><Lock className="h-4 w-4" /> {lead.phone}</span>
          <button
            type="button"
            disabled={unlocking}
            onClick={() => void unlock(lead.id).unwrap().then(() => toast.success("Lead unlocked")).catch((err) => toast.error(err?.data?.message || "Couldn't unlock this lead"))}
            className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />} Unlock{unlockCost ? ` · ${unlockCost} credits` : ""}
          </button>
        </div>
      )}
    </li>
  );
}

export function PanditLeadsPanel({ profileId }: { profileId: number }) {
  const { data, isLoading, isError, refetch } = useMyPanditLeadsQuery(profileId);
  const [filter, setFilter] = React.useState<"all" | "upcoming" | PanditLeadStatus>("all");
  if (isLoading) return <div className="h-40 animate-pulse rounded-3xl bg-white dark:bg-slate-900" />;
  if (isError)
    return (
      <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">
        Couldn&apos;t load enquiries. <button type="button" className="font-bold underline" onClick={() => void refetch()}>Retry</button>
      </div>
    );
  const all = data?.items ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const items =
    filter === "all"
      ? all
      : filter === "upcoming"
        ? all.filter((l) => l.eventDate && l.eventDate >= today && l.status !== "LOST").sort((a, b) => (a.eventDate! < b.eventDate! ? -1 : 1))
        : all.filter((l) => l.status === filter);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Enquiries</h2>
          <p className="text-sm text-slate-500">Unlock an enquiry to see the number and confirm the date.</p>
        </div>
        <Link href="/pricing" className="text-sm font-semibold text-rose-600 hover:underline">Buy credits</Link>
      </div>
      {all.length > 0 && (
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {([["all", "All"], ["upcoming", "Upcoming dates"], ...LEAD_STATUS_OPTIONS.map((s) => [s.value, s.label])] as [string, string][]).map(([v, l]) => (
            <button key={v} type="button" onClick={() => setFilter(v as typeof filter)} className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold", filter === v ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300")}>
              {l}
            </button>
          ))}
        </div>
      )}
      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <Inbox className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{all.length ? "Nothing here" : "No enquiries yet"}</p>
          <p className="mt-1 text-sm text-slate-500">Add your dakshina, photos and a few more pujas to get more enquiries once you&apos;re live.</p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">{items.map((l) => <LeadCard key={l.id} lead={l} unlockCost={data?.unlockCost ?? 0} />)}</ul>
      )}
    </div>
  );
}

function ReplyBox({ r }: { r: PanditReview }) {
  const [reply, setReply] = React.useState(r.reply ?? "");
  const [open, setOpen] = React.useState(false);
  const [save, { isLoading }] = useReplyPanditReviewMutation();
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-2 text-xs font-bold text-rose-600 hover:underline">
        {r.reply ? "Edit reply" : "Reply publicly"}
      </button>
    );
  return (
    <div className="mt-2 space-y-2">
      <textarea rows={2} maxLength={1000} value={reply} onChange={(e) => setReply(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Thank them, or respond politely to a concern" />
      <div className="flex gap-2">
        <button type="button" disabled={isLoading} onClick={() => void save({ id: r.id, reply }).unwrap().then(() => { toast.success("Reply saved"); setOpen(false); }).catch(() => toast.error("Couldn't save"))} className="inline-flex h-9 items-center gap-1 rounded-lg bg-rose-600 px-3 text-xs font-bold text-white disabled:opacity-60">
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save reply
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-9 px-2 text-xs font-semibold text-slate-600">Cancel</button>
      </div>
    </div>
  );
}

export function PanditReviewsPanel({ profileId, avg, count }: { profileId: number; avg: number; count: number }) {
  const { data, isLoading } = useMyPanditReviewsQuery(profileId);
  if (isLoading) return <div className="h-40 animate-pulse rounded-3xl bg-white dark:bg-slate-900" />;
  const items = data ?? [];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reviews</h2>
          <p className="text-sm text-slate-500">Only people who contacted you through Awasio can review you. Reply to build trust.</p>
        </div>
        {count > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900">
            <Star className="h-4 w-4 fill-current" /> {avg.toFixed(1)} · {count}
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          No reviews yet. After a puja, ask the family to open your Awasio profile and tap &quot;Write a review&quot;.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => <ReviewItem key={r.id} r={r} footer={<ReplyBox r={r} />} />)}
        </ul>
      )}
    </div>
  );
}
