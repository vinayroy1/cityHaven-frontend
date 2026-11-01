"use client";

import Link from "next/link";
import { Check, Clock, Rocket, Send } from "lucide-react";
import { InteriorListingStatus } from "@/types/interior.types";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "submitted", label: "Submitted", hint: "We have your listing.", icon: Send },
  { key: "review", label: "In review", hint: "Usually 24–48 hours.", icon: Clock },
  { key: "live", label: "Live", hint: "Homeowners can find and contact you.", icon: Rocket },
] as const;

const stageOf = (s?: InteriorListingStatus | null) =>
  s === InteriorListingStatus.PUBLISHED ? 2 : 1;

/** Post-submit status timeline: Submitted → In review (24–48h) → Live. */
export function SubmissionStatus({ status, submittedAt, reviewNotes }: { status?: InteriorListingStatus | null; submittedAt?: string | null; reviewNotes?: string | null }) {
  const stage = stageOf(status);
  const changes = status === InteriorListingStatus.CHANGES_REQUESTED || status === InteriorListingStatus.REJECTED;
  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{changes ? "A few changes needed" : stage === 2 ? "You're live!" : "Submitted for review"}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {changes ? reviewNotes || "Our team left notes on your listing." : submittedAt ? `Submitted ${new Date(submittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}` : "We'll email and WhatsApp you as it moves along."}
        </p>
      </div>
      <ol className="grid grid-cols-3 gap-2 text-left">
        {STEPS.map((s, i) => {
          const done = i < stage || (i === stage && stage === 2);
          const current = i === stage && !done;
          const Icon = done ? Check : s.icon;
          return (
            <li key={s.key} className="flex flex-col items-center gap-2 text-center">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2",
                  done ? "border-emerald-600 bg-emerald-600 text-white" : current ? "border-slate-900 text-slate-900 dark:border-white dark:text-white" : "border-slate-200 text-slate-400 dark:border-slate-700",
                )}
                aria-current={current ? "step" : undefined}
              >
                <Icon className="size-4" />
              </span>
              <span className="text-sm font-semibold">{s.label}</span>
              <span className="text-xs text-slate-500">{s.hint}</span>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/dashboard/interior-profile/manage" className="inline-flex h-11 items-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
          Go to my dashboard
        </Link>
      </div>
    </div>
  );
}
