"use client";

import React from "react";
import { Loader2, MessageSquareQuote, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getStoredUserContact } from "@/lib/auth/storedUser";
import { loginUrlForCurrentPage } from "@/lib/auth/loginRedirect";
import { cn } from "@/components/ui/utils";
import { useDeletePanditReviewMutation, useMyPanditReviewQuery, useSavePanditReviewMutation } from "@/features/pandit/api";
import { serviceLabel } from "@/features/pandit/options";
import type { PanditReview } from "@/features/pandit/types";

const noopSubscribe = () => () => {};
const fmt = (s: string) => new Date(s).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

export function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(size, n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600")} />
      ))}
    </span>
  );
}

export function ReviewItem({ r, footer }: { r: PanditReview; footer?: React.ReactNode }) {
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{r.author}</p>
          <p className="text-[11px] text-slate-500">{[r.service ? serviceLabel(r.service) : "", fmt(r.createdAt)].filter(Boolean).join(" · ")}</p>
        </div>
        <Stars value={r.rating} size="h-3.5 w-3.5" />
      </div>
      {r.comment && <p className="mt-2 whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">{r.comment}</p>}
      {r.reply && (
        <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Reply</p>
          <p className="mt-0.5 whitespace-pre-line">{r.reply}</p>
        </div>
      )}
      {footer}
    </li>
  );
}

/** Lets a visitor who contacted the listing through Awasio rate it (one review each, editable). */
export function WriteReview({ profileId, services, name }: { profileId: number; services: string[]; name: string }) {
  // null on the server and during hydration, so both renders match.
  const signedIn = React.useSyncExternalStore(
    noopSubscribe,
    () => !!getStoredUserContact(),
    () => null,
  );
  const { data, isLoading } = useMyPanditReviewQuery(profileId, { skip: !signedIn });
  const [save, { isLoading: saving }] = useSavePanditReviewMutation();
  const [remove, { isLoading: removing }] = useDeletePanditReviewMutation();
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [service, setService] = React.useState("");
  const [comment, setComment] = React.useState("");

  if (signedIn === null) return null;
  if (!signedIn) {
    return (
      <button type="button" onClick={() => { window.location.href = loginUrlForCurrentPage(); }} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-amber-300 dark:border-slate-700 dark:text-slate-200">
        <MessageSquareQuote className="h-4 w-4" /> Sign in to write a review
      </button>
    );
  }
  if (isLoading || !data || data.isOwner) return null;
  if (!data.canReview) {
    return <p className="text-xs text-slate-500">Reviews are open to people who contacted {name} through Awasio. Send an enquiry or view their number first.</p>;
  }
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setRating(data.review?.rating ?? 0);
          setService(data.review?.service ?? "");
          setComment(data.review?.comment ?? "");
          setOpen(true);
        }}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-bold text-slate-950 hover:bg-amber-400">
        <Star className="h-4 w-4" /> {data.review ? "Edit your review" : "Write a review"}
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Tap the stars to rate");
      return;
    }
    try {
      await save({ id: profileId, rating, service: service || null, comment: comment.trim() || undefined }).unwrap();
      toast.success("Thanks! Your review is live.");
      setOpen(false);
    } catch (err) {
      toast.error((err as { data?: { message?: string } })?.data?.message || "Couldn't save your review");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} className="p-0.5">
            <Star className={cn("h-7 w-7 transition", n <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
          </button>
        ))}
      </div>
      <select aria-label="Service" className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={service} onChange={(e) => setService(e.target.value)}>
        <option value="">Which puja / service? (optional)</option>
        {services.map((s) => <option key={s} value={s}>{serviceLabel(s)}</option>)}
      </select>
      <textarea rows={3} maxLength={1500} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="How was the puja / consultation? Punctuality, vidhi, explanation, dakshina…" value={comment} onChange={(e) => setComment(e.target.value)} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} {data.review ? "Update review" : "Post review"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-xl px-3 text-sm font-semibold text-slate-600">Cancel</button>
        {data.review && (
          <button
            type="button"
            disabled={removing}
            onClick={() => void remove(profileId).unwrap().then(() => { toast.success("Review removed"); setOpen(false); setRating(0); setComment(""); }).catch(() => toast.error("Couldn't remove"))}
            className="ml-auto inline-flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-rose-600"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        )}
      </div>
    </form>
  );
}
