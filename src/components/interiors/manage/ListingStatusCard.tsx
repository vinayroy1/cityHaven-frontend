"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { Archive, CalendarClock, Loader2, Pause, Play, Rocket, Send } from "lucide-react";
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
import { InteriorListingStatus as S, type InteriorProfile, type ReadinessReport } from "@/types/interior.types";
import { StatusBadge, effectiveStatus } from "./StatusBadge";
import { errorMessage, usePublishProfile, useSubmitProfile, useUpdateStatus, type StatusChange } from "./manageApi";

type Pending = { kind: "PAUSED" | "TEMP_UNAVAILABLE" | "ARCHIVED" } | null;

const HELP: Partial<Record<S, string>> = {
  DRAFT: "Your listing is not visible to clients yet. Complete the checklist and submit it for review.",
  SUBMITTED: "Thanks! Our team will review your listing, usually within 1–2 working days.",
  IN_REVIEW: "Our team is reviewing your listing. You can keep editing; changes are included in the review.",
  CHANGES_REQUESTED: "The reviewer asked for a few changes. Fix them and re-submit.",
  PUBLISHED: "Your listing is live and visible in search.",
  PAUSED: "Your listing is hidden from search. Existing leads stay available.",
  TEMP_UNAVAILABLE: "Clients can see your profile but are told you are not taking new projects right now.",
  ARCHIVED: "Your listing is archived and hidden. You can restore it at any time.",
  REJECTED: "Your listing was not approved. Review the notes, update it, and re-submit.",
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export function ListingStatusCard({ profile, readiness }: { profile: InteriorProfile; readiness: ReadinessReport }) {
  const status = effectiveStatus(profile);
  const [updateStatus, { isLoading: updating }] = useUpdateStatus();
  const [submit, { isLoading: submitting }] = useSubmitProfile();
  const [publish, { isLoading: publishing }] = usePublishProfile();
  const [pending, setPending] = useState<Pending>(null);
  const [until, setUntil] = useState("");
  const [reason, setReason] = useState("");
  const busy = updating || submitting || publishing;

  const change = async (body: StatusChange, ok: string) => {
    try {
      await updateStatus(body).unwrap();
      toast.success(ok);
      setPending(null);
      setUntil("");
      setReason("");
    } catch (e) {
      toast.error(errorMessage(e, "Could not update the listing status."));
    }
  };

  const doSubmit = async () => {
    try {
      await submit().unwrap();
      toast.success("Submitted for review.");
    } catch (e) {
      toast.error(errorMessage(e, "Could not submit. Check the checklist below."));
    }
  };

  const doPublish = async () => {
    try {
      await publish().unwrap();
      toast.success("Your listing is live.");
    } catch (e) {
      toast.error(errorMessage(e, "Could not publish yet. Check the checklist below."));
    }
  };

  const btn =
    "inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50";
  const ghost = `${btn} border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800`;
  const primary = `${btn} bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900`;

  const canSubmitNow = [S.DRAFT, S.CHANGES_REQUESTED, S.REJECTED].includes(status);
  const isPaused = [S.PAUSED, S.TEMP_UNAVAILABLE, S.ARCHIVED].includes(status);
  const wasPublished = Boolean(profile.publishedAt) || profile.isPublished;
  const publishReady = readiness.canPublish && (status === S.SUBMITTED || status === S.IN_REVIEW);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5" aria-labelledby="listing-status-title">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="listing-status-title" className="text-sm font-bold text-slate-900 dark:text-white">Listing status</h2>
        <StatusBadge profile={profile} />
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{HELP[status]}</p>

      {status === S.TEMP_UNAVAILABLE && profile.pausedUntil && (
        <p className="mt-1 text-xs font-medium text-orange-700 dark:text-orange-300">
          Back on {new Date(profile.pausedUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      )}
      {(status === S.CHANGES_REQUESTED || status === S.REJECTED) && profile.reviewNotes && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-semibold">Reviewer notes</p>
          <p className="mt-0.5 whitespace-pre-line">{profile.reviewNotes}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {canSubmitNow && (
          <button type="button" className={primary} disabled={busy || !readiness.canSubmit} onClick={doSubmit}
            title={readiness.canSubmit ? undefined : "Complete the 'Required to submit' items first"}>
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {status === S.DRAFT ? "Submit for review" : "Re-submit for review"}
          </button>
        )}
        {publishReady && (
          <button type="button" className={primary} disabled={busy} onClick={doPublish}>
            {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />} Publish
          </button>
        )}
        {status === S.PUBLISHED && (
          <>
            <button type="button" className={ghost} disabled={busy} onClick={() => setPending({ kind: "PAUSED" })}>
              <Pause className="h-3.5 w-3.5" /> Pause
            </button>
            <button type="button" className={ghost} disabled={busy} onClick={() => setPending({ kind: "TEMP_UNAVAILABLE" })}>
              <CalendarClock className="h-3.5 w-3.5" /> Temporarily unavailable
            </button>
          </>
        )}
        {isPaused && wasPublished && (
          <button type="button" className={primary} disabled={busy}
            onClick={() => change({ status: "PUBLISHED" }, "Your listing is live again.")}>
            {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {status === S.ARCHIVED ? "Restore listing" : "Resume listing"}
          </button>
        )}
        {status !== S.ARCHIVED && status !== S.DRAFT && (
          <button type="button" className={`${ghost} text-rose-700 dark:text-rose-300`} disabled={busy} onClick={() => setPending({ kind: "ARCHIVED" })}>
            <Archive className="h-3.5 w-3.5" /> Archive
          </button>
        )}
      </div>
      {canSubmitNow && !readiness.canSubmit && (
        <p className="mt-2 text-[11px] text-slate-500">Finish the items marked “Required to submit” to enable submission.</p>
      )}

      <AlertDialog open={pending !== null} onOpenChange={(o: boolean) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.kind === "PAUSED" && "Pause your listing?"}
              {pending?.kind === "TEMP_UNAVAILABLE" && "Mark as temporarily unavailable"}
              {pending?.kind === "ARCHIVED" && "Archive your listing?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.kind === "PAUSED" && "You will be hidden from search until you resume. Leads you already have stay available."}
              {pending?.kind === "TEMP_UNAVAILABLE" && "Your profile stays visible, but clients see that you are not taking new projects until the date you choose."}
              {pending?.kind === "ARCHIVED" && "Your listing will be hidden. You can restore it later from this page."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pending?.kind === "TEMP_UNAVAILABLE" && (
            <div className="space-y-1.5">
              <label htmlFor="until" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Available again from</label>
              <input id="until" type="date" min={todayIso()} value={until} onChange={(e) => setUntil(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
            </div>
          )}
          {pending && (
            <div className="space-y-1.5">
              <label htmlFor="reason" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reason (optional, private)</label>
              <input id="reason" value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Team on leave"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={updating || (pending?.kind === "TEMP_UNAVAILABLE" && !until)}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                if (!pending) return;
                const msg = { PAUSED: "Listing paused.", TEMP_UNAVAILABLE: "Marked as temporarily unavailable.", ARCHIVED: "Listing archived." }[pending.kind];
                change(
                  { status: pending.kind, until: pending.kind === "TEMP_UNAVAILABLE" ? new Date(until).toISOString() : null, reason: reason.trim() || undefined },
                  msg,
                );
              }}
            >
              {updating ? "Saving…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
