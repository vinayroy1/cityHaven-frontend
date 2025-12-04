import React from "react";
import type { Metadata } from "next";
import { buildCanonical } from "@/constants/seo";
import { ShieldCheck, Sparkles, Users, Building2, Leaf, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "About CityHaven",
  description: "Learn how CityHaven blends verified listings, human guidance, and locality insights for faster, safer moves.",
  alternates: { canonical: buildCanonical("/about") },
  openGraph: {
    title: "About CityHaven",
    description: "Learn how CityHaven blends verified listings, human guidance, and locality insights for faster, safer moves.",
    url: buildCanonical("/about"),
    type: "website",
  },
};

const pillars = [
  { title: "Trust-first listings", description: "Every home is vetted with verification, safety checks, and host guidance so you can book with confidence.", icon: ShieldCheck },
  { title: "Human help, 7 days", description: "From quick matches to move-in support, our team is on standby via chat and phone.", icon: Users },
  { title: "City-grade discovery", description: "Search by vibe, transit, price trends, and community insights tailored to each neighborhood.", icon: Compass },
];

const milestones = [
  { year: "2021", title: "CityHaven begins", body: "Started with a handful of curated rentals and a mission to remove friction from city moves." },
  { year: "2022", title: "Trusted network", body: "Expanded to owner-first listings, dealer partners, and verified home services." },
  { year: "2023", title: "Full-stack journeys", body: "Introduced guided discovery, price tools, and a single OTP sign-in across web & app." },
];

const commitments = [
  "Upfront clarity on pricing, locality data, and nearby essentials.",
  "Privacy by design: minimal data, encrypted OTP, no resale of user info.",
  "Inclusive hosting that respects diverse families, students, and professionals.",
  "Greener stays: promoting energy checks, water-saving fixtures, and transit-friendly picks.",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-10 sm:px-8">
        <section className="grid gap-6 overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.5)] backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500/10 via-amber-400/10 to-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
              <Sparkles className="h-4 w-4" />
              About CityHaven
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Homes that feel right, data that feels clear.</h1>
            <p className="text-base text-slate-700">
              CityHaven blends verified listings with human guidance so you can choose faster, safer, and with zero hassle. We obsess over the small details—so you can focus on the move that matters.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-inner">
                <Leaf className="mr-2 inline h-4 w-4" />
                Greener, transit-friendly picks first
              </div>
              <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 shadow-inner">
                <Building2 className="mr-2 inline h-4 w-4 text-amber-500" />
                Curated partners & on-ground checks
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(248,113,113,0.2),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(248,180,0,0.14),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.14),transparent_30%)]" />
            <div className="relative space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Why we exist</p>
              <h2 className="text-2xl font-semibold leading-tight">Moving homes should feel empowering, not exhausting.</h2>
              <p className="text-sm text-white/80">
                From OTP login to neighborhood intelligence, we trim friction everywhere. Our team pairs data with local know-how, ensuring every listing is discoverable, transparent, and ready for you.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-white/80">
                {["Price trends", "Locality heatmaps", "Verified hosts", "Instant tours"].map((chip) => (
                  <span key={chip} className="rounded-full border border-white/20 px-3 py-1">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:grid-cols-3">
          {pillars.map(({ title, description, icon: Icon }) => (
            <div key={title} className="group rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 px-4 py-4 shadow-sm transition hover:-translate-y-1 hover:border-rose-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shadow-inner shadow-rose-100/80">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Milestones</p>
            <div className="space-y-3">
              {milestones.map((item) => (
                <div key={item.year} className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 shadow-inner shadow-slate-100/70">
                  <p className="text-xs font-semibold text-rose-600">{item.year}</p>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">What drives us</p>
            <div className="space-y-2">
              {commitments.map((c) => (
                <div key={c} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-sm text-slate-700">{c}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
