"use client";

import { ChevronDown } from "lucide-react";
import { COUNTRY_LIST, getCountry } from "@/config/countries";
import { cn } from "@/lib/utils";

/**
 * Mobile number field with a country-code picker (🇮🇳 +91 ▾).
 * The value is the local number (digits only); pair it with `toStoredMobile(value, countryCode)`
 * from "@/lib/money" when saving. The picker is a native <select>, so phones show their own wheel/list.
 */
export function PhoneInput({
  id,
  value,
  onChange,
  countryCode,
  onCountryChange,
  placeholder,
  required,
  disabled,
  className,
  inputClassName,
  autoFocus,
  allowText = false,
}: {
  /** Pass typed text through unchanged (login "Email or Mobile" field switches back to email on a letter). */
  allowText?: boolean;
  id?: string;
  value: string;
  onChange: (local: string) => void;
  countryCode: string;
  onCountryChange: (code: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}) {
  const country = getCountry(countryCode);
  return (
    <div
      className={cn(
        "flex h-12 w-full items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-white transition focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 dark:border-slate-800 dark:bg-slate-950",
        disabled && "opacity-60",
        className,
      )}
    >
      <label className="relative flex shrink-0 items-center gap-1 border-r border-slate-200 pl-3 pr-2 text-xs font-black text-slate-700 dark:border-slate-800 dark:text-slate-300">
        <span aria-hidden>{country.flag}</span>
        <span>{country.phoneCode}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden />
        <select
          aria-label="Country code"
          value={country.code}
          disabled={disabled}
          onChange={(e) => onCountryChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {COUNTRY_LIST.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name} ({c.phoneCode})
            </option>
          ))}
        </select>
      </label>
      <input
        id={id}
        type={allowText ? "text" : "tel"}
        inputMode={allowText ? undefined : "numeric"}
        autoComplete="tel-national"
        autoFocus={autoFocus}
        maxLength={allowText ? undefined : country.phoneDigits + 1}
        disabled={disabled}
        required={required}
        placeholder={placeholder ?? country.phoneExample}
        value={value}
        onChange={(e) => onChange(allowText ? e.target.value : e.target.value.replace(/\D/g, ""))}
        className={cn(
          "min-w-0 flex-1 bg-transparent px-3 text-sm font-bold tracking-wider text-slate-900 outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 dark:text-white",
          inputClassName,
        )}
      />
    </div>
  );
}
