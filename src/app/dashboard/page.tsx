import React from "react";
import Link from "next/link";
import { Bell, FileText, HandCoins, IdCard, MessageSquare, NotebookTabs, RouteIcon, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "./components/PageHeader";
import { SectionCard } from "./components/SectionCard";
import { StatPill } from "./components/StatPill";

export default function DashboardPage() {
  const quickLinks = [
    { href: "/dashboard/properties", title: "Properties", description: "Manage drafts, active listings, and boosts.", icon: NotebookTabs },
    { href: "/dashboard/leads", title: "Leads & CRM", description: "Track enquiries, visits, and follow-ups.", icon: Users },
    { href: "/dashboard/kyc", title: "KYC & Compliance", description: "Keep verification and payouts current.", icon: ShieldCheck },
    { href: "/dashboard/documents", title: "Documents", description: "Rental agreements and proof bundles.", icon: FileText },
    { href: "/dashboard/transactions", title: "Transactions", description: "Payouts, commissions, and invoices.", icon: HandCoins },
    { href: "/dashboard/notifications", title: "Notifications", description: "Alerts across messages and status changes.", icon: Bell },
    { href: "/dashboard/messages", title: "Messages", description: "Chat with buyers, tenants, and support.", icon: MessageSquare },
    { href: "/dashboard/settings", title: "Settings", description: "Preferences, alerts, and account controls.", icon: RouteIcon },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          tag="Control center"
          title="Dashboard"
          subtitle="Manage listings, leads, compliance, and payouts in one place."
          actions={
            <Link
              href="/propertyListing"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5"
            >
              Create listing
            </Link>
          }
        />

        <SectionCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill label="Active listings" value="12" hint="4 boosting this week" tone="rose" />
            <StatPill label="New leads" value="27" hint="7 need follow-up" tone="emerald" />
            <StatPill label="Pending KYC" value="2 steps" hint="PAN + bank proof" tone="amber" />
            <StatPill label="Unread alerts" value="5" hint="Messages + status" tone="slate" />
          </div>
        </SectionCard>

        <SectionCard title="Jump into a workflow" subtitle="Everything aligns with your backend objects: leads, KYC, documents, notifications, and transactions.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map(({ href, title, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:border-rose-100"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600 shadow-inner shadow-rose-100/80">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                </div>
                <p className="text-xs text-slate-600">{description}</p>
                <span className="mt-auto text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-500 group-hover:translate-x-0.5 transition">
                  Open
                </span>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Need guidance?" subtitle="Our team can help map backend fields to UI forms.">
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Lead status flow</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">KYC + bank verification</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Rental agreements</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Payout audit</span>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
