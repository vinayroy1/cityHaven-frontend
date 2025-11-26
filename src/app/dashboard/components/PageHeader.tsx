import React from "react";

type PageHeaderProps = {
  tag?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ tag, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/70 bg-white/90 px-4 py-5 shadow-[0_16px_50px_-32px_rgba(15,23,42,0.55)] backdrop-blur sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          {tag ? (
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-rose-500/10 via-amber-400/10 to-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600">
              {tag}
            </span>
          ) : null}
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex-shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}
