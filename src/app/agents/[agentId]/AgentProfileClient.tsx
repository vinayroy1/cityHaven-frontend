"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import type { Agent } from "@/data/agents";
import { saveVisitBooking } from "@/lib/services/visitBookings";
import { BookVisitModal } from "@/components/agents/BookVisitModal";
import { getAgentProfile } from "@/lib/services/agentProfile";

interface AgentProfileClientProps {
  agent: Agent;
  similarAgents: Agent[];
}

export function AgentProfileClient({ agent: initialAgent, similarAgents }: AgentProfileClientProps) {
  const [agent, setAgent] = useState<Agent>(initialAgent);

  React.useEffect(() => {
    try {
      const stored = getAgentProfile(initialAgent.id);
      if (stored) {
        setAgent({
          ...initialAgent,
          name: stored.name || initialAgent.name,
          role: stored.role || initialAgent.role,
          agency: stored.agency || initialAgent.agency,
          reraId: stored.reraId || initialAgent.reraId,
          avatar: stored.avatar || initialAgent.avatar,
          city: stored.city || initialAgent.city,
          area: stored.area || initialAgent.area,
          experience: `${stored.experienceYears}+ yrs`,
          phone: stored.phone || initialAgent.phone,
          email: stored.email || initialAgent.email,
          services: stored.services?.length ? stored.services : initialAgent.services,
          languages: stored.languages?.length ? stored.languages : initialAgent.languages,
          bio: stored.bio || initialAgent.bio,
        });
      }
    } catch {
      // fallback to initialAgent
    }
  }, [initialAgent]);

  // Site visit booking form state
  const [tourDay, setTourDay] = useState("This Weekend");
  const [tourSlot, setTourSlot] = useState("Afternoon (1 PM - 4 PM)");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectedPropertyModal, setSelectedPropertyModal] = useState<string | undefined>(undefined);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientPhone.trim()) return;

    saveVisitBooking({
      agentId: agent.id,
      agentName: agent.name,
      agentRole: agent.role,
      agentAvatar: agent.avatar,
      visitorName: clientName.trim() || "Prospective Buyer",
      visitorPhone: clientPhone.trim(),
      tourDay,
      tourSlot,
      propertyTitle: selectedPropertyModal || agent.focus,
      locality: agent.area,
      cityName: agent.city,
      notes: notes.trim() || undefined,
    });

    setSubmitted(true);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div>
      {/* Breadcrumbs Navigation */}
      <div className="border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 py-2.5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/homePage" className="hover:text-rose-600 transition">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <Link href="/agents" className="hover:text-rose-600 transition">
              Verified Advisors
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <Link href={`/agents?city=${encodeURIComponent(agent.city)}`} className="hover:text-rose-600 transition">
              {agent.city}
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-white truncate">
              {agent.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Cover Banner */}
      <div className="relative h-52 sm:h-72 w-full bg-slate-900 overflow-hidden">
        {agent.coverImage ? (
          <img
            src={agent.coverImage}
            alt={`${agent.name} real estate portfolio`}
            className="h-full w-full object-cover opacity-60 transition duration-700"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-r from-rose-950 via-slate-900 to-slate-950 opacity-80" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/50 to-transparent" />

        <div className="absolute top-4 left-4 sm:left-6 z-10 flex items-center gap-2">
          <Link
            href="/agents"
            className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/70"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to all advisors
          </Link>
        </div>

        <div className="absolute top-4 right-4 sm:right-6 z-10 flex items-center gap-2">
          <Link
            href="/dashboard/advisor-profile"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition border border-white/20"
          >
            <span>Edit Profile</span>
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/70"
          >
            <Share2 className="h-3.5 w-3.5" />
            {copiedLink ? "Link Copied!" : "Share Profile"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 -mt-20 sm:-mt-24 relative z-20 pb-16">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: 8 Cols */}
          <div className="lg:col-span-8 space-y-6">
            {/* Identity Card */}
            <article className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="relative shrink-0 self-start">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover ring-4 ring-white shadow-md dark:ring-slate-800"
                  />
                  <span
                    title="Online and available for in-person tours"
                    className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white">
                      {agent.name}
                    </h1>
                    <BadgeCheck className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      {agent.badge}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {agent.role} • <span className="text-slate-900 dark:text-white">{agent.agency}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      {agent.area}, {agent.city}
                    </span>
                    <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      RERA: {agent.reraId}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      Avg response: {agent.responseTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Government RERA Registered & Awasio Certified Advisor</span>
                  </div>
                </div>
              </div>

              {/* Performance Stats Matrix */}
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 text-center">
                <div className="rounded-xl bg-slate-50 py-3 dark:bg-slate-800/60">
                  <p className="text-base sm:text-xl font-extrabold text-slate-950 dark:text-white">
                    {agent.experience}
                  </p>
                  <p className="text-xs text-slate-500">Market Experience</p>
                </div>
                <div className="rounded-xl bg-slate-50 py-3 dark:bg-slate-800/60">
                  <p className="text-base sm:text-xl font-extrabold text-slate-950 dark:text-white">
                    {agent.tours}
                  </p>
                  <p className="text-xs text-slate-500">Private Walkthroughs</p>
                </div>
                <div className="rounded-xl bg-slate-50 py-3 dark:bg-slate-800/60">
                  <p className="text-base sm:text-xl font-extrabold text-slate-950 dark:text-white">
                    {agent.listingsCount}
                  </p>
                  <p className="text-xs text-slate-500">Active Properties</p>
                </div>
              </div>
            </article>

            {/* About & Verified Services */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                About {agent.name}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {agent.bio}
              </p>

              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Verified Local Advisory Services
                </h3>
                <div className="flex flex-wrap gap-2">
                  {agent.services.map((srv) => (
                    <span
                      key={srv}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-rose-600" />
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-6 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <span>Languages: <strong className="text-slate-800 dark:text-slate-200">{agent.languages.join(", ")}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span>Specialization: <strong className="text-slate-800 dark:text-slate-200">{agent.focus}</strong></span>
                </div>
              </div>
            </section>

            {/* Managed Properties Showcase */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    Properties Managed by {agent.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verified properties available for private site visits and direct negotiations
                  </p>
                </div>
                <Link
                  href={`/propertySearch?city=${encodeURIComponent(agent.city)}`}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
                >
                  View all in {agent.city} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {agent.featuredListings.map((prop) => (
                  <div
                    key={prop.id}
                    className="group rounded-xl border border-slate-200 overflow-hidden bg-white hover:border-rose-200 hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-40 w-full overflow-hidden bg-slate-200">
                        <img
                          src={prop.image}
                          alt={prop.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <span className="absolute top-2.5 left-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                          {prop.type} • {prop.beds} BHK
                        </span>
                      </div>
                      <div className="p-3.5 space-y-1.5">
                        <p className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                          {prop.price}
                        </p>
                        <h3 className="text-xs font-bold text-slate-950 dark:text-white truncate">
                          {prop.title}
                        </h3>
                        <p className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                          {prop.location}
                        </p>
                      </div>
                    </div>
                    <div className="p-3.5 pt-0">
                      <button
                        type="button"
                        onClick={() => setSelectedPropertyModal(prop.title)}
                        className="w-full rounded-lg bg-slate-100 py-1.5 text-xs font-semibold text-slate-800 hover:bg-rose-50 hover:text-rose-700 transition dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-rose-950/60 dark:hover:text-rose-300"
                      >
                        Request Walkthrough for This Property
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>



            {/* Similar Advisors (Internal Crawling Links for SEO) */}
            {similarAgents.length > 0 && (
              <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">
                    Other Verified Advisors in {agent.city}
                  </h2>
                  <Link href="/agents" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                    Explore all →
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {similarAgents.map((sim) => (
                    <Link
                      key={sim.id}
                      href={`/agents/${sim.id}`}
                      className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 hover:border-rose-200 hover:bg-white hover:shadow-sm transition dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={sim.avatar}
                          alt={sim.name}
                          className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-950 group-hover:text-rose-600 transition truncate dark:text-white">
                            {sim.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{sim.area}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px] dark:border-slate-800">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{sim.experience} exp</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          {sim.tours}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: 4 Cols Sticky Walkthrough Card & Contact */}
          <aside className="lg:col-span-4">
            <div className="sticky top-20 space-y-4">
              {/* Site Visit Booking Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Free In-Person Visit
                </div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                  Schedule Private Walkthrough
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Direct appointment with {agent.name}. Verified access, parking assistance, and price guidance.
                </p>

                {submitted ? (
                  <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/60 animate-in fade-in">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Walkthrough Requested!
                    </h4>
                    <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      {agent.name} has been notified and will call you on <strong>{clientPhone}</strong> to confirm the exact location for <strong>{tourDay}</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-3 text-[11px] font-semibold text-rose-600 underline"
                    >
                      Book another walkthrough
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="mt-4 space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Select Preferred Day
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {["Today", "Tomorrow", "This Weekend"].map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => setTourDay(day)}
                            className={`rounded-lg border py-1.5 text-center text-xs font-semibold transition ${
                              tourDay === day
                                ? "border-rose-600 bg-rose-50 text-rose-700 ring-1 ring-rose-500 dark:bg-rose-950/60 dark:text-rose-300"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Preferred Slot
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        {[
                          { label: "Morning", time: "10 AM" },
                          { label: "Afternoon", time: "1 PM" },
                          { label: "Evening", time: "4 PM" },
                        ].map((slot) => {
                          const val = `${slot.label} (${slot.time})`;
                          const sel = tourSlot === val;
                          return (
                            <button
                              key={slot.label}
                              type="button"
                              onClick={() => setTourSlot(val)}
                              className={`rounded-lg border py-1.5 text-xs font-semibold transition ${
                                sel
                                  ? "border-rose-600 bg-rose-50 text-rose-700 ring-1 ring-rose-500 dark:bg-rose-950/60 dark:text-rose-300"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              <div>{slot.label}</div>
                              <span className="text-[10px] text-slate-400">{slot.time}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Specific Requirements (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Looking for 3 BHK park-facing floor with lift..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-[0.98] transition"
                    >
                      Request Walkthrough
                    </button>
                  </form>
                )}
              </div>

              {/* Direct Calling Quick Widget */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
                <p className="text-xs font-bold text-slate-950 dark:text-white">
                  Need Immediate Assistance?
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Call or WhatsApp {agent.name} directly for on-ground enquiries or immediate property viewings.
                </p>
                <div className="pt-2 flex gap-2">
                  <a
                    href={`tel:${agent.phone.replace(/\s+/g, "")}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-800 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-rose-500" />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${agent.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Hi ${agent.name}, I found your profile on Awasio and would like to inquire about properties in ${agent.area}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Property-specific Book Visit Modal */}
      <BookVisitModal
        agent={agent}
        isOpen={!!selectedPropertyModal}
        onClose={() => setSelectedPropertyModal(undefined)}
        propertyTitle={selectedPropertyModal}
      />
    </div>
  );
}
