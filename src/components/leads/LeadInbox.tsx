"use client";
/**
 * Owner's single Leads inbox: property enquiries, site visits, flatmate requests and interior
 * enquiries in one list, split into New / In progress / Closed.
 */
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BellRing, CalendarDays, Check, ChevronDown, Inbox, Loader2, Lock, MapPin, MessageCircle, Phone, RefreshCw, Search, StickyNote, Timer, X } from "lucide-react";
import {
  useGetAssignedLeadsQuery,
  useGetLeadInboxSummaryQuery,
  useGetMyResponseStatsQuery,
  useTouchInboxLeadMutation,
  useUpdateInboxLeadMetaMutation,
  useGetMyVisitsQuery,
  useUpdateLeadStatusMutation,
  useUpdateVisitStatusMutation,
} from "@/features/leads/api";
import { useGetMyFlatmateInterestsQuery, useUpdateFlatmateInterestStatusMutation } from "@/features/flatmates/api";
import {
  useGetMyInteriorInquiriesQuery,
  useUnlockInteriorInquiryMutation,
  useUpdateInteriorInquiryStatusMutation,
} from "@/features/interiors/api";
import { contactVerifyApi, useGetMyCreditsQuery } from "@/features/contactVerify/api";
import { useMeQuery } from "@/features/auth/api";
import { useDispatch } from "react-redux";
import { cn } from "@/components/ui/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  KIND_META,
  ago,
  dialable,
  replySpeed,
  fromFlatmate,
  fromInterior,
  fromPropertyLead,
  fromVisit,
  type InboxLead,
  type LeadBucket,
  type LeadKind,
} from "./leadModel";

const UNLOCK_COST = 20;
const BUCKETS: { key: LeadBucket; label: string }[] = [
  { key: "new", label: "New" },
  { key: "active", label: "In progress" },
  { key: "closed", label: "Closed" },
];
const KINDS: LeadKind[] = ["property", "visit", "flatmate", "interior"];
const DAY = 86_400_000;

const errMsg = (e: unknown, fb: string) => (e as { data?: { message?: string } })?.data?.message || fb;

