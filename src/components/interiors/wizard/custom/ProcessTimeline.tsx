"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { InteriorWizardValues } from "@/types/interior.types";
import { cn } from "@/lib/utils";
import { Field, Stepper, Toggle, getAt, propPath, setPath, textareaCls } from "./ui";

// Stored inside warranty.support.afterSalesNote (no dedicated column yet):
//   "Process: A → B → C · Delivery in 45 days · Post-handover check"\n\n<free note>
export const PROCESS_STEPS = ["Consultation", "Site measurement", "Design & 3D", "Quotation & booking", "Production", "Installation", "Handover"] as const;
const PREFIX = "Process: ";

export function parseProcess(note: string) {
  const [first, ...rest] = (note ?? "").split("\n");
  if (!first.startsWith(PREFIX)) return { steps: [] as string[], days: null as number | null, check: false, note: note ?? "" };
  const parts = first.slice(PREFIX.length).split(" · ");
  const steps = parts[0] ? parts[0].split(" → ") : [];
  const d = parts.find((p) => p.startsWith("Delivery in "));
  return {
    steps,
    days: d ? Number(d.replace(/\D/g, "")) || null : null,
    check: parts.includes("Post-handover check"),
    note: rest.join("\n").replace(/^\n/, ""),
  };
}

export function formatProcess(steps: string[], days: number | null, check: boolean, note: string) {
  const ordered = PROCESS_STEPS.filter((s) => steps.includes(s));
  const head = ordered.length || days || check
    ? `${PREFIX}${[ordered.join(" → "), days ? `Delivery in ${days} days` : "", check ? "Post-handover check" : ""].filter(Boolean).join(" · ")}`
    : "";
  return [head, note.trim()].filter(Boolean).join("\n\n");
}

export default function ProcessTimeline({ values, form, props }: CustomStepProps<InteriorWizardValues>) {
  const path = propPath(props, "field", "warranty.support.afterSalesNote");
  const raw = getAt<string>(values, path) ?? "";
  const [state] = useState(() => parseProcess(raw));
  const [steps, setSteps] = useState<string[]>(state.steps);
  const [days, setDays] = useState<number | null>(state.days);
  const [check, setCheck] = useState(state.check);
  const [note, setNote] = useState(state.note);

  const commit = (s = steps, d = days, c = check, n = note) => setPath(form, path, formatProcess(s, d, c, n));

  return (
    <div className="space-y-5">
      <ol className="relative space-y-2 border-l-2 border-slate-200 pl-5 dark:border-slate-700">
        {PROCESS_STEPS.map((s, i) => {
          const on = steps.includes(s);
          return (
            <li key={s} className="relative">
              <span
                className={cn(
                  "absolute -left-[31px] top-2 flex size-5 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                  on ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900" : "border-slate-300 bg-white text-slate-400 dark:bg-slate-950",
                )}
                aria-hidden
              >
                {on ? <Check className="size-3" /> : i + 1}
              </span>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => {
                  const next = on ? steps.filter((x) => x !== s) : [...steps, s];
                  setSteps(next);
                  commit(next);
                }}
                className={cn("rounded-xl px-3 py-2 text-left text-sm transition", on ? "font-semibold text-slate-900 dark:text-white" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900")}
              >
                {s}
              </button>
            </li>
          );
        })}
      </ol>
      <Field label="Typical delivery time" hint="From booking to handover for a 2–3 BHK.">
        {() => (
          <Stepper
            label="Delivery days"
            value={days}
            max={365}
            suffix="days"
            onChange={(v) => {
              const d = v;
              setDays(d);
              commit(steps, d);
            }}
          />
        )}
      </Field>
      <Toggle
        checked={check}
        onChange={(v) => {
          setCheck(v);
          commit(steps, days, v);
        }}
        label="Post-handover check visit"
        hint="A follow-up visit a few weeks after handover."
      />
      <Field label="Anything else about after-sales?">
        {(id) => (
          <textarea
            id={id}
            className={textareaCls}
            rows={3}
            maxLength={600}
            placeholder="How clients raise issues, response times…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => commit()}
          />
        )}
      </Field>
    </div>
  );
}
