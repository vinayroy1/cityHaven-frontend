import React from "react";
import { BadgeCheck, Banknote, FileCheck2, IdCard, ShieldCheck, Upload, UserCheck } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatPill } from "../components/StatPill";

const steps = [
  { title: "Identity verification", detail: "Aadhaar / Passport + selfie match", status: "Pending", icon: IdCard, tone: "rose" },
  { title: "PAN validation", detail: "PAN + name match", status: "In review", icon: FileCheck2, tone: "amber" },
  { title: "Bank proof", detail: "Cancelled cheque or bank statement", status: "Pending", icon: Banknote, tone: "emerald" },
  { title: "Address proof", detail: "Utility bill / rental agreement", status: "Complete", icon: BadgeCheck, tone: "slate" },
];

export default function KycPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          tag="Compliance"
          title="KYC & Compliance"
          subtitle="Mirror backend kyc_legal fields: identity, PAN, bank proof, and address checks for payouts."
          actions={
            <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5">
              Upload documents
            </button>
          }
        />

        <SectionCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill label="Overall status" value="In review" hint="2 steps pending" tone="amber" />
            <StatPill label="Payout readiness" value="80%" hint="Enable instant payouts" tone="emerald" />
            <StatPill label="Last updated" value="Today" hint="12:45 PM IST" tone="slate" />
            <StatPill label="Reviewer" value="Anika (Ops)" hint="SLA: 4 hours" tone="rose" />
          </div>
        </SectionCard>

        <SectionCard title="Verification steps" subtitle="Upload and track each requirement.">
          <div className="grid gap-3 md:grid-cols-2">
            {steps.map(({ title, detail, status, icon: Icon, tone }) => (
              <div key={title} className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shadow-inner shadow-rose-100/80">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{title}</p>
                      <p className="text-xs text-slate-600">{detail}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                    {status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                  <Upload className="h-4 w-4 text-slate-500" />
                  <span>Upload PDF / JPG - Under 5MB</span>
                </div>
                <div className={`mt-3 rounded-xl border px-3 py-2 text-xs font-semibold ${tone === "emerald" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : tone === "rose" ? "border-rose-100 bg-rose-50 text-rose-700" : tone === "amber" ? "border-amber-100 bg-amber-50 text-amber-800" : "border-slate-100 bg-slate-50 text-slate-700"}`}>
                  Linked to kyc_legal.{title.toLowerCase().replace(/\s/g, "_")}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Payout readiness" subtitle="Sync payout preferences with transactions and bank proof.">
          <div className="grid gap-3 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Bank verification status
              </div>
              <p className="mt-2 text-xs text-slate-600">Match account name with PAN and property owner metadata before releasing payouts.</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">IFSC validated</span>
                <span className="rounded-full bg-slate-50 px-3 py-1">Penny drop pending</span>
                <span className="rounded-full bg-slate-50 px-3 py-1">Owner ID linked</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner">
              <p className="text-sm font-semibold text-slate-900">What happens after approval?</p>
              <p className="mt-2 text-xs text-slate-600">
                Transactions can flow to your bank; commissions and refunds tie back to transaction & payout tables in the backend. Keep proofs updated to avoid holds.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                Manual override via ops is supported with audit logs.
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
