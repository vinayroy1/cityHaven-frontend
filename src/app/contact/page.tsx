import React from "react";
import { Mail, Phone, MessageSquare, MapPin, Clock, ShieldCheck, Send } from "lucide-react";

const contacts = [
  { title: "Call support", value: "1800 41 99099", description: "9AM - 11PM IST, 7 days a week", icon: Phone, accent: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  { title: "Email us", value: "support@cityhaven.com", description: "We respond within 1 business day", icon: Mail, accent: "text-rose-600 bg-rose-50 border-rose-100" },
  { title: "Chat", value: "Message our concierge", description: "Instant responses for quick queries", icon: MessageSquare, accent: "text-sky-600 bg-sky-50 border-sky-100" },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.5)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
            <ShieldCheck className="h-4 w-4" />
            We are here to help
          </div>
          <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">Contact CityHaven Support</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-700">
            Reach us for bookings, listings, safety, or account queries. We keep responses fast and transparent.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700">
            {["7-day support", "Local experts", "Secure communication"].map((chip) => (
              <span key={chip} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 shadow-inner">
                {chip}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Send us a note</h2>
            <p className="text-sm text-slate-700">Share your details and we&apos;ll respond within a business day.</p>
            <form className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-slate-800">Full name</label>
                <input className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" placeholder="Priya Sharma" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-800">Email</label>
                  <input className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" type="email" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">Mobile</label>
                  <input className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" type="tel" placeholder="9876543210" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">How can we help?</label>
                <textarea
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  rows={4}
                  placeholder="Share booking id, property link, or your question."
                />
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5"
              >
                <Send className="h-4 w-4" />
                Submit
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Quick reach</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {contacts.map(({ title, value, description, icon: Icon, accent }) => (
                <div key={title} className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-sm ${accent}`}>
                  <div className="mt-1 rounded-xl bg-white/80 p-2 shadow-inner">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="text-sm text-slate-700">{value}</p>
                    <p className="text-xs text-slate-600">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-lg">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                <MapPin className="h-4 w-4" />
                Visit us (by appointment)
              </div>
              <p className="mt-2 text-sm text-white/85">CityHaven HQ, Gurgaon</p>
              <p className="text-xs text-white/70">Mon - Fri, 10AM to 6PM</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/20">
                <Clock className="h-4 w-4" />
                Scheduled tours available
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
