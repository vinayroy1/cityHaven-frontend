"use client";

// Editor for a co-working centre's plans (details.coworkingPlans): one card per product it sells.

import React from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { AlertTriangle, CheckCircle2, Sparkles, Zap, Armchair, CalendarDays, CalendarRange, Copy, DoorClosed, Building2, Laptop, Mail, Mic, PartyPopper, Plus, Presentation, Shapes, Trash2 } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCountry } from "@/config/countries";
import { formatMoney } from "@/lib/money";
import type { FieldConfig } from "@/features/propertyListing/formConfig/types";
import {
  PLAN_TYPES,
  PRICE_UNITS,
  planTypeMeta,
  type CoworkingPlan,
  type PlanType,
  type PriceUnit,
} from "@/features/coworking/model";
import { errorText, helpText, inputBase } from "../theme";

const toNum = (raw: string): number | null => (raw === "" ? null : Number(raw));

/** Per-seat monthly prices above this are almost always a whole-centre rent typed in the wrong box. */
const SEAT_PRICE_SANITY = 100_000;

const PLAN_ICON: Record<PlanType, React.ComponentType<{ className?: string }>> = {
  HOT_DESK: Laptop,
  DEDICATED_DESK: Armchair,
  PRIVATE_CABIN: DoorClosed,
  MANAGED_OFFICE: Building2,
  DAY_PASS: CalendarDays,
  MEETING_ROOM: Presentation,
  VIRTUAL_OFFICE: Mail,
  FLEXI_PASS: CalendarRange,
  EVENT_SPACE: PartyPopper,
  STUDIO: Mic,
  OTHER: Shapes,
};

const newPlan = (type: PlanType): CoworkingPlan => ({
  type,
  name: "",
  price: null,
  priceUnit: planTypeMeta(type).unit,
  capacity: null,
  unitsAvailable: null,
  minSeats: null,
  isAvailable: true,
});

const miniLabel = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400";

function NumberBox({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  min = 0,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
}) {
  return (
    <label className="block">
      <span className={miniLabel}>{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        className={inputBase}
        disabled={disabled}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(toNum(e.target.value))}
      />
    </label>
  );
}

