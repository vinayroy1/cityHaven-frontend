"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
  CreditCard,
  Heart,
  Home,
  Key,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  PlusCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import { BrandLogo } from "@/components/common/BrandLogo";
import { ThemeToggle } from "@/components/common/ThemeToggle";

interface UserProfile {
  name?: string;
  email?: string;
  mobileNumber?: string;
  role?: string;
}

const searchLinks = [
  { label: "Buy", href: "/propertySearch?intent=BUY", icon: Home },
  { label: "Rent", href: "/propertySearch?intent=RENT", icon: Key },
  { label: "Commercial", href: "/propertySearch?intent=COMMERCIAL", icon: Building2 },
  { label: "Plots", href: "/propertySearch?intent=PLOT", icon: MapPin },
  { label: "Find Agents", href: "/agents", icon: Users },
];

export function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [currentSearch, setCurrentSearch] = React.useState("");
  const accountRef = React.useRef<HTMLDivElement | null>(null);

  const loginHref = `/login?redirect=${encodeURIComponent(pathname || "/")}`;

  // Check auth and user info on mount & events
  React.useEffect(() => {
    setMounted(true);
    setCurrentSearch(window.location.search);
    const checkAuth = () => {
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
      setIsAuthed(Boolean(token));
      try {
        const storedUser = localStorage.getItem(APP_CONFIG.AUTH.USER_KEY);
        if (storedUser) {
          setUserProfile(JSON.parse(storedUser));
        } else {
          setUserProfile(null);
        }
      } catch {
        setUserProfile(null);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth-change", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);

  // Handle scroll effect
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close account dropdown when clicking outside
  React.useEffect(() => {
    if (!accountOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountOpen]);

  // Prevent background scroll when mobile menu is active
  React.useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const logout = () => {
    localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.USER_KEY);
    setIsAuthed(false);
    setUserProfile(null);
    setAccountOpen(false);
    setMenuOpen(false);
    router.push("/");
  };

  // Keep active route indicator in sync with URL search params after navigation
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentSearch(window.location.search);
    }
  }, [pathname]);

  const isLinkActive = (href: string) => {
    if (href.includes("?")) {
      const [path, query] = href.split("?");
      if (!mounted) {
        return false;
      }
      return pathname === path && currentSearch.includes(query);
    }
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  };

  const accountMenuItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: null },
    { label: "My Properties", href: "/dashboard/properties", icon: Building2, badge: null },
    { label: "Organization", href: "/dashboard/organization", icon: ShieldCheck, badge: null },
    { label: "Plans & Credits", href: "/pricing", icon: CreditCard, badge: "PRO" },
    { label: "Saved Properties", href: "/favorites", icon: Heart, badge: null },
    { label: "Account Settings", href: "/dashboard/settings", icon: Settings, badge: null },
  ];

  const userDisplayName =
    userProfile?.name ||
    userProfile?.email?.split("@")[0] ||
    userProfile?.mobileNumber ||
    "Account";

  const userInitials =
    userProfile?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() ||
    userDisplayName[0]?.toUpperCase() ||
    "U";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-slate-200/80 bg-white/90 shadow-md shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90 dark:shadow-black/20"
          : "border-b border-slate-200/50 bg-white/75 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/75"
      }`}
    >
      {/* Ambient Top Subtle Gradient Accent */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 opacity-90" />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex shrink-0 items-center">
          <BrandLogo size="md" href="/" />
        </div>

        {/* Center Desktop Navigation */}
        <nav className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-slate-100/60 p-1 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-900/60 lg:flex">
          {searchLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                  active
                    ? "bg-white text-rose-600 shadow-xs dark:bg-slate-800 dark:text-rose-400"
                    : "text-slate-600 hover:text-slate-950 hover:bg-white/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side CTAs & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5" ref={accountRef}>
          {/* Post Property Glowing CTA */}
          <Link
            href={isAuthed ? "/propertyListing" : "/login?redirect=/propertyListing"}
            className="group relative hidden items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-[length:200%_auto] px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all duration-300 hover:bg-right hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0 sm:inline-flex"
          >
            <PlusCircle className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            <span>Post Property</span>
            <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-50 backdrop-blur-xs">
              Free
            </span>
          </Link>

          {/* Plans Pill Button */}
          <Link
            href={isAuthed ? "/pricing" : "/login?redirect=/pricing"}
            className="group hidden items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-sm transition-all duration-200 hover:border-amber-400/80 hover:bg-amber-50/50 hover:text-amber-700 md:inline-flex dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-amber-500/50 dark:hover:bg-amber-950/30 dark:hover:text-amber-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500 transition-transform group-hover:scale-110" />
            <span>Plans</span>
          </Link>

          {/* Saved Properties Heart Icon */}
          <Link
            href="/favorites"
            className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-600 shadow-2xs backdrop-blur-sm transition-all duration-200 hover:border-rose-300 hover:bg-rose-50/60 hover:text-rose-600 active:scale-95 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-rose-900/50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            aria-label="Saved properties"
            title="Saved properties"
          >
            <Heart className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Authenticated Account Menu or Login Button */}
          {isAuthed ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                className={`flex items-center gap-2 rounded-full border p-1 pr-2.5 transition-all duration-200 ${
                  accountOpen
                    ? "border-rose-400 bg-rose-50/70 shadow-xs dark:border-rose-800 dark:bg-rose-950/30"
                    : "border-slate-200/80 bg-white/80 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700"
                }`}
                aria-label="User Account Menu"
                aria-expanded={accountOpen}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 text-xs font-bold text-white shadow-2xs">
                  {userInitials}
                </div>
                <span className="hidden max-w-[80px] truncate text-xs font-semibold text-slate-800 sm:inline-block dark:text-slate-200">
                  {userDisplayName}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${
                    accountOpen ? "rotate-180 text-rose-600 dark:text-rose-400" : ""
                  }`}
                />
              </button>

              {/* Polished Account Dropdown */}
              {accountOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 max-w-[calc(100vw-24px)] origin-top-right animate-in fade-in zoom-in-95 rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl duration-150 dark:border-slate-800 dark:bg-slate-950/95">
                  {/* User Profile Header */}
                  <div className="rounded-xl bg-slate-50/80 p-3 dark:bg-slate-900/80">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 text-sm font-bold text-white shadow-xs">
                        {userInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {userDisplayName}
                        </p>
                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {userProfile?.email || userProfile?.mobileNumber || "Verified Member"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="mt-1.5 space-y-0.5">
                    {accountMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-850 dark:hover:text-white"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Divider & Logout */}
                  <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={loginHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-slate-900 shadow-2xs backdrop-blur-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 hover:shadow-xs dark:border-slate-700 dark:bg-slate-900/90 dark:text-white dark:hover:border-slate-600 dark:hover:bg-slate-800"
            >
              <User className="h-3.5 w-3.5" />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-700 shadow-2xs backdrop-blur-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      {menuOpen && (
        <>
          {/* Dark Backdrop Overlay */}
          <div
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-down Drawer Attached to Bottom of Header */}
          <div className="absolute left-0 right-0 top-full z-50 w-full border-b border-slate-200/90 bg-white shadow-2xl duration-200 animate-in fade-in slide-in-from-top-2 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
            <div className="max-h-[calc(100dvh-70px)] overflow-y-auto px-5 py-4">
              {/* Quick Action Cards in Mobile */}
              <div className="grid grid-cols-2 gap-2.5 pb-4">
                <Link
                  href={isAuthed ? "/propertyListing" : "/login?redirect=/propertyListing"}
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-col items-start justify-between rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-3.5 text-white shadow-md shadow-emerald-700/20"
                >
                  <PlusCircle className="mb-2 h-5 w-5" />
                  <div>
                    <span className="block text-xs font-bold">Post Property</span>
                    <span className="text-[10px] font-medium text-emerald-100">100% Free Listing</span>
                  </div>
                </Link>
                <Link
                  href={isAuthed ? "/pricing" : "/login?redirect=/pricing"}
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-col items-start justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-slate-800 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80 dark:text-white"
                >
                  <Sparkles className="mb-2 h-5 w-5 text-amber-500" />
                  <div>
                    <span className="block text-xs font-bold">Plans & Credits</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Boost Visibility</span>
                  </div>
                </Link>
              </div>

              <div className="my-2 border-t border-slate-100 dark:border-slate-850" />

              {/* Navigation Explore Section */}
              <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Explore Properties
              </p>
              <div className="mt-2 space-y-1">
                {searchLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isLinkActive(link.href);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                          : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span>{link.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* User Account / Auth Section for Mobile */}
              <div className="my-3 border-t border-slate-100 dark:border-slate-850" />
              {isAuthed ? (
                <div className="space-y-1">
                  <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    My Account
                  </p>
                  {accountMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                      >
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href={loginHref}
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-center text-sm font-bold text-white shadow-md dark:bg-white dark:text-slate-950"
                >
                  <User className="h-4 w-4" />
                  <span>Login or Sign Up</span>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
