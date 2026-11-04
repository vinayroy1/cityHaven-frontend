"use client";
import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Coins, Inbox, Lock, Mail, MapPin, Phone, Unlock } from "lucide-react";
import { LeadsListSkeleton } from "@/components/interiors/skeletons";
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
import { useGetMyCreditsQuery } from "@/features/contactVerify/api";
import { cn } from "@/components/ui/utils";
import type { InteriorInquiry, InteriorInquiryStatus } from "@/types/interior.types";
import { errorMessage, useMyInquiries, useUnlockInquiry } from "./manageApi";

const UNLOCK_COST = 20;
const FILTERS: { value: InteriorInquiryStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "MEETING_FIXED", label: "Meeting fixed" },
  { value: "QUOTATION_SENT", label: "Quote sent" },
  { value: "CONVERTED", label: "Won" },
  { value: "LOST", label: "Lost" },
];

const inr = (n?: number | null) => (n ? `₹${n.toLocaleString("en-IN")}` : null);

export function LeadsPanel() {
  const [status, setStatus] = useState<InteriorInquiryStatus | "">("");
  const { items, isLoading, isError } = useMyInquiries(status, 1);
  const { data: credits } = useGetMyCreditsQuery();
  const balance = credits?.data?.credits;
  const [unlock, { isLoading: unlocking }] = useUnlockInquiry();
  const [target, setTarget] = useState<InteriorInquiry | null>(null);
  const insufficient = typeof balance === "number" && balance < UNLOCK_COST;

  const confirmUnlock = async () => {
    if (!target) return;
    try {
      await unlock(target.id).unwrap();
      toast.success("Lead unlocked. Contact details are now visible.");
      setTarget(null);
    } catch (e) {
      toast.error(errorMessage(e, "Could not unlock this lead. Check your credit balance."));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Leads</h2>
          <p className="text-xs text-slate-500">Homeowners asking for estimates and consultations.</p>
          <Link href="/dashboard/leads?type=interior" className="mt-1 inline-block text-xs font-semibold text-rose-600 hover:underline">
            Manage all your leads in one inbox →
          </Link>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900">
          <Coins className="h-4 w-4 text-amber-500" aria-hidden />
          <span className="text-slate-600 dark:text-slate-400">Credits:</span>
          <span className="font-bold text-slate-900 dark:text-white">{balance ?? "—"}</span>
          <Link href="/pricing" className="ml-1 font-semibold text-slate-900 underline underline-offset-2 dark:text-white">Top up</Link>
        </div>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filter leads by status">
        {FILTERS.map((f) => (
          <button key={f.value || "all"} type="button" role="tab" aria-selected={status === f.value} onClick={() => setStatus(f.value)}
            className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold",
              status === f.value ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300")}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LeadsListSkeleton />
      ) : isError ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">Could not load leads. Please refresh.</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <Inbox className="mx-auto h-10 w-10 text-slate-400" aria-hidden />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{status ? "No leads with this status" : "No leads yet"}</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
            {status ? "Try another filter." : "When homeowners request an estimate from your listing, it will show up here."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((inq) => {
            const budget = [inr(inq.budgetMin), inr(inq.budgetMax)].filter(Boolean).join(" – ");
            return (
              <li key={inq.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{inq.clientName}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {inq.bhkType}{inq.carpetAreaSqft ? ` · ${inq.carpetAreaSqft} sq.ft` : ""}
                      </span>
                      <span className="text-[11px] text-slate-400">{new Date(inq.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                    <p className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {inq.locality ? `${inq.locality}, ` : ""}{inq.cityName} · {inq.projectScope}
                    </p>
                    {(budget || inq.siteVisitRequested) && (
                      <p className="text-xs text-slate-500">{budget && `Budget ${budget}`}{budget && inq.siteVisitRequested ? " · " : ""}{inq.siteVisitRequested && "Site visit requested"}</p>
                    )}
                    {inq.isUnlocked ? (
                      <div className="flex flex-wrap gap-3 pt-1 text-xs font-semibold">
                        <a href={`tel:${inq.clientPhone}`} className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400"><Phone className="h-3.5 w-3.5" />{inq.clientPhone}</a>
                        {inq.clientEmail && <a href={`mailto:${inq.clientEmail}`} className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400"><Mail className="h-3.5 w-3.5" />{inq.clientEmail}</a>}
                      </div>
                    ) : (
                      <p className="flex items-center gap-1 pt-1 text-xs text-slate-400"><Lock className="h-3.5 w-3.5" /> Contact details hidden until unlocked</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {inq.isUnlocked ? (
                      <span className="inline-block rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">Unlocked</span>
                    ) : (
                      <button type="button" onClick={() => setTarget(inq)}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 sm:w-auto">
                        <Unlock className="h-3.5 w-3.5" /> Unlock · {UNLOCK_COST} credits
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog open={!!target} onOpenChange={(o: boolean) => !o && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              {UNLOCK_COST} credits will be deducted to reveal {target?.clientName}&apos;s phone number and email.
              {typeof balance === "number" && ` Your balance: ${balance} credits.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {insufficient && (
            <p className="text-xs font-medium text-rose-700 dark:text-rose-300">
              Not enough credits. <Link href="/pricing" className="underline">Top up</Link> to unlock.
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unlocking}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={unlocking || insufficient} onClick={(e: React.MouseEvent) => { e.preventDefault(); confirmUnlock(); }}>
              {unlocking ? "Unlocking…" : `Unlock for ${UNLOCK_COST} credits`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
