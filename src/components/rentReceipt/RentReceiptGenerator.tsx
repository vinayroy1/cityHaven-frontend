"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Download, FileDown, Info, Loader2, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/components/ui/utils";
import {
  FREQ_LABEL,
  PAY_LABEL,
  buildReceipts,
  financialYear,
  formatINR,
  hraExemption,
  monthCount,
  needsStamp,
  receiptHints,
  type Frequency,
  type PayMode,
  type Receipt,
  type ReceiptInput,
} from "@/features/rentReceipt/receipts";
import { amountInWords } from "@/features/rentalAgreement/numberToWords";

const DRAFT_KEY = "awasio_rent_receipt_draft_v1";
const AGREEMENT_DRAFT_KEY = "awasio_rental_agreement_draft_v1";
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function defaults(): ReceiptInput {
  const fy = financialYear();
  return {
    tenantName: "",
    landlordName: "",
    landlordPan: "",
    propertyAddress: "",
    monthlyRent: 0,
    fromMonth: fy.from,
    toMonth: fy.to,
    frequency: "MONTHLY",
    payMode: "UPI",
    payRef: "",
    payDay: 5,
  };
}

function loadDraft(): ReceiptInput {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return { ...defaults(), ...(JSON.parse(raw) as Partial<ReceiptInput>) };
  } catch {
    /* ignore */
  }
  return defaults();
}

type AgreementDraft = {
  tenants?: { name?: string }[];
  landlords?: { name?: string; idNumber?: string }[];
  propertyAddress?: string;
  rent?: number;
};
function readAgreement(): AgreementDraft | null {
  try {
    const d = JSON.parse(localStorage.getItem(AGREEMENT_DRAFT_KEY) || "null") as AgreementDraft | null;
    return d && (d.tenants?.[0]?.name || d.propertyAddress || d.rent) ? d : null;
  } catch {
    return null;
  }
}

/* ---------- small UI pieces ---------- */

const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-rose-900/40";

