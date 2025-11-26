import React from "react";
import Link from "next/link";
import { Calendar, MapPin, User, Search, Home, Briefcase } from "lucide-react";

export function HeroSearch() {
  return (
    <section className="relative mx-auto mt-10 max-w-6xl px-6">
      <div className="absolute inset-x-8 -top-10 h-40 rounded-[28px] bg-gradient-to-r from-rose-500/25 via-amber-400/20 to-emerald-400/25 blur-3xl" aria-hidden />
      <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/90 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.6)] backdrop-blur">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 25%, rgba(244,63,94,0.12), transparent 28%), radial-gradient(circle at 80% 8%, rgba(248,113,113,0.18), transparent 24%), radial-gradient(circle at 82% 86%, rgba(16,185,129,0.14), transparent 26%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 px-4 py-5 md:px-6">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
            {[
              { label: "Buy", icon: <Home className="h-4 w-4 text-red-500" /> },
              { label: "Rent", icon: <Home className="h-4 w-4 text-emerald-500" /> },
              { label: "PG/Co-living", icon: <User className="h-4 w-4 text-sky-500" /> },
              { label: "Commercial", icon: <Briefcase className="h-4 w-4 text-amber-500" /> },
            ].map((tab, idx) => (
              <button
                key={tab.label}
                className={`flex items-center gap-2 rounded-full px-3 py-2 transition ${idx === 0 ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" : "hover:bg-slate-100"}`}
                type="button"
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center">
            <label className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-3 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5 hover:border-rose-200">
              <MapPin className="h-4 w-4 text-slate-500" />
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search locality, project or builder" />
            </label>
            <label className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-3 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5 hover:border-rose-200">
              <Calendar className="h-4 w-4 text-slate-500" />
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Possession or move-in" />
            </label>
            <select className="rounded-full border border-slate-200/80 bg-white/70 px-4 py-3 text-sm shadow-[0_15px_35px_-25px_rgba(15,23,42,0.4)] outline-none transition hover:-translate-y-0.5 hover:border-rose-200">
              <option>Budget</option>
              <option>₹20L - ₹50L</option>
              <option>₹50L - ₹1Cr</option>
              <option>₹1Cr - ₹2Cr</option>
              <option>₹2Cr+</option>
            </select>
            <select className="rounded-full border border-slate-200/80 bg-white/70 px-4 py-3 text-sm shadow-[0_15px_35px_-25px_rgba(15,23,42,0.4)] outline-none transition hover:-translate-y-0.5 hover:border-rose-200">
              <option>BHK</option>
              <option>1 BHK</option>
              <option>2 BHK</option>
              <option>3 BHK</option>
              <option>4+ BHK</option>
            </select>
            <Link
              href="/propertySearch"
              className="flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_-20px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-22px_rgba(15,23,42,0.6)]"
            >
              <Search className="h-4 w-4" /> Search
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
