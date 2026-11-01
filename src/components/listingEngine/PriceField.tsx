"use client";

import React from "react";
import { useController, useFormContext } from "react-hook-form";
import { cn } from "@/components/ui/utils";
import { amountToWords } from "@/components/propertyListing/fields/numberToWords";
import type { FieldConfig } from "@/lib/listingEngine/types";
import { describedBy, domId, FieldShell } from "./FieldShell";
import { helpText, inputBase } from "./theme";

const fmt = (n: number) => n.toLocaleString("en-IN");
const parse = (raw: string): number | null => {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
};

/** ₹ amount with Indian grouping, optional words (meta.showWords) and unit select (unitField/unitOptions). */
export function PriceField({
  field,
  name,
  required,
  disabled,
}: {
  field: FieldConfig;
  name: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const { control } = useFormContext();
  const { field: f, fieldState } = useController({ name, control });
  const unitName = field.unitField;
  const id = domId(name);
  const value = typeof f.value === "number" ? f.value : f.value ? parse(String(f.value)) : null;
  const words = field.meta?.showWords && value ? amountToWords(value) : "";
  const err = fieldState.error?.message;

  return (
    <FieldShell id={id} label={field.label} required={required} publishOnly={field.requiredFor === "PUBLISH"} help={field.helpText} error={err}>
      <div className="flex min-w-0 gap-2">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₹</span>
          <input
            id={id}
            ref={f.ref}
            inputMode="numeric"
            autoComplete="off"
            disabled={disabled}
            placeholder={field.placeholder ?? "0"}
            aria-invalid={Boolean(err) || undefined}
            aria-describedby={describedBy(id, field.helpText, err)}
            value={value === null ? "" : fmt(value)}
            onChange={(e) => {
              let n = parse(e.target.value);
              if (n !== null && typeof field.max === "number") n = Math.min(n, field.max);
              f.onChange(n);
            }}
            onBlur={f.onBlur}
            className={cn(inputBase, "pl-7 tabular-nums", err && "border-rose-400")}
          />
        </div>
        {unitName && field.unitOptions?.length ? <UnitSelect name={unitName} field={field} disabled={disabled} /> : null}
      </div>
      {words && <p className={cn(helpText, "text-emerald-700 dark:text-emerald-400")}>{words}</p>}
    </FieldShell>
  );
}

function UnitSelect({ name, field, disabled }: { name: string; field: FieldConfig; disabled?: boolean }) {
  const { control } = useFormContext();
  const { field: f } = useController({ name, control });
  return (
    <select
      aria-label={`${field.label} unit`}
      disabled={disabled}
      value={f.value ?? ""}
      onChange={(e) => f.onChange(e.target.value)}
      className={cn(inputBase, "w-auto max-w-[45%] shrink-0")}
    >
      <option value="">Unit</option>
      {field.unitOptions!.map((o) => (
        <option key={String(o.value)} value={String(o.value)}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
