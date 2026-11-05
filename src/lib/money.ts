import { COUNTRY_LIST, countryForCurrency, getCountry, type CountryConfig } from "@/config/countries";

/**
 * Country-aware money/phone formatting. For INR these return exactly the strings
 * the app produced before (₹12,34,567 / ₹1.25 Cr / ₹45 L), so India is unchanged.
 */

type CurrencyInput = string | null | undefined;

/** Resolve a currency (ISO) or country code into its country config. */
export function moneyCountry(currencyOrCountry?: CurrencyInput): CountryConfig {
  const v = (currencyOrCountry || "").toUpperCase();
  return v.length === 2 ? getCountry(v) : countryForCurrency(v);
}

export function currencySymbol(currencyOrCountry?: CurrencyInput): string {
  return moneyCountry(currencyOrCountry).currencySymbol;
}

/** Symbol + space when the symbol is a word ("Rs. 5,000"), no space for glyphs ("₹5,000"). */
function prefix(c: CountryConfig): string {
  return /[a-z.]$/i.test(c.currencySymbol) ? `${c.currencySymbol} ` : c.currencySymbol;
}

/** Grouped number without symbol: 12,34,567 (lakh countries) or 1,234,567. */
export function formatNumber(value: number | string | null | undefined, currencyOrCountry?: CurrencyInput): string {
  const n = Number(value);
  if (value === null || value === undefined || value === "" || !Number.isFinite(n)) return "";
  return n.toLocaleString(moneyCountry(currencyOrCountry).locale, { maximumFractionDigits: 0 });
}

/** Full amount with symbol: ₹12,34,567 / Rs. 1,234,567 */
export function formatMoney(value: number | string | null | undefined, currencyOrCountry?: CurrencyInput): string {
  const num = formatNumber(value, currencyOrCountry);
  return num ? `${prefix(moneyCountry(currencyOrCountry))}${num}` : "";
}

export interface ShortMoneyOptions {
  /** "fixed" keeps 2 decimals unless round (₹1.20 Cr); "trim" drops trailing zeros (₹1.2 Cr). */
  decimals?: "fixed" | "trim";
  /** Unit words: "short" = L / Cr / K / M, "long" = Lakh / Crore / Million. */
  units?: "short" | "long";
}

/** Compact amount: ₹1.25 Cr, ₹45 L, Rs. 4.5 M — falls back to full amount below 1 lakh / 1 million. */
export function formatMoneyShort(
  value: number | string | null | undefined,
  currencyOrCountry?: CurrencyInput,
  opts: ShortMoneyOptions = {},
): string {
  const n = Number(value);
  if (value === null || value === undefined || value === "" || !Number.isFinite(n)) return "";
  const c = moneyCountry(currencyOrCountry);
  const long = opts.units === "long";
  const steps: Array<[number, string]> =
    c.bigNumbers === "lakh"
      ? [[1e7, long ? "Crore" : "Cr"], [1e5, long ? "Lakh" : "L"]]
      : [[1e9, long ? "Billion" : "B"], [1e6, long ? "Million" : "M"]];
  for (const [div, unit] of steps) {
    if (Math.abs(n) >= div) {
      const raw = n / div;
      const text =
        opts.decimals === "trim"
          ? raw.toFixed(2).replace(/\.?0+$/, "")
          : raw.toFixed(n % div ? 2 : 0);
      return `${prefix(c)}${text} ${unit}`;
    }
  }
  return formatMoney(n, currencyOrCountry);
}

/* ---------------- phone ---------------- */

/** Strip spaces, dashes, the country code and the trunk 0. Returns local digits. */
export function normalizeLocalPhone(raw: string | null | undefined, countryCode?: string | null): string {
  const c = getCountry(countryCode);
  let d = String(raw || "").replace(/[^\d+]/g, "");
  const cc = c.phoneCode.replace("+", "");
  if (d.startsWith("+")) d = d.slice(1).startsWith(cc) ? d.slice(1 + cc.length) : d.slice(1);
  else if (d.length > c.phoneDigits && d.startsWith(cc)) d = d.slice(cc.length);
  if (d.length === c.phoneDigits + 1 && d.startsWith("0")) d = d.slice(1);
  return d;
}

export function isValidPhone(raw: string | null | undefined, countryCode?: string | null): boolean {
  return getCountry(countryCode).phonePattern.test(normalizeLocalPhone(raw, countryCode));
}

/** E.164-ish: +9779801234567 */
export function toInternationalPhone(raw: string | null | undefined, countryCode?: string | null): string {
  const local = normalizeLocalPhone(raw, countryCode);
  return local ? `${getCountry(countryCode).phoneCode}${local}` : "";
}

/* ---------------- account mobile storage ----------------
 * India keeps the historical 10-digit format (existing accounts unchanged);
 * other countries are stored with their code, e.g. "+9779801234567", so they never clash with Indian numbers.
 */

/** Local digits + country -> the value saved in User.mobileNumber. "" when invalid. */
export function toStoredMobile(raw: string | null | undefined, countryCode?: string | null): string {
  const c = getCountry(countryCode);
  if (!isValidPhone(raw, c.code)) return "";
  const local = normalizeLocalPhone(raw, c.code);
  return c.code === "IN" ? local : `${c.phoneCode}${local}`;
}

/** Stored mobile -> { country, local digits }. Bare 10 digits are Indian. */
export function splitStoredMobile(stored: string | null | undefined): { countryCode: string; local: string } {
  const v = String(stored || "").replace(/[^\d+]/g, "");
  if (v.startsWith("+")) {
    const match = COUNTRY_LIST.filter((c) => v.startsWith(c.phoneCode)).sort((a, b) => b.phoneCode.length - a.phoneCode.length)[0];
    if (match) return { countryCode: match.code, local: v.slice(match.phoneCode.length) };
  }
  return { countryCode: "IN", local: v.replace(/^\+?91(?=\d{10}$)/, "") };
}

/** "+91 9876543210" / "+977 9801234567" for display (India format unchanged). */
export function displayMobile(stored: string | null | undefined): string {
  if (!stored) return "";
  const { countryCode, local } = splitStoredMobile(stored);
  return `${getCountry(countryCode).phoneCode} ${local}`;
}

/** Stored mobile -> "+919876543210" / "+9779801234567" (for tel: links). "" when empty. */
export function intlMobile(stored: string | null | undefined): string {
  const v = String(stored || "").replace(/[^\d+]/g, "");
  if (!v) return "";
  if (v.startsWith("+")) return v;
  const ten = v.slice(-10);
  return v.length >= 10 ? `+91${ten}` : v;
}

/** Digits for wa.me links: "919876543210". */
export const whatsappNumber = (stored: string | null | undefined) => intlMobile(stored).replace(/^\+/, "");