export function CoworkingPlansField({ field, disabled, error }: { field: FieldConfig; disabled?: boolean; error?: string }) {
  const form = useFormContext();
  const { fields, append, remove, insert } = useFieldArray({ control: form.control, name: field.id });
  const plans = (useWatch({ control: form.control, name: field.id }) as CoworkingPlan[] | undefined) ?? [];
  const countryCode = useWatch({ control: form.control, name: "location.countryCode" }) as string | undefined;
  const country = getCountry(countryCode);

  const used = new Set(plans.map((p) => p.type));
  // Cabins, rooms and "Other" come in several kinds, so those chips stay after the first one.
  const repeatable = new Set<PlanType>(["PRIVATE_CABIN", "MEETING_ROOM", "EVENT_SPACE", "STUDIO", "OTHER"]);
  const suggestions = PLAN_TYPES.filter((t) => !used.has(t.value) || repeatable.has(t.value));
  const set = (path: string, value: unknown) => form.setValue(path, value, { shouldDirty: true });
  const quickStart = () => append([newPlan("DEDICATED_DESK"), { ...newPlan("PRIVATE_CABIN"), capacity: 4 }, newPlan("DAY_PASS")]);
  const unpriced = plans.filter((p) => !(typeof p.price === "number" && p.price > 0)).length;

  return (
    // @container: the card lays out by the width the form gives it, not the screen, so it fits a
    // narrow form column on desktop as well as a phone.
    <div className="@container space-y-3">
      {fields.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4 @md:p-5 dark:border-rose-900/50 dark:from-rose-950/40 dark:via-slate-950 dark:to-amber-950/20">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900 dark:text-white">Last big step: what you rent out</p>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                Renters pick a centre by its plans and prices. Add each plan once; it takes about a minute.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 @md:flex-row @md:items-center">
            <Button type="button" disabled={disabled} onClick={quickStart} className="w-full @md:w-auto">
              <Zap className="h-4 w-4" /> Quick start: desk, cabin &amp; day pass
            </Button>
            <span className="text-center text-xs text-slate-500 @md:text-left dark:text-slate-400">or pick plans one by one below</span>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold",
            unpriced === 0
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
          )}
        >
          {unpriced === 0 ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          <span className="min-w-0">
            {fields.length} plan{fields.length === 1 ? "" : "s"} added
            {unpriced > 0
              ? ` · ${unpriced} without a price (shown as "on request")`
              : fields.length < 2
                ? " · add one more so you show up in more searches"
                : " · looking good"}
          </span>
        </div>
      )}

      {fields.map((row, index) => {
        const plan = plans[index] ?? (row as unknown as CoworkingPlan);
        const meta = planTypeMeta(plan.type);
        const Icon = PLAN_ICON[meta.value];
        const base = `${field.id}.${index}`;
        const available = plan.isAvailable !== false;
        const seatPriceTooHigh =
          plan.priceUnit === "PER_SEAT_MONTH" && typeof plan.price === "number" && plan.price > SEAT_PRICE_SANITY;
        const perSeat =
          typeof plan.price === "number" && plan.price > 0 && plan.priceUnit === "PER_CABIN_MONTH" && plan.capacity
            ? Math.round(plan.price / plan.capacity)
            : null;
        const showSeatsFree = !["VIRTUAL_OFFICE", "DAY_PASS", "FLEXI_PASS", "OTHER"].includes(plan.type);
        const showMinSeats = plan.type === "HOT_DESK" || plan.type === "DEDICATED_DESK" || plan.type === "MANAGED_OFFICE";

        return (
          <div
            key={row.id}
            className={cn(
              "overflow-hidden rounded-2xl border bg-white shadow-xs transition dark:bg-slate-950",
              available ? "border-slate-200 dark:border-slate-800" : "border-dashed border-slate-300 opacity-75 dark:border-slate-700",
            )}
          >
            {/* Header: what the plan is, availability, actions */}
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-2.5 @md:gap-3 @md:px-4 dark:border-slate-800 dark:bg-slate-900/60">
              <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 @xs:flex text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <Select
                  value={plan.type}
                  disabled={disabled}
                  onValueChange={(v) => {
                    const type = v as PlanType;
                    set(`${base}.type`, type);
                    set(`${base}.priceUnit`, planTypeMeta(type).unit);
                  }}
                >
                  <SelectTrigger size="sm" aria-label="Plan type" className="font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{meta.hint}</p>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="hidden @md:inline">{available ? "Available" : "Full"}</span>
                <Switch
                  checked={available}
                  disabled={disabled}
                  onCheckedChange={(v) => set(`${base}.isAvailable`, v)}
                  aria-label="Available"
                />
              </label>
              <div className="flex shrink-0 items-center">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => insert(index + 1, { ...plan, name: "" })}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
                  title="Duplicate (e.g. another cabin size)"
                  aria-label={`Duplicate ${meta.label}`}
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => remove(index)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                  title="Remove"
                  aria-label={`Remove ${meta.label}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 p-3 @md:p-4">
              {/* Price: amount and unit read as one figure, "₹ 9,000 per seat / month" */}
              <div>
                <span className={miniLabel}>Price</span>
                {/* Amount and unit side by side when there is room, stacked on a narrow column. */}
                <div className="grid items-center gap-2 @md:grid-cols-[minmax(0,1fr)_minmax(0,13rem)]">
                  <div className="flex h-11 min-w-0 items-center rounded-xl border border-slate-200 bg-white transition focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:ring-rose-900/30">
                    <span className="shrink-0 pl-3 text-sm font-semibold text-slate-500">{country.currencySymbol}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    aria-label="Price"
                    className="min-w-0 flex-1 bg-transparent px-2 text-base font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 dark:text-white"
                    disabled={disabled}
                    placeholder="Leave blank for price on request"
                    value={plan.price ?? ""}
                    onChange={(e) => set(`${base}.price`, toNum(e.target.value))}
                  />
                  </div>
                  <Select
                    value={plan.priceUnit ?? meta.unit}
                    disabled={disabled}
                    onValueChange={(v) => set(`${base}.priceUnit`, v as PriceUnit)}
                  >
                    <SelectTrigger aria-label="Charged">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {perSeat ? (
                  <p className={cn(helpText, "mt-1.5")}>≈ {formatMoney(perSeat, country.code)} per seat / month</p>
                ) : null}
                {seatPriceTooHigh && (
                  <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {formatMoney(plan.price!, country.code)} a month for one seat looks like the whole centre&apos;s rent. Enter one seat&apos;s price, or price it per cabin.
                  </p>
                )}
              </div>

              {/* Size and availability */}
              <div className="grid grid-cols-1 gap-3 @xs:grid-cols-2 @2xl:grid-cols-4">
                {meta.hasCapacity && (
                  <NumberBox
                    label={plan.type === "PRIVATE_CABIN" ? "Seats in cabin" : plan.type === "MANAGED_OFFICE" ? "Seats in office" : "Capacity (people)"}
                    value={plan.capacity}
                    min={1}
                    placeholder="e.g. 6"
                    disabled={disabled}
                    onChange={(v) => set(`${base}.capacity`, v)}
                  />
                )}
                {showSeatsFree && (
                  <NumberBox
                    label={plan.type === "PRIVATE_CABIN" ? "Cabins available" : meta.hasCapacity ? "Rooms available" : "Seats available"}
                    value={plan.unitsAvailable}
                    placeholder="e.g. 3"
                    disabled={disabled}
                    onChange={(v) => set(`${base}.unitsAvailable`, v)}
                  />
                )}
                {plan.type === "FLEXI_PASS" && (
                  <NumberBox
                    label="Days a month"
                    value={plan.daysIncluded}
                    min={1}
                    placeholder="e.g. 10"
                    disabled={disabled}
                    onChange={(v) => set(`${base}.daysIncluded`, v)}
                  />
                )}
                {showMinSeats && (
                  <NumberBox
                    label="Min. seats to book"
                    value={plan.minSeats}
                    min={1}
                    placeholder="e.g. 1"
                    disabled={disabled}
                    onChange={(v) => set(`${base}.minSeats`, v)}
                  />
                )}
                <label className="block min-w-0 @xs:col-span-2 @2xl:col-span-1">
                  <span className={miniLabel}>Name shown to renters</span>
                  <input
                    className={inputBase}
                    disabled={disabled}
                    maxLength={80}
                    placeholder={plan.type === "OTHER" ? "Required, e.g. Locker rental" : meta.hasCapacity ? "e.g. 6-seater cabin" : "Optional, e.g. Premium desk"}
                    {...form.register(`${base}.name`)}
                  />
                </label>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add-plan tiles: big tap targets; descriptions only until the first plan is added. */}
      <div>
        <p className={cn(miniLabel, "mb-2")}>{fields.length ? "Add another plan" : "Pick what you offer"}</p>
        <div className="grid grid-cols-2 gap-2 @md:grid-cols-3 @2xl:grid-cols-4">
          {suggestions.map((t) => {
            const Icon = PLAN_ICON[t.value];
            return (
              <button
                key={t.value}
                type="button"
                disabled={disabled}
                onClick={() => append(newPlan(t.value))}
                className="group flex min-w-0 items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50/60 hover:shadow-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-rose-800 dark:hover:bg-rose-950/30"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-rose-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-300">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-sm font-semibold text-slate-900 dark:text-white">
                    <span className="truncate">{t.label}</span>
                    <Plus className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-rose-600" />
                  </span>
                  {!fields.length && <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-slate-500 dark:text-slate-400">{t.hint}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className={errorText}>{error}</p>}
    </div>
  );
}

