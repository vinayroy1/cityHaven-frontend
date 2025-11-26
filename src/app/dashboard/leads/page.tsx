import React from "react";
import { CalendarClock, MapPin, PhoneCall, Sparkles, Star, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatPill } from "../components/StatPill";

const pipeline = [
  {
    title: "New",
    tone: "rose",
    leads: [
      { name: "Aarav Mehta", type: "Buyer - 3BHK", budget: "₹1.2 Cr", note: "Prefers south Bengaluru", time: "5m ago" },
      { name: "Sana Iqbal", type: "Tenant - 2BHK", budget: "₹55k/mo", note: "Near metro, pet friendly", time: "12m ago" },
    ],
  },
  {
    title: "Contacted",
    tone: "emerald",
    leads: [
      { name: "Ravi Kapoor", type: "Commercial lease", budget: "₹3.5L/mo", note: "Needs 2 parking slots", time: "30m ago" },
      { name: "Jaspreet Kaur", type: "Plot - 2400 sqft", budget: "₹95L", note: "Corner plot preferred", time: "1h ago" },
    ],
  },
  {
    title: "Visits",
    tone: "amber",
    leads: [
      { name: "Ananya Rao", type: "Villa resale", budget: "₹2.6 Cr", note: "Tour scheduled Thu 4PM", time: "Tomorrow" },
      { name: "Kabir Shah", type: "Co-working", budget: "₹1.8L/mo", note: "Needs 25 seats", time: "Fri" },
    ],
  },
  {
    title: "Closed / Won",
    tone: "slate",
    leads: [
      { name: "Vikram Joshi", type: "Studio rent", budget: "₹28k/mo", note: "Agreement in progress", time: "Today" },
    ],
  },
];

export default function LeadsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          tag="CRM"
          title="Leads & Enquiries"
          subtitle="Pipeline mapped to backend leads, visits, and agreements. Keep responses quick and measurable."
          actions={
            <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5">
              Add lead
            </button>
          }
        />

        <SectionCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill label="New today" value="14" hint="From web & app" tone="rose" />
            <StatPill label="Response SLA" value="12 mins" hint="Avg first reply" tone="emerald" />
            <StatPill label="Visits booked" value="8" hint="Next 48 hours" tone="amber" />
            <StatPill label="Win rate" value="24%" hint="Last 30 days" tone="slate" />
          </div>
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-4">
          {pipeline.map((stage) => (
            <SectionCard key={stage.title} title={stage.title} className="lg:h-full">
              <div className="space-y-3">
                {stage.leads.map((lead) => (
                  <div key={lead.name} className="rounded-2xl border border-slate-100 bg-white/90 p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                        <p className="text-xs text-slate-600">{lead.type}</p>
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-500">{lead.time}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
                      <span className="rounded-full bg-slate-50 px-2 py-1">Budget {lead.budget}</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">{lead.note}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                      <PhoneCall className="h-4 w-4 text-slate-500" />
                      <CalendarClock className="h-4 w-4 text-slate-500" />
                      <MapPin className="h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>

        <SectionCard title="Performance pulse" subtitle="Tie CRM metrics to backend lead_status, visit logs, and bookings.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-inner">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Conversion funnel
              </div>
              <p className="mt-2 text-xs text-slate-600">New → Contacted → Visit → Won mapped to lead_status.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-inner">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Sparkles className="h-4 w-4 text-rose-600" />
                Smart tags
              </div>
              <p className="mt-2 text-xs text-slate-600">Auto-apply tags from property_type, budget, and locality.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-inner">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Star className="h-4 w-4 text-amber-500" />
                Priority SLA
              </div>
              <p className="mt-2 text-xs text-slate-600">Respond within 15 mins for high-intent leads.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-inner">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Users className="h-4 w-4 text-sky-600" />
                Team visibility
              </div>
              <p className="mt-2 text-xs text-slate-600">Assign owners, log follow-ups, and sync status with CRM API.</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
