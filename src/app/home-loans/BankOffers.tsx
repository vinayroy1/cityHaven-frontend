"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, BadgePercent, Lock, Sparkles } from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";

type Bank = {
  id: string;
  name: string;
  short: string;
  rate: number;
  fee: string;
  /** Brand-ish gradient (no logos: those are the banks' trademarks). */
  badge: string;
  url: string;
};

/** Starting rates for salaried borrowers. Indicative only; update RATES_AS_OF when changing. */
const RATES_AS_OF = "Nov 2026";
const BANKS: Bank[] = [
  { id: "sbi", name: "SBI", short: "SBI", rate: 7.5, fee: "0.35%", badge: "from-sky-500 to-blue-700", url: "https://homeloans.sbi/" },
  { id: "hdfc", name: "HDFC Bank", short: "HDFC", rate: 7.45, fee: "0.50%", badge: "from-blue-800 to-indigo-950", url: "https://www.hdfcbank.com/personal/borrow/popular-loans/home-loan" },
  { id: "icici", name: "ICICI Bank", short: "ICICI", rate: 7.45, fee: "2.00%", badge: "from-orange-500 to-rose-700", url: "https://www.icicibank.com/personal-banking/loans/home-loan" },
  { id: "axis", name: "Axis Bank", short: "AXIS", rate: 7.45, fee: "1.00%", badge: "from-rose-700 to-fuchsia-900", url: "https://www.axisbank.com/retail/loans/home-loan" },
  { id: "kotak", name: "Kotak Mahindra Bank", short: "KOTAK", rate: 7.7, fee: "0.50%", badge: "from-red-500 to-rose-800", url: "https://www.kotak.com/en/personal-banking/loans/home-loan.html" },
  { id: "pnb", name: "Punjab National Bank", short: "PNB", rate: 7.35, fee: "0.35%", badge: "from-amber-500 to-orange-700", url: "https://www.pnbindia.in/" },
  { id: "bob", name: "Bank of Baroda", short: "BOB", rate: 7.45, fee: "0.00%", badge: "from-orange-400 to-amber-600", url: "https://www.bankofbaroda.in/personal-banking/loans/home-loan" },
  { id: "canara", name: "Canara Bank", short: "CANARA", rate: 7.4, fee: "0.50%", badge: "from-cyan-500 to-blue-700", url: "https://canarabank.com/" },
];
const LOWEST = Math.min(...BANKS.map((b) => b.rate));
/** Monthly EMI per ₹10 lakh over 20 years, rounded to the rupee. */
const emiPer10L = (rate: number) => {
  const r = rate / 1200, n = 240;
  return Math.round((1_000_000 * r * (1 + r) ** n) / ((1 + r) ** n - 1));
};

function isLoggedIn() {
  try {
    return Boolean(localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY));
  } catch {
    return false;
  }
}

/**
 * Save the click as a lead in the admin contact inbox (POST /v1/contact, source HOME_LOAN), with the
 * signed-in user's name / email / phone. Fire-and-forget: the bank site opens regardless.
 * Once per bank per browser session so repeat clicks don't flood the inbox.
 */
