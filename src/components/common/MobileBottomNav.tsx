"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Home,
  Search,
  Plus,
  Heart,
  Menu,
  X,
  Key,
  Sparkles,
  BedDouble,
  Building2,
  MapPin,
  Users,
  TrendingUp,
  Coins,
  Calculator,
  User,
  LogOut,
  ShieldCheck,
  Info,
  CircleHelp,
  Shield,
  FileText,
  Mail,
  Phone,
  BookOpenText,
} from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import { ThemeToggle } from "./ThemeToggle";
import { useModalBackHandler } from "@/lib/navigation/useModalBackHandler";

interface UserProfile {
  name?: string;
  email?: string;
  mobileNumber?: string;
  role?: string;
}

// Routes where the bottom bar should be hidden (form steppers, auth flows)
const HIDDEN_ROUTES = [
  "/propertyListing",
  "/login",
  "/auth",
];

const categoryLinks = [
  { label: "Buy Homes", href: "/buy", icon: Home },
  { label: "Rent Properties", href: "/rent", icon: Key },
  { label: "PG & Co-living", href: "/pg", icon: BedDouble },
  { label: "Find Flatmates", href: "/flatmate", icon: Users },
  { label: "Commercial", href: "/commercial", icon: Building2 },
  { label: "Plots & Land", href: "/plot", icon: MapPin },
  { label: "New Projects", href: "/new-projects", icon: Sparkles, badge: "New" },
  { label: "Find Verified Agents", href: "/agents", icon: Users },
  { label: "Post Project (Builder)", href: "/post-project", icon: Building2 },
];

const resourceLinks = [
  { label: "Price Trends", href: "/price-trends", icon: TrendingUp },
  { label: "Home Loans", href: "/home-loans", icon: Coins },
  { label: "EMI Calculator", href: "/emi-calculator", icon: Calculator },
  { label: "Pricing & Plans", href: "/pricing", icon: Sparkles },
  { label: "Blog & Guides", href: "/blog", icon: BookOpenText },
];

