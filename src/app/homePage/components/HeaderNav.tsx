"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Calculator,
  ChevronDown,
  CircleHelp,
  Coins,
  CreditCard,
  FileText,
  Heart,
  Home,
  Info,
  Key,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  PlusCircle,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
  BedDouble,
  Zap,
} from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import { BrandLogo } from "@/components/common/BrandLogo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useModalBackHandler } from "@/lib/navigation/useModalBackHandler";
import { useGetMyCreditsQuery, useGetCreditPlatformConfigQuery } from "@/features/contactVerify/api";
import { CreditWalletModal } from "@/components/billing/CreditWalletModal";

interface UserProfile {
  name?: string;
  email?: string;
  mobileNumber?: string;
  role?: string;
}

const primaryNavLinks = [
  { label: "Buy", href: "/buy", icon: Home },
  { label: "Rent", href: "/rent", icon: Key },
  { label: "New Projects", href: "/new-projects", icon: Sparkles, isNew: true },
  { label: "PG / Coliving", href: "/pg", icon: BedDouble, xlOnly: true },
  { label: "Commercial", href: "/commercial", icon: Building2 },
  { label: "Plans", href: "/pricing", icon: CreditCard, badge: "PRO" },
];

const emiCalculatorLinks = [
  {
    label: "EMI Calculator",
    href: "/emi-calculator",
    icon: Calculator,
    desc: "Calculate loan EMI, interest breakdown & tenure",
    badge: "Popular",
  },
  {
    label: "Home Loans",
    href: "/home-loans",
    icon: Coins,
    desc: "Compare lowest interest rates from top banks",
    badge: "Low Rates",
  },
];

const categoryExploreLinks = [
  { label: "PG & Co-living", href: "/pg", icon: BedDouble, desc: "Verified hostels & coliving spaces" },
  { label: "Plots & Land", href: "/plot", icon: MapPin, desc: "Residential & commercial plots" },
  { label: "Price Trends", href: "/price-trends", icon: TrendingUp, desc: "Locality price index & appreciation rates" },
  { label: "Find Flatmates", href: "/flatmate", icon: Users, desc: "Find verified roommates nearby" },
  { label: "Find Agents", href: "/agents", icon: ShieldCheck, desc: "Connect with verified local brokers" },
  { label: "Post Project (Builder)", href: "/post-project", icon: Building2, desc: "List new residential & commercial projects" },
];

const companySupportLinks = [
  { label: "About Us", href: "/about", icon: Info },
  { label: "Help Centre & Contact", href: "/contact", icon: CircleHelp },
  { label: "Community Forum", href: "/community", icon: MessageSquare },
  { label: "Property Guides", href: "/blog", icon: FileText },
  { label: "Safety & Policies", href: "/policies", icon: Shield },
  { label: "Privacy Policy", href: "/privacy", icon: ShieldCheck },
  { label: "Terms of Service", href: "/terms", icon: FileText },
];

interface HeaderNavProps {
  isMobileHidden?: boolean;
  hideOnPhone?: boolean;
}

