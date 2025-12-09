import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import type { FieldConfig, FormValues } from "../config/types";
import { evaluateCondition } from "./condition";

type Props = {
  field: FieldConfig;
  form: UseFormReturn<FormValues>;
  values: FormValues;
};

export function FieldRenderer({ field, form, values }: Props) {
  if (!evaluateCondition(values, field.visibleWhen)) return null;

  const options = (field.options ?? []).filter((opt) => evaluateCondition(values, opt.visibleWhen));
  const disabledField = field.disabledIf ? evaluateCondition(values, field.disabledIf) : false;
  const isRequired = field.required || (field.requiredWhen ? evaluateCondition(values, field.requiredWhen) : false);
  const rules = isRequired ? { required: `${field.label} is required` } : undefined;
  const controllerProps = { name: field.id, control: form.control, rules };
  const error = form.formState.errors?.[field.id]?.message as string | undefined;

  switch (field.type) {
    case "text":
    case "number":
      return (
        <Controller
          {...controllerProps}
          render={({ field: rhf }) => (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800">{field.label}</label>
              <Input
                {...rhf}
                type={field.type === "number" ? "number" : "text"}
                placeholder={field.placeholder}
                disabled={disabledField}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
            </div>
          )}
        />
      );

    case "textarea":
      return (
        <Controller
          {...controllerProps}
          render={({ field: rhf }) => (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800">{field.label}</label>
              <Textarea {...rhf} placeholder={field.placeholder} disabled={disabledField} />
              {error && <p className="text-xs text-destructive">{error}</p>}
              {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
            </div>
          )}
        />
      );

    case "select":
      return (
        <Controller
          {...controllerProps}
          render={({ field: rhf }) => (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800">{field.label}</label>
              <Select onValueChange={rhf.onChange} value={rhf.value ?? ""} disabled={disabledField}>
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder ?? "Select"} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => {
                    const optDisabled = opt.disabledIf ? evaluateCondition(values, opt.disabledIf) : false;
                    return (
                      <SelectItem key={`${field.id}-${String(opt.value)}`} value={String(opt.value)} disabled={optDisabled}>
                        {opt.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {error && <p className="text-xs text-destructive">{error}</p>}
              {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
            </div>
          )}
        />
      );

    case "radio":
    case "chip-radio":
      return (
        <Controller
          {...controllerProps}
          render={({ field: rhf }) => (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">{field.label}</label>
              {field.type === "radio" ? (
                <RadioGroup className="grid gap-2 sm:grid-cols-3" value={rhf.value ?? ""} onValueChange={rhf.onChange}>
                  {options.map((opt) => (
                    <label key={`${field.id}-${String(opt.value)}`} className="flex items-center gap-2">
                      <RadioGroupItem value={String(opt.value)} />
                      <span className="text-sm text-slate-800">{opt.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {options.map((opt) => {
                    const active = `${rhf.value ?? ""}` === `${opt.value}`;
                    const optDisabled = opt.disabledIf ? evaluateCondition(values, opt.disabledIf) : false;
                    return (
                      <Button
                        key={`${field.id}-${String(opt.value)}`}
                        type="button"
                        variant="outline"
                        onClick={() => rhf.onChange(opt.value)}
                        className={cn(
                          "rounded-full border-2 px-4 py-2 text-sm font-semibold",
                          active ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-700",
                          optDisabled && "cursor-not-allowed opacity-50",
                        )}
                        disabled={optDisabled}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </div>
              )}
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          )}
        />
      );

    case "chip-multi":
      return (
        <Controller
          {...controllerProps}
          render={({ field: rhf }) => {
            const current = Array.isArray(rhf.value) ? rhf.value : [];
            return (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">{field.label}</label>
                <div className="flex flex-wrap gap-2">
                  {options.map((opt) => {
                    const active = current.includes(opt.value);
                    const optDisabled = opt.disabledIf ? evaluateCondition(values, opt.disabledIf) : false;
                    return (
                      <Button
                        key={`${field.id}-${String(opt.value)}`}
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const next = active ? current.filter((v) => v !== opt.value) : [...current, opt.value];
                          rhf.onChange(next);
                        }}
                        className={cn(
                          "rounded-full border-2 px-4 py-2 text-sm font-semibold",
                          active ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-700",
                          optDisabled && "cursor-not-allowed opacity-50",
                        )}
                        disabled={optDisabled}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            );
          }}
        />
      );

    case "toggle":
      return (
        <Controller
          {...controllerProps}
          render={({ field: rhf }) => (
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <span className="text-sm font-semibold text-slate-800">{field.label}</span>
              <Switch checked={Boolean(rhf.value)} onCheckedChange={(v) => rhf.onChange(v)} />
            </div>
          )}
        />
      );

    case "checkbox":
      return (
        <Controller
          {...controllerProps}
          render={({ field: rhf }) => (
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Checkbox checked={Boolean(rhf.value)} onCheckedChange={(v) => rhf.onChange(v)} />
                {field.label}
              </label>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          )}
        />
      );

    case "counter":
      return (
        <Controller
          {...controllerProps}
          render={({ field: rhf }) => {
            const value = Number(rhf.value) || 0;
            const min = field.min ?? 0;
            const max = field.max ?? 999;
            const step = field.step ?? 1;
            const dec = () => rhf.onChange(Math.max(min, value - step));
            const inc = () => rhf.onChange(Math.min(max, value + step));
            const label = field.meta?.showZeroAsLabel && value === 0 ? field.meta.showZeroAsLabel : value;

            return (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-800">{field.label}</label>
                <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <Button type="button" variant="outline" size="sm" className="h-8 w-8 rounded-full" onClick={dec}>
                    -
                  </Button>
                  <span className="min-w-[40px] text-center text-sm font-semibold text-slate-900">{label}</span>
                  <Button type="button" variant="outline" size="sm" className="h-8 w-8 rounded-full" onClick={inc}>
                    +
                  </Button>
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            );
          }}
        />
      );

    default:
      return null;
  }
}
