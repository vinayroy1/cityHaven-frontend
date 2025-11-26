import React from "react";
import { ArrowDownCircle, ArrowUpCircle, CreditCard, IndianRupee, Receipt, ShieldCheck, Wallet } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatPill } from "../components/StatPill";

const payouts = [
  { id: "#TXN-2481", type: "Payout", amount: "₹1,25,000", status: "Processed", date: "Today", ref: "Property #114" },
  { id: "#TXN-2479", type: "Deposit", amount: "₹50,000", status: "In review", date: "Yesterday", ref: "Security deposit" },
  { id: "#TXN-2472", type: "Commission", amount: "₹18,500", status: "Success", date: "2 days ago", ref: "Lead closed" },
];

const invoices = [
  { id: "INV-9021", label: "Boosted listing - 30 days", amount: "₹3,499", status: "Paid" },
  { id: "INV-9012", label: "Owner services pack", amount: "₹6,999", status: "Pending" },
  { id: "INV-9008", label: "Pro subscription", amount: "₹4,499", status: "Paid" },
];

export default function TransactionsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          tag="Transactions"
          title="Payouts & Billing"
          subtitle="Aligns with transaction and payout tables. Track deposits, commissions, and invoices."
          actions={
            <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5">
              Export CSV
            </button>
          }
        />

        <SectionCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill label="Wallet balance" value="₹2,45,800" hint="Available for payouts" tone="emerald" />
            <StatPill label="In review" value="₹50,000" hint="Verification pending" tone="amber" />
            <StatPill label="Commissions" value="₹38,500" hint="This month" tone="rose" />
            <StatPill label="Invoices" value="3 open" hint="1 due soon" tone="slate" />
          </div>
        </SectionCard>

        <SectionCard title="Recent payouts & deposits" subtitle="Surface status, ids, and linked objects.">
          <div className="space-y-3">
            {payouts.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shadow-inner shadow-emerald-100/80">
                    {item.type === "Deposit" ? <ArrowDownCircle className="h-5 w-5" /> : <ArrowUpCircle className="h-5 w-5" />}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.amount}</p>
                    <p className="text-xs text-slate-600">
                      {item.id} | {item.type} | {item.ref}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
                      <span className="rounded-full bg-slate-50 px-3 py-1">Updated {item.date}</span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{item.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Secured
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Billing & invoices" subtitle="Map to invoice records tied to subscription/add-on purchases.">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{inv.label}</p>
                    <p className="text-xs text-slate-600">{inv.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{inv.amount}</p>
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
                        inv.status === "Paid" ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-lg">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                <CreditCard className="h-4 w-4" />
                Payout preferences
              </div>
              <p className="mt-2 text-sm text-white/85">Set bank account, UPI, or wallet. Syncs with verification on KYC page.</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-white/85">
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">Instant payouts</span>
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">Scheduled weekly</span>
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">UTR tracking</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-white/80">
                <Wallet className="h-4 w-4" />
                Wallet to bank transfers supported
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
                <Receipt className="h-4 w-4" />
                GST invoices available for downloads
              </div>
              <div className="mt-4 inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow">
                <IndianRupee className="mr-2 h-4 w-4" />
                Update payout method
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
