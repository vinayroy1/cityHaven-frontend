import React from "react";

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function SectionCard({ title, subtitle, children, actions, className = "" }: SectionCardProps) {
  return (
    <section className={`rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_16px_50px_-32px_rgba(15,23,42,0.55)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:p-5 ${className}`}>
      {(title || subtitle || actions) && (
        <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2> : null}
            {subtitle ? <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex-shrink-0">{actions}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