export function HeaderNav({ isMobileHidden = false, hideOnPhone = false }: HeaderNavProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [moreNavOpen, setMoreNavOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [currentSearch, setCurrentSearch] = React.useState("");
  const [creditModalOpen, setCreditModalOpen] = React.useState(false);
  const accountRef = React.useRef<HTMLDivElement | null>(null);
  const moreNavRef = React.useRef<HTMLDivElement | null>(null);

  const { data: creditsData, refetch: refetchCredits } = useGetMyCreditsQuery(undefined, { skip: !isAuthed });
  const { data: platformData } = useGetCreditPlatformConfigQuery();
  const purchaseEnabled = platformData?.data?.flags?.find((f) => f.key === "CREDIT_PURCHASES_ENABLED")?.isEnabled ?? false;
  const creditBalance = creditsData?.data?.credits ?? (userProfile as any)?.credits ?? 0;

  useModalBackHandler({
    isOpen: accountOpen,
    onClose: () => setAccountOpen(false),
    pushHistoryState: false,
    name: "HeaderNavAccountDropdown",
  });

  useModalBackHandler({
    isOpen: moreNavOpen,
    onClose: () => setMoreNavOpen(false),
    pushHistoryState: false,
    name: "HeaderNavMoreDropdown",
  });

  const loginHref = `/login?redirect=${encodeURIComponent(pathname || "/")}`;

  // Check auth and user info on mount & events
  React.useEffect(() => {
    setMounted(true);
    setCurrentSearch(window.location.search);
    const checkAuth = () => {
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
      const authed = Boolean(token);
      setIsAuthed(authed);
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
      if (authed && refetchCredits) {
        refetchCredits();
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

  // Close account and more dropdowns when clicking outside
  React.useEffect(() => {
    if (!accountOpen && !moreNavOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (accountOpen && accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
      if (moreNavOpen && moreNavRef.current && !moreNavRef.current.contains(event.target as Node)) {
        setMoreNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountOpen, moreNavOpen]);

  const logout = () => {
    localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.USER_KEY);
    setIsAuthed(false);
    setUserProfile(null);
    setAccountOpen(false);
    router.push("/");
  };

  const closeMenusAfterNavigation = () => {
    window.requestAnimationFrame(() => {
      setMoreNavOpen(false);
      setAccountOpen(false);
    });
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
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: null, onClick: undefined },
    { label: "My Properties", href: "/dashboard/properties", icon: Building2, badge: null, onClick: undefined },
    { label: "Organization", href: "/dashboard/organization", icon: ShieldCheck, badge: null, onClick: undefined },
    purchaseEnabled
      ? { label: "Plans & Credits", href: "/pricing", icon: CreditCard, badge: "PRO", onClick: undefined }
      : { label: `Credits Wallet (${creditBalance})`, href: "#credits", icon: Zap, badge: "⚡ Free", onClick: () => setCreditModalOpen(true) },
    { label: "Saved Properties", href: "/favorites", icon: Heart, badge: null, onClick: undefined },
    { label: "EMI Calculator", href: "/emi-calculator", icon: Calculator, badge: null, onClick: undefined },
    { label: "Help & Support", href: "/contact", icon: CircleHelp, badge: null, onClick: undefined },
    { label: "Account Settings", href: "/dashboard/settings", icon: Settings, badge: null, onClick: undefined },
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
      className={`sticky top-0 z-50 transition-all duration-300 ${hideOnPhone ? "hidden sm:block" : ""} ${
        isMobileHidden
          ? "-translate-y-full pointer-events-none lg:translate-y-0 lg:pointer-events-auto"
          : "translate-y-0"
      } ${
        isScrolled
          ? "border-b border-slate-200/80 bg-white/90 shadow-md shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90 dark:shadow-black/20"
          : "border-b border-slate-200/50 bg-white/75 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/75"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 lg:gap-4 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex-nowrap">
        {/* Brand Logo */}
        <div className="flex shrink-0 items-center">
          <BrandLogo size="md" href="/" />
        </div>

        {/* Center Desktop Navigation - Guaranteed Single Line */}
        <nav className="hidden items-center gap-0.5 rounded-full border border-slate-200/70 bg-slate-100/60 p-1 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-900/60 lg:flex shrink-0">
          {primaryNavLinks
            .filter((link) => link.href !== "/pricing" || purchaseEnabled)
            .map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative items-center gap-1 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200 ${
                  "xlOnly" in link && link.xlOnly ? "hidden xl:flex" : "flex"
                } ${
                  active
                    ? "bg-white text-rose-600 shadow-xs dark:bg-slate-800 dark:text-rose-400"
                    : "text-slate-600 hover:text-slate-950 hover:bg-white/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
                }`}
              >
                <span>{link.label}</span>
                {"isNew" in link && link.isNew && (
                  <span className="rounded-full bg-rose-500/10 px-1 py-0.2 text-[9px] font-black uppercase tracking-wider text-rose-600 dark:bg-rose-400/15 dark:text-rose-300">
                    New
                  </span>
                )}
                {"badge" in link && link.badge && (
                  <span className="rounded-full bg-rose-500/10 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider text-rose-600 dark:bg-rose-400/15 dark:text-rose-300">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* More Categories & Portals Dropdown */}
          <div className="relative" ref={moreNavRef}>
            <button
              type="button"
              onClick={() => {
                setMoreNavOpen((open) => !open);
                setAccountOpen(false);
              }}
              className={`flex items-center gap-1 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                moreNavOpen ||
                categoryExploreLinks.some((l) => isLinkActive(l.href)) ||
                companySupportLinks.some((l) => isLinkActive(l.href)) ||
                emiCalculatorLinks.some((l) => isLinkActive(l.href))
                  ? "bg-white text-rose-600 shadow-xs dark:bg-slate-800 dark:text-rose-400"
                  : "text-slate-600 hover:text-slate-950 hover:bg-white/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
              }`}
              aria-label="More Portals and Pages Menu"
              aria-expanded={moreNavOpen}
            >
              <span>More</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${moreNavOpen ? "rotate-180" : ""}`} />
            </button>

            {moreNavOpen && (
              <div className="absolute right-0 top-10 z-50 w-[540px] max-w-[calc(100vw-32px)] origin-top-right rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 dark:border-slate-800 dark:bg-slate-950/95">
                <div className="grid grid-cols-2 gap-3">
                  {/* Section 1: Explore Portals */}
                  <div>
                    <div className="px-2 py-1 mb-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Explore Portals
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      {categoryExploreLinks.map((item) => {
                        const Icon = item.icon;
                        const active = isLinkActive(item.href);
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            onNavigate={closeMenusAfterNavigation}
                            className={`flex items-start gap-2.5 rounded-xl p-2 transition-all ${
                              active
                                ? "bg-rose-50/80 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                                : "text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-900"
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                active
                                  ? "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-semibold block leading-tight">{item.label}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {item.desc}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 2: EMI & Calculators */}
                  <div>
                    <div className="px-2 py-1 mb-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        EMI & Loan Calculators
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      {emiCalculatorLinks.map((item) => {
                        const Icon = item.icon;
                        const active = isLinkActive(item.href);
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            onNavigate={closeMenusAfterNavigation}
                            className={`flex items-start gap-2.5 rounded-xl p-2 transition-all ${
                              active
                                ? "bg-rose-50/80 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                                : "text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-900"
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                active
                                  ? "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-semibold leading-tight">{item.label}</span>
                                {item.badge && (
                                  <span className="rounded-full bg-rose-500/10 px-1 py-0.2 text-[8px] font-extrabold uppercase text-rose-600 dark:bg-rose-400/15 dark:text-rose-300">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {item.desc}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Section 3: Company & Support Bar */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="px-2 py-0.5 mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Company & Support
                    </span>
                    <Link
                      href="/contact"
                      onNavigate={closeMenusAfterNavigation}
                      className="text-[10px] font-semibold text-rose-600 hover:underline dark:text-rose-400"
                    >
                      Need help? Contact us →
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {companySupportLinks.map((item) => {
                      const Icon = item.icon;
                      const active = isLinkActive(item.href);
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onNavigate={closeMenusAfterNavigation}
                          className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition ${
                            active
                              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                          }`}
                        >
                          <Icon className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Side CTAs & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5" ref={accountRef}>
          {/* Post Property Glowing CTA - Always visible on mobile and desktop */}
          <Link
            href={isAuthed ? "/propertyListing" : "/login?redirect=/propertyListing"}
            onClick={(e) => {
              if (!isAuthed) {
                e.preventDefault();
                window.dispatchEvent(
                  new CustomEvent("awasio:open-welcome-credits", {
                    detail: { returnUrl: "/propertyListing" },
                  })
                );
              }
            }}
            className="group relative inline-flex items-center gap-1.5 sm:gap-2 overflow-hidden rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 bg-[length:200%_auto] px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition-all duration-300 hover:bg-right hover:shadow-lg hover:shadow-rose-600/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200 group-hover:rotate-90 shrink-0" />
            <span className="whitespace-nowrap">
              <span className="inline sm:hidden">Post</span>
              <span className="hidden sm:inline">Post Property</span>
            </span>
            <span className="rounded-full bg-white/25 px-1 sm:px-1.5 py-0.2 sm:py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-rose-50 backdrop-blur-xs">
              Free
            </span>
          </Link>


          {/* Saved Properties Heart Icon (Visible on sm+ screens, available in mobile drawer) */}
          <Link
            href="/favorites"
            className="group relative hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-600 shadow-2xs backdrop-blur-sm transition-all duration-200 hover:border-rose-300 hover:bg-rose-50/60 hover:text-rose-600 active:scale-95 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-rose-900/50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            aria-label="Saved properties"
            title="Saved properties"
          >
            <Heart className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          </Link>

          {/* Theme Toggle (Visible on sm+ screens, available in mobile drawer) */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Sleek Floating Credit Badge Pill */}
          {isAuthed ? (
            <button
              type="button"
              onClick={() => setCreditModalOpen(true)}
              className="group inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-amber-300/80 bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-black text-amber-900 shadow-2xs hover:border-amber-400 hover:shadow-xs hover:scale-[1.02] active:scale-95 transition-all dark:border-amber-700/60 dark:bg-gradient-to-r dark:from-amber-950/40 dark:via-amber-900/30 dark:to-amber-950/40 dark:text-amber-200"
              title="Click to view Credit Wallet & Rewards"
              aria-label="View Credit Balance"
            >
              <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500 animate-pulse shrink-0" />
              <span>{creditBalance}</span>
              <span className="hidden sm:inline font-bold text-amber-800 dark:text-amber-300 text-[11px]">
                Credits
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("awasio:open-welcome-credits", {
                    detail: { returnUrl: window.location.pathname },
                  })
                );
              }}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50/90 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 transition"
              title="Sign up and claim 1,000 free credits"
            >
              <Zap className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span>1,000 Free Credits</span>
            </button>
          )}

          {/* Authenticated Account Menu or Login Button */}
          {isAuthed ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                className={`flex items-center gap-1 sm:gap-2 rounded-full border p-1 sm:pr-2.5 transition-all duration-200 ${
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
                      if (item.onClick) {
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => {
                              setAccountOpen(false);
                              item.onClick!();
                            }}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-850 dark:hover:text-white"
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      }
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onNavigate={closeMenusAfterNavigation}
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

        </div>
      </div>

      {/* Credit Wallet & Rewards Modal */}
      <CreditWalletModal
        isOpen={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        userProfile={userProfile}
      />
    </header>
  );
}
