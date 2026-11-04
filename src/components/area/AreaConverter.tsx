"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Check, Copy } from "lucide-react";
import { AREA_UNITS, convertArea, fmtArea, pairSlug, unitByKey } from "./units";

export function AreaConverter({ initialFrom = "sq-ft", initialTo = "sq-m", initialValue = "1000" }: {
  initialFrom?: string;
  initialTo?: string;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [fromKey, setFromKey] = useState(initialFrom);
  const [toKey, setToKey] = useState(initialTo);
  const [copied, setCopied] = useState<string | null>(null);

  const from = unitByKey(fromKey)!;
  const to = unitByKey(toKey)!;
  const num = Number(value.replace(/,/g, ""));
  const valid = value.trim() !== "" && Number.isFinite(num) && num >= 0;
  const result = valid ? convertArea(num, from, to) : NaN;

  const all = useMemo(
    () => (valid ? AREA_UNITS.filter((u) => u.key !== fromKey).map((u) => ({ u, v: convertArea(num, from, u) })) : []),
    [valid, num, from, fromKey],
  );

  const copy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1200);
    });
  };

  const select =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

  return (
    <div className="w-full">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="area-value">
          Enter area
        </label>
        <input
          id="area-value"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9.,]/g, ""))}
          className="mt-1.5 h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-2xl font-bold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          placeholder="e.g. 1200"
        />
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-500">From</span>
            <select aria-label="From unit" className={select} value={fromKey} onChange={(e) => setFromKey(e.target.value)}>
              {AREA_UNITS.map((u) => (
                <option key={u.key} value={u.key}>{u.plural} ({u.short})</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            aria-label="Swap units"
            onClick={() => { setFromKey(toKey); setToKey(fromKey); }}
            className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow hover:bg-emerald-700"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-500">To</span>
            <select aria-label="To unit" className={select} value={toKey} onChange={(e) => setToKey(e.target.value)}>
              {AREA_UNITS.map((u) => (
                <option key={u.key} value={u.key}>{u.plural} ({u.short})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-4 text-white">
          <p className="text-xs font-medium text-emerald-100">
            {valid ? `${fmtArea(num)} ${num === 1 ? from.name : from.plural} =` : "Enter a valid number"}
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="min-w-0 break-all text-3xl font-extrabold">
              {valid ? fmtArea(result) : "—"} <span className="text-lg font-semibold text-emerald-100">{to.short}</span>
            </p>
            {valid && (
              <button
                type="button"
                onClick={() => copy(fmtArea(result), "main")}
                className="shrink-0 rounded-full bg-white/15 p-2 hover:bg-white/25"
                aria-label="Copy result"
              >
                {copied === "main" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            )}
          </div>
          <p className="mt-1 text-[11px] text-emerald-100">
            1 {from.short} = {fmtArea(convertArea(1, from, to))} {to.short}
          </p>
        </div>
      </div>

      {valid && (
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {fmtArea(num)} {from.short} in all units
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {all.map(({ u, v }) => (
              <div key={u.key} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                <Link href={`/area-converter/${pairSlug(from, u)}`} className="min-w-0 text-xs text-slate-500 hover:text-emerald-600">
                  {u.plural}
                </Link>
                <button
                  type="button"
                  onClick={() => copy(fmtArea(v), u.key)}
                  className="flex min-w-0 items-center gap-1.5 text-right text-sm font-bold text-slate-800 dark:text-slate-100"
                  title="Copy"
                >
                  <span className="truncate">{fmtArea(v)}</span>
                  {copied === u.key ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-300" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
