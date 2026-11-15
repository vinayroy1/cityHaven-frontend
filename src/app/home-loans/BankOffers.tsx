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

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6" aria-labelledby="bank-offers-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <BadgePercent className="h-4 w-4" /> Home loans
          </div>
          <h2 id="bank-offers-title" className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl dark:text-white">
            Top banks &amp; home loan offers
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Compare interest rates and processing fees from leading banks.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Starting rates · {RATES_AS_OF}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BANKS.map((b) => {
          const best = b.rate === LOWEST;
          const resume = resumeId === b.id;
          return (
            <article
              key={b.id}
              id={`bank-${b.id}`}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-100/60 dark:bg-slate-900 dark:hover:shadow-black/40 ${
                resume || best
                  ? "border-rose-300 ring-2 ring-rose-200/70 dark:border-rose-800 dark:ring-rose-900/60"
                  : "border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <div className={`relative overflow-hidden bg-gradient-to-br ${b.badge} px-4 pb-10 pt-4 text-white`}>
                <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10 transition duration-500 group-hover:scale-125" />
                <div className="pointer-events-none absolute -bottom-10 right-10 h-20 w-20 rounded-full bg-white/10" />
                <div className="relative flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-white/20 px-2 py-1 text-[11px] font-black tracking-wide backdrop-blur-sm">{b.short}</span>
                  {best && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-700 shadow">
                      <Sparkles className="h-3 w-3" /> Lowest rate
                    </span>
                  )}
                </div>
                <h3 className="relative mt-2 truncate text-sm font-semibold text-white/90">{b.name}</h3>
              </div>

              <div className="relative -mt-7 mx-3 rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Interest from</div>
                <div className="mt-0.5 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                  {b.rate.toFixed(2)}<span className="text-lg">%</span>
                  <span className="ml-1 text-xs font-semibold text-slate-400">p.a.</span>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-2 px-4 pt-3 text-center">
                <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-800/60">
                  <dt className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Processing fee</dt>
                  <dd className={`text-sm font-bold ${b.fee === "0.00%" ? "text-emerald-600" : "text-slate-900 dark:text-white"}`}>
                    {b.fee === "0.00%" ? "Nil" : b.fee}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-800/60">
                  <dt className="text-[10px] font-medium text-slate-500 dark:text-slate-400">EMI / ₹10 L*</dt>
                  <dd className="text-sm font-bold text-slate-900 dark:text-white">₹{emiPer10L(b.rate).toLocaleString("en-IN")}</dd>
                </div>
              </dl>

              <div className="mt-auto p-4">
                <button
                  type="button"
                  onClick={() => apply(b)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-200 transition hover:shadow-lg hover:brightness-110 active:scale-[0.98] dark:shadow-none"
                >
                  {resume ? `Continue to ${b.short}` : "Apply now"}
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
        <Lock className="mt-0.5 h-3 w-3 shrink-0" />
        *EMI for ₹10 lakh over 20 years at the starting rate. Sign in to apply; you&apos;ll continue on the bank&apos;s official website. Rates are indicative starting rates and depend
        on your credit score, income and loan amount. Check the final rate and fees with the bank.
      </p>
    </section>
  );
}