export function LeadInbox() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const dispatch = useDispatch();
  const bucket = (BUCKETS.find((b) => b.key === params.get("tab"))?.key ?? "new") as LeadBucket;
  const kind = (KINDS.includes(params.get("type") as LeadKind) ? params.get("type") : "all") as LeadKind | "all";
  const [q, setQ] = useState("");
  const [now] = useState(() => Date.now());

  const setParam = (k: string, v: string | null) => {
    const sp = new URLSearchParams(params.toString());
    if (v) sp.set(k, v);
    else sp.delete(k);
    router.replace(`${pathname}${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
  };

  const { data: me } = useMeQuery();
  const myId = (me as { id?: number } | undefined)?.id;
  const leadsQ = useGetAssignedLeadsQuery({ pageSize: 100 });
  const visitsQ = useGetMyVisitsQuery();
  const flatQ = useGetMyFlatmateInterestsQuery();
  const intQ = useGetMyInteriorInquiriesQuery({ scope: "all", limit: 50 });
  const summaryQ = useGetLeadInboxSummaryQuery();
  const { data: credits } = useGetMyCreditsQuery();
  const balance = credits?.data?.credits;

  const [setLeadStatus] = useUpdateLeadStatusMutation();
  const [setVisitStatus] = useUpdateVisitStatusMutation();
  const [setFlatStatus] = useUpdateFlatmateInterestStatusMutation();
  const [setIntStatus] = useUpdateInteriorInquiryStatusMutation();
  const [unlock, { isLoading: unlocking }] = useUnlockInteriorInquiryMutation();
  const [busy, setBusy] = useState<string | null>(null);
  const { data: stats } = useGetMyResponseStatsQuery();
  const [touch] = useTouchInboxLeadMutation();
  const [saveMeta] = useUpdateInboxLeadMetaMutation();
  // Local edits so notes/follow-ups show instantly without refetching all four lists.
  const [metaEdits, setMetaEdits] = useState<Record<string, { ownerNote?: string | null; followUpAt?: string | null }>>({});
  const followUpOnly = params.get("followup") === "1";
  const [unlockTarget, setUnlockTarget] = useState<InboxLead | null>(null);

  const loading = leadsQ.isLoading || visitsQ.isLoading || flatQ.isLoading || intQ.isLoading;
  const fetching = leadsQ.isFetching || visitsQ.isFetching || flatQ.isFetching || intQ.isFetching;
  const failed = [leadsQ, visitsQ, flatQ, intQ].filter((x) => x.isError).length;

  const all = useMemo(() => {
    const out: InboxLead[] = [];
    (leadsQ.data ?? []).forEach((l) => out.push(fromPropertyLead(l)));
    // Only visits to the owner's properties (the endpoint also returns visits the user booked).
    (visitsQ.data ?? []).filter((v) => !myId || v.buyer?.id !== myId).forEach((v) => out.push(fromVisit(v)));
    (flatQ.data?.received ?? []).forEach((i) => out.push(fromFlatmate(i)));
    const ints = intQ.data as { items?: Parameters<typeof fromInterior>[0][] } | Parameters<typeof fromInterior>[0][] | undefined;
    (Array.isArray(ints) ? ints : (ints?.items ?? [])).forEach((i) => out.push(fromInterior(i)));
    return out
      .map((l) => (metaEdits[l.key] ? { ...l, ...metaEdits[l.key] } : l))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [leadsQ.data, visitsQ.data, flatQ.data, intQ.data, myId, metaEdits]);

  const kindsPresent = KINDS.filter((k) => all.some((l) => l.kind === k));
  const inKind = kind === "all" ? all : all.filter((l) => l.kind === kind);
  const counts = { new: 0, active: 0, closed: 0 } as Record<LeadBucket, number>;
  inKind.forEach((l) => counts[l.bucket]++);
  const needle = q.trim().toLowerCase();
  const isDue = (l: InboxLead) => !!l.followUpAt && new Date(l.followUpAt).getTime() <= now && l.bucket !== "closed";
  const dueCount = inKind.filter(isDue).length;
  const shown = inKind
    .filter((l) => (followUpOnly ? isDue(l) : l.bucket === bucket))
    .filter((l) => !needle || `${l.name} ${l.listing} ${l.place ?? ""} ${l.phone ?? ""}`.toLowerCase().includes(needle));

  const refreshAll = () => {
    leadsQ.refetch();
    visitsQ.refetch();
    flatQ.refetch();
    intQ.refetch();
    summaryQ.refetch();
  };

  const changeStatus = async (l: InboxLead, status: string, label: string) => {
    setBusy(l.key);
    try {
      if (l.kind === "property") await setLeadStatus({ id: l.id, status }).unwrap();
      else if (l.kind === "visit") await setVisitStatus({ id: l.id, status }).unwrap();
      else if (l.kind === "flatmate") await setFlatStatus({ id: l.id, status: status as "ACCEPTED" | "DECLINED" }).unwrap();
      else await setIntStatus({ id: l.id, status: status as never }).unwrap();
      summaryQ.refetch();
      toast.success(`${l.name}: ${label}`);
    } catch (e) {
      toast.error(errMsg(e, "Couldn't update this lead. Please try again."));
    } finally {
      setBusy(null);
    }
  };

  /** Call / WhatsApp tap: record the reply (moves NEW → contacted) without blocking the dial. */
  const onContact = (l: InboxLead) => {
    if (!l.workflowKind) return;
    touch({ kind: l.workflowKind, id: l.id })
      .unwrap()
      .then(() => {
        if (l.bucket === "new") (l.kind === "property" ? leadsQ : intQ).refetch();
      })
      .catch(() => undefined);
  };

  const onSaveMeta = async (l: InboxLead, patch: { ownerNote?: string | null; followUpAt?: string | null }) => {
    if (!l.workflowKind) return false;
    try {
      const saved = await saveMeta({ kind: l.workflowKind, id: l.id, ...patch }).unwrap();
      setMetaEdits((m) => ({ ...m, [l.key]: { ownerNote: saved.ownerNote, followUpAt: saved.followUpAt } }));
      return true;
    } catch (e) {
      toast.error(errMsg(e, "Couldn't save. Please try again."));
      return false;
    }
  };

  const confirmUnlock = async () => {
    if (!unlockTarget) return;
    try {
      await unlock(unlockTarget.id).unwrap();
      dispatch(contactVerifyApi.util.invalidateTags(["Credits", "BillingSummary"]));
      summaryQ.refetch();
      toast.success("Lead unlocked. You can call them now.");
      setUnlockTarget(null);
    } catch (e) {
      toast.error(errMsg(e, "Couldn't unlock this lead. Check your credit balance."));
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-28 pt-4 sm:px-6 sm:pb-12 sm:pt-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Leads</h1>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
            People who contacted you about your properties, rooms and interior listings.
          </p>
          {stats && stats.total > 0 && (
            <p className="mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full bg-white px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
              <Timer className="h-3.5 w-3.5 text-emerald-600" />
              {replySpeed(stats.medianMinutes) ? (
                <span>
                  You reply in <b className="text-slate-900 dark:text-white">~{replySpeed(stats.medianMinutes)}</b>
                </span>
              ) : (
                <span>Reply fast to earn a badge</span>
              )}
              <span className="text-slate-300">·</span>
              <span>
                <b className="text-slate-900 dark:text-white">{Math.round(stats.rate * 100)}%</b> replied
              </span>
              {stats.label && <span className="font-semibold text-emerald-700 dark:text-emerald-400">· Badge: {stats.label.replace("Usually replies", "replies")}</span>}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={refreshAll}
          aria-label="Refresh leads"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <RefreshCw className={cn("h-4 w-4", fetching && "animate-spin")} />
        </button>
      </div>

      {/* Bucket tabs */}
      <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-900" role="tablist" aria-label="Lead stage">
        {BUCKETS.map((b) => (
          <button
            key={b.key}
            type="button"
            role="tab"
            aria-selected={bucket === b.key}
            onClick={() => setParam("tab", b.key === "new" ? null : b.key)}
            className={cn(
              "flex min-h-10 items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition",
              bucket === b.key ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:text-slate-400",
            )}
          >
            {b.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-[11px]",
                b.key === "new" && counts.new > 0 ? "bg-rose-600 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
              )}
            >
              {counts[b.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Type chips + search */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        {kindsPresent.length > 1 && (
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
            {(["all", ...kindsPresent] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setParam("type", k === "all" ? null : k)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  kind === k
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
                )}
              >
                {k === "all" ? "All" : `${KIND_META[k].emoji} ${KIND_META[k].label}`}
              </button>
            ))}
          </div>
        )}
        {all.length > 5 && (
          <label className="relative sm:ml-auto sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, listing or phone"
              className="h-10 w-full rounded-full border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        )}
      </div>

      {(dueCount > 0 || followUpOnly) && (
        <button
          type="button"
          onClick={() => setParam("followup", followUpOnly ? null : "1")}
          className={cn(
            "mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold",
            followUpOnly
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
          )}
        >
          <BellRing className="h-4 w-4" />
          {followUpOnly ? "Showing follow-ups due · tap to see all leads" : `${dueCount} follow-up${dueCount === 1 ? "" : "s"} due · tap to view`}
        </button>
      )}

      {failed > 0 && !loading && (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          Some leads couldn&apos;t load.{" "}
          <button type="button" onClick={refreshAll} className="font-semibold underline">
            Retry
          </button>
        </p>
      )}

      {/* List */}
      <div className="mt-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          ))
        ) : shown.length === 0 ? (
          <EmptyState bucket={bucket} hasAny={all.length > 0} searching={!!needle} />
        ) : (
          shown.map((l) => (
            <LeadCard
              key={l.key}
              lead={l}
              now={now}
              busy={busy === l.key}
              onStatus={(s, label) => changeStatus(l, s, label)}
              onUnlock={() => setUnlockTarget(l)}
              onContact={() => onContact(l)}
              onSaveMeta={(patch) => onSaveMeta(l, patch)}
            />
          ))
        )}
      </div>

      <AlertDialog open={!!unlockTarget} onOpenChange={(o: boolean) => !o && setUnlockTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock {unlockTarget?.name}&apos;s contact?</AlertDialogTitle>
            <AlertDialogDescription>
              {UNLOCK_COST} credits will be used to show their phone number and email.
              {typeof balance === "number" ? ` Your balance: ${balance} credits.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {typeof balance === "number" && balance < UNLOCK_COST && (
            <p className="text-sm text-rose-600">
              Not enough credits.{" "}
              <Link href="/pricing" className="font-semibold underline">
                Top up
              </Link>
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unlocking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={unlocking || (typeof balance === "number" && balance < UNLOCK_COST)}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                confirmUnlock();
              }}
            >
              {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Unlock for {UNLOCK_COST} credits
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LeadCard({
  lead: l,
  now,
  busy,
  onStatus,
  onUnlock,
  onContact,
  onSaveMeta,
}: {
  lead: InboxLead;
  now: number;
  busy: boolean;
  onStatus: (status: string, label: string) => void;
  onUnlock: () => void;
  onContact: () => void;
  onSaveMeta: (patch: { ownerNote?: string | null; followUpAt?: string | null }) => Promise<boolean>;
}) {
  const meta = KIND_META[l.kind];
  const dial = dialable(l.phone);
  const waiting = l.bucket === "new" && now - new Date(l.createdAt).getTime() > DAY;
  const visitWhen = l.scheduledAt
    ? new Date(l.scheduledAt).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : null;
  const visitPast = l.scheduledAt ? new Date(l.scheduledAt).getTime() < now : false;
  const waText = `Hi ${l.name}, this is regarding your enquiry on Awasio for "${l.listing}".`;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      {/* Top row */}
      <div className="flex items-center gap-2 text-[11px]">
        <span className={cn("rounded-full px-2 py-0.5 font-semibold", meta.tone)}>
          {meta.emoji} {meta.label}
        </span>
        <span className="font-semibold text-slate-500 dark:text-slate-400">{l.statusLabel}</span>
        <span className={cn("ml-auto shrink-0", waiting ? "font-bold text-amber-600" : "text-slate-400")}>
          {waiting ? `Waiting ${ago(l.createdAt).replace(" ago", "")}` : ago(l.createdAt)}
        </span>
      </div>

      {/* Who + what */}
      <h3 className="mt-2 truncate text-base font-bold text-slate-900 dark:text-white">{l.name}</h3>
      <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        <span className="truncate">
          {l.listingHref ? (
            <Link href={l.listingHref} className="hover:underline">
              {l.listing}
            </Link>
          ) : (
            l.listing
          )}
        </span>
        {l.place && (
          <>
            <MapPin className="ml-1 h-3 w-3 shrink-0" />
            <span className="truncate">{l.place}</span>
          </>
        )}
      </p>

      {visitWhen && (
        <p
          className={cn(
            "mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold",
            visitPast && l.status === "SCHEDULED"
              ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
              : "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
          )}
        >
          <CalendarDays className="h-3.5 w-3.5" /> {visitWhen}
          {visitPast && l.status === "SCHEDULED" ? " · did they visit?" : ""}
        </p>
      )}

      {l.details.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {l.details.map((d) => (
            <span key={d} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {d}
            </span>
          ))}
        </div>
      )}

      {l.message && <p className="mt-2 line-clamp-3 text-sm text-slate-700 dark:text-slate-300">&ldquo;{l.message}&rdquo;</p>}

      {/* Contact line */}
      {l.locked ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Lock className="h-3.5 w-3.5" /> {l.maskedPhone || "Phone hidden"} · unlock to see contact
        </p>
      ) : l.kind === "flatmate" && l.status === "PENDING" ? (
        <p className="mt-2 text-xs text-slate-500">Accept to see their phone number.</p>
      ) : l.phone ? (
        <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
          {l.phone}
          {l.email ? <span className="font-normal text-slate-500"> · {l.email}</span> : null}
        </p>
      ) : null}

      {l.workflowKind && <NoteAndFollowUp lead={l} now={now} onSave={onSaveMeta} />}

      {/* Actions */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        {l.locked ? (
          <>
            <button
              type="button"
              onClick={onUnlock}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700 sm:flex-none"
            >
              <Lock className="h-4 w-4" /> Unlock · {UNLOCK_COST} credits
            </button>
            {l.bucket !== "closed" && (
              <GhostButton disabled={busy} onClick={() => onStatus("LOST", "marked not relevant")}>
                Not relevant
              </GhostButton>
            )}
          </>
        ) : l.kind === "flatmate" && l.status === "PENDING" ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onStatus("ACCEPTED", "accepted")}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 sm:flex-none"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Accept
            </button>
            <GhostButton disabled={busy} onClick={() => onStatus("DECLINED", "declined")}>
              <X className="h-4 w-4" /> Decline
            </GhostButton>
          </>
        ) : (
          <>
            {dial && (
              <>
                <a
                  href={`tel:${dial.tel}`}
                  onClick={onContact}
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"
                >
                  <Phone className="h-4 w-4" /> Call
                </a>
                <a
                  href={`https://wa.me/${dial.wa}?text=${encodeURIComponent(waText)}`}
                  onClick={onContact}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </>
            )}
            {l.next && (
              <GhostButton disabled={busy} onClick={() => onStatus(l.next!.value, l.next!.label.toLowerCase())}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {l.next.label}
              </GhostButton>
            )}
            {l.statusOptions.length > 0 && (
              <label className="relative ml-auto">
                <span className="sr-only">Change status</span>
                <select
                  value={l.status}
                  disabled={busy}
                  onChange={(e) => {
                    const o = l.statusOptions.find((x) => x.value === e.target.value);
                    if (o) onStatus(o.value, o.label.toLowerCase());
                  }}
                  className="h-10 appearance-none rounded-full border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {l.statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </label>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function GhostButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
      {children}
    </button>
  );
}

function EmptyState({ bucket, hasAny, searching }: { bucket: LeadBucket; hasAny: boolean; searching: boolean }) {
  const text = searching
    ? "No leads match your search."
    : !hasAny
      ? "When someone enquires about your property, room or interior listing, they'll show up here."
      : bucket === "new"
        ? "You're all caught up. No new leads waiting."
        : bucket === "active"
          ? "No leads in progress."
          : "No closed leads yet.";
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <Inbox className="h-8 w-8 text-slate-300" />
      <p className="mt-3 max-w-sm text-sm text-slate-600 dark:text-slate-400">{text}</p>
      {!hasAny && !searching && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link href="/propertyListing" className="rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700">
            Post a property
          </Link>
          <Link href="/flatmates/post" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
            Post a room
          </Link>
        </div>
      )}
    </div>
  );
}

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Quick follow-up presets: tomorrow 10 AM, in 3 days, next week (10 AM). */
function preset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(10, 0, 0, 0);
  return d;
}

