import React from "react";
import { MessageCircle, PhoneCall, Send, UserCircle2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatPill } from "../components/StatPill";

const threads = [
  { name: "Priya (Buyer)", property: "3BHK - Indiranagar", last: "Can we visit tomorrow?", time: "2m ago" },
  { name: "Arjun (Tenant)", property: "2BHK - HSR", last: "Sharing payslips now", time: "8m ago" },
  { name: "Sunil (Owner)", property: "Villa - Whitefield", last: "Sent ownership docs", time: "1h ago" },
];

const messages = [
  { author: "Priya", role: "Buyer", text: "Can we visit tomorrow at 5PM? Need parking for 2 cars.", time: "2m ago" },
  { author: "You", role: "Host", text: "5PM works. Sharing location pin shortly.", time: "1m ago" },
];

export default function MessagesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          tag="Inbox"
          title="Messages"
          subtitle="Connect to backend messaging threads; unify visit scheduling and documents."
          actions={
            <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5">
              New message
            </button>
          }
        />

        <SectionCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill label="Active threads" value="12" hint="3 new today" tone="rose" />
            <StatPill label="Unreplied" value="4" hint="Respond within 15 mins" tone="amber" />
            <StatPill label="Scheduled visits" value="6" hint="Synced to calendar" tone="emerald" />
            <StatPill label="Attachments" value="9" hint="Docs shared this week" tone="slate" />
          </div>
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionCard title="Threads" subtitle="Sorted by recency">
            <div className="space-y-3">
              {threads.map((t) => (
                <div key={t.name} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white/90 p-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <UserCircle2 className="h-9 w-9 text-rose-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-600">{t.property}</p>
                      <p className="text-xs text-slate-500">{t.last}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">{t.time}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Conversation" subtitle="Map to message table; persist read receipts and attachments.">
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 shadow-inner">
              {messages.map((msg) => (
                <div key={msg.author + msg.time} className="rounded-xl bg-white/90 p-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">{msg.author}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-800">{msg.text}</p>
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm">
                <MessageCircle className="h-5 w-5 text-slate-500" />
                <input className="w-full bg-transparent text-sm outline-none" placeholder="Type a message" />
                <PhoneCall className="h-5 w-5 text-slate-500" />
                <button className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
