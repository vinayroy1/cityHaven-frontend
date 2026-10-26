"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Crown, Loader2, Sparkles, X, Zap, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  useActivateCreditPromotionMutation,
  useGetCreditPlatformConfigQuery,
  useGetMyCreditsQuery,
} from "@/features/contactVerify/api";

type TargetType = "PROPERTY" | "FLATMATE" | "ADVISOR";

export function CreditBoostButton({
  targetType,
  targetId,
  organizationId,
}: {
  targetType: TargetType;
  targetId: number;
  organizationId?: number;
}) {
  const { data } = useGetCreditPlatformConfigQuery();
  const { data: creditsData } = useGetMyCreditsQuery();
  const [activate, { isLoading }] = useActivateCreditPromotionMutation();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const prefix = targetType === "ADVISOR" ? "ADVISOR_BOOST_" : "PROPERTY_BOOST_";
  const flagKey =
    targetType === "ADVISOR"
      ? "ADVISOR_BOOSTS_ENABLED"
      : targetType === "FLATMATE"
      ? "FLATMATE_BOOSTS_ENABLED"
      : "PROPERTY_BOOSTS_ENABLED";
  const enabled = data?.data.flags.find((flag) => flag.key === flagKey)?.isEnabled ?? false;
  const actions = (data?.data.actions ?? []).filter(
    (action) => action.isEnabled && action.key.startsWith(prefix)
  );

  if (!enabled || !actions.length) return null;

  const currentBalance = creditsData?.data?.credits ?? 0;

  const buy = async (actionKey: string) => {
    try {
      const result = await activate({ actionKey, targetType, targetId, organizationId }).unwrap();
      toast.success(
        `Boost activated! Listing featured until ${new Date(result.data.promotion.endsAt).toLocaleDateString()}`
      );
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Could not activate boost");
    }
  };

  const targetLabel =
    targetType === "PROPERTY" ? "Property" : targetType === "FLATMATE" ? "Flatmate Listing" : "Advisor Profile";

  const modalContent = open ? (
    <div
      className="fixed inset-0 z-[10000] flex min-h-[100dvh] items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      {/* Semi-transparent backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="boost-modal-title"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="cursor-default relative z-10 w-full max-w-sm sm:max-w-md my-auto max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl sm:rounded-3xl border border-amber-300 bg-white shadow-2xl overflow-hidden dark:border-amber-900/60 dark:bg-slate-900 animate-in zoom-in-95 duration-200"
      >
        {/* Header Banner */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-4 sm:px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white shadow-inner">
                <Crown className="h-5 w-5 fill-amber-200 stroke-amber-200" />
              </div>
              <div className="min-w-0">
                <h3 id="boost-modal-title" className="text-sm sm:text-base font-black tracking-tight text-white truncate">
                  Boost {targetLabel}
                </h3>
                <p className="text-[11px] text-amber-100 font-medium truncate">
                  Pin to top of search results &amp; get 5x more leads
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-all shadow-md active:scale-95"
              aria-label="Close boost modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Current balance chip */}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-black/25 px-3 py-1.5 backdrop-blur-md border border-white/10 text-xs">
            <span className="text-amber-100 font-medium">Your Available Balance:</span>
            <span className="font-extrabold text-white flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              {currentBalance} Credits
            </span>
          </div>
        </div>

        {/* Scrollable Action Options */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Choose Boost Duration
          </p>

          <div className="space-y-2">
            {actions.map((action) => {
              const canAfford = currentBalance >= action.creditAmount;

              return (
                <div
                  key={action.key}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
                    canAfford
                      ? "border-slate-200 bg-white hover:border-amber-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-amber-600"
                      : "border-slate-200/60 bg-slate-50/60 opacity-80 dark:border-slate-800/50 dark:bg-slate-900/40"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {action.durationDays} Days Featured
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                        ⚡ Top Placement
                      </span>
                    </div>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {action.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {action.creditAmount} <span className="text-[10px] font-semibold text-slate-500">Credits</span>
                    </span>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => void buy(action.key)}
                      className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:from-amber-600 hover:to-rose-700 active:scale-95 transition disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <span>Boost</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {currentBalance < 20 && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 text-center dark:border-amber-900/50 dark:bg-amber-950/30">
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                Low on credits? Invite friends or explore recharge plans to boost more properties.
              </p>
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="mt-1 inline-block text-[11px] font-bold text-rose-600 hover:underline dark:text-rose-400"
              >
                View Credit Plans →
              </Link>
            </div>
          )}
        </div>

        {/* Footer info & Close */}
        <div className="shrink-0 flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-900/80">
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Instant activation &bull; 0 Brokerage
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-black text-white shadow-sm hover:bg-amber-600 active:scale-95 transition disabled:opacity-60"
        title="Boost property visibility"
      >
        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        <span>Boost</span>
      </button>

      {mounted && typeof document !== "undefined" && modalContent
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
}
