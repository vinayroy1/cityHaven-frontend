"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, IndianRupee, Percent } from "lucide-react";

type TenureUnit = "years" | "months";
const MIN_AMOUNT = 100_000;
const MAX_AMOUNT = 100_000_000;
const MIN_RATE = 1;
const MAX_RATE = 20;

const formatINR = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(Number.isFinite(value) ? value : 0));
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);
const parseAmount = (value: string) => Number(value.replace(/[^\d]/g, ""));

function RangeField({ label, icon, children, min, max, step, value, onChange, minLabel, maxLabel }: {
  label: string; icon: React.ReactNode; children: React.ReactNode; min: number; max: number; step: number;
  value: number; onChange: (value: number) => void; minLabel: string; maxLabel: string;
}) {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{icon}</span>
          {label}
        </label>
        {children}
      </div>
      <input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-rose-600"
        style={{ background: `linear-gradient(to right, #e11d48 0%, #e11d48 ${progress}%, #e2e8f0 ${progress}%, #e2e8f0 100%)` }} />
      <div className="flex justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500"><span>{minLabel}</span><span>{maxLabel}</span></div>
    </div>
  );
}

export function EmiCalculator() {
  const [amount, setAmount] = useState(3_000_000);
  const [rate, setRate] = useState(8.8);
  const [tenure, setTenure] = useState(20);
  const [tenureUnit, setTenureUnit] = useState<TenureUnit>("years");
  const maxTenure = tenureUnit === "years" ? 35 : 420;
  const minTenure = tenureUnit === "years" ? 1 : 12;

  const { emi, totalPayable, totalInterest, principalShare, months } = useMemo(() => {
    const months = tenureUnit === "years" ? tenure * 12 : tenure;
    const monthlyRate = rate / 1200;
    const growth = Math.pow(1 + monthlyRate, months);
    const emi = monthlyRate === 0 ? amount / months : (amount * monthlyRate * growth) / (growth - 1);
    const totalPayable = emi * months;
    const totalInterest = Math.max(totalPayable - amount, 0);
    return { emi, totalPayable, totalInterest, principalShare: (amount / Math.max(totalPayable, 1)) * 100, months };
  }, [amount, rate, tenure, tenureUnit]);

  function changeTenureUnit(unit: TenureUnit) {
    if (unit === tenureUnit) return;
    setTenure(unit === "months" ? tenure * 12 : Math.max(1, Math.round(tenure / 12)));
    setTenureUnit(unit);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900">
      <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(340px,.7fr)]">
        <div className="p-5 sm:p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">Loan details</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Shape a repayment plan that fits</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Move the sliders or enter exact values. Your estimate updates instantly.</p>
          </div>
          <div className="space-y-8">
            <RangeField label="Loan amount" icon={<IndianRupee className="h-4 w-4" />} min={MIN_AMOUNT} max={MAX_AMOUNT} step={50_000} value={amount} onChange={setAmount} minLabel="₹1 lakh" maxLabel="₹10 crore">
              <div className="flex h-11 w-44 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 dark:border-slate-700 dark:bg-slate-800">
                <span className="mr-1 text-sm font-semibold text-slate-400">₹</span>
                <input aria-label="Enter loan amount" inputMode="numeric" value={formatINR(amount)} onChange={(event) => setAmount(clamp(parseAmount(event.target.value), MIN_AMOUNT, MAX_AMOUNT))} className="min-w-0 flex-1 bg-transparent text-right text-base font-bold text-slate-900 outline-none dark:text-white" />
              </div>
            </RangeField>
            <RangeField label="Interest rate" icon={<Percent className="h-4 w-4" />} min={MIN_RATE} max={MAX_RATE} step={0.1} value={rate} onChange={setRate} minLabel="1%" maxLabel="20%">
              <div className="flex h-11 w-28 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 dark:border-slate-700 dark:bg-slate-800">
                <input aria-label="Enter annual interest rate" type="number" min={MIN_RATE} max={MAX_RATE} step={0.1} value={rate} onChange={(event) => setRate(clamp(Number(event.target.value), MIN_RATE, MAX_RATE))} className="min-w-0 flex-1 bg-transparent text-right text-base font-bold text-slate-900 outline-none dark:text-white" />
                <span className="ml-1 text-sm font-semibold text-slate-400">%</span>
              </div>
            </RangeField>
            <RangeField label="Loan tenure" icon={<CalendarDays className="h-4 w-4" />} min={minTenure} max={maxTenure} step={tenureUnit === "years" ? 1 : 12} value={tenure} onChange={setTenure} minLabel={tenureUnit === "years" ? "1 year" : "12 months"} maxLabel={tenureUnit === "years" ? "35 years" : "420 months"}>
              <div className="flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <input aria-label="Enter loan tenure" type="number" min={minTenure} max={maxTenure} value={tenure} onChange={(event) => setTenure(clamp(Number(event.target.value), minTenure, maxTenure))} className="w-16 bg-transparent px-2 text-center text-base font-bold text-slate-900 outline-none dark:text-white" />
                <div className="flex border-l border-slate-200 p-1 dark:border-slate-700">
                  {(["years", "months"] as TenureUnit[]).map((unit) => <button key={unit} type="button" aria-pressed={tenureUnit === unit} onClick={() => changeTenureUnit(unit)} className={`rounded-lg px-2.5 text-xs font-semibold transition ${tenureUnit === unit ? "bg-slate-900 text-white dark:bg-rose-600" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}>{unit === "years" ? "Yr" : "Mo"}</button>)}
                </div>
              </div>
            </RangeField>
          </div>
        </div>

        <aside className="relative overflow-hidden bg-slate-950 p-5 text-white sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-300">Your monthly EMI</p>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">₹{formatINR(emi)}</p>
            <p className="mt-2 text-sm text-slate-400">for {months} monthly payments</p>
            <div className="my-8 flex items-center justify-center">
              <div className="relative grid h-48 w-48 place-items-center rounded-full" style={{ background: `conic-gradient(#fb7185 ${principalShare * 3.6}deg, #fb923c 0deg)` }} role="img" aria-label={`${principalShare.toFixed(0)} percent principal and ${(100 - principalShare).toFixed(0)} percent interest`}>
                <div className="grid h-32 w-32 place-items-center rounded-full bg-slate-950 text-center shadow-inner"><div><p className="text-2xl font-bold">{principalShare.toFixed(0)}%</p><p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Principal</p></div></div>
              </div>
            </div>
            <div className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5 px-4">
              <div className="flex items-center justify-between py-3.5 text-sm"><span className="flex items-center gap-2 text-slate-300"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" />Principal amount</span><strong>₹{formatINR(amount)}</strong></div>
              <div className="flex items-center justify-between py-3.5 text-sm"><span className="flex items-center gap-2 text-slate-300"><span className="h-2.5 w-2.5 rounded-full bg-orange-400" />Total interest</span><strong>₹{formatINR(totalInterest)}</strong></div>
              <div className="flex items-center justify-between py-3.5 text-sm"><span className="text-slate-300">Total payable</span><strong>₹{formatINR(totalPayable)}</strong></div>
            </div>
            <Link href="/home-loans" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-950/30 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Explore home loans <ArrowRight className="h-4 w-4" /></Link>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">Indicative calculation only. Actual lender terms may vary.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
