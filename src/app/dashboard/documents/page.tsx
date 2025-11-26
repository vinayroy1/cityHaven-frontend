import React from "react";
import { FileSignature, FileText, Download, Clock, CheckCircle2, AlertTriangle, Lock } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatPill } from "../components/StatPill";

const agreements = [
  { name: "Rental Agreement - Green View 3BHK", status: "Signature pending", updated: "2h ago", badge: "Tenant" },
  { name: "Owner NOC - Sunrise Tower 1203", status: "Verified", updated: "Yesterday", badge: "Owner" },
  { name: "KYC bundle - Ashok Vihar Plot", status: "Reviewing", updated: "Today", badge: "Compliance" },
];

const templates = [
  "Rental agreement (standard)",
  "Owner declaration",
  "Co-living house rules",
  "Leave & license (11 months)",
  "Commercial lease",
];

export default function DocumentsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          tag="Documents"
          title="Agreements & Proofs"
          subtitle="Map to backend documents_rental_agreements and media uploads. Generate, share, and track status."
          actions={
            <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5">
              New agreement
            </button>
          }
        />

        <SectionCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill label="Active agreements" value="6" hint="2 awaiting signatures" tone="rose" />
            <StatPill label="Proof bundles" value="4" hint="Ownership, utility, ID" tone="emerald" />
            <StatPill label="Pending reviews" value="3" hint="Ops & legal" tone="amber" />
            <StatPill label="Downloads" value="24" hint="This week" tone="slate" />
          </div>
        </SectionCard>

        <SectionCard title="Recent documents" subtitle="Signatures, timestamps, and roles tracked.">
          <div className="space-y-3">
            {agreements.map((item) => (
              <div key={item.name} className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shadow-inner shadow-rose-100/80">
                    <FileSignature className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-600">{item.status}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{item.badge}</span>
                      <span className="rounded-full bg-slate-50 px-3 py-1">Updated {item.updated}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Download className="h-4 w-4" />
                  Download
                  <Lock className="h-4 w-4 text-slate-500" />
                  Secure link
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Template library" subtitle="Pick a template and auto-fill from backend property/user data.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((name) => (
              <div key={name} className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FileText className="h-4 w-4 text-slate-600" />
                  {name}
                </div>
                <p className="mt-2 text-xs text-slate-600">Prefill from property, user, and transaction data.</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="h-4 w-4 text-slate-500" />
                  2 min setup
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  E-sign ready
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Audit & alerts" subtitle="Hook into notification + transaction tables for visibility.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Expiring soon
              </div>
              <p className="mt-2 text-xs text-slate-600">Remind tenants/owners 30 days before expiry. Sync to notifications feed.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Versioned
              </div>
              <p className="mt-2 text-xs text-slate-600">Keep PDF history with timestamps and role-based access.</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
