"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, Globe, Phone, User, Bell, CircleHelp } from "lucide-react";

const navMenus = [
  {
    key: "buyers",
    label: "For Buyers",
    sections: [
      { title: "Buy a home", items: ["Ready to move", "New launch projects", "Owner properties", "Budget homes"] },
      { title: "Commercial", items: ["Office space", "Retail / Shops", "Co-working"] },
      { title: "Insights", items: ["Price trends", "Locality reviews", "Tools & calculators"] },
      { title: "Articles & News", items: ["Market news", "Expert advice", "How to buy"] },
    ],
    cities: ["Property in Delhi / NCR", "Property in Mumbai", "Property in Bangalore", "Property in Pune", "Property in Hyderabad", "Property in Kolkata"],
  },
  {
    key: "tenants",
    label: "For Tenants",
    sections: [
      { title: "Rent a home", items: ["Apartments for rent", "PG / Co-living", "Furnished rentals"] },
      { title: "Commercial", items: ["Office for lease", "Retail for lease"] },
      { title: "Articles & News", items: ["Moving tips", "Rental agreements"] },
    ],
    cities: [
      "Property for rent in Delhi / NCR",
      "Property for rent in Mumbai",
      "Property for rent in Bangalore",
      "Property for rent in Chennai",
      "Property for rent in Hyderabad",
      "Property for rent in Ahmedabad",
    ],
  },
  {
    key: "owners",
    label: "For Owners",
    sections: [
      { title: "Owner offerings", items: ["Post property FREE", "Owner services", "View responses"] },
      { title: "Insights", items: ["Tenant demand heatmap", "Price guide"] },
      { title: "Articles & News", items: ["Selling tips", "Renovation ideas"] },
    ],
    cities: [],
  },
  {
    key: "dealers",
    label: "For Dealers / Builders",
    sections: [
      { title: "Dealer offerings", items: ["Post property", "Dealer services", "Lead center"] },
      { title: "Research & advice", items: ["Market demand", "Locality reports"] },
    ],
    cities: [],
  },
  { key: "insights", label: "Insights", sections: [], cities: [] },
];

export function HeaderNav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const openMenu = (key: string) => setActiveMenu((prev) => (prev === key ? null : key));
  const closeMenu = () => setActiveMenu(null);

  const activeConfig = navMenus.find((m) => m.key === activeMenu);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 flex-nowrap">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Link href="/homePage" className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-200">CH</span>
            <span className="tracking-tight">CityHaven</span>
          </Link>
          <Link
            href="/propertySearch"
            className="hidden items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 sm:flex whitespace-nowrap"
          >
            All India <ChevronDown className="h-4 w-4" />
          </Link>
        </div>

        <nav
          className="hidden items-center gap-1 text-sm font-semibold text-slate-800 md:flex flex-nowrap overflow-x-auto no-scrollbar"
          onMouseLeave={closeMenu}
        >
          {navMenus.map((item) => (
            <button
              key={item.key}
              onClick={() => openMenu(item.key)}
              onMouseEnter={() => setActiveMenu(item.key)}
              onFocus={() => setActiveMenu(item.key)}
              className={`whitespace-nowrap rounded-full px-3 py-2 transition ${activeMenu === item.key ? "bg-slate-100 text-slate-900 shadow-inner" : "hover:bg-slate-100"}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 flex-nowrap">
          <Link
            href="/propertyListing"
            className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 sm:flex whitespace-nowrap"
          >
            Post property <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">FREE</span>
          </Link>
          <Link
            href="/contact"
            className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 sm:flex"
          >
            <Phone className="h-5 w-5" />
          </Link>
          <Link
            href="/dashboard"
            className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 sm:flex"
          >
            <Bell className="h-5 w-5" />
          </Link>
          <Link
            href="/contact"
            className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 sm:flex"
          >
            <CircleHelp className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-white shadow-sm transition hover:-translate-y-0.5"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href="/homePage"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 sm:hidden"
          >
            <Globe className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {activeConfig && (
        <div className="absolute left-1/2 z-20 w-full max-w-5xl -translate-x-1/2 px-4">
          <div
            className="mt-2 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/60 md:grid-cols-[1fr_1fr_0.8fr]"
            onMouseLeave={closeMenu}
          >
            <div className="space-y-4">
              {activeConfig.sections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">{section.title}</p>
                  <div className="flex flex-col gap-1 text-sm text-slate-700">
                    {section.items.map((item) => (
                      <a key={item} href="#" className="transition hover:text-red-500">
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
              {!activeConfig.sections.length && (
                <p className="text-sm text-slate-600">Explore deep insights, trends, and reviews to decide faster.</p>
              )}
              <div className="pt-2 text-xs text-slate-500">
                contact us toll free on <span className="font-semibold text-slate-900">1800 41 99099</span> (9AM-11PM IST)
              </div>
            </div>

            <div className="space-y-3 border-l border-slate-100 pl-4">
              <p className="text-sm font-semibold text-slate-900">Top cities</p>
              <div className="grid gap-2 text-sm text-slate-700">
                {(activeConfig.cities.length ? activeConfig.cities : ["Property in Delhi / NCR", "Property in Mumbai", "Property in Bangalore", "Property in Pune"]).map(
                  (city) => (
                    <a key={city} href="#" className="transition hover:text-red-500">
                      {city}
                    </a>
                  ),
                )}
              </div>
              <div className="pt-2 text-xs text-slate-500">
                Email us at <span className="font-semibold">services@cityhaven.com</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-sky-50 p-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Insights</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-900">Understand localities better</h4>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                <li>✔ Read resident reviews</li>
                <li>✔ Check price trends</li>
                <li>✔ Tools, utilities & more</li>
              </ul>
              <button className="mt-3 inline-flex items-center rounded-full bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5">
                Explore insights
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
