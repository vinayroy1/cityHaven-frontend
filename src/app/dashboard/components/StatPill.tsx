import React from "react";

type StatPillProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: "rose" | "emerald" | "amber" | "slate";
};

const toneMap: Record<NonNullable<StatPillProps["tone"]>, string> = {
  rose: "bg-rose-50 text-rose-700 border-rose-100",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  slate: "bg-slate-50 text-slate-700 border-slate-100",
};

export function StatPill({ label, value, hint, tone = "slate" }: StatPillProps) {
  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-inner ${toneMap[tone]} flex flex-col gap-1`}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      {hint ? <p className="text-xs text-slate-600">{hint}</p> : null}
    </div>
  );
}
