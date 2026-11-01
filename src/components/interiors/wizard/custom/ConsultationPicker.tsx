"use client";
/**
 * "Do you offer consultations?" — explicit Yes / No, then one card per consultation mode
 * (online / studio / site visit) with Free vs Paid, fee, duration and fee-adjustment.
 * Stores the same `pricing.consultationOptions: ConsultationOption[]` shape as before.
 */
import { useState } from "react";
import { Check, Home, MapPin, Video, X } from "lucide-react";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { ConsultationOption, InteriorWizardValues } from "@/types/interior.types";
import { getAt, inputCls, newId, propPath, setPath, toNum, Toggle } from "./ui";
import { cn } from "@/lib/utils";

type Mode = Exclude<ConsultationOption["type"], "">;

const MODES: { value: Mode; label: string; hint: string; icon: typeof Video }[] = [
  { value: "ONLINE" as Mode, label: "Online call", hint: "Video / phone consultation", icon: Video },
  { value: "IN_PERSON" as Mode, label: "At your studio", hint: "Client visits your office", icon: Home },
  { value: "SITE_VISIT" as Mode, label: "Site visit", hint: "You visit the client's home", icon: MapPin },
];

function ChoiceCard({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 px-4 text-sm font-semibold transition",
        active
          ? "border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-400 dark:bg-rose-950/40 dark:text-rose-300"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
      )}
    >
      {children}
    </button>
  );
}

export default function ConsultationPicker({ values, form, props }: CustomStepProps<InteriorWizardValues>) {
  const path = propPath(props, "field", "pricing.consultationOptions");
  const rows = getAt<ConsultationOption[]>(values, path) ?? [];
  const write = (next: ConsultationOption[]) => setPath(form, path, next);

  // "Yes" with nothing picked yet is a UI-only state; saved data is just the list.
  const [answer, setAnswer] = useState<"yes" | "no" | null>(rows.length ? "yes" : null);
  const offers = answer === "yes" || rows.length > 0;

  const rowFor = (m: Mode) => rows.find((r) => r.type === m);
  const toggleMode = (m: Mode) => {
    const existing = rowFor(m);
    if (existing) write(rows.filter((r) => r !== existing));
    else
      write([
        ...rows,
        { id: newId("consult"), type: m, isFree: m !== "SITE_VISIT", fee: null, durationMins: m === "SITE_VISIT" ? 60 : 30, adjustableAgainstProject: true },
      ]);
  };
  const update = (id: string, patch: Partial<ConsultationOption>) => write(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <ChoiceCard active={offers} onClick={() => setAnswer("yes")}>
          <Check className="size-4" aria-hidden /> Yes, I do
        </ChoiceCard>
        <ChoiceCard
          active={answer === "no" && !rows.length}
          onClick={() => {
            setAnswer("no");
            if (rows.length) write([]);
          }}
        >
          <X className="size-4" aria-hidden /> Not right now
        </ChoiceCard>
      </div>

      {offers && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">How can clients consult you? Pick all that apply.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {MODES.map((m) => {
              const on = !!rowFor(m.value);
              const Icon = m.icon;
              return (
                <button
                  key={m.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleMode(m.value)}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border-2 p-3 text-left transition",
                    on
                      ? "border-rose-500 bg-rose-50/60 dark:border-rose-400 dark:bg-rose-950/30"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900",
                  )}
                >
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", on ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">{m.label}</span>
                    <span className="block text-xs text-slate-500">{m.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {MODES.map((m) => {
            const r = rowFor(m.value);
            if (!r) return null;
            return (
              <div key={r.id} className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{m.label}</p>
                <div className="flex gap-2" role="radiogroup" aria-label={`${m.label} pricing`}>
                  {[
                    { v: true, l: "Free" },
                    { v: false, l: "Paid" },
                  ].map((o) => (
                    <button
                      key={o.l}
                      type="button"
                      role="radio"
                      aria-checked={r.isFree === o.v}
                      onClick={() => update(r.id, { isFree: o.v, fee: o.v ? null : r.fee })}
                      className={cn(
                        "min-h-10 flex-1 rounded-xl border text-sm font-semibold transition sm:flex-none sm:px-6",
                        r.isFree === o.v
                          ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                          : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200",
                      )}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {!r.isFree && (
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Fee (₹)
                      <input
                        inputMode="numeric"
                        className={cn(inputCls, "mt-1")}
                        placeholder="e.g. 1500"
                        value={r.fee ?? ""}
                        onChange={(e) => update(r.id, { fee: toNum(e.target.value) })}
                      />
                    </label>
                  )}
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Duration (minutes)
                    <input
                      inputMode="numeric"
                      className={cn(inputCls, "mt-1")}
                      placeholder="e.g. 45"
                      value={r.durationMins ?? ""}
                      onChange={(e) => update(r.id, { durationMins: toNum(e.target.value) })}
                    />
                  </label>
                </div>
                {!r.isFree && (
                  <Toggle
                    checked={!!r.adjustableAgainstProject}
                    onChange={(v) => update(r.id, { adjustableAgainstProject: v })}
                    label="Adjust fee against the project"
                    hint="Refund the fee if the client signs up with you."
                  />
                )}
              </div>
            );
          })}
          {answer === "yes" && !rows.length && <p className="text-xs text-amber-700 dark:text-amber-400">Pick at least one way clients can consult you.</p>}
        </div>
      )}
    </div>
  );
}
