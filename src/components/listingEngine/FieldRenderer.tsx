"use client";

import React, { useEffect, useRef, useState } from "react";
import { Minus, Phone, Plus, X } from "lucide-react";
import { useController, useFormContext } from "react-hook-form";
import { cn } from "@/components/ui/utils";
import { evaluateCondition, getValue } from "@/lib/listingEngine/conditions";
import type { FieldConfig, FormValues, Option } from "@/lib/listingEngine/types";
import { getStoredUserContact } from "@/lib/auth/storedUser";
import { PropertyListingCitySelector } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { SearchableSelect } from "@/components/propertyListing/SearchableSelect";
import { useEngine } from "./EngineContext";
import { describedBy, domId, FieldShell } from "./FieldShell";
import { GalleryField } from "./GalleryField";
import { PriceField } from "./PriceField";
import { RepeaterField } from "./RepeaterField";
import { SelectCards } from "./SelectCards";
import { UploadField } from "./UploadField";
import { chip, helpText, inputBase } from "./theme";

/** Types that should span the full row of a 2-column section grid. */
export const FULL_WIDTH_TYPES = new Set([
  "textarea",
  "chip-radio",
  "chip-multi",
  "chip-add",
  "radio",
  "tags",
  "repeater",
  "gallery",
  "custom",
  "multi-select",
  "media",
]);

export const emptyValueFor = (type: FieldConfig["type"]): unknown => {
  switch (type) {
    case "chip-multi":
    case "multi-select":
    case "tags":
    case "gallery":
    case "repeater":
    case "chip-add":
      return [];
    case "toggle":
    case "checkbox":
      return false;
    case "number":
    case "price":
    case "counter":
      return null;
    default:
      return "";
  }
};

type RendererProps = {
  field: FieldConfig;
  /** full RHF path; defaults to field.id. Repeater rows pass `${arrayPath}.${index}.${field.id}`. */
  name?: string;
  /** values that the field's conditions are evaluated against (repeater row); defaults to form values. */
  scope?: FormValues;
};

export function FieldRenderer({ field, name: nameProp, scope }: RendererProps) {
  const engine = useEngine();
  const form = useFormContext();
  const name = nameProp ?? field.id;
  const condValues = scope ?? engine.values;
  const visible = evaluateCondition(condValues, field.visibleWhen, engine.predicates);
  const disabled = field.disabledIf ? evaluateCondition(condValues, field.disabledIf, engine.predicates) : false;
  const required =
    Boolean(field.required) || (field.requiredWhen ? evaluateCondition(condValues, field.requiredWhen, engine.predicates) : false);

  // Clear a value when its field is hidden (visible -> hidden transition only).
  const wasVisible = useRef(visible);
  useEffect(() => {
    if (wasVisible.current && !visible && field.resetOnHide !== false) {
      form.setValue(name, emptyValueFor(field.type), { shouldDirty: true });
      form.clearErrors(name);
    }
    wasVisible.current = visible;
  }, [visible, field.resetOnHide, field.type, form, name]);

  if (!visible) return null;
  return (
    <div data-field-path={name} className={cn("min-w-0 scroll-mt-28", FULL_WIDTH_TYPES.has(field.type) && "sm:col-span-2")}>
      <FieldBody field={field} name={name} required={required} disabled={disabled} scope={condValues} />
    </div>
  );
}

function FieldBody({
  field,
  name,
  required,
  disabled,
  scope,
}: {
  field: FieldConfig;
  name: string;
  required: boolean;
  disabled: boolean;
  scope: FormValues;
}) {
  const engine = useEngine();
  switch (field.type) {
    case "price":
      return <PriceField field={field} name={name} required={required} disabled={disabled} />;
    case "upload":
    case "media":
      return <UploadField field={field} name={name} required={required} disabled={disabled} />;
    case "gallery":
      return <GalleryField field={field} name={name} required={required} disabled={disabled} />;
    case "repeater":
      return <RepeaterField field={field} name={name} required={required} disabled={disabled} />;
    case "custom": {
      const Comp = field.component ? engine.customComponents[field.component] : undefined;
      if (!Comp) return <MissingComponent name={field.component} />;
      return <CustomField Comp={Comp} field={field} />;
    }
    default:
      return <ControlledField field={field} name={name} required={required} disabled={disabled} scope={scope} />;
  }
}

