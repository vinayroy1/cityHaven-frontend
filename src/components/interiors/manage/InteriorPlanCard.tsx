"use client";
/**
 * Owner-facing plan & visibility card: monthly listing fee status (paid / grace / paused for
 * payment) and paid boosts. Customers never pay to view or contact a designer.
 */
import Link from "next/link";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { AlertTriangle, CalendarCheck, Coins, Loader2, Rocket, Sparkles, TrendingUp } from "lucide-react";
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
import { useBoostInteriorListingMutation, useGetMyInteriorBillingQuery } from "@/features/interiors/api";
import { contactVerifyApi } from "@/features/contactVerify/api";
import { InteriorListingStatus as S, type InteriorBoostOption, type InteriorProfile } from "@/types/interior.types";
import { errorMessage } from "./manageApi";

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

export function InteriorPlanCard({ profile }: { profile: InteriorProfile }) {
  const dispatch = useDispatch();
  const { data: billing, isLoading } = useGetMyInteriorBillingQuery();
  const [boost, { isLoading: boosting }] = useBoostInteriorListingMutation();
  const [choice, setChoice] = useState<InteriorBoostOption | null>(null);

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-hidden />;
  }
  if (!billing) return null;

  const isLive = profile.status === S.PUBLISHED;
  const lowBalance = billing.balance < billing.monthlyCredits;

  const confirmBoost = async () => {
    if (!choice) return;
    try {
      await boost({ profileId: profile.id, actionKey: choice.key }).unwrap();
      dispatch(contactVerifyApi.util.invalidateTags(["Credits", "BillingSummary"]));
      toast.success(`Boost active for ${choice.days} days. Your profile now ranks at the top.`);
      setChoice(null);
    } catch (e) {
      toast.error(errorMessage(e, "Could not start the boost. Check your credit balance."));
    }
  };

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5"
      aria-labelledby="plan-card-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="plan-card-title" className="text-sm font-bold text-slate-900 dark:text-white">
          Plan &amp; visibility
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Coins className="h-3.5 w-3.5" aria-hidden /> {billing.balance.toLocaleString("en-IN")} credits
        </span>
      </div>

      {/* Monthly listing fee */}
      <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
          <CalendarCheck className="h-4 w-4 text-emerald-600" aria-hidden />
          Listing plan · {billing.monthlyCredits} credits / {billing.periodDays} days
        </p>
        {billing.pausedForPayment ? (
          <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
            Paused because the monthly renewal couldn&apos;t be charged. Top up and resume to go live again.
          </p>
        ) : billing.inGrace ? (
          <p className="mt-1 flex items-start gap-1 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            Renewal failed: not enough credits. Your listing stays live until {fmt(billing.graceEndsAt)}, then pauses.
          </p>
        ) : billing.isPaid ? (
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {isLive ? "Live" : "Paid"} until <strong>{fmt(billing.paidUntil)}</strong>. Renews automatically for{" "}
            {billing.monthlyCredits} credits.
          </p>
        ) : (
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {billing.monthlyCredits} credits are charged when your listing goes live, then every {billing.periodDays} days.
          </p>
        )}
        <p className="mt-1.5 text-[11px] text-slate-500">
          Clients view your profile and send enquiries for free. Unlocking a lead&apos;s contact details is charged separately.
        </p>
        {(billing.inGrace || billing.pausedForPayment || (!billing.isPaid && lowBalance)) && (
          <Link
            href="/pricing"
            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Top up credits
          </Link>
        )}
      </div>

      {/* Boost */}
      <div className="mt-3 rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-3 dark:border-rose-900/40 dark:from-rose-950/30 dark:to-slate-900">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
          <TrendingUp className="h-4 w-4 text-rose-600" aria-hidden /> Boost your profile
        </p>
        {billing.boostedUntil ? (
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-700 dark:text-rose-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Boost active until {fmt(billing.boostedUntil)}. Buying more extends it.
          </p>
        ) : (
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Appear at the top of interior designer search and the homepage, with a Featured badge.
          </p>
        )}
        {isLive ? (
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {billing.boostOptions.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setChoice(o)}
                disabled={boosting}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-rose-400 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="block text-sm font-bold text-slate-900 dark:text-white">{o.days} days</span>
                <span className="text-xs text-slate-600 dark:text-slate-400">{o.credits} credits</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-slate-500">Available once your listing is live.</p>
        )}
      </div>

      <AlertDialog open={choice !== null} onOpenChange={(o: boolean) => !o && setChoice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Boost for {choice?.days} days?</AlertDialogTitle>
            <AlertDialogDescription>
              {choice?.credits} credits will be deducted. Your balance: {billing.balance} credits.
              {billing.boostedUntil ? " The new boost starts when your current one ends." : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {choice && billing.balance < choice.credits && (
            <p className="text-sm text-rose-600">
              Not enough credits.{" "}
              <Link href="/pricing" className="underline">
                Top up
              </Link>{" "}
              to boost.
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={boosting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={boosting || !choice || billing.balance < choice.credits}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                confirmBoost();
              }}
            >
              {boosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              {boosting ? "Boosting…" : `Boost for ${choice?.credits} credits`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
