import React from "react";
import { Bell, CheckCircle2, MessageSquare, Shield, Sparkles } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatPill } from "../components/StatPill";

const feed = [
  { title: "New lead assigned", detail: "Rohit for 3BHK in HSR", time: "2m ago", tone: "rose" },
  { title: "Document verified", detail: "Owner NOC - Sunrise Tower", time: "1h ago", tone: "emerald" },
  { title: "Visit reminder", detail: "Kabir Shah • Co-working • Fri 4PM", time: "3h ago", tone: "amber" },
  { title: "Payment processed", detail: "Payout ₹1,25,000 • TXN-2481", time: "Today", tone: "slate" },
];

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          tag="Inbox"
          title="Notifications"
          subtitle="Unified feed from leads, documents, KYC, and transactions tables."
          actions={
            <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5">
              Mark all read
            </button>
          }
        />

        <SectionCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill label="Unread" value="5" hint="New today" tone="rose" />
            <StatPill label="Leads" value="3" hint="Assignments & replies" tone="emerald" />
            <StatPill label="Documents" value="1" hint="Verification updates" tone="amber" />
            <StatPill label="Transactions" value="1" hint="Payout alerts" tone="slate" />
          </div>
        </SectionCard>

        <SectionCard title="Feed" subtitle="Actionable alerts mapped to notification table.">
          <div className="space-y-3">
            {feed.map((item) => (
              <div key={item.title + item.time} className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shadow-inner shadow-rose-100/80">
                    <Bell className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-600">{item.detail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                    {item.time}
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Preferences" subtitle="Control categories and channels.">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Shield className="h-4 w-4 text-emerald-600" />
                Safety first
              </div>
              <p className="mt-2 text-xs text-slate-600">Policy and verification events are always on.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MessageSquare className="h-4 w-4 text-rose-600" />
                Messages
              </div>
              <p className="mt-2 text-xs text-slate-600">Sync chat mentions and replies to notifications.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Promotions
              </div>
              <p className="mt-2 text-xs text-slate-600">Optional boosts and offers; opt out anytime.</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
