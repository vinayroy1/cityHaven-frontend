import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Bell, Building2, CreditCard, FileText, HandCoins, Heart, MessageSquare, NotebookTabs, RouteIcon, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "./components/PageHeader";
import { SectionCard } from "./components/SectionCard";
import { StatPill } from "./components/StatPill";
import { buildCanonical } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";

export const metadata: Metadata = {
  title: "Dashboard | Awasio",
  description: "Monitor listings, leads, KYC, and payouts from your Awasio control center.",
  alternates: { canonical: buildCanonical("/dashboard") },
  openGraph: {
    title: "Dashboard | Awasio",
    description: "Manage Awasio listings, leads, compliance, and payouts in one place.",
    url: buildCanonical("/dashboard"),
    type: "website",
  },
};

export default function DashboardPage() {
  const quickLinks = [
    { href: "/dashboard/advisor-profile", title: "Advisor Profile & RERA", description: "Manage agent license, RERA verification, and in-person walkthrough services.", icon: BadgeCheck },
    { href: "/pricing", title: "Plans & Contact Packs", description: "Buy contact unlock packs, seller tiers, and agency subscriptions.", icon: CreditCard },
    { href: "/dashboard/favorites", title: "Liked Properties", description: "Your shortlisted homes and saved properties.", icon: Heart },
    { href: "/dashboard/properties", title: "Properties", description: "Manage drafts, active listings, and boosts.", icon: NotebookTabs },
    { href: "/dashboard/organization", title: "Organization", description: "Manage company workspaces, employees, and roles.", icon: Building2 },
    { href: "/dashboard/leads", title: "Leads & CRM", description: "Track enquiries, visits, and follow-ups.", icon: Users },
    { href: "/dashboard/kyc", title: "KYC & Compliance", description: "Keep verification and payouts current.", icon: ShieldCheck },
    { href: "/dashboard/documents", title: "Documents", description: "Rental agreements and proof bundles.", icon: FileText },
    { href: "/dashboard/transactions", title: "Transactions & Invoices", description: "Payouts, invoices, and billing statements.", icon: HandCoins },
    { href: "/dashboard/notifications", title: "Notifications", description: "Alerts across messages and status changes.", icon: Bell },
    { href: "/dashboard/messages", title: "Messages", description: "Chat with buyers, tenants, and support.", icon: MessageSquare },
    { href: "/dashboard/settings", title: "Settings", description: "Preferences, alerts, and account controls.", icon: RouteIcon },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 transition-colors duration-150">
      <HeaderNav />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3.5 py-6 sm:px-6 sm:py-8 overflow-hidden sm:overflow-visible">
        <PageHeader
          tag="Control center"
          title="Dashboard"
          subtitle="Manage listings, leads, compliance, and payouts in one place."
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 hover:-translate-y-0.5"
              >
                <span>⭐ Buy Plan / Credits</span>
              </Link>
              <Link
                href="/propertyListing"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5 dark:bg-rose-600 dark:hover:bg-rose-700"
              >
                Create listing
              </Link>
            </div>
          }
        />

        {/* Role switcher: Buyer / Owner / Org Agent */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/dashboard/enquiries"
            className="group flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:border-sky-100 dark:border-slate-800 dark:bg-slate-900/90"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700 shadow-inner shadow-sky-100/80 dark:bg-sky-950/60 dark:text-sky-300">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Saved & enquiries</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Buyer / tenant workspace</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">See saved homes, enquiries, visits, and messages.</p>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition">
              Open workspace
            </span>
          </Link>

          <Link
            href="/dashboard/properties"
            className="group flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:border-rose-100 dark:border-slate-800 dark:bg-slate-900/90"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 shadow-inner shadow-emerald-100/80 dark:bg-emerald-950/60 dark:text-emerald-300">
                <NotebookTabs className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">My listings</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Drafts, active, under review</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">View and edit your own properties.</p>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-500 dark:text-rose-400 group-hover:translate-x-0.5 transition">
              Manage listings
            </span>
          </Link>

          <Link
            href="/dashboard/organization"
            className="group flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:border-amber-100 dark:border-slate-800 dark:bg-slate-900/90"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700 shadow-inner shadow-amber-100/80 dark:bg-amber-950/60 dark:text-amber-300">
                <RouteIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Organization</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Company, team, roles</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Switch org, add employees, assign access, and open team listings.</p>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition">
              Manage organization
            </span>
          </Link>
        </div>

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
                className="group flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:border-rose-100 dark:border-slate-800 dark:bg-slate-900/90"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600 shadow-inner shadow-rose-100/80 dark:bg-rose-950/60 dark:text-rose-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{description}</p>
                <span className="mt-auto text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-500 dark:text-rose-400 group-hover:translate-x-0.5 transition">
                  Open
                </span>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Need guidance?" subtitle="Our team can help map backend fields to UI forms.">
          <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300">Lead status flow</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300">KYC + bank verification</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300">Rental agreements</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300">Payout audit</span>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
