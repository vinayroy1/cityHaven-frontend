import React from "react";
import { Calendar, MapPin, User, Search, Home, Briefcase } from "lucide-react";

export function HeroSearch() {
  return (
    <section className="mx-auto mt-6 max-w-6xl px-6">
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-lg">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
          {[
            { label: "Buy", icon: <Home className="h-4 w-4 text-red-500" /> },
            { label: "Rent", icon: <Home className="h-4 w-4 text-emerald-500" /> },
            { label: "PG/Co-living", icon: <User className="h-4 w-4 text-sky-500" /> },
            { label: "Commercial", icon: <Briefcase className="h-4 w-4 text-amber-500" /> },
          ].map((tab, idx) => (
            <button
              key={tab.label}
              className={`flex items-center gap-2 rounded-full px-3 py-2 transition ${idx === 0 ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100"}`}
              type="button"
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="grid gap-3 px-4 py-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center">
          <label className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-3 shadow-sm transition hover:border-slate-300">
            <MapPin className="h-4 w-4 text-slate-500" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Search locality, project or builder" />
          </label>
          <label className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-3 shadow-sm transition hover:border-slate-300">
            <Calendar className="h-4 w-4 text-slate-500" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Possession or move-in" />
          </label>
          <select className="rounded-full border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none">
            <option>Budget</option>
            <option>₹20L - ₹50L</option>
            <option>₹50L - ₹1Cr</option>
            <option>₹1Cr - ₹2Cr</option>
            <option>₹2Cr+</option>
          </select>
          <select className="rounded-full border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none">
            <option>BHK</option>
            <option>1 BHK</option>
            <option>2 BHK</option>
            <option>3 BHK</option>
            <option>4+ BHK</option>
          </select>
          <button className="flex items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-red-200 transition hover:-translate-y-0.5">
            <Search className="h-4 w-4" /> Search
          </button>
        </div>
      </div>
    </section>
  );
}