function Field({ label, hint, children, htmlFor }: { label: string; hint?: React.ReactNode; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cn(
            "h-9 rounded-lg px-2 text-xs font-semibold transition",
            value === v ? "bg-white text-rose-600 shadow-sm dark:bg-slate-900" : "text-slate-600 hover:text-slate-900 dark:text-slate-400",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function MonthPicker({ value, onChange, id, label }: { value: string; onChange: (v: string) => void; id: string; label: string }) {
  const [y, m] = (value || "").split("-").map(Number);
  const now = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => now - 5 + i);
  const set = (yy: number, mm: number) => onChange(`${yy}-${String(mm).padStart(2, "0")}`);
  const sel = "h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-2 text-sm font-medium text-slate-900 shadow-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
  return (
    <div className="grid grid-cols-[1fr_1.1fr] gap-1.5">
      <select id={id} aria-label={`${label} month`} className={sel} value={m || 1} onChange={(e) => set(y || now, Number(e.target.value))}>
        {MONTH_NAMES.map((n, i) => (
          <option key={n} value={i + 1}>{n}</option>
        ))}
      </select>
      <select aria-label={`${label} year`} className={sel} value={y || now} onChange={(e) => set(Number(e.target.value), m || 1)}>
        {years.map((yy) => (
          <option key={yy} value={yy}>{yy}</option>
        ))}
      </select>
    </div>
  );
}

function ReceiptCard({ r, input }: { r: Receipt; input: ReceiptInput }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-rose-600 to-orange-500 px-4 py-2.5 text-white">
        <span className="text-sm font-black tracking-wide">RENT RECEIPT</span>
        <span className="text-right text-[10px] font-medium leading-tight opacity-90">
          No. {r.no}
          <br />
          {r.date}
        </span>
      </div>
      <div className="space-y-3 p-4 text-[13px] leading-6 text-slate-700 dark:text-slate-300">
        <p>
          Received with thanks from <b className="text-slate-900 dark:text-white">{input.tenantName || "Tenant name"}</b> a sum of{" "}
          <b className="text-slate-900 dark:text-white">{formatINR(r.amount)}</b> <span className="text-slate-500">({r.amountWords})</span> towards rent for{" "}
          <b className="text-slate-900 dark:text-white">{r.periodLabel}</b> for the property at{" "}
          <span className="text-slate-900 dark:text-white">{input.propertyAddress || "Property address"}</span>.
        </p>
        <dl className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Paid by</dt>
            <dd className="font-semibold text-slate-900 dark:text-white">{PAY_LABEL[input.payMode]}{input.payRef ? ` · ${input.payRef}` : ""}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Landlord PAN</dt>
            <dd className="font-semibold text-slate-900 dark:text-white">{input.landlordPan ? input.landlordPan.toUpperCase() : "—"}</dd>
          </div>
        </dl>
        <div className="flex items-end justify-between gap-3 pt-1">
          {needsStamp(input, r) ? (
            <span className="flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-slate-300 text-center text-[9px] leading-tight text-slate-400">
              Revenue
              <br />
              stamp ₹1
            </span>
          ) : (
            <span />
          )}
          <div className="text-center">
            <div className="h-7 w-36 border-b border-slate-400" />
            <p className="mt-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">{input.landlordName || "Landlord"}</p>
            <p className="text-[10px] text-slate-400">Landlord signature</p>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------- main ---------- */

export function RentReceiptGenerator() {
  const [input, setInput] = React.useState<ReceiptInput>(loadDraft);
  const [tab, setTab] = React.useState<"form" | "preview">("form");
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [agreement] = React.useState(readAgreement);
  const set = <K extends keyof ReceiptInput>(k: K, v: ReceiptInput[K]) => {
    setDone(false);
    setInput((x) => ({ ...x, [k]: v }));
  };

  React.useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(input));
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [input]);

  const receipts = React.useMemo(() => buildReceipts(input), [input]);
  const hints = React.useMemo(() => receiptHints(input), [input]);
  const total = receipts.reduce((s, r) => s + r.amount, 0);
  const months = monthCount(input);
  const missing = [
    !input.tenantName.trim() && "tenant name",
    !input.landlordName.trim() && "landlord name",
    !input.propertyAddress.trim() && "property address",
    !(input.monthlyRent > 0) && "monthly rent",
    !receipts.length && input.monthlyRent > 0 && "a valid period",
  ].filter(Boolean) as string[];

  const fy = financialYear();
  const lastFy = financialYear(new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1));
  const preset = input.fromMonth === fy.from && input.toMonth === fy.to ? "this" : input.fromMonth === lastFy.from && input.toMonth === lastFy.to ? "last" : "custom";

  const importAgreement = () => {
    if (!agreement) return;
    const pan = agreement.landlords?.[0]?.idNumber?.toUpperCase() ?? "";
    setInput((x) => ({
      ...x,
      tenantName: agreement.tenants?.[0]?.name || x.tenantName,
      landlordName: agreement.landlords?.[0]?.name || x.landlordName,
      landlordPan: /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan) ? pan : x.landlordPan,
      propertyAddress: agreement.propertyAddress || x.propertyAddress,
      monthlyRent: agreement.rent || x.monthlyRent,
    }));
  };

  const download = async () => {
    if (missing.length || busy) return;
    setBusy(true);
    try {
      const { downloadReceiptsPdf } = await import("@/features/rentReceipt/pdf");
      const safe = (input.tenantName || "tenant").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      await downloadReceiptsPdf(input, receipts, `rent-receipts-${safe}-${input.fromMonth}-to-${input.toMonth}.pdf`);
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  const downloadButton = (className?: string) => (
    <button
      type="button"
      onClick={() => void download()}
      disabled={!!missing.length || busy}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none dark:shadow-none dark:disabled:from-slate-700 dark:disabled:to-slate-700",
        className,
      )}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {busy ? "Preparing PDF…" : receipts.length > 1 ? `Download ${receipts.length} receipts (PDF)` : "Download receipt (PDF)"}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Mobile tabs */}
      <div className="sticky top-14 z-20 -mx-4 bg-slate-50/95 px-4 py-2 backdrop-blur lg:hidden dark:bg-slate-950/95">
        <Segmented
          label="Form or preview"
          value={tab}
          onChange={setTab}
          options={[
            ["form", "✏️ Details"],
            ["preview", `👁 Preview${receipts.length ? ` (${receipts.length})` : ""}`],
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        {/* ---------------- Form ---------------- */}
        <section className={cn("space-y-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900", tab !== "form" && "hidden lg:block")} aria-label="Receipt details">
          {agreement && (
            <button
              type="button"
              onClick={importAgreement}
              className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-rose-300 bg-rose-50/60 p-3 text-left transition hover:bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30"
            >
              <Wand2 className="h-5 w-5 shrink-0 text-rose-600" />
              <span className="min-w-0 text-sm">
                <b className="text-rose-700 dark:text-rose-300">Fill from your rental agreement</b>
                <span className="block truncate text-xs text-slate-500">Uses the tenant, landlord, address and rent you entered there.</span>
              </span>
            </button>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tenant name" htmlFor="rr-tenant">
              <input id="rr-tenant" className={inputCls} placeholder="e.g. Rahul Sharma" value={input.tenantName} onChange={(e) => set("tenantName", e.target.value)} autoComplete="name" />
            </Field>
            <Field label="Landlord name" htmlFor="rr-landlord">
              <input id="rr-landlord" className={inputCls} placeholder="e.g. Sunita Verma" value={input.landlordName} onChange={(e) => set("landlordName", e.target.value)} />
            </Field>
          </div>

          <Field label="Property address" htmlFor="rr-address">
            <textarea
              id="rr-address"
              rows={2}
              className={cn(inputCls, "h-auto resize-none py-2.5 leading-5")}
              placeholder="Flat 302, Green Park Apartments, Sector 62, Noida"
              value={input.propertyAddress}
              onChange={(e) => set("propertyAddress", e.target.value)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Monthly rent"
              htmlFor="rr-rent"
              hint={input.monthlyRent > 0 ? `Rupees ${amountInWords(input.monthlyRent, true)} only` : undefined}
            >
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-1.5 left-1.5 flex items-center rounded-lg bg-slate-100 px-2.5 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">₹</span>
                <input
                  id="rr-rent"
                  inputMode="numeric"
                  className={cn(inputCls, "pl-12 text-base font-semibold tabular-nums")}
                  placeholder="25,000"
                  value={input.monthlyRent ? input.monthlyRent.toLocaleString("en-IN") : ""}
                  onChange={(e) => set("monthlyRent", Math.min(99_99_999, Number(e.target.value.replace(/\D/g, "")) || 0))}
                />
              </div>
            </Field>
            <Field label="Landlord PAN" htmlFor="rr-pan" hint="Needed if annual rent is above ₹1 lakh.">
              <input
                id="rr-pan"
                className={cn(inputCls, "uppercase tracking-widest")}
                placeholder="ABCDE1234F"
                maxLength={10}
                value={input.landlordPan}
                onChange={(e) => set("landlordPan", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              />
            </Field>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rent period</p>
            <div className="flex flex-wrap gap-2">
              {[
                ["this", `This year (${fy.label})`, fy],
                ["last", `Last year (${lastFy.label})`, lastFy],
              ].map(([k, l, f]) => (
                <button
                  key={k as string}
                  type="button"
                  onClick={() => setInput((x) => ({ ...x, fromMonth: (f as typeof fy).from, toMonth: (f as typeof fy).to }))}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    preset === k ? "border-rose-600 bg-rose-600 text-white" : "border-slate-200 text-slate-600 hover:border-rose-300 dark:border-slate-700 dark:text-slate-300",
                  )}
                >
                  {l as string}
                </button>
              ))}
              {preset === "custom" && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Custom</span>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="From" htmlFor="rr-from">
                <MonthPicker id="rr-from" label="From" value={input.fromMonth} onChange={(v) => set("fromMonth", v)} />
              </Field>
              <Field label="To" htmlFor="rr-to">
                <MonthPicker id="rr-to" label="To" value={input.toMonth} onChange={(v) => set("toMonth", v)} />
              </Field>
            </div>
          </div>

          <Field label="One receipt per">
            <Segmented
              label="Receipt frequency"
              value={input.frequency}
              onChange={(v: Frequency) => set("frequency", v)}
              options={(Object.keys(FREQ_LABEL) as Frequency[]).map((f) => [f, f === "HALF_YEARLY" ? "6 months" : FREQ_LABEL[f]])}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <Field label="Paid by">
              <Segmented label="Payment mode" value={input.payMode} onChange={(v: PayMode) => set("payMode", v)} options={(Object.keys(PAY_LABEL) as PayMode[]).map((p) => [p, p === "BANK" ? "Bank" : PAY_LABEL[p]])} />
            </Field>
            <Field label="Paid on (day of month)" htmlFor="rr-day">
              <select id="rr-day" className={inputCls} value={input.payDay} onChange={(e) => set("payDay", Number(e.target.value))}>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </Field>
          </div>
          {input.payMode !== "CASH" && (
            <Field label={input.payMode === "CHEQUE" ? "Cheque number (optional)" : "UPI / transaction reference (optional)"} htmlFor="rr-ref">
              <input id="rr-ref" className={inputCls} maxLength={40} value={input.payRef} onChange={(e) => set("payRef", e.target.value)} />
            </Field>
          )}

          {hints.length > 0 && (
            <ul className="space-y-2">
              {hints.map((h) => (
                <li
                  key={h.text}
                  className={cn(
                    "flex gap-2 rounded-xl px-3 py-2.5 text-xs leading-5",
                    h.tone === "warn" && "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
                    h.tone === "info" && "bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
                    h.tone === "ok" && "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
                  )}
                >
                  {h.tone === "warn" ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : h.tone === "ok" ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                  {h.text}
                </li>
              ))}
            </ul>
          )}

          <div className="hidden lg:block">
            {downloadButton()}
            {missing.length > 0 && <p className="mt-2 text-center text-xs text-slate-500">Add {missing.join(", ")} to download.</p>}
          </div>
        </section>

        {/* ---------------- Preview ---------------- */}
        <section className={cn("space-y-4 lg:sticky lg:top-24 lg:self-start", tab !== "preview" && "hidden lg:block")} aria-label="Receipt preview">
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Receipts", String(receipts.length || 0)],
              ["Months", String(months || 0)],
              ["Total rent", formatINR(total)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{k}</p>
                <p className="truncate text-base font-black text-slate-900 dark:text-white">{v}</p>
              </div>
            ))}
          </div>

          {receipts.length ? (
            <>
              <ReceiptCard r={receipts[0]} input={input} />
              {receipts.length > 1 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-3 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
                  + {receipts.length - 1} more receipt{receipts.length > 2 ? "s" : ""} ({receipts[1].periodLabel}
                  {receipts.length > 2 ? ` … ${receipts[receipts.length - 1].periodLabel}` : ""}) · 2 per A4 page
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <FileDown className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Your receipts appear here</p>
              <p className="mt-1 text-xs text-slate-500">Enter the monthly rent and period to see them.</p>
            </div>
          )}

          {done && (
            <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              <Sparkles className="h-4 w-4" /> Downloaded. Print, get the landlord&apos;s signature, and submit to your employer.
            </p>
          )}
        </section>
      </div>

      {/* Mobile sticky download */}
      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 -mx-4 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent px-4 pb-2 pt-4 lg:hidden dark:from-slate-950 dark:via-slate-950/95">
        {downloadButton()}
        {missing.length > 0 && <p className="mt-1.5 text-center text-[11px] text-slate-500">Add {missing.join(", ")} to download.</p>}
      </div>

      <HraCalculator annualRent={input.monthlyRent * 12} />
    </div>
  );
}

/* ---------- HRA calculator ---------- */

function HraCalculator({ annualRent }: { annualRent: number }) {
  const [basic, setBasic] = React.useState(0);
  const [hra, setHra] = React.useState(0);
  const [rent, setRent] = React.useState<number | null>(null);
  const [metro, setMetro] = React.useState(true);
  const rentPaid = rent ?? annualRent;
  const res = hraExemption({ basic, hra, rentPaid, metro });
  const num = (v: string) => Math.min(9_99_99_999, Number(v.replace(/\D/g, "")) || 0);
  const fmt = (n: number) => (n ? n.toLocaleString("en-IN") : "");

  return (
    <details className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-sm open:shadow-md sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <span>
          <span className="block text-base font-bold text-slate-900 dark:text-white">HRA exemption calculator</span>
          <span className="block text-xs text-slate-500">See how much of your HRA is tax-free under the old regime.</span>
        </span>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 group-open:hidden dark:bg-rose-950/40">Calculate</span>
      </summary>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Annual basic salary (+DA)", basic, setBasic],
          ["Annual HRA received", hra, setHra],
          ["Annual rent paid", rentPaid, (n: number) => setRent(n)],
        ].map(([l, v, s]) => (
          <Field key={l as string} label={l as string}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₹</span>
              <input inputMode="numeric" className={cn(inputCls, "pl-7 tabular-nums")} value={fmt(v as number)} onChange={(e) => (s as (n: number) => void)(num(e.target.value))} />
            </div>
          </Field>
        ))}
        <Field label="City">
          <Segmented label="City type" value={metro ? "M" : "N"} onChange={(v) => setMetro(v === "M")} options={[["M", "Metro"], ["N", "Non-metro"]]} />
        </Field>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Tax-free HRA</p>
          <p className="mt-1 text-3xl font-black">{formatINR(res.exempt)}</p>
          <p className="mt-1 text-xs opacity-90">Taxable HRA: {formatINR(res.taxable)} per year</p>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <li className="flex justify-between gap-2"><span>Actual HRA received</span><b>{formatINR(res.limits.a)}</b></li>
          <li className="flex justify-between gap-2"><span>Rent paid − 10% of basic</span><b>{formatINR(res.limits.b)}</b></li>
          <li className="flex justify-between gap-2"><span>{metro ? "50%" : "40%"} of basic ({metro ? "metro" : "non-metro"})</span><b>{formatINR(res.limits.c)}</b></li>
          <li className="pt-1 text-[11px] text-slate-500">Exemption is the lowest of these three. Metro: Delhi, Mumbai, Kolkata, Chennai. Not available under the new tax regime.</li>
        </ul>
      </div>
    </details>
  );
}

