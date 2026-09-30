"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Phone, User, Bell, CircleHelp, Menu, X, LogOut, Heart, CreditCard, Sparkles } from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { BrandLogo } from "@/components/common/BrandLogo";

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
    const checkAuth = () => {
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
      setIsAuthed(!!token);
    };
    checkAuth();
    setMounted(true);

    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth-change", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-change", checkAuth);
    };
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
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-850 dark:bg-slate-950/95 transition-colors duration-150" onMouseLeave={closeMenu}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 flex-nowrap">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <BrandLogo size="md" />
        </div>

        <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200 md:flex flex-nowrap overflow-x-auto no-scrollbar">
          {navMenus.map((item) => (
            <button
              key={item.key}
              onClick={() => openMenu(item.key)}
              onMouseEnter={() => setActiveMenu(item.key)}
              onFocus={() => setActiveMenu(item.key)}
              className={`whitespace-nowrap rounded-full px-3 py-2 transition ${activeMenu === item.key ? "bg-slate-100 text-slate-900 shadow-inner dark:bg-slate-850 dark:text-white" : "hover:bg-slate-100 dark:hover:bg-slate-850"}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="relative flex items-center gap-2 flex-nowrap" ref={userMenuRef}>
          <Link
            href={isAuthed ? "/propertyListing" : "/login?redirect=/propertyListing"}
            className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 sm:flex whitespace-nowrap"
          >
            Post property <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">FREE</span>
          </Link>
          <Link
            href={isAuthed ? "/pricing" : "/login?redirect=/pricing"}
            className="hidden items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 sm:flex whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            Plans & Pricing
          </Link>
          <Link
            href="/about"
            className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:flex whitespace-nowrap"
          >
            About
          </Link>
          <Link
            href="/favorites"
            className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-rose-200 hover:text-rose-600 active:scale-95 dark:border-slate-800 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:text-rose-400"
            title="Liked properties"
            aria-label="Liked properties"
          >
            <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {isAuthed ? (
            <button
              type="button"
              onClick={handleUserClick}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-white shadow-sm transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-100 dark:text-slate-950"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUserClick}
              className="flex flex-shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <User className="h-4 w-4" />
              Login
            </button>
          )}
          <button
            type="button"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 dark:border-slate-800 dark:text-slate-300 sm:hidden"
            onClick={toggleMobile}
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {isAuthed && userMenuOpen && (
            <div className="absolute right-0 top-14 z-50 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => {
                  router.push("/dashboard");
                  setUserMenuOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push("/pricing");
                  setUserMenuOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span>Pricing & Plans</span>
                <CreditCard className="h-4 w-4 text-rose-600" />
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push("/favorites");
                  setUserMenuOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span>Liked properties</span>
                <Heart className="h-4 w-4 text-rose-500" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                Logout <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu sheet */}
      {mounted &&
        mobileOpen &&
        createPortal(
          <div className="fixed inset-0 z-[80] bg-slate-900/70 backdrop-blur-sm sm:hidden" onClick={toggleMobile}>
            <div
              className="absolute left-0 top-0 flex h-full w-72 max-w-full flex-col overflow-y-auto bg-white p-4 shadow-2xl dark:bg-slate-950 dark:border-r dark:border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <BrandLogo size="sm" />
                <div className="flex items-center gap-2">
                  <ThemeToggle compact />
                  <button type="button" onClick={toggleMobile} className="rounded-full p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close menu">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-sm font-semibold text-slate-900 dark:text-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    handleUserClick();
                    toggleMobile();
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left shadow-sm hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                >
                  <span>{isAuthed ? "Go to dashboard" : "Login / Signup"}</span>
                  <User className="h-4 w-4" />
                </button>

                <Link
                  href="/favorites"
                  onClick={toggleMobile}
                  className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2 text-rose-700 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
                >
                  <span>Liked properties</span>
                  <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                </Link>

                <Link
                  href={isAuthed ? "/propertyListing" : "/login?redirect=/propertyListing"}
                  onClick={toggleMobile}
                  className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                  <span>Post property</span>
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">FREE</span>
                </Link>

                <Link
                  href={isAuthed ? "/pricing" : "/login?redirect=/pricing"}
                  onClick={toggleMobile}
                  className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2 text-rose-700 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
                >
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-rose-600" />
                    Plans & Pricing
                  </span>
                  <span className="text-xs font-bold text-rose-600">Buy</span>
                </Link>

                <div className="space-y-2 rounded-xl border border-slate-200 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Browse</p>
                  <Link href="/propertySearch" onClick={toggleMobile} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800">
                    Search properties
                  </Link>
                  <Link href="/price-trends" onClick={toggleMobile} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800">
                    Price trends
                  </Link>
                  <Link href="/policies" onClick={toggleMobile} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800">
                    Policies & safety
                  </Link>
                </div>

              <div className="space-y-2 rounded-xl border border-slate-200 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Company</p>
                <Link href="/about" onClick={toggleMobile} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800">
                  About CityHaven
                </Link>
                <Link href="/contact" onClick={toggleMobile} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800">
                  Contact & support
                </Link>
                <Link href="/privacy" onClick={toggleMobile} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800">
                  Privacy
                </Link>
                <Link href="/terms" onClick={toggleMobile} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800">
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              )}

              <div className="pt-2 text-xs font-normal text-slate-600 dark:text-slate-400">
                Call us at <span className="font-semibold text-slate-900 dark:text-white">1800 41 99099</span> (9AM-11PM IST)
              </div>
            </div>
          </div>
          </div>,
          document.body,
        )}

      {activeConfig && (
        <div className="absolute left-1/2 z-20 w-full max-w-5xl -translate-x-1/2 px-4">
          <div
            className="mt-2 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/50 md:grid-cols-[1fr_1fr_0.8fr]"
            onMouseLeave={closeMenu}
          >
            <div className="space-y-4">
              {activeConfig.sections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{section.title}</p>
                  <div className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
                    {section.items.map((item) => (
                      <a key={item} href="#" className="transition hover:text-red-500">
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
              {!activeConfig.sections.length && (
                <p className="text-sm text-slate-600 dark:text-slate-400">Explore deep insights, trends, and reviews to decide faster.</p>
              )}
              <div className="pt-2 text-xs text-slate-500">
                contact us toll free on <span className="font-semibold text-slate-900 dark:text-white">1800 41 99099</span> (9AM-11PM IST)
              </div>
            </div>

            <div className="space-y-3 border-l border-slate-100 pl-4 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Top cities</p>
              <div className="grid gap-2 text-sm text-slate-700 dark:text-slate-300">
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

            <div className="rounded-2xl border border-slate-100 bg-sky-50 p-4 shadow-inner dark:border-slate-800 dark:bg-slate-800/80">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">Insights</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Understand localities better</h4>
              <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-300">
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
