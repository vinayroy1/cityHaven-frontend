import React from "react";
import { BackButton } from "@/components/common/BackButton";

type PageHeaderProps = {
  tag?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function PageHeader({ tag, title, subtitle, actions, backHref, backLabel = "Back to Dashboard" }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2.5 sm:gap-3 rounded-2xl sm:rounded-3xl border border-white/70 bg-white/90 p-3 sm:px-6 sm:py-5 shadow-[0_16px_50px_-32px_rgba(15,23,42,0.55)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 w-full max-w-full">
      {backHref && (
        <div className="mb-0.5 sm:mb-1">
          <BackButton
            fallbackHref={backHref}
            label={backLabel}
            variant="ghost"
            size="sm"
          />
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
          {tag ? (
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-rose-500/10 via-amber-400/10 to-emerald-400/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">
              {tag}
            </span>
          ) : null}
          <h1 className="text-lg font-bold text-slate-900 dark:text-white sm:text-2xl lg:text-3xl break-words">{title}</h1>
          {subtitle ? <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 break-words">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">{actions}</div> : null}
      </div>
    </div>
  );
}
