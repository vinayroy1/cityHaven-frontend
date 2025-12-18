"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Phone, User, Bell, CircleHelp, Menu, X, LogOut } from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const loginHref = `/login?redirect=${encodeURIComponent(pathname || "/homePage")}`;

  const openMenu = (key: string) => setActiveMenu((prev) => (prev === key ? null : key));
  const closeMenu = () => setActiveMenu(null);
  const toggleMobile = () => setMobileOpen((prev) => !prev);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
    setIsAuthed(!!token);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleUserClick = () => {
    if (isAuthed) {
      setUserMenuOpen((prev) => !prev);
    } else {
      router.push(loginHref);
    }
  };

  const activeConfig = navMenus.find((m) => m.key === activeMenu);

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.USER_KEY);
    setIsAuthed(false);
    setUserMenuOpen(false);
    router.push("/homePage");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur" onMouseLeave={closeMenu}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 flex-nowrap">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Link href="/homePage" className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-200">CH</span>
            <span className="tracking-tight">CityHaven</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-800 md:flex flex-nowrap overflow-x-auto no-scrollbar">
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

        <div className="relative flex items-center gap-2 flex-nowrap" ref={userMenuRef}>
          <Link
            href="/propertyListing"
            className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 sm:flex whitespace-nowrap"
          >
            Post property <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">FREE</span>
          </Link>
          <Link
            href="/about"
            className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 sm:flex whitespace-nowrap"
          >
            About
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
          {isAuthed ? (
            <button
              type="button"
              onClick={handleUserClick}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-white shadow-sm transition hover:-translate-y-0.5"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUserClick}
              className="flex flex-shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5"
            >
              <User className="h-4 w-4" />
              Login
            </button>
          )}
          <button
            type="button"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 sm:hidden"
            onClick={toggleMobile}
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {isAuthed && userMenuOpen && (
            <div className="absolute right-0 top-14 z-50 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
              <button
                type="button"
                onClick={() => {
                  router.push("/dashboard");
                  setUserMenuOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
              >
                Logout <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User intent chooser (buyer/seller) */}
      {/* Mobile menu sheet */}
      {mounted &&
        mobileOpen &&
        createPortal(
          <div className="fixed inset-0 z-[80] bg-slate-900/70 backdrop-blur-sm sm:hidden" onClick={toggleMobile}>
            <div
              className="absolute left-0 top-0 flex h-full w-72 max-w-full flex-col overflow-y-auto bg-white p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow">CH</span>
                  <span className="text-base font-semibold text-slate-900">CityHaven</span>
                </div>
                <button type="button" onClick={toggleMobile} className="rounded-full p-2 text-slate-600 hover:bg-slate-100" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm font-semibold text-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    handleUserClick();
                    toggleMobile();
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left shadow-sm hover:border-slate-300"
                >
                  <span>{isAuthed ? "Go to dashboard" : "Login / Signup"}</span>
                  <User className="h-4 w-4" />
                </button>

                <Link
                  href="/propertyListing"
                  onClick={toggleMobile}
                  className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700 shadow-sm"
                >
                  <span>Post property</span>
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">FREE</span>
                </Link>

                <div className="space-y-2 rounded-xl border border-slate-200 p-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Browse</p>
                  <Link href="/propertySearch" onClick={toggleMobile} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50">
                    Search properties
                  </Link>
                  <Link href="/price-trends" onClick={toggleMobile} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50">
                    Price trends
                  </Link>
                  <Link href="/policies" onClick={toggleMobile} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50">
                    Policies & safety
                  </Link>
                </div>

              <div className="space-y-2 rounded-xl border border-slate-200 p-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Company</p>
                <Link href="/about" onClick={toggleMobile} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50">
                  About CityHaven
                </Link>
                <Link href="/contact" onClick={toggleMobile} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50">
                  Contact & support
                </Link>
                <Link href="/privacy" onClick={toggleMobile} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50">
                  Privacy
                </Link>
                <Link href="/terms" onClick={toggleMobile} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50">
                  Terms
                </Link>
              </div>

              {isAuthed && (
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    toggleMobile();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              )}

              <div className="pt-2 text-xs font-normal text-slate-600">
                Call us at <span className="font-semibold text-slate-900">1800 41 99099</span> (9AM-11PM IST)
              </div>
            </div>
          </div>
          </div>,
          document.body,
        )}

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
