"use client";

import React, { useState } from "react";
import { Building2, Check, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { InteriorProviderType, InteriorWizardValues } from "@/types/interior.types";
import { PROVIDER_TYPE_OPTIONS } from "@/features/interiors/wizard/options";
import { setPath, usePathValue } from "./ui";

const ICONS = { INDIVIDUAL: User, COMPANY: Building2 } as const;
const PERKS: Record<InteriorProviderType, string[]> = {
  INDIVIDUAL: ["Your name and photo on the card", "One studio location", "Credentials like COA / IIID"],
  COMPANY: ["Brand logo and team", "Head office plus branches", "GST-verified business badge"],
};

/** Has the provider entered anything that the other type would hide? */
function hasTypeSpecificData(v: InteriorWizardValues) {
  return Boolean(
    v.identity.fullName ||
      v.identity.businessName ||
      v.location.branches.length ||
      v.team.members.length ||
      v.team.gstin,
  );
}

export function ProviderTypeCards({ form, values, mode }: CustomStepProps<InteriorWizardValues>) {
  const current = usePathValue<InteriorProviderType | "">(form, "identity.providerType");
  const [pending, setPending] = useState<InteriorProviderType | null>(null);

  const choose = (next: InteriorProviderType) => {
    if (next === current) return;
    if (current && hasTypeSpecificData(values)) return setPending(next);
    setPath(form, "identity.providerType", next);
  };

  return (
    <>
      <div role="radiogroup" aria-label="Who is listing?" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PROVIDER_TYPE_OPTIONS.map((o) => {
          const value = o.value as InteriorProviderType;
          const Icon = ICONS[value];
          const active = current === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => choose(value)}
              className={cn(
                "relative flex min-w-0 flex-col gap-3 rounded-2xl border-2 bg-white p-5 text-left transition dark:bg-slate-900",
                active
                  ? "border-slate-900 shadow-lg ring-4 ring-slate-900/5 dark:border-white"
                  : "border-slate-200 hover:border-slate-400 hover:shadow-md dark:border-slate-800",
              )}
            >
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-xl",
                  active ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
                )}
              >
                <Icon className="size-6" />
              </span>
              <span>
                <span className="block text-base font-semibold text-slate-900 dark:text-white">{o.label}</span>
                <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{o.description}</span>
              </span>
              <ul className="space-y-1">
                {PERKS[value].map((p) => (
                  <li key={p} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <Check className="size-3.5 text-emerald-600" /> {p}
                  </li>
                ))}
              </ul>
              {active && (
                <span className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <Check className="size-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {mode === "manage" && current && (
        <p className="mt-2 text-xs text-slate-500">Switching type changes which sections appear and may need re-review.</p>
      )}

      <AlertDialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to {pending === "COMPANY" ? "Company / Firm" : "Individual designer"}?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending === "INDIVIDUAL"
                ? "Branches, team members and company details will be hidden from your listing. Your data is kept if you switch back."
                : "Your individual details stay saved, but the listing will show your business name, branches and team instead."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep current</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) setPath(form, "identity.providerType", pending);
                setPending(null);
              }}
            >
              Switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ProviderTypeCards;
