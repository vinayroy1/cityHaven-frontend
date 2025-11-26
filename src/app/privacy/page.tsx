import React from "react";
import Link from "next/link";
import { Shield, EyeOff, Lock, Smartphone, Database, Bell } from "lucide-react";

const principles = [
  { title: "Minimal data", body: "We collect only what is required to provide OTP login, personalize listings, and keep your account secure.", icon: EyeOff },
  { title: "Encrypted in transit", body: "OTP and session data move over encrypted channels; sensitive tokens are not shared with third parties.", icon: Lock },
  { title: "Clear control", body: "You can update or delete your number and preferences anytime from your profile.", icon: Shield },
];

const uses = [
  "Mobile number for OTP authentication and account recovery.",
  "Session data to remember your searches, filters, and saved homes.",
  "Basic device info to improve performance and prevent abuse.",
  "Optional communication preferences for alerts and updates.",
];

const sharing = [
  "We never sell your personal data.",
  "We share details with hosts only after you engage (e.g., schedule a visit).",
  "Analytics are aggregated and anonymized.",
  "Payment partners receive only the data required to process transactions.",
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.5)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
            <Shield className="h-4 w-4" /> Privacy Policy
          </div>
          <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">Your data, protected and in your control.</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-700">
            CityHaven is built on trust. We use your data to deliver a secure OTP login, personalized discovery, and reliable communication—nothing more.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-700">
            {["Encrypted OTP", "Consent-first", "No resale of data"].map((chip) => (
              <span key={chip} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 shadow-inner">
                {chip}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:grid-cols-3">
          {principles.map(({ title, body, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-4 shadow-sm transition hover:-translate-y-1 hover:border-rose-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shadow-inner shadow-emerald-100/70">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
              <Smartphone className="h-4 w-4" />
              What we use
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {uses.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-xs text-slate-600">
              You can request deletion of your account or preferences anytime. We&apos;ll remove or anonymize data unless retention is required by law.
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
              <Database className="h-4 w-4" />
              Sharing & retention
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {sharing.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-inner">
              <Bell className="mr-2 inline h-4 w-4" />
              Alert preferences: opt in/out of SMS or email anytime from your profile or by contacting support.
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Requests & questions</h2>
              <p className="text-sm text-slate-700">Need to export, correct, or delete your data? Reach out and we&apos;ll respond within 3 business days.</p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5"
            >
              Contact support
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
