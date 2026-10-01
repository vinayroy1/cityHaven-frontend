"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CreditCard, Heart, LogOut, Menu, User, X } from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import { BrandLogo } from "@/components/common/BrandLogo";
import { ThemeToggle } from "@/components/common/ThemeToggle";

const searchLinks = [
  { label: "Buy", href: "/propertySearch?intent=BUY" },
  { label: "Rent", href: "/propertySearch?intent=RENT" },
  { label: "PG", href: "/propertySearch?intent=PG" },
  { label: "Commercial", href: "/propertySearch?intent=COMMERCIAL" },
  { label: "Plots", href: "/propertySearch?intent=PLOT" },
];

export function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const accountRef = React.useRef<HTMLDivElement | null>(null);
  const loginHref = `/login?redirect=${encodeURIComponent(pathname || "/homePage")}`;

  React.useEffect(() => {
    const checkAuth = () => setIsAuthed(Boolean(localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY)));
    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth-change", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);

  React.useEffect(() => {
    if (!accountOpen) return;
    const close = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [accountOpen]);

  const logout = () => {
    localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.USER_KEY);
    setIsAuthed(false);
    setAccountOpen(false);
    router.push("/homePage");
  };

  const accountItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Organization", href: "/dashboard/organization" },
    { label: "Plans & credits", href: "/pricing" },
    { label: "Saved properties", href: "/favorites" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <BrandLogo size="md" href="/homePage" />

        <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200 lg:flex">
          {searchLinks.map((link) => (
            <Link key={link.label} href={link.href} className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-rose-700 dark:hover:bg-slate-900 dark:hover:text-rose-300">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2" ref={accountRef}>
          <Link
            href={isAuthed ? "/propertyListing" : "/login?redirect=/propertyListing"}
            className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 sm:inline-flex dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            Post property
          </Link>
          <Link
            href={isAuthed ? "/pricing" : "/login?redirect=/pricing"}
            className="hidden items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 md:inline-flex dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <CreditCard className="h-4 w-4" />
            Plans
          </Link>
          <Link
            href="/favorites"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-rose-200 hover:text-rose-600 dark:border-slate-800 dark:text-slate-300"
            aria-label="Saved properties"
            title="Saved properties"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <ThemeToggle />
          {isAuthed ? (
            <button
              type="button"
              onClick={() => setAccountOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-white dark:border-slate-700 dark:bg-white dark:text-slate-950"
              aria-label="Account menu"
            >
              <User className="h-5 w-5" />
            </button>
          ) : (
            <Link
              href={loginHref}
              className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 sm:inline-flex dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              Login
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300 lg:hidden"
            aria-label="Open menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {accountOpen && (
            <div className="absolute right-4 top-14 z-50 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              {accountItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setAccountOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={logout}
                className="mt-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                Logout <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          <div className="mx-auto grid max-w-6xl gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            {searchLinks.map((link) => (
              <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-900">
                {link.label}
              </Link>
            ))}
            <Link href={isAuthed ? "/propertyListing" : "/login?redirect=/propertyListing"} onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30">
              Post property
            </Link>
            <Link href={isAuthed ? "/pricing" : "/login?redirect=/pricing"} onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30">
              Plans & credits
            </Link>
            {!isAuthed && (
              <Link href={loginHref} onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-900">
                Login / Signup
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
