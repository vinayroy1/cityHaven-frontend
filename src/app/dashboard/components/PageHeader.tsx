import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <div className="flex flex-col gap-3 rounded-3xl border border-white/70 bg-white/90 px-4 py-5 shadow-[0_16px_50px_-32px_rgba(15,23,42,0.55)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
      {backHref && (
        <div className="mb-1">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{backLabel}</span>
          </Link>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          {tag ? (
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-rose-500/10 via-amber-400/10 to-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">
              {tag}
            </span>
          ) : null}
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">{title}</h1>
          {subtitle ? <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex-shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}