function CustomField({
  Comp,
  field,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Comp: React.ComponentType<any>;
  field: FieldConfig;
}) {
  const engine = useEngine();
  const form = useFormContext();
  return (
    <Comp
      values={engine.values}
      form={form}
      mode={engine.mode}
      field={field}
      props={field.meta}
      goToStep={engine.goToStep}
      readiness={engine.readiness}
    />
  );
}

export function MissingComponent({ name }: { name?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
      This section ({name ?? "unknown"}) is not available yet.
    </div>
  );
}

const visibleOptions = (opts: Option[] | undefined, scope: FormValues, predicates: Record<string, (v: FormValues) => boolean>) =>
  (opts ?? []).filter((o) => evaluateCondition(scope, o.visibleWhen, predicates));

function ControlledField({
  field,
  name,
  required,
  disabled,
  scope,
}: {
  field: FieldConfig;
  name: string;
  required: boolean;
  disabled: boolean;
  scope: FormValues;
}) {
  const { control, setValue } = useFormContext();
  const engine = useEngine();
  const { field: f, fieldState } = useController({ name, control });
  const id = domId(name);
  const err = fieldState.error?.message;
  const meta = field.meta ?? {};
  const shell = {
    id,
    label: field.label,
    required,
    publishOnly: field.requiredFor === "PUBLISH",
    help: field.helpText,
    error: err,
  };
  const aria = {
    "aria-invalid": Boolean(err) || undefined,
    "aria-describedby": describedBy(id, field.helpText, err),
    "aria-required": required || undefined,
  };
  const inputCls = cn(inputBase, err && "border-rose-400 focus:border-rose-500 focus:ring-rose-100");
  const options = visibleOptions(field.options, scope, engine.predicates);
  const str = f.value === null || f.value === undefined ? "" : String(f.value);

  switch (field.type) {
    case "text":
    case "email":
    case "url":
    case "date":
    case "time":
    case "month-year": {
      const inputType =
        field.type === "month-year" ? "month" : field.type === "text" ? "text" : field.type;
      const slug = Boolean(meta.slugPreview);
      return (
        <FieldShell
          {...shell}
          counter={field.maxLength && str.length > field.maxLength * 0.7 ? `${str.length}/${field.maxLength}` : undefined}
        >
          <input
            id={id}
            ref={f.ref}
            type={inputType}
            inputMode={field.type === "url" ? "url" : field.type === "email" ? "email" : undefined}
            autoComplete={field.type === "email" ? "email" : "off"}
            disabled={disabled}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            min={field.type === "date" && typeof field.min === "string" ? field.min : undefined}
            value={str}
            onBlur={f.onBlur}
            onChange={(e) => {
              let v = e.target.value;
              if (meta.uppercase) v = v.toUpperCase();
              if (slug) v = toSlug(v, true);
              f.onChange(v);
            }}
            className={cn(inputCls, field.type === "date" || field.type === "time" ? "appearance-none" : "")}
            {...aria}
          />
          {slug && <SlugPreview field={field} value={str} onUseSuggestion={(s) => f.onChange(s)} />}
        </FieldShell>
      );
    }
    case "tel":
      return (
        <FieldShell {...shell}>
          <div className="flex min-w-0 gap-2">
            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">+91</span>
              <input
                id={id}
                ref={f.ref}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                disabled={disabled}
                placeholder={field.placeholder}
                value={str}
                maxLength={10}
                onBlur={f.onBlur}
                onChange={(e) => f.onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className={cn(inputCls, "pl-11 tabular-nums")}
                {...aria}
              />
            </div>
            {Boolean(meta.suggestFromUser) && <UseMyNumber current={str} onUse={(n) => f.onChange(n)} disabled={disabled} />}
          </div>
        </FieldShell>
      );
    case "textarea":
      return (
        <FieldShell
          {...shell}
          counter={
            field.maxLength || field.minLength ? (
              <span className={cn(field.minLength && str.trim().length > 0 && str.trim().length < field.minLength && "text-amber-600")}>
                {str.length}
                {field.maxLength ? `/${field.maxLength}` : ""}
                {field.minLength && str.trim().length < field.minLength ? ` · min ${field.minLength}` : ""}
              </span>
            ) : undefined
          }
        >
          <textarea
            id={id}
            ref={f.ref}
            rows={field.rows ?? 4}
            disabled={disabled}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            value={str}
            onBlur={f.onBlur}
            onChange={(e) => f.onChange(e.target.value)}
            className={cn(inputCls, "h-auto min-h-[96px] resize-y py-2.5 leading-relaxed")}
            {...aria}
          />
        </FieldShell>
      );
    case "number": {
      const suffix = meta.suffix as string | undefined;
      return (
        <FieldShell {...shell}>
          <div className="relative">
            <input
              id={id}
              ref={f.ref}
              type="number"
              inputMode="decimal"
              disabled={disabled}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step ?? 1}
              value={str}
              onBlur={f.onBlur}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              onChange={(e) => {
                const raw = e.target.value;
                f.onChange(raw === "" ? null : Number(raw));
              }}
              className={cn(inputCls, suffix && "pr-12", "tabular-nums")}
              {...aria}
            />
            {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">{suffix}</span>}
          </div>
        </FieldShell>
      );
    }
    case "counter": {
      const n = typeof f.value === "number" ? f.value : 0;
      const min = field.min ?? 0;
      const max = field.max ?? 99;
      return (
        <FieldShell {...shell}>
          <div className="inline-flex items-center gap-3 rounded-xl border border-slate-200 p-1 dark:border-slate-700">
            <button type="button" aria-label={`Decrease ${field.label}`} disabled={disabled || n <= min} onClick={() => f.onChange(Math.max(min, n - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800">
              <Minus className="h-4 w-4" />
            </button>
            <output id={id} aria-live="polite" className="w-8 text-center text-sm font-semibold tabular-nums">
              {n}
            </output>
            <button type="button" aria-label={`Increase ${field.label}`} disabled={disabled || n >= max} onClick={() => f.onChange(Math.min(max, n + 1))} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </FieldShell>
      );
    }
    case "select":
      return (
        <FieldShell {...shell}>
          <select
            id={id}
            ref={f.ref}
            disabled={disabled}
            value={str}
            onBlur={f.onBlur}
            onChange={(e) => {
              const opt = options.find((o) => String(o.value) === e.target.value);
              f.onChange(opt ? opt.value : options.some((x) => typeof x.value === "boolean" || typeof x.value === "number") ? null : "");
            }}
            className={inputCls}
            {...aria}
          >
            <option value="">{field.placeholder ?? "Select…"}</option>
            {options.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
          </select>
        </FieldShell>
      );
    case "searchable-select":
      return (
        <FieldShell {...shell}>
          <SearchableSelect
            value={str}
            onChange={(v) => f.onChange(v)}
            options={options.map((o) => ({ value: String(o.value), label: o.label, description: o.description }))}
            placeholder={field.placeholder}
            disabled={disabled}
            hasError={Boolean(err)}
            allowCustom={Boolean(meta.allowCustom)}
            onCustomSelect={(v) => f.onChange(v)}
          />
        </FieldShell>
      );
    case "radio":
      if (meta.variant === "cards") {
        return (
          <FieldShell {...shell} as="fieldset">
            <SelectCards
              label={field.label}
              options={options}
              value={f.value}
              onChange={(v) => f.onChange(v)}
              disabled={disabled}
              columns={meta.columns === 3 ? 3 : 2}
              isOptionDisabled={(o) => (o.disabledIf ? evaluateCondition(scope, o.disabledIf, engine.predicates) : false)}
            />
          </FieldShell>
        );
      }
    // falls through to chips
    case "chip-radio":
      return (
        <FieldShell {...shell} as="fieldset">
          <div role="radiogroup" aria-label={field.label} className="flex flex-wrap gap-2">
            {options.map((o) => {
              const active = f.value === o.value;
              const optDisabled = disabled || (o.disabledIf ? evaluateCondition(scope, o.disabledIf, engine.predicates) : false);
              return (
                <button
                  key={String(o.value)}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={optDisabled}
                  title={o.description}
                  onClick={() => f.onChange(active && !required ? (options.some((x) => typeof x.value === "boolean" || typeof x.value === "number") ? null : emptyValueFor(field.type)) : o.value)}
                  className={cn(chip.base, "min-h-10", active ? chip.active : chip.idle, optDisabled && chip.disabled)}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </FieldShell>
      );
    case "chip-multi":
      if (meta.variant === "cards") {
        return (
          <FieldShell {...shell} as="fieldset">
            <SelectCards
              multiple
              label={field.label}
              options={options}
              value={f.value}
              onChange={(v) => f.onChange(v)}
              disabled={disabled}
              maxItems={field.maxItems}
              columns={meta.columns === 3 ? 3 : 2}
            />
          </FieldShell>
        );
      }
      return (
        <ChipMulti
          field={field}
          shell={shell}
          options={options}
          value={Array.isArray(f.value) ? f.value : []}
          onChange={(v) => f.onChange(v)}
          disabled={disabled}
        />
      );
    case "multi-select":
      return (
        <FieldShell {...shell}>
          <MultiSelect
            options={options}
            value={Array.isArray(f.value) ? f.value : []}
            onChange={(v) => f.onChange(v)}
            maxItems={field.maxItems}
            placeholder={field.placeholder}
            disabled={disabled}
            hasError={Boolean(err)}
          />
        </FieldShell>
      );
    case "tags":
    case "chip-add":
      return (
        <FieldShell {...shell}>
          <TagsInput
            id={id}
            value={Array.isArray(f.value) ? f.value : []}
            onChange={(v) => f.onChange(v)}
            placeholder={field.placeholder}
            maxItems={field.maxItems}
            disabled={disabled}
            suggestions={options.map((o) => String(o.label))}
          />
        </FieldShell>
      );
    case "toggle":
    case "checkbox": {
      const on = Boolean(f.value);
      return (
        <div className="flex min-h-11 items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900/60">
          <label htmlFor={id} className="min-w-0 cursor-pointer">
            <span className="block text-sm font-medium text-slate-800 dark:text-slate-200">
              {field.label}
              {required && <span className="text-rose-500"> *</span>}
            </span>
            {field.helpText && <span id={`${id}-help`} className={cn(helpText, "block")}>{field.helpText}</span>}
            {err && <span role="alert" className="block text-xs font-medium text-rose-600">{err}</span>}
          </label>
          {field.type === "checkbox" ? (
            <input
              id={id}
              ref={f.ref}
              type="checkbox"
              checked={on}
              disabled={disabled}
              onChange={(e) => f.onChange(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-slate-900"
              {...aria}
            />
          ) : (
            <button
              id={id}
              ref={f.ref}
              type="button"
              role="switch"
              aria-checked={on}
              aria-describedby={describedBy(id, field.helpText, err)}
              disabled={disabled}
              onClick={() => f.onChange(!on)}
              className={cn(
                "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition",
                on ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700",
                disabled && "opacity-50",
              )}
            >
              <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition", on ? "translate-x-5" : "translate-x-0.5")} />
            </button>
          )}
        </div>
      );
    }
    case "city-select":
      return (
        <FieldShell {...shell}>
          <PropertyListingCitySelector
            value={str}
            hasError={Boolean(err)}
            placeholder={field.placeholder}
            onChange={(city) => {
              f.onChange(city.name);
              if (meta.stateField && city.state !== undefined) setValue(meta.stateField as string, city.state ?? "", { shouldDirty: true });
              if (meta.latField) setValue(meta.latField as string, city.lat ?? null, { shouldDirty: true });
              if (meta.lngField) setValue(meta.lngField as string, city.lng ?? null, { shouldDirty: true });
            }}
          />
        </FieldShell>
      );
    case "locality-select": {
      const cityName = meta.cityField ? String(getValue(engine.values, meta.cityField as string) ?? "") : "";
      return (
        <FieldShell {...shell} help={!cityName ? "Choose a city first." : field.helpText}>
          <PropertyListingLocalitySelector
            value={str}
            cityName={cityName}
            hasError={Boolean(err)}
            placeholder={field.placeholder}
            onChange={(loc) => {
              f.onChange(loc.name);
              if (meta.pincodeField && loc.pincode) setValue(meta.pincodeField as string, loc.pincode, { shouldDirty: true });
              if (meta.latField) setValue(meta.latField as string, loc.lat ?? null, { shouldDirty: true });
              if (meta.lngField) setValue(meta.lngField as string, loc.lng ?? null, { shouldDirty: true });
            }}
          />
        </FieldShell>
      );
    }
    default:
      return <MissingComponent name={`field type "${field.type}"`} />;
  }
}

/* ------------------------------------------------------------------ */

export const toSlug = (s: string, keepTrailingDash = false) => {
  const out = s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-/, "");
  return keepTrailingDash ? out.slice(0, 80) : out.replace(/-$/, "").slice(0, 80);
};

function SlugPreview({ field, value, onUseSuggestion }: { field: FieldConfig; value: string; onUseSuggestion: (s: string) => void }) {
  const engine = useEngine();
  const meta = field.meta ?? {};
  const city = meta.cityField ? toSlug(String(getValue(engine.values, meta.cityField as string) ?? "")) : "";
  const source = ((meta.sourceFields as string[] | undefined) ?? [])
    .map((p) => getValue(engine.values, p))
    .find((v) => typeof v === "string" && v.trim()) as string | undefined;
  const suggestion = source ? toSlug(source) : "";
  const effective = toSlug(value) || suggestion;
  return (
    <div className="space-y-1">
      <p className="break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
        {String(meta.prefix ?? "")}
        {city ? `${city}/` : "{city}/"}
        <span className="font-semibold text-slate-900 dark:text-white">{effective || "{your-name}"}</span>
      </p>
      {!value && suggestion && (
        <button type="button" onClick={() => onUseSuggestion(suggestion)} className="text-xs font-medium text-slate-700 underline underline-offset-2">
          Use “{suggestion}”
        </button>
      )}
    </div>
  );
}

function UseMyNumber({ current, onUse, disabled }: { current: string; onUse: (n: string) => void; disabled?: boolean }) {
  const [mine, setMine] = useState<string | null>(null);
  useEffect(() => {
    const u = getStoredUserContact();
    const digits = u?.mobileNumber?.replace(/\D/g, "").slice(-10) ?? "";
    setMine(digits.length === 10 ? digits : null);
  }, []);
  if (!mine || mine === current) return null;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onUse(mine)}
      className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
    >
      <Phone className="h-3.5 w-3.5" /> Use my number
    </button>
  );
}

type ShellProps = React.ComponentProps<typeof FieldShell> extends infer P ? Omit<P & object, "children"> : never;

function ChipMulti({
  field,
  shell,
  options,
  value,
  onChange,
  disabled,
}: {
  field: FieldConfig;
  shell: Omit<ShellProps, "as">;
  options: Option[];
  value: unknown[];
  onChange: (v: unknown[]) => void;
  disabled?: boolean;
}) {
  const meta = field.meta ?? {};
  const presets = (meta.presets as { label: string; value: unknown[] }[] | undefined) ?? [];
  const max = field.maxItems;
  const grouped = Boolean(meta.grouped) && options.some((o) => o.group);
  const groups = grouped
    ? options.reduce<Record<string, Option[]>>((acc, o) => {
        const g = o.group ?? "Other";
        (acc[g] ??= []).push(o);
        return acc;
      }, {})
    : { "": options };
  const toggle = (v: Option["value"]) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else if (!max || value.length < max) onChange([...value, v]);
  };
  const atMax = Boolean(max && value.length >= max);
  return (
    <FieldShell
      {...shell}
      as="fieldset"
      counter={max ? `${value.length}/${max}` : value.length ? `${value.length} selected` : undefined}
    >
      {(presets.length > 0 || value.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              disabled={disabled}
              onClick={() => onChange(max ? p.value.slice(0, max) : p.value)}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              {p.label}
            </button>
          ))}
          {value.length > 0 && (
            <button type="button" disabled={disabled} onClick={() => onChange([])} className="px-1 text-xs text-slate-500 underline underline-offset-2">
              Clear
            </button>
          )}
        </div>
      )}
      {Object.entries(groups).map(([g, opts]) => (
        <div key={g || "all"} className="space-y-1.5">
          {g && <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{g}</p>}
          <div className="flex flex-wrap gap-2">
            {opts.map((o) => {
              const active = value.includes(o.value);
              const off = disabled || (!active && atMax);
              return (
                <button
                  key={String(o.value)}
                  type="button"
                  aria-pressed={active}
                  disabled={off}
                  title={o.description}
                  onClick={() => toggle(o.value)}
                  className={cn(chip.base, "min-h-10", active ? chip.active : chip.idle, off && chip.disabled)}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </FieldShell>
  );
}

export function TagsInput({
  id,
  value,
  onChange,
  placeholder,
  maxItems,
  disabled,
  suggestions = [],
}: {
  id?: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  disabled?: boolean;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");
  const atMax = Boolean(maxItems && value.length >= maxItems);
  const add = (raw: string) => {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const next = [...value];
    for (const p of parts) {
      if (!next.some((x) => x.toLowerCase() === p.toLowerCase()) && (!maxItems || next.length < maxItems)) next.push(p);
    }
    if (next.length !== value.length) onChange(next);
    setDraft("");

  };
  const unused = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()));
  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Added items">
          {value.map((t) => (
            <li key={t} className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-900 py-1 pl-3 pr-1 text-xs font-medium text-white dark:bg-white dark:text-slate-900">
              <span className="truncate">{t}</span>
              <button type="button" aria-label={`Remove ${t}`} disabled={disabled} onClick={() => onChange(value.filter((x) => x !== t))} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/20">
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          id={id}
          value={draft}
          disabled={disabled || atMax}
          placeholder={atMax ? `Maximum ${maxItems} reached` : placeholder ?? "Type and press Enter"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => draft.trim() && add(draft)}
          className={cn(inputBase, "min-w-0 flex-1")}
        />
        <button
          type="button"
          disabled={disabled || !draft.trim() || atMax}
          onClick={() => add(draft)}
          className="h-11 shrink-0 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
        >
          Add
        </button>
      </div>
      {unused.length > 0 && !atMax && (
        <div className="flex flex-wrap gap-1.5">
          {unused.slice(0, 12).map((s) => (
            <button key={s} type="button" disabled={disabled} onClick={() => add(s)} className="rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:border-slate-500 dark:border-slate-700 dark:text-slate-300">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MultiSelect({
  options,
  value,
  onChange,
  maxItems,
  placeholder,
  disabled,
  hasError,
}: {
  options: Option[];
  value: unknown[];
  onChange: (v: unknown[]) => void;
  maxItems?: number;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
}) {
  const atMax = Boolean(maxItems && value.length >= maxItems);
  const labelOf = (v: unknown) => options.find((o) => o.value === v)?.label ?? String(v);
  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <li key={String(v)} className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-3 pr-1 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-100">
              {labelOf(v)}
              <button type="button" aria-label={`Remove ${labelOf(v)}`} disabled={disabled} onClick={() => onChange(value.filter((x) => x !== v))} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {!atMax && (
        <SearchableSelect
          value=""
          onChange={(v) => {
            const opt = options.find((o) => String(o.value) === v);
            if (opt && !value.includes(opt.value)) onChange([...value, opt.value]);
          }}
          options={options.filter((o) => !value.includes(o.value)).map((o) => ({ value: String(o.value), label: o.label }))}
          placeholder={placeholder ?? "Search and add…"}
          disabled={disabled}
          hasError={hasError}
        />
      )}
    </div>
  );
}
