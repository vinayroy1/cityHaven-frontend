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
  /** Brand-ish badge colours (no logos: those are the banks' trademarks). */
  badge: string;
  url: string;
};

/** Starting rates for salaried borrowers. Indicative only; update RATES_AS_OF when changing. */
const RATES_AS_OF = "Nov 2026";
const BANKS: Bank[] = [
  { id: "sbi", name: "SBI", short: "SBI", rate: 7.5, fee: "0.35%", badge: "bg-sky-600", url: "https://homeloans.sbi/" },
  { id: "hdfc", name: "HDFC Bank", short: "HDFC", rate: 7.45, fee: "0.50%", badge: "bg-blue-900", url: "https://www.hdfcbank.com/personal/borrow/popular-loans/home-loan" },
  { id: "icici", name: "ICICI Bank", short: "ICICI", rate: 7.45, fee: "2.00%", badge: "bg-orange-600", url: "https://www.icicibank.com/personal-banking/loans/home-loan" },
  { id: "axis", name: "Axis Bank", short: "AXIS", rate: 7.45, fee: "1.00%", badge: "bg-rose-800", url: "https://www.axisbank.com/retail/loans/home-loan" },
  { id: "kotak", name: "Kotak Mahindra Bank", short: "KOTAK", rate: 7.7, fee: "0.50%", badge: "bg-red-600", url: "https://www.kotak.com/en/personal-banking/loans/home-loan.html" },
  { id: "pnb", name: "Punjab National Bank", short: "PNB", rate: 7.35, fee: "0.35%", badge: "bg-amber-700", url: "https://www.pnbindia.in/" },
  { id: "bob", name: "Bank of Baroda", short: "BOB", rate: 7.45, fee: "0.00%", badge: "bg-orange-500", url: "https://www.bankofbaroda.in/personal-banking/loans/home-loan" },
  { id: "canara", name: "Canara Bank", short: "CANARA", rate: 7.4, fee: "0.50%", badge: "bg-cyan-700", url: "https://canarabank.com/" },
];
const LOWEST = Math.min(...BANKS.map((b) => b.rate));

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
    <section className="mx-auto max-w-5xl px-4 pt-10 sm:px-6" aria-labelledby="bank-offers-title">
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

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BANKS.map((b) => {
          const best = b.rate === LOWEST;
          const resume = resumeId === b.id;
          return (
            <article
              key={b.id}
              id={`bank-${b.id}`}
              className={`group relative flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 ${
                resume
                  ? "border-rose-400 ring-2 ring-rose-200 dark:ring-rose-900"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {best && (
                <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                  <Sparkles className="h-3 w-3" /> Lowest rate
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-black tracking-tight text-white ${b.badge}`}>
                  {b.short}
                </span>
                <h3 className="text-sm font-bold leading-tight text-slate-900 dark:text-white">{b.name}</h3>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <div>
                  <dt className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Interest rate</dt>
                  <dd className="text-lg font-black text-slate-950 dark:text-white">
                    {b.rate.toFixed(2)}%<span className="ml-0.5 text-[10px] font-semibold text-slate-500"> p.a.</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Processing fee</dt>
                  <dd className={`text-lg font-black ${b.fee === "0.00%" ? "text-emerald-600" : "text-slate-950 dark:text-white"}`}>
                    {b.fee === "0.00%" ? "Nil" : b.fee}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => apply(b)}
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 active:scale-[0.98]"
              >
                {resume ? `Continue to ${b.short}` : "Apply now"}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </article>
          );
        })}
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
        <Lock className="mt-0.5 h-3 w-3 shrink-0" />
        Sign in to apply; you&apos;ll continue on the bank&apos;s official website. Rates are indicative starting rates and depend
        on your credit score, income and loan amount. Check the final rate and fees with the bank.
      </p>
    </section>
  );
}