function NoteAndFollowUp({
  lead: l,
  now,
  onSave,
}: {
  lead: InboxLead;
  now: number;
  onSave: (patch: { ownerNote?: string | null; followUpAt?: string | null }) => Promise<boolean>;
}) {
  const [mode, setMode] = useState<null | "note" | "follow">(null);
  const [note, setNote] = useState(l.ownerNote ?? "");
  const [when, setWhen] = useState(l.followUpAt ? toLocalInput(new Date(l.followUpAt)) : "");
  const [saving, setSaving] = useState(false);
  const due = l.followUpAt ? new Date(l.followUpAt) : null;
  const overdue = !!due && due.getTime() <= now;

  const save = async (patch: { ownerNote?: string | null; followUpAt?: string | null }) => {
    setSaving(true);
    const ok = await onSave(patch);
    setSaving(false);
    if (ok) setMode(null);
  };

  return (
    <div className="mt-2 space-y-1.5">
      {(l.ownerNote || due) && mode === null && (
        <div className="flex flex-wrap gap-1.5">
          {due && (
            <button
              type="button"
              onClick={() => setMode("follow")}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold",
                overdue ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              <BellRing className="h-3 w-3" />
              {overdue ? "Follow up now" : "Follow up"} ·{" "}
              {due.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
            </button>
          )}
          {l.ownerNote && (
            <button
              type="button"
              onClick={() => setMode("note")}
              className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-lg bg-yellow-50 px-2 py-1 text-left text-[11px] text-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200"
            >
              <StickyNote className="h-3 w-3 shrink-0" />
              <span className="truncate">{l.ownerNote}</span>
            </button>
          )}
        </div>
      )}

      {mode === null && (
        <div className="flex gap-3 text-[11px] font-semibold text-slate-500">
          <button type="button" onClick={() => setMode("note")} className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200">
            <StickyNote className="h-3.5 w-3.5" /> {l.ownerNote ? "Edit note" : "Add note"}
          </button>
          {l.bucket !== "closed" && (
            <button type="button" onClick={() => setMode("follow")} className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200">
              <BellRing className="h-3.5 w-3.5" /> {due ? "Change reminder" : "Remind me"}
            </button>
          )}
        </div>
      )}

      {mode === "note" && (
        <div className="rounded-xl border border-slate-200 p-2 dark:border-slate-700">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            rows={2}
            autoFocus
            placeholder="Private note, e.g. wants 2nd floor, budget ₹40k, call after 6 PM"
            className="w-full resize-none bg-transparent text-sm outline-none"
          />
          <div className="mt-1 flex justify-end gap-2">
            <button type="button" onClick={() => setMode(null)} className="px-2 text-xs font-semibold text-slate-500">
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => save({ ownerNote: note.trim() || null })}
              className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60 dark:bg-white dark:text-slate-900"
            >
              {saving ? "Saving…" : "Save note"}
            </button>
          </div>
        </div>
      )}

      {mode === "follow" && (
        <div className="rounded-xl border border-slate-200 p-2 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Remind me to follow up</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {[
              { label: "Tomorrow", d: 1 },
              { label: "In 3 days", d: 3 },
              { label: "Next week", d: 7 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                disabled={saving}
                onClick={() => save({ followUpAt: preset(p.d).toISOString() })}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900"
            />
            <button
              type="button"
              disabled={saving || !when}
              onClick={() => save({ followUpAt: new Date(when).toISOString() })}
              className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
            >
              Set
            </button>
          </div>
          <div className="mt-1.5 flex justify-between">
            {due ? (
              <button type="button" disabled={saving} onClick={() => save({ followUpAt: null })} className="text-xs font-semibold text-rose-600">
                Remove reminder
              </button>
            ) : (
              <span />
            )}
            <button type="button" onClick={() => setMode(null)} className="text-xs font-semibold text-slate-500">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