const companyAndSupportLinks = [
  { label: "About us", href: "/about", icon: Info },
  { label: "Help Centre", href: "/contact", icon: CircleHelp },
  { label: "Safety information", href: "/policies", icon: Shield },
  { label: "Privacy policy", href: "/privacy", icon: ShieldCheck },
  { label: "Terms & conditions", href: "/terms", icon: FileText },
  { label: "Search properties", href: "/propertySearch", icon: Search },
  { label: "Saved properties", href: "/favorites", icon: Heart },
  { label: "Email support", href: "mailto:contact@awasio.com", icon: Mail },
  { label: "Call support", href: "tel:+918848510629", icon: Phone },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);

  // Check auth
  React.useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
      setIsAuthed(Boolean(token));
      try {
        const storedUser = localStorage.getItem(APP_CONFIG.AUTH.USER_KEY);
        if (storedUser) setUserProfile(JSON.parse(storedUser));
        else setUserProfile(null);
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

  // Close drawer on route change
  React.useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock background scroll when drawer is open
  React.useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useModalBackHandler({
    isOpen: drawerOpen,
    onClose: () => setDrawerOpen(false),
    pushHistoryState: false,
    name: "MobileBottomNavDrawer",
  });

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      setDrawerOpen(false);
      return;
    }
    if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("http")) {
      setDrawerOpen(false);
      return;
    }
    e.preventDefault();
    setDrawerOpen(false);
    router.push(href);
  };

  // Hide on excluded full-screen paths
  const shouldHide = HIDDEN_ROUTES.some((route) => pathname?.startsWith(route));
  if (shouldHide) return null;

  const isHomeActive = pathname === "/";
  const isSearchActive = pathname?.startsWith("/propertySearch") || pathname?.startsWith("/search/") || ["/buy", "/rent", "/pg", "/flatmate", "/commercial", "/plot"].some((route) => pathname === route || pathname?.startsWith(`${route}/`));
  const isSavedActive = pathname === "/favorites";

  const handlePostClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthed) {
      router.push("/propertyListing");
    } else {
      router.push(`/login?redirect=${encodeURIComponent("/propertyListing")}`);
    }
  };

  const logout = () => {
    localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.USER_KEY);
    window.dispatchEvent(new Event("auth-change"));
    setIsAuthed(false);
    setUserProfile(null);
    setDrawerOpen(false);
    router.push("/");
  };

  return (
    <>
      {/* Spacer at document end to prevent bottom content from being covered by fixed nav */}
      <div
        data-mobile-bottom-spacer="true"
        className="h-20 w-full pointer-events-none block lg:hidden"
        aria-hidden="true"
      />

      {/* =========================================================================
          PERSISTENT MOBILE BOTTOM NAVIGATION BAR (iOS / Android Ergonomics)
          ========================================================================= */}
      <nav
        aria-label="Mobile Navigation Bar"
        className="fixed bottom-0 inset-x-0 z-40 block lg:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:border-slate-800/80 dark:bg-slate-950/95 dark:shadow-[0_-8px_24px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="grid grid-cols-5 items-center justify-around h-16 max-w-md mx-auto px-2">
          {/* TAB 1: HOME */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1 transition-colors group ${
              isHomeActive
                ? "text-rose-600 dark:text-rose-400 font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium"
            }`}
          >
            <div className="relative">
              <Home
                className={`h-5 w-5 transition-transform duration-200 ${
                  isHomeActive ? "scale-110 stroke-[2.4]" : "group-hover:scale-105"
                }`}
              />
              {isHomeActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-rose-600 dark:bg-rose-400" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Home</span>
          </Link>

          {/* TAB 2: SEARCH */}
          <Link
            href="/propertySearch"
            className={`flex flex-col items-center justify-center py-1 transition-colors group ${
              isSearchActive
                ? "text-rose-600 dark:text-rose-400 font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium"
            }`}
          >
            <div className="relative">
              <Search
                className={`h-5 w-5 transition-transform duration-200 ${
                  isSearchActive ? "scale-110 stroke-[2.4]" : "group-hover:scale-105"
                }`}
              />
              {isSearchActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-rose-600 dark:bg-rose-400" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Search</span>
          </Link>

          {/* TAB 3: POST PROPERTY (Center Elevated Accent CTA) */}
          <div className="relative flex flex-col items-center justify-center -top-3">
            <button
              type="button"
              onClick={handlePostClick}
              aria-label="Post Property for free"
              className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/35 ring-4 ring-white dark:ring-slate-950 transition-all duration-200 active:scale-90 hover:scale-105 hover:shadow-rose-500/50"
            >
              <Plus className="h-6 w-6 stroke-[2.6]" />
            </button>
            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mt-0.5 tracking-tight">
              Post Free
            </span>
          </div>

          {/* TAB 4: SAVED / FAVORITES */}
          <Link
            href="/favorites"
            className={`flex flex-col items-center justify-center py-1 transition-colors group ${
              isSavedActive
                ? "text-rose-600 dark:text-rose-400 font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium"
            }`}
          >
            <div className="relative">
              <Heart
                className={`h-5 w-5 transition-transform duration-200 ${
                  isSavedActive ? "scale-110 stroke-[2.4] fill-rose-600/20 dark:fill-rose-400/20" : "group-hover:scale-105"
                }`}
              />
              {isSavedActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-rose-600 dark:bg-rose-400" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Saved</span>
          </Link>

          {/* TAB 5: MENU / MORE DRAWER TRIGGER */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            className={`flex flex-col items-center justify-center py-1 transition-colors group ${
              drawerOpen
                ? "text-rose-600 dark:text-rose-400 font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium"
            }`}
          >
            <div className="relative">
              <Menu
                className={`h-5 w-5 transition-transform duration-200 ${
                  drawerOpen ? "scale-110 stroke-[2.4]" : "group-hover:scale-105"
                }`}
              />
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Menu</span>
          </button>
        </div>
      </nav>

      {/* =========================================================================
          SLIDE-UP FULL MENU SHEET (Accessible from Tab 5)
          ========================================================================= */}
      {drawerOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in lg:hidden"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Bottom Sheet */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
              className="fixed inset-x-0 bottom-0 z-[101] flex max-h-[85vh] max-h-[85dvh] w-full flex-col rounded-t-3xl border-t border-slate-200/90 bg-white shadow-2xl transition-transform duration-300 animate-in slide-in-from-bottom dark:border-slate-800 dark:bg-slate-950 lg:hidden pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
            >
              {/* Grab Handle & Sheet Header */}
              <div className="flex flex-col items-center border-b border-slate-100 px-5 pb-3 pt-3 dark:border-slate-800/80">
                <div className="mb-2.5 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Explore Awasio
                    </span>
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                      Verified
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Sheet Content Scroll Area */}
              <div className="overflow-y-auto px-5 py-4 space-y-5">
                {/* Auth / Account Quick Header Card */}
                {isAuthed ? (
                  <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-slate-100/60 p-3.5 dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 text-sm font-bold text-white shadow-sm">
                          {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                            {userProfile?.name || "Verified Member"}
                          </p>
                          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                            {userProfile?.email || userProfile?.mobileNumber || "Member"}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={(e) => handleLinkClick(e, "/dashboard")}
                        className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                      >
                        Dashboard
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-2xl border border-rose-200/80 bg-rose-50/70 p-3.5 dark:border-rose-950 dark:bg-rose-950/30">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Sign in for full access
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        Unlock owner contacts &amp; manage properties
                      </p>
                    </div>
                    <Link
                      href={`/login?redirect=${encodeURIComponent(pathname || "/")}`}
                      onClick={(e) => handleLinkClick(e, `/login?redirect=${encodeURIComponent(pathname || "/")}`)}
                      className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Login</span>
                    </Link>
                  </div>
                )}

                {/* Explore Categories */}
                <div>
                  <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Property Categories
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {categoryLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={(e) => handleLinkClick(e, item.href)}
                          className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs font-semibold text-slate-700 hover:border-slate-200 hover:bg-slate-100/80 dark:border-slate-850 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-850 transition"
                        >
                          <Icon className="h-4 w-4 text-rose-500 shrink-0" />
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto rounded-md bg-amber-100 px-1 py-0.2 text-[9px] font-extrabold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Resources & Tools */}
                <div>
                  <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Calculators &amp; Advisory
                  </p>
                  <div className="mt-2 space-y-1">
                    {resourceLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={(e) => handleLinkClick(e, item.href)}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 text-slate-400" />
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Company, support and legal links moved from the mobile footer. */}
                <div>
                  <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Awasio &amp; Support
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {companyAndSupportLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={(e) => handleLinkClick(e, item.href)}
                          className="flex min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Account / Settings Footer inside drawer */}
                <div className="border-t border-slate-100 pt-3 dark:border-slate-850 space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Display Theme
                    </span>
                    <ThemeToggle />
                  </div>

                  {isAuthed && (
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out of Awasio</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
