import React from "react";
import Link from "next/link";

type StatPillProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "rose" | "emerald" | "amber" | "slate";
  href?: string;
};

const toneMap: Record<NonNullable<StatPillProps["tone"]>, string> = {
  rose: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50",
  amber: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
  slate: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700/50",
};

export function StatPill({ label, value, hint, tone = "slate", href }: StatPillProps) {
  const content = (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-inner ${toneMap[tone]} flex flex-col gap-1 transition ${
        href ? "hover:-translate-y-0.5 hover:shadow-md cursor-pointer" : ""
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
      {hint ? <p className="text-xs text-slate-600 dark:text-slate-400">{hint}</p> : null}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}

