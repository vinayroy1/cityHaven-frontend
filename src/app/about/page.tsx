import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonical } from "@/constants/seo";
import {
  ShieldCheck,
  Sparkles,
  Users,
  Building2,
  Leaf,
  Compass,
  ArrowLeft,
  Lock,
  HeartHandshake,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowRight,
} from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";

export const metadata: Metadata = {
  title: "About CityHaven - Smarter Real Estate Discovery",
  description: "Learn how CityHaven blends verified listings, human guidance, and locality insights for faster, safer moves.",
  alternates: { canonical: buildCanonical("/about") },
  openGraph: {
    title: "About CityHaven - Smarter Real Estate Discovery",
    description: "Learn how CityHaven blends verified listings, human guidance, and locality insights for faster, safer moves.",
    url: buildCanonical("/about"),
    type: "website",
  },
};

const stats = [
  { value: "50K+", label: "Verified Homes", hint: "Vetted on ground", icon: ShieldCheck, color: "text-emerald-500" },
  { value: "120K+", label: "Happy Movers", hint: "Found their haven", icon: Users, color: "text-rose-500" },
  { value: "15+", label: "Major Cities", hint: "Across India", icon: Building2, color: "text-amber-500" },
  { value: "4.9★", label: "Trust Score", hint: "From direct owners & tenants", icon: Award, color: "text-sky-500" },
];

const pillars = [
  {
    title: "Trust-First Listings",
    description: "Every property is vetted with rigorous verification, fraud checks, and host guidance so you can connect with 100% confidence.",
    icon: ShieldCheck,
    badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/80",
    gradient: "from-emerald-500/10 to-transparent",
  },
  {
    title: "Human Guidance 7 Days",
    description: "From micro-market insights to instant visit coordination, our dedicated support team is on standby via chat and phone whenever you need.",
    icon: Users,
    badgeBg: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800/80",
    gradient: "from-rose-500/10 to-transparent",
  },
  {
    title: "City-Grade Discovery",
    description: "Search by neighborhood vibe, transit connectivity, price trends, and locality heatmaps tailored specifically for Indian cities.",
    icon: Compass,
    badgeBg: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800/80",
    gradient: "from-sky-500/10 to-transparent",
  },
];

const milestones = [
  {
    year: "2021",
    title: "CityHaven Begins",
    body: "Launched with curated direct-owner rentals and a mission to eliminate fake listings and middleman friction.",
  },
  {
    year: "2022",
    title: "Verified Network",
    body: "Scaled to 8 metro regions, introducing automated ID verification, verified photo badges, and zero-spam protocols.",
  },
  {
    year: "2023",
    title: "Full-Stack Intelligence",
    body: "Rolled out micro-market price trends, locality guides, and unified single-OTP instant access across web and app.",
  },
  {
    year: "2024",
    title: "Commercial & Organization Portfolios",
    body: "Empowered brokerages, landlords, and corporate tenants with enterprise team workspaces and instant contact credits.",
  },
];

const commitments = [
  {
    title: "Upfront Pricing & Zero Hidden Fees",
    desc: "Complete transparency on maintenance, deposits, amenities, and brokerage so there are no surprises on move-in day.",
    icon: TrendingUp,
  },
  {
    title: "Privacy by Design",
    desc: "Minimal required data, encrypted phone numbers, and strict zero-resale guarantees protect your personal information.",
    icon: Lock,
  },
  {
    title: "Inclusive & Respectful Housing",
    desc: "A warm, bias-free ecosystem catering to diverse families, bachelor professionals, students, and senior citizens.",
    icon: HeartHandshake,
  },
  {
    title: "Sustainable & Green Living",
    desc: "Prioritizing energy efficiency, transit proximity, and eco-friendly societies to champion cleaner urban living.",
    icon: Leaf,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="relative flex-1 overflow-hidden bg-gradient-to-b from-rose-50/60 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Subtle Ambient Glow Elements */}
        <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-rose-500/10 blur-[120px] dark:bg-rose-500/5" />
        <div className="pointer-events-none absolute -right-40 top-48 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/5" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/homePage"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Hero Section */}
          <section className="grid gap-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none sm:p-8 md:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-rose-50/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-400">
                <Sparkles className="h-3.5 w-3.5" />
                About CityHaven
              </span>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl leading-[1.15]">
                Homes that feel right. <br />
                <span className="bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-600 bg-clip-text text-transparent dark:from-rose-400 dark:via-amber-300 dark:to-emerald-400">
                  Data that feels clear.
                </span>
              </h1>

              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed sm:text-lg">
                CityHaven combines verified property inventory with direct owner connections and transparent locality intelligence so you make confident housing decisions without guesswork or spam.
              </p>

              <div className="pt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-xs font-bold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Leaf className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Transit-friendly & green picks</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-100/60 px-4 py-3 text-xs font-bold text-slate-800 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-200">
                  <Building2 className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>Verified direct owner inventory</span>
                </div>
              </div>
            </div>

            {/* Hero Interactive Stats Card */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 text-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-rose-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl" />

              <div className="relative space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Our Reach & Trust</p>
                  <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                    Setting a new benchmark for real estate discovery
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {stats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition hover:bg-white/10"
                    >
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                      <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                      <p className="text-xs font-bold text-slate-200">{item.label}</p>
                      <p className="text-[11px] text-slate-400">{item.hint}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-300">
                  {["Instant OTP Access", "Direct Owner Connect", "Micro-market Analytics", "Zero Brokerage Picks"].map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-200"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Three Core Pillars */}
          <section className="space-y-4">
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">What Drives Us</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Built from the ground up for transparency
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {pillars.map(({ title, description, icon: Icon, badgeBg, gradient }) => (
                <div
                  key={title}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900/90`}
                >
                  <div className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${gradient}`} />
                  <div className="relative space-y-3">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${badgeBg} shadow-inner`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Milestones and Commitments Grid */}
          <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            {/* Milestones Journey */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/90 sm:p-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">Our Journey</p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl">
                  Milestones that define us
                </h2>

                <div className="mt-6 space-y-4">
                  {milestones.map((item, idx) => (
                    <div
                      key={item.year}
                      className="group relative flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-slate-100/80 dark:border-slate-800/80 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white font-black text-xs text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-400 border border-slate-200/80 dark:border-slate-700">
                        {item.year}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Core Commitments */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/90 sm:p-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Our Values</p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl">
                  Principles we never compromise on
                </h2>

                <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {commitments.map((c) => (
                    <div
                      key={c.title}
                      className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-slate-100/80 dark:border-slate-800/80 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                    >
                      <div className="space-y-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                          <c.icon className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{c.title}</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action Bar */}
          <section className="relative overflow-hidden rounded-3xl border border-rose-200/60 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 p-8 text-white shadow-xl dark:border-rose-900/40 sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
              <div className="max-w-xl space-y-2">
                <h2 className="text-2xl font-black sm:text-3xl text-white">Ready to find your next haven?</h2>
                <p className="text-sm text-white/90">
                  Explore thousands of verified homes with direct owner contacts or list your own property for free.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/propertySearch"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-slate-900 shadow-md transition hover:bg-slate-100 hover:scale-105"
                >
                  <span>Search Properties</span>
                  <ArrowRight className="h-4 w-4 text-rose-600" />
                </Link>
                <Link
                  href="/propertyListing"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  <span>Post a Property</span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}


