"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, IndianRupee } from "lucide-react";
import { FilterSelect } from "@/components/common/FilterSelect";
import { STAMP_DUTY_BY_SLUG, STAMP_DUTY_STATES, computeDuty, type Buyer } from "@/features/stampDuty/data";
import { cn } from "@/lib/utils";

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

function words(n: number) {
  if (n >= 1e7) return `${(n / 1e7).toFixed(2).replace(/\.?0+$/, "")} crore`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2).replace(/\.?0+$/, "")} lakh`;
  return n.toLocaleString("en-IN");
}

const BUYERS: { id: Buyer; label: string; long?: string }[] = [
  { id: "male", label: "Man" },
  { id: "female", label: "Woman" },
  { id: "joint", label: "Joint", long: " (man + woman)" },
];

/** `stateSlug` fixes the state (state pages); without it the visitor picks one and is taken to that state's page. */
export function StampDutyCalculator({ stateSlug }: { stateSlug?: string }) {
  const router = useRouter();
  const [localSlug, setSlug] = useState("maharashtra");
  const slug = stateSlug ?? localSlug;
  const s = STAMP_DUTY_BY_SLUG.get(slug)!;
  const [area, setArea] = useState(s.areas?.[0]?.id ?? "");
  const [buyer, setBuyer] = useState<Buyer>("male");
  const [valueText, setValueText] = useState("5000000");
  const value = Number(valueText.replace(/\D/g, "")) || 0;
  const areaId = s.areas?.some((a) => a.id === area) ? area : (s.areas?.[0]?.id ?? "");
  const r = useMemo(() => computeDuty(s, value, buyer, areaId), [s, value, buyer, areaId]);

  const pickState = (next: string) => {
    if (stateSlug) {
      router.push(`/stamp-duty-calculator/${next}`);
      return;
    }
    setSlug(next);
    setArea(STAMP_DUTY_BY_SLUG.get(next)?.areas?.[0]?.id ?? "");
  };

  const label = "mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300";
  return (
    <div className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-4">
        <div className={cn("grid gap-3", s.areas && "grid-cols-2")}>
        <div className="min-w-0">
          <span className={label}>State</span>
          <FilterSelect ariaLabel="State" value={slug} onChange={pickState} options={STAMP_DUTY_STATES.map((x) => ({ value: x.slug, label: x.name }))} />
        </div>
        {s.areas && (
          <div className="min-w-0">
            <span className={label}>Property location</span>
            <FilterSelect ariaLabel="Property location" value={areaId} onChange={setArea} options={s.areas.map((a) => ({ value: a.id, label: a.label }))} />
          </div>
        )}
        </div>
        <div>
          <label htmlFor="sd-value" className={label}>
            Property value <span className="font-normal text-slate-500"><span className="hidden sm:inline">(sale price or circle rate value, whichever is higher)</span></span>
          </label>
          <div className="relative">
            <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="sd-value"
              inputMode="numeric"
              value={value ? value.toLocaleString("en-IN") : ""}
              onChange={(e) => setValueText(e.target.value)}
              placeholder="e.g. 50,00,000"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          {value > 0 && <p className="mt-1 text-xs text-slate-500">₹{words(value)}</p>}
          <div className="-mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
            {[2500000, 5000000, 7500000, 10000000, 20000000].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setValueText(String(p))}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  value === p ? "border-rose-400 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300",
                )}
              >
                ₹{words(p)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className={label}>Buyer</span>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="radiogroup" aria-label="Buyer">
            {BUYERS.map((b) => (
              <button
                key={b.id}
                type="button"
                role="radio"
                aria-checked={buyer === b.id}
                onClick={() => setBuyer(b.id)}
                className={cn(
                  "rounded-lg px-2 py-2 text-[13px] font-medium transition",
                  buyer === b.id ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400",
                )}
              >
                {b.label}
                {b.long && <span className="hidden sm:inline">{b.long}</span>}
              </button>
            ))}
          </div>
        </div>
        <a
          href="#sd-result"
          className="sticky bottom-20 z-10 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-lg lg:hidden dark:bg-white dark:text-slate-900"
        >
          <span className="text-xs opacity-80">Total payable</span>
          <span className="text-lg font-bold">{inr(r.total)} <span className="text-xs font-medium opacity-70">↓ details</span></span>
        </a>
      </div>

      <div id="sd-result" className="flex scroll-mt-20 flex-col rounded-2xl bg-gradient-to-br from-rose-600 to-orange-500 p-4 text-white sm:p-5">
        <p className="text-sm text-white/85">Total stamp duty + registration in {s.name}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl" aria-live="polite">{inr(r.total)}</p>
        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-white/85">Stamp duty ({r.stampRate}%)</dt>
            <dd className="font-semibold">{inr(r.stampDuty)}</dd>
          </div>
          {r.extras.map((e) => (
            <div key={e.label} className="flex justify-between gap-3">
              <dt className="text-white/85">{e.label}</dt>
              <dd className="font-semibold">{inr(e.amount)}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-3">
            <dt className="text-white/85">Registration fee</dt>
            <dd className="font-semibold">{r.registration == null ? "See note" : inr(r.registration)}</dd>
          </div>
        </dl>
        {r.registrationNote && <p className="mt-3 text-xs text-white/80">{r.registrationNote}</p>}
        <div className="mt-auto space-y-2 pt-5">
          {r.warnings.map((w) => (
            <p key={w} className="flex gap-2 rounded-xl bg-white/15 p-2.5 text-xs text-white">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {w}
            </p>
          ))}
          <p className="text-[11px] text-white/75">Indicative estimate for a residential sale deed. Final charges are set by the sub-registrar.</p>
        </div>
      </div>
    </div>
  );
}