function recordLoanLead(bank: Bank) {
  try {
    const key = `awasio_loan_lead_${bank.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(APP_CONFIG.AUTH.USER_KEY) || "{}") as {
      name?: string; fullName?: string; email?: string; mobileNumber?: string; phone?: string;
    };
    const phone = user.mobileNumber || user.phone;
    void fetch(`${APP_CONFIG.API.BASE_URL}/v1/contact`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        ...(user.name || user.fullName ? { fullName: (user.name || user.fullName)!.slice(0, 120) } : {}),
        ...(user.email ? { email: user.email } : {}),
        ...(phone ? { phone: String(phone).slice(0, 20) } : {}),
        reason: "GENERAL",
        source: "HOME_LOAN",
        subject: `Home loan interest: ${bank.name}`,
        message: `Clicked "Apply now" for ${bank.name} home loan (${bank.rate.toFixed(2)}% p.a., processing fee ${bank.fee}) on the Awasio home loans page.`,
        pageUrl: window.location.origin + "/home-loans",
      }),
    }).catch(() => {});
  } catch {
    // Never block the user on lead logging.
  }
}

const noopSubscribe = () => () => {};

export function BankOffers() {
  const router = useRouter();
  const params = useSearchParams();
  // Bank chosen before login: after returning, highlight it with a one-tap "continue" (a new tab
  // can't be opened automatically without a click, browsers block it).
  const pending = params.get("apply");
  const loggedIn = React.useSyncExternalStore(noopSubscribe, isLoggedIn, () => false);
  const [dismissed, setDismissed] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<"rate" | "fee">("rate");
  const resumeId = !dismissed && loggedIn && pending && BANKS.some((b) => b.id === pending) ? pending : null;

  React.useEffect(() => {
    if (resumeId) document.getElementById(`bank-${resumeId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [resumeId]);

  const apply = (bank: Bank) => {
    if (!isLoggedIn()) {
      router.push(`/login?redirect=${encodeURIComponent(`/home-loans?apply=${bank.id}`)}`);
      return;
    }
    setDismissed(true);
    recordLoanLead(bank);
    window.open(bank.url, "_blank", "noopener,noreferrer");
  };

  const sorted = [...BANKS].sort((x, y) => (sortBy === "rate" ? x.rate - y.rate : parseFloat(x.fee) - parseFloat(y.fee)) || x.rate - y.rate);
  const top = BANKS.find((b) => b.rate === LOWEST)!;

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10" aria-labelledby="bank-offers-title">
      {/* Best-deal banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 p-5 text-white shadow-xl sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rose-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-300">
              <BadgePercent className="h-4 w-4" /> Top banks · {RATES_AS_OF}
            </div>
            <h2 id="bank-offers-title" className="mt-2 text-2xl font-black leading-tight tracking-tight sm:text-3xl">
              Home loans from <span className="bg-gradient-to-r from-rose-300 to-amber-200 bg-clip-text text-transparent">{LOWEST.toFixed(2)}%</span> p.a.
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-slate-300">
              Compare interest rates, processing fees and EMI from {BANKS.length} leading banks — then apply in one tap.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur sm:min-w-[300px]">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${top.badge} ${top.short.length > 4 ? "text-[8px]" : "text-[10px]"} font-black shadow-lg`}>{top.short}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300"><Sparkles className="h-3 w-3" /> Lowest rate</div>
              <div className="truncate text-sm font-semibold">{top.name}</div>
              <div className="text-2xl font-black">{top.rate.toFixed(2)}%</div>
            </div>
            <button type="button" onClick={() => apply(top)} className="rounded-xl bg-white px-3.5 py-2 text-sm font-bold text-slate-900 transition hover:bg-rose-50 active:scale-95">
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Sort + legend */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Compare banks</h3>
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs font-semibold dark:bg-slate-800">
          {(["rate", "fee"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setSortBy(k)}
              className={`rounded-full px-3 py-1.5 transition ${sortBy === k ? "bg-white text-rose-600 shadow-sm dark:bg-slate-900" : "text-slate-500 hover:text-slate-800 dark:text-slate-400"}`}
            >
              {k === "rate" ? "Lowest rate" : "Lowest fee"}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop column headings */}
      <div className="mt-3 hidden grid-cols-[2.2fr_1fr_1fr_1fr_auto] gap-4 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 md:grid">
        <span>Bank</span><span>Interest rate</span><span>Processing fee</span><span>EMI / ₹10 L*</span><span className="w-32" />
      </div>

      <ol className="mt-2 space-y-2.5">
        {sorted.map((b, i) => {
          const best = b.rate === LOWEST;
          const resume = resumeId === b.id;
          const freeFee = parseFloat(b.fee) === 0;
          return (
            <li
              key={b.id}
              id={`bank-${b.id}`}
              className={`group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 rounded-2xl border bg-white p-3.5 shadow-sm transition hover:border-rose-200 hover:shadow-md sm:p-4 md:grid-cols-[2.2fr_1fr_1fr_1fr_auto] md:gap-4 md:px-5 dark:bg-slate-900 dark:hover:border-rose-900 ${
                resume ? "border-rose-400 ring-2 ring-rose-200 dark:ring-rose-900" : best ? "border-emerald-200 dark:border-emerald-900" : "border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <span className={`absolute inset-y-3 left-0 w-1 rounded-r-full bg-gradient-to-b ${b.badge} opacity-0 transition group-hover:opacity-100 ${best || resume ? "opacity-100" : ""}`} />

              {/* Bank */}
              <div className="col-span-2 flex min-w-0 items-center gap-3 md:col-span-1">
                <span className="w-4 text-center text-xs font-bold text-slate-400">{i + 1}</span>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${b.badge} ${b.short.length > 4 ? "text-[8px]" : "text-[10px]"} font-black text-white shadow-sm`}>{b.short}</span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900 dark:text-white">{b.name}</div>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {best && <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Lowest rate</span>}
                    {freeFee && <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">Zero fee</span>}
                  </div>
                </div>
              </div>

              {/* Rate (mobile: top-right) */}
              <div className="row-start-1 col-start-3 text-right md:col-start-auto md:row-start-auto md:text-left">
                <div className="text-xl font-black tracking-tight text-slate-950 dark:text-white">{b.rate.toFixed(2)}%</div>
                <div className="text-[10px] font-medium text-slate-400 md:hidden">p.a. onwards</div>
              </div>

              {/* Fee + EMI */}
              <div className="col-span-2 flex items-center gap-3 pl-7 text-xs text-slate-500 md:contents dark:text-slate-400">
                <div className="flex items-baseline gap-1">
                  <span className="md:hidden">Fee</span>
                  <div className={`text-xs font-bold md:text-sm ${freeFee ? "text-emerald-600" : "text-slate-800 dark:text-slate-200"}`}>{freeFee ? "Nil" : b.fee}</div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="md:hidden">EMI*</span>
                  <div className="text-xs font-bold md:text-sm text-slate-800 dark:text-slate-200">₹{emiPer10L(b.rate).toLocaleString("en-IN")}<span className="text-[10px] font-medium text-slate-400">/mo</span></div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => apply(b)}
                className="col-start-3 inline-flex items-center justify-center gap-1 rounded-xl bg-rose-600 px-3.5 py-2 text-xs md:col-start-auto md:px-4 md:py-2.5 md:text-sm font-bold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700 active:scale-[0.98] md:col-span-1 md:w-32 dark:shadow-none"
              >
                {resume ? `Continue` : "Apply now"}
                <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
        <Lock className="mt-0.5 h-3 w-3 shrink-0" />
        *EMI for ₹10 lakh over 20 years at the starting rate. Sign in to apply; you&apos;ll continue on the bank&apos;s official website.
        Rates are indicative and depend on your credit score, income and loan amount — confirm the final rate and fees with the bank.
      </p>
    </section>
  );
}
