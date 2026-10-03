"use client";

import React from "react";
import { Check } from "lucide-react";
import { Controller, get, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/components/ui/utils";
import { evaluateCondition } from "@/features/propertyListing/formConfig/conditions";
import { areaUnitOptions, monthOptions } from "@/features/propertyListing/formConfig/options";
import type { FieldConfig, FormValues, Option } from "@/features/propertyListing/formConfig/types";
import { chip as chipCls, errorText, fieldLabel, helpText as helpCls } from "../theme";
import { amountToWords } from "./numberToWords";
import { MediaField } from "./MediaField";

type Props = { field: FieldConfig; values: FormValues };

const toNum = (raw: string): number | null => (raw === "" ? null : Number(raw));

const Labelled = ({
  label,
  htmlFor,
  required,
  error,
  helpText,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={htmlFor} className={fieldLabel}>
      {label}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
    {children}
    {error ? <p className={errorText}>{error}</p> : helpText ? <p className={helpCls}>{helpText}</p> : null}
  </div>
);

const Chip = ({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={cn(chipCls.base, active ? chipCls.active : chipCls.idle, disabled && chipCls.disabled)}
  >
    {active && <Check className="h-3.5 w-3.5" />}
    {children}
  </button>
);

export function FieldRenderer({ field, values }: Props) {
  const form = useFormContext();

  if (!evaluateCondition(values, field.visibleWhen)) return null;

  const options = (field.options ?? []).filter((o) => evaluateCondition(values, o.visibleWhen));
  const disabled = field.disabledIf ? evaluateCondition(values, field.disabledIf) : false;
  const required =
    field.required || (field.requiredWhen ? evaluateCondition(values, field.requiredWhen) : false);
  const rules = required ? { required: `${field.label} is required` } : undefined;
  const error = get(form.formState.errors, field.id)?.message as string | undefined;

  const optDisabled = (o: Option) => (o.disabledIf ? evaluateCondition(values, o.disabledIf) : false);

  switch (field.type) {
    case "text":
    case "number":
    case "date":
      return (
        <Controller
          name={field.id}
          control={form.control}
          rules={rules}
          render={({ field: rhf }) => (
            <Labelled label={field.label} required={required} error={error} helpText={field.helpText}>
              <Input
                type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                inputMode={field.type === "number" ? "decimal" : undefined}
                placeholder={field.placeholder}
                disabled={disabled}
                min={field.min}
                max={field.max}
                value={rhf.value === undefined || rhf.value === null ? "" : String(rhf.value)}
                onChange={(e) =>
                  rhf.onChange(field.type === "number" ? toNum(e.target.value) : e.target.value)
                }
                onBlur={rhf.onBlur}
              />
            </Labelled>
          )}
        />
      );

    case "textarea":
      return (
        <Controller
          name={field.id}
          control={form.control}
          rules={rules}
          render={({ field: rhf }) => (
            <Labelled label={field.label} required={required} error={error} helpText={field.helpText}>
              <Textarea
                placeholder={field.placeholder}
                disabled={disabled}
                rows={4}
                value={rhf.value ?? ""}
                onChange={(e) => rhf.onChange(e.target.value)}
                onBlur={rhf.onBlur}
              />
            </Labelled>
          )}
        />
      );

    case "select":
      return (
        <Controller
          name={field.id}
          control={form.control}
          rules={rules}
          render={({ field: rhf }) => (
            <Labelled label={field.label} required={required} error={error} helpText={field.helpText}>
              <Select
                value={rhf.value ? String(rhf.value) : ""}
                onValueChange={rhf.onChange}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder ?? "Select"} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((o) => (
                    <SelectItem key={String(o.value)} value={String(o.value)} disabled={optDisabled(o)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Labelled>
          )}
        />
      );

    case "radio":
    case "chip-radio":
      return (
        <Controller
          name={field.id}
          control={form.control}
          rules={rules}
          render={({ field: rhf }) => (
            <Labelled label={field.label} required={required} error={error} helpText={field.helpText}>
              <div className="flex flex-wrap gap-2">
                {options.map((o) => {
                  const active = String(rhf.value ?? "") === String(o.value);
                  return (
                    <Chip
                      key={String(o.value)}
                      active={active}
                      disabled={disabled || optDisabled(o)}
                      // radio semantics: switch selection, never clear on re-click
                      // (unless the field is optional, where clearing is allowed)
                      onClick={() =>
                        rhf.onChange(active && !required && !field.requiredWhen ? undefined : o.value)
                      }
                    >
                      {o.label}
                    </Chip>
                  );
                })}
              </div>
            </Labelled>
          )}
        />
      );

    case "chip-multi":
      return (
        <Controller
          name={field.id}
          control={form.control}
          rules={rules}
          render={({ field: rhf }) => {
            const arr: (string | number)[] = Array.isArray(rhf.value) ? rhf.value : [];
            return (
              <Labelled label={field.label} required={required} error={error} helpText={field.helpText}>
                <div className="flex flex-wrap gap-2">
                  {options.map((o) => {
                    const active = arr.includes(o.value as string | number);
                    return (
                      <Chip
                        key={String(o.value)}
                        active={active}
                        disabled={disabled || optDisabled(o)}
                        onClick={() =>
                          rhf.onChange(
                            active
                              ? arr.filter((v) => v !== o.value)
                              : [...arr, o.value as string | number],
                          )
                        }
                      >
                        {o.label}
                      </Chip>
                    );
                  })}
                </div>
              </Labelled>
            );
          }}
        />
      );

    case "chip-add":
      return (
        <Controller
          name={field.id}
          control={form.control}
          rules={rules}
          render={({ field: rhf }) => {
            const rec: Record<string, boolean> =
              rhf.value && typeof rhf.value === "object" ? rhf.value : {};
            return (
              <Labelled label={field.label} required={required} error={error} helpText={field.helpText}>
                <div className="flex flex-wrap gap-2">
                  {options.map((o) => {
                    const key = String(o.value);
                    const active = !!rec[key];
                    return (
                      <Chip
                        key={key}
                        active={active}
                        disabled={disabled || optDisabled(o)}
                        onClick={() => rhf.onChange({ ...rec, [key]: !active })}
                      >
                        {active ? o.label : `+ ${o.label}`}
                      </Chip>
                    );
                  })}
                </div>
              </Labelled>
            );
          }}
        />
      );

    case "toggle":
      return (
        <Controller
          name={field.id}
          control={form.control}
          render={({ field: rhf }) => (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition hover:border-slate-300">
              <div>
                <p className={fieldLabel}>{field.label}</p>
                {field.helpText && <p className={helpCls}>{field.helpText}</p>}
              </div>
              <Switch checked={!!rhf.value} onCheckedChange={rhf.onChange} disabled={disabled} />
            </div>
          )}
        />
      );

    case "checkbox":
      return (
        <Controller
          name={field.id}
          control={form.control}
          render={({ field: rhf }) => (
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 transition hover:border-slate-300">
              <Checkbox checked={!!rhf.value} onCheckedChange={rhf.onChange} disabled={disabled} />
              {field.label}
            </label>
          )}
        />
      );

    case "counter":
      return (
        <Controller
          name={field.id}
          control={form.control}
          rules={rules}
          render={({ field: rhf }) => {
            const val = Number(rhf.value) || 0;
            const min = field.min ?? 0;
            const max = field.max ?? 99;
            const step = field.step ?? 1;
            return (
              <Labelled label={field.label} required={required} error={error} helpText={field.helpText}>
                <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-lg leading-none text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                    disabled={disabled || val <= min}
                    onClick={() => rhf.onChange(Math.max(min, val - step))}
                  >
                    −
                  </button>
                  <span className="min-w-[2.5ch] text-center text-sm font-semibold text-slate-900">{val}</span>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-lg leading-none text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                    disabled={disabled || val >= max}
                    onClick={() => rhf.onChange(Math.min(max, val + step))}
                  >
                    +
                  </button>
                </div>
              </Labelled>
            );
          }}
        />
      );

    case "measure": {
      const unitField = field.unitField!;
      const unitOptions = field.unitOptions ?? areaUnitOptions;
      return (
        <Labelled label={field.label} required={required} error={error} helpText={field.helpText}>
          <div className="flex h-11 overflow-hidden rounded-xl border border-slate-200 transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
            <Controller
              name={field.id}
              control={form.control}
              rules={rules}
              render={({ field: rhf }) => (
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={field.placeholder ?? field.label}
                  disabled={disabled}
                  className="w-full bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-50"
                  value={rhf.value === undefined || rhf.value === null ? "" : String(rhf.value)}
                  onChange={(e) => rhf.onChange(toNum(e.target.value))}
                  onBlur={rhf.onBlur}
                />
              )}
            />
            <Controller
              name={unitField}
              control={form.control}
              render={({ field: rhf }) => (
                <select
                  disabled={disabled}
                  className="border-l border-slate-200 bg-slate-50 px-2 text-sm text-slate-700 outline-none"
                  value={rhf.value ? String(rhf.value) : String(unitOptions[0]?.value ?? "")}
                  onChange={(e) => rhf.onChange(e.target.value)}
                >
                  {unitOptions.map((o) => (
                    <option key={String(o.value)} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        </Labelled>
      );
    }

    case "dimension": {
      // value stored as { length, breadth } at field.id
      return (
        <Controller
          name={field.id}
          control={form.control}
          render={({ field: rhf }) => {
            const v: { length?: number | null; breadth?: number | null } =
              rhf.value && typeof rhf.value === "object" ? rhf.value : {};
            return (
              <Labelled label={field.label} required={required} error={error} helpText={field.helpText}>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Length"
                    disabled={disabled}
                    value={v.length ?? ""}
                    onChange={(e) => rhf.onChange({ ...v, length: toNum(e.target.value) })}
                  />
                  <span className="text-slate-400">×</span>
                  <Input
                    type="number"
                    placeholder="Breadth"
                    disabled={disabled}
                    value={v.breadth ?? ""}
                    onChange={(e) => rhf.onChange({ ...v, breadth: toNum(e.target.value) })}
                  />
                </div>
              </Labelled>
            );
          }}
        />
      );
    }

    case "month-year":
      return (
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name={field.id}
            control={form.control}
            rules={rules}
            render={({ field: rhf }) => (
              <Labelled label={field.label} required={required} error={error}>
                <Input
                  type="text"
                  placeholder="Year (e.g. 2027)"
                  disabled={disabled}
                  value={rhf.value ?? ""}
                  onChange={(e) => rhf.onChange(e.target.value)}
                />
              </Labelled>
            )}
          />
          <Controller
            name={field.unitField ?? `${field.id}Month`}
            control={form.control}
            render={({ field: rhf }) => (
              <Labelled label="Month">
                <Select value={rhf.value ? String(rhf.value) : ""} onValueChange={rhf.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((o) => (
                      <SelectItem key={String(o.value)} value={String(o.value)}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Labelled>
            )}
          />
        </div>
      );

    case "price":
      return <PriceField field={field} disabled={disabled} required={required} error={error} />;

    case "media":
      return <MediaField field={field} />;

    default:
      return null;
  }
}

function PriceField({
  field,
  disabled,
  required,
  error,
}: {
  field: FieldConfig;
  disabled: boolean;
  required: boolean;
  error?: string;
}) {
  const form = useFormContext();
  const amount = useWatch({ control: form.control, name: field.id });
  const words = amountToWords(typeof amount === "number" ? amount : Number(amount));

  return (
    <div className="space-y-2">
      <div className="grid gap-3 sm:grid-cols-2">
        <Controller
          name={field.id}
          control={form.control}
          rules={required ? { required: `${field.label} is required` } : undefined}
          render={({ field: rhf }) => (
            <Labelled label={field.label} required={required} error={error}>
              <div className="flex h-11 items-center rounded-xl border border-slate-200 px-3 transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
                <span className="text-sm text-slate-500">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  disabled={disabled}
                  placeholder={field.placeholder ?? "Expected price"}
                  className="w-full bg-transparent px-2 py-2 text-sm outline-none"
                  value={rhf.value === undefined || rhf.value === null ? "" : String(rhf.value)}
                  onChange={(e) => rhf.onChange(toNum(e.target.value))}
                />
              </div>
            </Labelled>
          )}
        />
        {field.perUnitField && (
          <Controller
            name={field.perUnitField}
            control={form.control}
            render={({ field: rhf }) => (
              <Labelled label="Price per sq.ft.">
                <div className="flex h-11 items-center rounded-xl border border-slate-200 px-3">
                  <span className="text-sm text-slate-500">₹</span>
                  <input
                    type="number"
                    disabled={disabled}
                    className="w-full bg-transparent px-2 py-2 text-sm outline-none"
                    value={rhf.value === undefined || rhf.value === null ? "" : String(rhf.value)}
                    onChange={(e) => rhf.onChange(toNum(e.target.value))}
                  />
                </div>
              </Labelled>
            )}
          />
        )}
      </div>
      {words && <p className="text-xs font-medium text-slate-500">₹ {words}</p>}
    </div>
  );
}
