"use client";

import React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { cn } from "@/components/ui/utils";
import type { FieldConfig, FormValues } from "@/lib/listingEngine/types";
import { FieldRenderer } from "./FieldRenderer";
import { domId, FieldShell } from "./FieldShell";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/**
 * Array of rows; row sub-fields come from meta.itemFields (ids relative to the row, conditions too).
 * meta: itemFields, newItem, idPrefix, addLabel, emptyText, itemLabel (e.g. "Option"), titleField.
 */
export function RepeaterField({
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
  const { control, getFieldState, formState } = useFormContext();
  // keyName must not be "id" — rows carry their own persisted `id`.
  const { fields: rows, append, remove, move } = useFieldArray({ control, name, keyName: "_rowKey" as "id" });
  const live = (useWatch({ control, name }) as FormValues[] | undefined) ?? [];
  const meta = field.meta ?? {};
  const itemFields = (meta.itemFields as FieldConfig[] | undefined) ?? [];
  const newItem = (meta.newItem as FormValues | undefined) ?? {};
  const itemLabel = (meta.itemLabel as string | undefined) ?? "Item";
  const titleField = meta.titleField as string | undefined;
  const max = field.maxItems;
  const id = domId(name);
  const err = getFieldState(name, formState).error;
  const errMsg = err?.message ?? (err as { root?: { message?: string } } | undefined)?.root?.message;

  const add = () => {
    const prefix = (meta.idPrefix as string | undefined) ?? "row";
    append({ ...structuredClone(newItem), id: `${prefix}-${uid()}` });
  };

  const rowTitle = (row: FormValues, i: number) => {
    if (titleField) {
      const tf = itemFields.find((f) => f.id === titleField);
      const v = row?.[titleField];
      const opt = tf?.options?.find((o) => o.value === v);
      if (opt) return opt.label;
      if (typeof v === "string" && v.trim()) return v;
    }
    const first = itemFields[0];
    const v = first ? row?.[first.id] : undefined;
    const opt = first?.options?.find((o) => o.value === v);
    return opt?.label ?? `${itemLabel} ${i + 1}`;
  };

  return (
    <FieldShell id={id} as="fieldset" label={field.label} required={required} help={field.helpText} error={errMsg}>
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700">
          {(meta.emptyText as string) ?? "Nothing added yet."}
        </div>
      ) : (
        <ol className="space-y-3">
          {rows.map((r, i) => {
            const row = live[i] ?? {};
            return (
              <li
                key={(r as unknown as { _rowKey: string })._rowKey}
                className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-slate-900 dark:text-white">{rowTitle(row, i)}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    <IconBtn label={`Move ${itemLabel.toLowerCase()} ${i + 1} up`} disabled={disabled || i === 0} onClick={() => move(i, i - 1)}>
                      <ArrowUp className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn label={`Move ${itemLabel.toLowerCase()} ${i + 1} down`} disabled={disabled || i === rows.length - 1} onClick={() => move(i, i + 1)}>
                      <ArrowDown className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn label={`Remove ${itemLabel.toLowerCase()} ${i + 1}`} disabled={disabled} onClick={() => remove(i)} danger>
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {itemFields.map((sub) => (
                    <FieldRenderer key={sub.id} field={sub} name={`${name}.${i}.${sub.id}`} scope={row} />
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <button
        type="button"
        onClick={add}
        disabled={disabled || Boolean(max && rows.length >= max)}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-300 px-4 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" /> {(meta.addLabel as string) ?? `Add ${itemLabel.toLowerCase()}`}
      </button>
    </FieldShell>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800",
        danger && "hover:bg-rose-50 hover:text-rose-600",
      )}
    >
      {children}
    </button>
  );
}
