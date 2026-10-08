"use client";

import React, { useEffect, useRef } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { amountToWords } from "./numberToWords";
import { formatIndianCurrency } from "@/lib/propertyListing/formatBrokerage";
import type { FieldConfig } from "@/features/propertyListing/formConfig/types";

interface BrokerageFieldProps {
  field: FieldConfig;
  disabled?: boolean;
}

interface BrokerageOption {
  value: string;
  label: string;
  subtitle?: string;
  badge?: string;
}

const RENT_OPTIONS: BrokerageOption[] = [
  {
    value: "HALF_MONTH_RENT",
    label: "15 Days Rent",
    subtitle: "Delhi/NCR Standard",
    badge: "Most Popular",
  },
  {
    value: "ONE_MONTH_RENT",
    label: "1 Month Rent",
    subtitle: "30 Days standard",
  },
  {
    value: "FIXED",
    label: "Fixed Amount (₹)",
    subtitle: "Custom rupee fee",
  },
  {
    value: "PERCENTAGE",
    label: "Percentage (%)",
    subtitle: "Custom % of annual rent",
  },
  {
    value: "ZERO",
    label: "Zero Brokerage",
    subtitle: "Charged to owner only / Promo",
    badge: "3x Inquiries",
  },
];

const SELL_OPTIONS: BrokerageOption[] = [
  {
    value: "ONE_PERCENT",
    label: "1% of Total Value",
    subtitle: "Standard Indian sale norm",
    badge: "Industry Standard",
  },
  {
    value: "TWO_PERCENT",
    label: "2% of Total Value",
    subtitle: "Commercial / High-value norm",
  },
  {
    value: "PERCENTAGE",
    label: "Custom %",
    subtitle: "Enter any percentage",
  },
  {
    value: "FIXED",
    label: "Fixed Amount (₹)",
    subtitle: "Custom flat fee",
  },
  {
    value: "ZERO",
    label: "Zero Brokerage",
    subtitle: "Direct builder / No fee from buyer",
    badge: "3x Inquiries",
  },
];

