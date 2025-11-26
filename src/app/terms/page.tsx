import React from "react";
import Link from "next/link";
import { ShieldCheck, Scale, Clock, FileCheck } from "lucide-react";

const sections = [
  {
    title: "Using CityHaven",
    points: [
      "Create an account with accurate information; keep your login secure.",
      "Use OTP sign-in only for yourself—no sharing or reselling of access.",
      "Respect local laws and building rules when visiting or booking a property.",
    ],
  },
  {
    title: "Listings & bookings",
    points: [
      "All prices, availability, and offers are subject to verification and change.",
      "Bookings may require identity verification; false submissions can be declined.",
      "Refund and cancellation policies are defined per listing; review before you confirm.",
    ],
  },
  {
    title: "Conduct & safety",
    points: [
      "Be respectful of hosts, neighbors, and communities during visits or stays.",
      "No harassment, discrimination, or misuse of property information.",
      "Report safety or fraud concerns immediately via Contact or Safety Centre.",
    ],
  },
  {
    title: "Intellectual property",
    points: [
      "Logos, copy, and photos are owned by CityHaven or respective partners.",
      "Do not scrape, clone, or republish listings or analytics without permission.",
      "Brand assets can be used only with a written approval.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.5)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
            <ShieldCheck className="h-4 w-4" /> Terms & Conditions
          </div>
          <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">Simple rules for a trusted marketplace.</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-700">
            These terms outline how you use CityHaven, interact with listings, and stay compliant with hosts and local regulations. For any clarification, contact our support team.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-700">
            {["Transparent policies", "Safety-first", "Respectful community"].map((chip) => (
              <span key={chip} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 shadow-inner">
                {chip}
              </span>
            ))}
          </div>
        </header>

        <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur md:grid-cols-2">
          {sections.map((section) => (
            <details key={section.title} className="group rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-100" open>
              <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-900">
                {section.title}
                <span className="text-xs text-rose-500">View</span>
              </summary>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {section.points.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Cancellations & refunds</h2>
            <p className="text-sm text-slate-700">
              Refunds, timelines, and deductions are governed by each listing&apos;s policy. Check the cancellation badge on the listing card and confirm before booking.
            </p>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-inner">
              <Clock className="mr-2 inline h-4 w-4" />
              Most refunds initiate within 5-7 business days after approval.
            </div>
            <p className="text-sm text-slate-700">
              If a host cancels, you receive a full refund and priority rebooking support. For disputes, reach out with visit proofs or communication logs.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              <FileCheck className="h-4 w-4" /> Quick references
            </div>
            <ul className="space-y-2 text-sm text-white/85">
              <li>• Submit KYC only within CityHaven flows.</li>
              <li>• Keep payment proofs until move-in is confirmed.</li>
              <li>• Report fraud or safety issues immediately.</li>
              <li>• Use official support channels—avoid third-party links.</li>
            </ul>
            <Link
              href="/contact"
              className="inline-flex w-fit items-center justify-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/30 transition hover:-translate-y-0.5"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
