"use client";

import React from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/components/ui/utils";

/** Back / status / primary action. Fixed to the bottom on mobile, inline on desktop. */
export function StickyActionBar({
  onBack,
  backLabel = "Back",
  status,
  primary,
  secondary,
  extra,
}: {
  onBack?: () => void;
  backLabel?: string;
  status?: React.ReactNode;
  primary: { label: string; onClick: () => void; busy?: boolean; disabled?: boolean; icon?: "next" | "none" };
  secondary?: { label: string; onClick: () => void; busy?: boolean; disabled?: boolean };
  /** quiet action next to the primary, e.g. "Save & exit" or "Preview". */
  extra?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:static lg:mt-6 lg:rounded-2xl lg:border lg:px-5 lg:pb-3">
      <div className="mx-auto flex max-w-3xl items-center gap-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="max-[359px]:sr-only">{backLabel}</span>
          </button>
        ) : (
          <span className="w-1" />
        )}
        <div className="hidden min-w-0 flex-1 justify-center sm:flex">{status}</div>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          {extra}
          {secondary && (
            <button
              type="button"
              onClick={secondary.onClick}
              disabled={secondary.disabled || secondary.busy}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {secondary.busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {secondary.label}
            </button>
          )}
          <button
            type="button"
            onClick={primary.onClick}
            disabled={primary.disabled || primary.busy}
            className={cn(
              "inline-flex h-11 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-900",
            )}
          >
            {primary.busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {primary.label}
            {primary.icon !== "none" && !primary.busy && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
