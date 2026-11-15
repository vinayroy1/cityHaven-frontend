"use client";

import { ArrowRight, CheckCircle2, CircleAlert, CircleDot } from "lucide-react";
import type { CustomStepProps, ReadinessItem } from "@/lib/listingEngine/types";
import type { InteriorWizardValues } from "@/types/interior.types";
import { computeReadiness } from "@/lib/listingEngine/readiness";
import { interiorReadinessRules } from "@/features/interiors/wizard/readiness";
import { cn } from "@/lib/utils";

/**
 * Required (red, blocks going live), publish-only (amber) and recommended (blue, never blocks:
 * improves the profile and its ranking).
 */
export default function ReadinessChecklist({ values, readiness, goToStep }: CustomStepProps<InteriorWizardValues>) {
  const report = readiness ?? computeReadiness(interiorReadinessRules, values);
  const required = report.items.filter((i) => i.level === "SUBMIT");
  const ruleId = (i: ReadinessItem) => i.id.split(":")[0];
  const requiredRules = new Set(required.map(ruleId));
  // PUBLISH items for rules not already listed as required (most rules carry both levels).
  const publishOnly = report.items.filter((i) => i.level === "PUBLISH" && !requiredRules.has(ruleId(i)));
  const recommended = report.items.filter((i) => i.level === "RECOMMENDED");
  const reqLeft = required.filter((i) => !i.done).length + publishOnly.filter((i) => !i.done).length;
  const recLeft = recommended.filter((i) => !i.done).length;

  const Item = ({ i, tone }: { i: ReadinessItem; tone: "red" | "amber" | "blue" }) => (
    <li>
      <button
        type="button"
        // Recommended items live in dashboard sections that setup doesn't show: not clickable here.
        disabled={i.done || !goToStep || tone === "blue"}
        onClick={() => goToStep?.(i.stepId, i.fieldPath)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
          i.done
            ? "text-slate-500"
            : tone === "red"
              ? "bg-rose-50 text-rose-900 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-100"
              : tone === "amber"
                ? "bg-amber-50 text-amber-900 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-100"
                : "bg-sky-50 text-sky-900 dark:bg-sky-950 dark:text-sky-100",
        )}
      >
        {i.done ? (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-label="Done" />
        ) : tone === "red" ? (
          <CircleAlert className="size-4 shrink-0 text-rose-600" aria-label="Required" />
        ) : (
          <CircleDot className={cn("size-4 shrink-0", tone === "amber" ? "text-amber-600" : "text-sky-600")} aria-label={tone === "amber" ? "Needed to go live" : "Recommended"} />
        )}
        <span className={cn("flex-1", i.done && "line-through decoration-slate-300")}>{i.label}</span>
        {!i.done && goToStep && tone !== "blue" && <ArrowRight className="size-4 shrink-0" aria-hidden />}
      </button>
    </li>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 36 36" className="size-16 -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-emerald-600" strokeWidth="3" strokeDasharray={`${report.pct} 100`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{Math.round(report.pct)}%</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {reqLeft
            ? `${reqLeft} required item${reqLeft > 1 ? "s" : ""} left before you can go live.`
            : recLeft
              ? `You're ready to go live! Add ${recLeft} more detail${recLeft > 1 ? "s" : ""} anytime from your dashboard to rank higher.`
              : "Everything's in place. You're ready to go live."}
        </p>
      </div>
      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-700">
          Required to go live · {required.filter((i) => i.done).length}/{required.length}
        </p>
        <ul className="space-y-1.5">{required.map((i) => <Item key={`${i.id}-r`} i={i} tone="red" />)}</ul>
      </section>
      {publishOnly.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">Also needed to go live</p>
          <ul className="space-y-1.5">{publishOnly.map((i) => <Item key={`${i.id}-p`} i={i} tone="amber" />)}</ul>
        </section>
      )}
      {recommended.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-700">
            Recommended · optional · {recommended.length - recLeft}/{recommended.length}
          </p>
          <p className="mb-2 text-xs text-slate-500">Complete profiles rank higher and get more enquiries. You can add these later from your dashboard.</p>
          <ul className="space-y-1.5">{recommended.map((i) => <Item key={`${i.id}-c`} i={i} tone="blue" />)}</ul>
        </section>
      )}
    </div>
  );
}
