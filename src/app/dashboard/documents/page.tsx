import React from "react";
import { FileSignature, FileText, Download, Clock, CheckCircle2, AlertTriangle, Lock } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatPill } from "../components/StatPill";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";

const documents = [
  { name: "Sale Deed & Title Certificate - Green View 3BHK", status: "Verified", updated: "2h ago", badge: "Ownership" },
  { name: "Owner Society NOC - Sunrise Tower 1203", status: "Verified", updated: "Yesterday", badge: "Society" },
  { name: "Electricity & Utility Proof - Ashok Vihar Plot", status: "Reviewing", updated: "Today", badge: "Utility Proof" },
];

const templates = [
  "Society NOC request letter",
  "Owner possession declaration",
  "Co-living house rules",
  "Property handover checklist",
  "Utility transfer undertaking",
];

export default function DocumentsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 transition-colors duration-150">
      <HeaderNav />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          tag="Documents"
          title="Property Documents & Proofs"
          subtitle="Securely organize property title deeds, society NOCs, and utility records."
          backHref="/dashboard"
          actions={
            <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5">
              Upload document
            </button>
          }
        />

        <SectionCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill label="Total documents" value="6" hint="3 properties linked" tone="rose" />
            <StatPill label="Verified proofs" value="4" hint="Ownership & NOCs" tone="emerald" />
            <StatPill label="In review" value="1" hint="Verification pending" tone="amber" />
            <StatPill label="Downloads" value="24" hint="This month" tone="slate" />
          </div>
        </SectionCard>

        <SectionCard title="Recent documents" subtitle="Property records and verification status.">
          <div className="space-y-3">
            {documents.map((item) => (
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

        <SectionCard title="Checklists & formats" subtitle="Standard templates for ownership verification and society handovers.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((name) => (
              <div key={name} className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FileText className="h-4 w-4 text-slate-600" />
                  {name}
                </div>
                <p className="mt-2 text-xs text-slate-600">Prefill from property and owner details.</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="h-4 w-4 text-slate-500" />
                  2 min setup
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Verified format
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Security & storage" subtitle="Keep documents organized with encrypted storage.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Renewal alerts
              </div>
              <p className="mt-2 text-xs text-slate-600">Get alerts when annual property taxes or utility records need updating.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Encrypted & safe
              </div>
              <p className="mt-2 text-xs text-slate-600">Keep PDF history with timestamps and owner-controlled access.</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
