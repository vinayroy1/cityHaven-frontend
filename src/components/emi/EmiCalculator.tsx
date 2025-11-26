 "use client";
import React, { useMemo, useState } from "react";
import { Calculator, Info, Percent, Sparkles, TrendingUp, Wallet } from "lucide-react";

type TenureUnit = "years" | "months";

function toNumber(value: string | number) {
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

export function EmiCalculator() {
  const [amount, setAmount] = useState<number>(3000000);
  const [rate, setRate] = useState<number>(8.8);
  const [tenure, setTenure] = useState<number>(20);
  const [tenureUnit, setTenureUnit] = useState<TenureUnit>("years");

  const { emi, totalPayable, totalInterest, monthlyRate, months, principalShare } = useMemo(() => {
    const months = tenureUnit === "years" ? tenure * 12 : tenure;
    const monthlyRate = rate / (12 * 100);
    const numerator = amount * monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    const emi = denominator === 0 ? 0 : numerator / denominator;
    const totalPayable = emi * months;
    const totalInterest = totalPayable - amount;
    const principalShare = (amount / Math.max(totalPayable, 1)) * 100;
    return { emi, totalPayable, totalInterest, monthlyRate, months, principalShare };
  }, [amount, rate, tenure, tenureUnit]);

  const pieBackground = `conic-gradient(#0f172a 0deg ${principalShare}deg, #2dd4bf ${principalShare}deg 360deg)`;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-10 -top-20 h-56 w-56 rounded-full bg-red-100 blur-3xl" />
        <div className="absolute -right-6 top-10 h-52 w-52 rounded-full bg-orange-100 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-200/60">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Plan repayments</p>
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">EMI Calculator</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold">
            <Wallet className="h-4 w-4 text-emerald-600" /> Principal + interest split
          </span>
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold">
            <TrendingUp className="h-4 w-4 text-indigo-600" /> Live recalculation
          </span>
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold">
            <Sparkles className="h-4 w-4 text-red-500" /> Mobile friendly
          </span>
        </div>
      </div>

      <div className="relative flex flex-col gap-5 p-4 sm:p-6 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              <span className="flex items-center gap-2">
                Loan amount <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">₹</span>
              </span>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm shadow-red-100/40 ring-1 ring-red-50">
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount.toLocaleString("en-IN")}
                  onChange={(e) => setAmount(toNumber(e.target.value))}
                  className="w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
                />
              </div>
              <input
                type="range"
                min={100000}
                max={20000000}
                step={50000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Rate of interest (p.a)
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm shadow-indigo-100/40 ring-1 ring-indigo-50">
                <Percent className="h-4 w-4 text-slate-500" />
                <input
                  type="number"
                  min={1}
                  step={0.1}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
                />
                <span className="text-sm text-slate-500">%</span>
              </div>
              <div className="flex gap-2 text-[11px] text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-1">Floating</span>
                <span className="rounded-full bg-slate-100 px-2 py-1">Fixed</span>
              </div>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Tenure
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm shadow-orange-100/50 ring-1 ring-orange-50">
                <input
                  type="number"
                  min={1}
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
                />
                <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-700 shadow-inner">
                  {(["years", "months"] as TenureUnit[]).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setTenureUnit(unit)}
                      className={`rounded-lg px-3 py-1 transition ${
                        tenureUnit === unit ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm" : "hover:bg-white"
                      }`}
                    >
                      {unit === "years" ? "Years" : "Months"}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="range"
                min={tenureUnit === "years" ? 1 : 12}
                max={tenureUnit === "years" ? 35 : 420}
                step={tenureUnit === "years" ? 1 : 12}
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </label>

            <div className="space-y-2 rounded-2xl border border-slate-100 bg-white/80 p-4 text-xs text-slate-600 shadow-sm">
              <p className="flex items-center gap-2 font-semibold text-slate-800">
                <Info className="h-4 w-4 text-red-500" /> How we calculate
              </p>
              <p>EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]</p>
              <p>
                r = monthly interest rate ({monthlyRate.toFixed(4)}), n = total months ({months}).
              </p>
              <p className="text-[11px] text-slate-500">Try lowering tenure to see interest drop faster.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white shadow-lg sm:p-5 lg:max-w-sm">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="col-span-2 flex items-center justify-center">
              <div
                className="flex h-44 w-44 items-center justify-center rounded-full bg-white/10 shadow-inner ring-2 ring-white/10 sm:h-48 sm:w-48"
                style={{ background: pieBackground }}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-center text-xs font-semibold text-slate-900 shadow">
                  EMI
                  <br />
                  ₹{Math.round(emi).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[#0f172a]" />
                <div>
                  <p className="text-xs text-slate-300">Principal</p>
                  <p className="text-sm font-semibold text-white">₹{amount.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[#2dd4bf]" />
                <div>
                  <p className="text-xs text-slate-300">Interest</p>
                  <p className="text-sm font-semibold text-white">₹{Math.round(totalInterest).toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-sm backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-slate-200">Monthly EMI</p>
                <p className="text-xl font-bold text-white">₹{Math.round(emi).toLocaleString("en-IN")}</p>
                <p className="mt-2 text-xs text-slate-200">Total Payable: ₹{Math.round(totalPayable).toLocaleString("en-IN")}</p>
              </div>
              <button className="w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5">
                Get instant loan offers
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-slate-200">Interest rate</p>
              <p className="text-lg font-semibold text-white">{rate}% p.a.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-slate-200">Tenure</p>
              <p className="text-lg font-semibold text-white">
                {tenure} {tenureUnit === "years" ? "yrs" : "mo"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
