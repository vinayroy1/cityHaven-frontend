"use client";

import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { BranchPricingOverride, InteriorBranchDraft, InteriorWizardValues } from "@/types/interior.types";
import { Field, getAt, inputCls, propPath, setPath, toNum, wizardSymbol } from "./ui";

/** Per-branch starting rates for branches flagged "overrides company pricing". */
export default function BranchPricingOverrides({ values, form, props }: CustomStepProps<InteriorWizardValues>) {
  const path = propPath(props, "field", "pricing.branchOverrides");
  const branches = (getAt<InteriorBranchDraft[]>(values, propPath(props, "branchesField", "location.branches")) ?? []).filter(
    (b) => b.overridesCompanyPricing && b.serverId,
  );
  const rows = getAt<BranchPricingOverride[]>(values, path) ?? [];
  const rowFor = (id: number) => rows.find((r) => r.branchId === id) ?? { branchId: id, startingRateMin: null, startingRateMax: null };
  const update = (id: number, p: Partial<BranchPricingOverride>) =>
    setPath(form, path, [...rows.filter((r) => r.branchId !== id), { ...rowFor(id), ...p }]);

  if (!branches.length) return <p className="text-sm text-slate-500">Save a branch with “overrides company pricing” turned on to set its rates here.</p>;
  return (
    <ul className="space-y-3">
      {branches.map((b) => {
        const r = rowFor(b.serverId!);
        return (
          <li key={b.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-3 dark:border-slate-700">
            <p className="font-semibold sm:col-span-3">{b.branchName || b.city}</p>
            <Field label={`Starting from ${wizardSymbol(values)}`}>
              {(id) => <input id={id} inputMode="numeric" className={inputCls} value={r.startingRateMin ?? ""} onChange={(e) => update(b.serverId!, { startingRateMin: toNum(e.target.value) })} />}
            </Field>
            <Field label={`Up to ${wizardSymbol(values)}`}>
              {(id) => <input id={id} inputMode="numeric" className={inputCls} value={r.startingRateMax ?? ""} onChange={(e) => update(b.serverId!, { startingRateMax: toNum(e.target.value) })} />}
            </Field>
            <Field label="Unit">
              {(id) => (
                <select id={id} className={inputCls} value={r.pricingUnit ?? values.pricing.pricingUnit ?? ""} onChange={(e) => update(b.serverId!, { pricingUnit: e.target.value as BranchPricingOverride["pricingUnit"] })}>
                  <option value="PER_SQFT">per sq.ft</option>
                  <option value="PER_ROOM">per room</option>
                  <option value="PER_PROJECT">per project</option>
                  <option value="FIXED_PRICE">fixed</option>
                </select>
              )}
            </Field>
          </li>
        );
      })}
    </ul>
  );
}