export function BrokerageField({ disabled }: BrokerageFieldProps) {
  const form = useFormContext();

  const listingType = useWatch({ control: form.control, name: "context.listingType" });
  const priceRaw = useWatch({ control: form.control, name: "pricing.price" });
  const brokerageType = useWatch({ control: form.control, name: "pricing.brokerageType" });
  const brokerageVal = useWatch({ control: form.control, name: "pricing.brokerage" });

  const isRent = listingType === "RENT" || listingType === "PG";
  const options = isRent ? RENT_OPTIONS : SELL_OPTIONS;
  const currentPrice = priceRaw ? Number(priceRaw) : 0;
  const activeType = brokerageType || (isRent ? "HALF_MONTH_RENT" : "ONE_PERCENT");

  // Mount only: initialize default brokerage type and computed amount if absent
  useEffect(() => {
    const existingType = form.getValues("pricing.brokerageType");
    if (!existingType) {
      const defaultType = isRent ? "HALF_MONTH_RENT" : "ONE_PERCENT";
      form.setValue("pricing.brokerageType", defaultType, { shouldDirty: false });

      const p = Number(form.getValues("pricing.price") || 0);
      let calc = 0;
      if (defaultType === "HALF_MONTH_RENT") calc = p > 0 ? Math.round(p / 2) : 0;
      else if (defaultType === "ONE_PERCENT") calc = p > 0 ? Math.round(p * 0.01) : 0;

      if (form.getValues("pricing.brokerage") === undefined || form.getValues("pricing.brokerage") === null) {
        form.setValue("pricing.brokerage", calc, { shouldDirty: false });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Synchronize computed brokerage amount only when price actually changes
  const lastPriceRef = useRef<number>(currentPrice);
  useEffect(() => {
    if (lastPriceRef.current === currentPrice) return;
    lastPriceRef.current = currentPrice;

    const currentType = form.getValues("pricing.brokerageType") || activeType;
    let targetAmt: number | null = null;
    if (currentType === "HALF_MONTH_RENT") targetAmt = currentPrice > 0 ? Math.round(currentPrice / 2) : 0;
    else if (currentType === "ONE_MONTH_RENT") targetAmt = currentPrice > 0 ? currentPrice : 0;
    else if (currentType === "ONE_PERCENT") targetAmt = currentPrice > 0 ? Math.round(currentPrice * 0.01) : 0;
    else if (currentType === "TWO_PERCENT") targetAmt = currentPrice > 0 ? Math.round(currentPrice * 0.02) : 0;
    else if (currentType === "ZERO") targetAmt = 0;

    if (targetAmt !== null && form.getValues("pricing.brokerage") !== targetAmt) {
      form.setValue("pricing.brokerage", targetAmt, { shouldDirty: false });
    }
  }, [currentPrice, activeType]); // eslint-disable-line react-hooks/exhaustive-deps

  // User interaction event handler: never loops
  const handleSelectType = (val: string) => {
    form.setValue("pricing.brokerageType", val, { shouldDirty: true });
    if (val === "HALF_MONTH_RENT") {
      form.setValue("pricing.brokerage", currentPrice > 0 ? Math.round(currentPrice / 2) : 0, { shouldDirty: true });
    } else if (val === "ONE_MONTH_RENT") {
      form.setValue("pricing.brokerage", currentPrice > 0 ? currentPrice : 0, { shouldDirty: true });
    } else if (val === "ONE_PERCENT") {
      form.setValue("pricing.brokerage", currentPrice > 0 ? Math.round(currentPrice * 0.01) : 0, { shouldDirty: true });
    } else if (val === "TWO_PERCENT") {
      form.setValue("pricing.brokerage", currentPrice > 0 ? Math.round(currentPrice * 0.02) : 0, { shouldDirty: true });
    } else if (val === "ZERO") {
      form.setValue("pricing.brokerage", 0, { shouldDirty: true });
    } else if (val === "FIXED" || val === "PERCENTAGE") {
      // Clear auto-calculated price so user can enter custom number
      const prevAuto = [Math.round(currentPrice / 2), currentPrice, Math.round(currentPrice * 0.01), Math.round(currentPrice * 0.02), 0];
      if (brokerageVal !== null && prevAuto.includes(Number(brokerageVal))) {
        form.setValue("pricing.brokerage", null, { shouldDirty: true });
      }
    }
  };

  const words =
    activeType === "FIXED" && brokerageVal && Number(brokerageVal) > 0
      ? amountToWords(Number(brokerageVal))
      : null;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
      {/* Platform Zero-Commission Guarantee Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/40">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
        <div className="text-xs text-emerald-900 dark:text-emerald-200">
          <p className="font-bold">Awasio Platform Guarantee: 0% Platform Brokerage</p>
          <p className="mt-0.5 text-emerald-800/80 dark:text-emerald-300/80">
            Awasio never charges any commission from you, owners, or clients. The brokerage fee you configure here is your independent fee charged directly to the prospective {isRent ? "tenant" : "buyer"}.
          </p>
        </div>
      </div>

      {/* Brokerage Type Selection Cards */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Choose Brokerage Terms for this Listing
        </label>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((opt) => {
            const isSelected = activeType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                onClick={() => handleSelectType(opt.value)}
                className={cn(
                  "relative flex flex-col items-start rounded-xl border p-3.5 text-left transition-all",
                  isSelected
                    ? "border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20 dark:border-rose-500 dark:bg-rose-950/40"
                    : "border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700"
                )}
              >
                {opt.badge && (
                  <span className="absolute right-2.5 top-2.5 inline-flex items-center rounded-md bg-rose-100 px-1.5 py-0.5 text-[9px] font-extrabold text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                    {opt.badge}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border",
                      isSelected
                        ? "border-rose-600 bg-rose-600 text-white dark:border-rose-500 dark:bg-rose-500"
                        : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                    )}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {opt.label}
                  </span>
                </div>
                {opt.subtitle && (
                  <span className="mt-1 pl-6 text-[11px] text-slate-500 dark:text-slate-400">
                    {opt.subtitle}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-Calculation / Custom Input Preview */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
        {activeType === "HALF_MONTH_RENT" && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400">
              <Sparkles className="h-4 w-4" />
              <span>Standard 15 Days Rental Commission (Delhi/NCR)</span>
            </div>
            {currentPrice > 0 ? (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Based on monthly rent of <span className="font-bold">₹{formatIndianCurrency(currentPrice)}</span>, tenant will pay:{" "}
                <span className="font-extrabold text-slate-950 dark:text-white">
                  ₹{formatIndianCurrency(Math.round(currentPrice / 2))}
                </span>{" "}
                <span className="text-xs text-slate-500">(15 Days Rent)</span>
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Will automatically compute as 15 Days (half month) rent once monthly rent is entered above.
              </p>
            )}
          </div>
        )}

        {activeType === "ONE_MONTH_RENT" && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400">
              <Sparkles className="h-4 w-4" />
              <span>Full 1 Month (30 Days) Rental Commission</span>
            </div>
            {currentPrice > 0 ? (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Based on monthly rent of <span className="font-bold">₹{formatIndianCurrency(currentPrice)}</span>, tenant will pay:{" "}
                <span className="font-extrabold text-slate-950 dark:text-white">
                  ₹{formatIndianCurrency(currentPrice)}
                </span>{" "}
                <span className="text-xs text-slate-500">(1 Month Rent)</span>
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Will automatically compute as 1 month rent once monthly rent is entered above.
              </p>
            )}
          </div>
        )}

        {activeType === "ONE_PERCENT" && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400">
              <Sparkles className="h-4 w-4" />
              <span>1% Standard Property Sale Commission</span>
            </div>
            {currentPrice > 0 ? (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Based on property price of <span className="font-bold">₹{formatIndianCurrency(currentPrice)}</span>, brokerage will be:{" "}
                <span className="font-extrabold text-slate-950 dark:text-white">
                  ₹{formatIndianCurrency(Math.round(currentPrice * 0.01))}
                </span>{" "}
                <span className="text-xs text-slate-500">(1% of sale value)</span>
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Will automatically compute as 1% once expected price is entered above.
              </p>
            )}
          </div>
        )}

        {activeType === "TWO_PERCENT" && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400">
              <Sparkles className="h-4 w-4" />
              <span>2% Commercial / Premium Sale Commission</span>
            </div>
            {currentPrice > 0 ? (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Based on property price of <span className="font-bold">₹{formatIndianCurrency(currentPrice)}</span>, brokerage will be:{" "}
                <span className="font-extrabold text-slate-950 dark:text-white">
                  ₹{formatIndianCurrency(Math.round(currentPrice * 0.02))}
                </span>{" "}
                <span className="text-xs text-slate-500">(2% of sale value)</span>
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Will automatically compute as 2% once expected price is entered above.
              </p>
            )}
          </div>
        )}

        {activeType === "ZERO" && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Zero Brokerage for {isRent ? "Tenants" : "Buyers"}!</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              You are not charging any commission to the {isRent ? "tenant" : "buyer"}. This listing will be promoted with a highlighted <strong>0% Brokerage</strong> badge across search results and detail pages.
            </p>
          </div>
        )}

        {activeType === "FIXED" && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Enter Fixed Brokerage Amount (₹)
            </label>
            <Controller
              name="pricing.brokerage"
              control={form.control}
              render={({ field: rhf }) => (
                <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-sm font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    disabled={disabled}
                    placeholder="e.g. 15000"
                    className="w-full bg-transparent px-2 text-sm font-semibold outline-none text-slate-900 dark:text-white"
                    value={rhf.value === undefined || rhf.value === null ? "" : String(rhf.value)}
                    onChange={(e) =>
                      rhf.onChange(e.target.value === "" ? null : Number(e.target.value))
                    }
                  />
                </div>
              )}
            />
            {words && (
              <p className="text-xs font-medium text-slate-500">
                ₹ {words}
              </p>
            )}
          </div>
        )}

        {activeType === "PERCENTAGE" && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Enter Custom Brokerage Percentage (%)
            </label>
            <Controller
              name="pricing.brokerage"
              control={form.control}
              render={({ field: rhf }) => (
                <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 dark:border-slate-800 dark:bg-slate-900">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    disabled={disabled}
                    placeholder="e.g. 1.5"
                    className="w-full bg-transparent px-1 text-sm font-semibold outline-none text-slate-900 dark:text-white"
                    value={rhf.value === undefined || rhf.value === null ? "" : String(rhf.value)}
                    onChange={(e) =>
                      rhf.onChange(e.target.value === "" ? null : Number(e.target.value))
                    }
                  />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              )}
            />
            {currentPrice > 0 && brokerageVal && Number(brokerageVal) > 0 && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Equivalent to approx:{" "}
                <strong className="text-slate-900 dark:text-white">
                  ₹{formatIndianCurrency(Math.round((currentPrice * Number(brokerageVal)) / 100))}
                </strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Brokerage Negotiable Checkbox */}
      <Controller
        name="pricing.brokerageNegotiable"
        control={form.control}
        defaultValue={true}
        render={({ field: rhf }) => (
          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              disabled={disabled}
              checked={rhf.value !== false}
              onChange={(e) => rhf.onChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 dark:border-slate-700"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Brokerage terms are open to negotiation with client
            </span>
          </label>
        )}
      />
    </div>
  );
}
