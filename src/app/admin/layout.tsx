"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AdminProvider, useAdmin } from "@/features/admin/adminStore";
import { StaffRole } from "@/features/admin/types";
import { useIsMounted } from "@/features/admin/dateUtils";
import {
  ShieldAlert,
  Building2,
  FileCheck2,
  Users2,
  CreditCard,
  History,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Lock,
  UserCog,
  AlertTriangle,
  BadgeCheck,
  Sun,
  Moon,
  TrendingUp,
  Flame,
  Zap,
  Sliders,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    allowedRoles: [
      "SUPER_ADMIN",
      "OPERATIONS_MANAGER",
      "SENIOR_QC_LEAD",
      "QC_REVIEWER",
      "CATALOG_SPECIALIST",
      "VERIFICATION_SPECIALIST",
      "LEGAL_COMPLIANCE_OFFICER",
      "FRAUD_INVESTIGATOR",
      "SUPPORT_EXECUTIVE",
      "FINANCE_EXECUTIVE",
      "FINANCE_APPROVER",
      "ANALYST_AUDITOR",
    ],
  },
  {
    label: "Analytics & KPIs",
    href: "/admin/analytics",
    icon: TrendingUp,
    allowedRoles: [
      "SUPER_ADMIN",
      "OPERATIONS_MANAGER",
      "SENIOR_QC_LEAD",
      "FINANCE_EXECUTIVE",
      "FINANCE_APPROVER",
      "ANALYST_AUDITOR",
    ],
  },
  {
    label: "Property Quality Control",
    href: "/admin/properties",
    icon: Building2,
    allowedRoles: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "SENIOR_QC_LEAD", "QC_REVIEWER", "CATALOG_SPECIALIST", "ANALYST_AUDITOR"],
    badgeKey: "properties",
  },
  {
    label: "Org Verification",
    href: "/admin/organizations",
    icon: FileCheck2,
    allowedRoles: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "VERIFICATION_SPECIALIST", "LEGAL_COMPLIANCE_OFFICER", "ANALYST_AUDITOR"],
    badgeKey: "organizations",
  },
  {
    label: "Disputes & Leads",
    href: "/admin/disputes",
    icon: ShieldAlert,
    allowedRoles: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "SUPPORT_EXECUTIVE", "LEGAL_COMPLIANCE_OFFICER", "FINANCE_EXECUTIVE", "ANALYST_AUDITOR"],
    badgeKey: "disputes",
  },
  {
    label: "Fraud Threats",
    href: "/admin/fraud",
    icon: Flame,
    allowedRoles: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "FRAUD_INVESTIGATOR", "LEGAL_COMPLIANCE_OFFICER", "ANALYST_AUDITOR"],
    badgeKey: "fraud",
  },
  {
    label: "Staff & Roles",
    href: "/admin/staff",
    icon: UserCog,
    allowedRoles: ["SUPER_ADMIN"],
  },
  {
    label: "Customer Accounts",
    href: "/admin/users",
    icon: Users2,
    allowedRoles: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "SUPPORT_EXECUTIVE", "FRAUD_INVESTIGATOR", "ANALYST_AUDITOR"],
  },
  {
    label: "Billing & Refunds",
    href: "/admin/billing",
    icon: CreditCard,
    allowedRoles: ["SUPER_ADMIN", "FINANCE_EXECUTIVE", "FINANCE_APPROVER", "ANALYST_AUDITOR"],
    badgeKey: "refunds",
  },
  {
    label: "Audit Trail",
    href: "/admin/audit",
    icon: History,
    allowedRoles: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "LEGAL_COMPLIANCE_OFFICER", "ANALYST_AUDITOR"],
  },
  {
    label: "Governance & Policies",
    href: "/admin/settings",
    icon: Sliders,
    allowedRoles: ["SUPER_ADMIN"],
  },
];

const ALL_ROLES: { role: StaffRole; label: string; desc: string }[] = [
  { role: "SUPER_ADMIN", label: "Super Admin", desc: "Staff access, settings, exceptional actions" },
  { role: "OPERATIONS_MANAGER", label: "Operations Manager", desc: "Work assignment, capacity balancing, escalations" },
  { role: "SENIOR_QC_LEAD", label: "Senior QC Lead", desc: "High-value listing approvals & override power" },
  { role: "QC_REVIEWER", label: "Quality Control (QC) Reviewer", desc: "Property review and listing quality verification" },
  { role: "CATALOG_SPECIALIST", label: "Catalog Specialist", desc: "Photo curation, media watermarks & title SEO" },
  { role: "VERIFICATION_SPECIALIST", label: "Verification Specialist", desc: "Organization KYC, GSTIN & RERA verification" },
  { role: "LEGAL_COMPLIANCE_OFFICER", label: "Legal & Compliance Officer", desc: "Regulatory RERA audit, terms compliance & disputes" },
  { role: "FRAUD_INVESTIGATOR", label: "Fraud Investigator", desc: "Scraper detection, coordinate clusters & security threats" },
  { role: "SUPPORT_EXECUTIVE", label: "Support Executive", desc: "Customer issues, unlock disputes & complaints" },
  { role: "FINANCE_EXECUTIVE", label: "Finance Executive", desc: "Payment reconciliation & refund request creation" },
  { role: "FINANCE_APPROVER", label: "Finance Approver", desc: "2-person restricted financial approval signoff" },
  { role: "ANALYST_AUDITOR", label: "Analyst / Auditor", desc: "Read-only business intelligence & audit logs" },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useIsMounted();
  const {
    isHydrated,
    currentStaff,
    logoutStaff,
    switchStaffRole,
    propertyQcList,
    orgVerificationList,
    refundCases,
    disputeCases,
    fraudAlerts,
  } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  useEffect(() => {
    if (isHydrated && !currentStaff && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [currentStaff, isHydrated, pathname, router]);

  // If on login page, render plain without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isHydrated || !currentStaff) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 text-sm font-semibold shadow-sm">
          Checking staff session...
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logoutStaff();
    router.push("/admin/login");
  };

  if (currentStaff.status === "SUSPENDED" || currentStaff.status === "INACTIVE") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 p-8 text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Staff Access Restricted</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            Your internal staff account (<span className="font-mono font-semibold text-rose-600 dark:text-rose-400">{currentStaff.email}</span>) status is currently <span className="font-bold">{currentStaff.status}</span>. Please contact an Operations Manager or Super Admin to restore active operational duties.
          </p>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
          >
            Sign Out to Staff Login
          </button>
        </div>
      </div>
    );
  }

  // Count pending items for badge indicators
  const pendingQcCount = propertyQcList.filter((p) => p.qcStatus === "SUBMITTED" || p.qcStatus === "UNDER_REVIEW").length;
  const pendingOrgCount = orgVerificationList.filter((o) => o.verificationStatus === "PENDING_REVIEW").length;
  const pendingRefundsCount = refundCases.filter((r) => r.status === "PENDING_APPROVAL").length;
  const activeDisputesCount = disputeCases.filter((d) => d.status !== "RESOLVED" && d.status !== "CLOSED").length;
  const activeFraudCount = fraudAlerts.filter((f) => f.status === "INVESTIGATING" || f.status === "OPEN").length;

  const getBadgeCount = (badgeKey?: string) => {
    if (badgeKey === "properties") return pendingQcCount;
    if (badgeKey === "organizations") return pendingOrgCount;
    if (badgeKey === "refunds") return pendingRefundsCount;
    if (badgeKey === "disputes") return activeDisputesCount;
    if (badgeKey === "fraud") return activeFraudCount;
    return 0;
  };

  const activeRole = currentStaff.roles[0];
  const assignableRoles = ALL_ROLES.filter((role) => currentStaff.roles.includes(role.role));

  // Check if current user has permission to view the current route
  const currentNavItem = NAV_ITEMS.find((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)));
  const hasAccess = !currentNavItem || currentNavItem.allowedRoles.includes(activeRole);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-rose-500 selection:text-white transition-colors duration-200">
      {/* Top Warning Banner for internal portal separation */}
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-700 text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-200 animate-pulse" />
          <span className="truncate">CITYHAVEN INTERNAL STAFF OPERATIONS PORTAL • RESTRICTED ACCESS • ALL ACTIONS AUDITED</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono opacity-90 hidden sm:flex shrink-0">
          <span>Session: SECURE_MFA_ACTIVE</span>
          <Link href="/" className="underline hover:text-amber-100 flex items-center gap-1">
            Public Site <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Brand header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-rose-600 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-rose-900/30">
                A
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  Awasio <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/20 dark:border-rose-500/30">Admin</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Staff Ops & Moderation</div>
              </div>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Staff Persona & Role Switcher */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 font-semibold px-2 mb-1.5 flex items-center justify-between">
              <span>Active Staff Persona</span>
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Online
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="w-full text-left bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 flex items-center justify-between transition group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow">
                    {currentStaff.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{currentStaff.name}</div>
                    <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium truncate flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3 text-rose-500" />
                      {ALL_ROLES.find((r) => r.role === activeRole)?.label || activeRole}
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Role Switcher Menu */}
              {roleDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 text-xs divide-y divide-slate-100 dark:divide-slate-800/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400 font-bold">
                    Switch Active Staff Role
                  </div>
                  <div className="py-1 space-y-0.5 max-h-60 overflow-y-auto">
                    {assignableRoles.map(({ role, label, desc }) => (
                      <button
                        key={role}
                        onClick={() => {
                          switchStaffRole(role);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg transition flex items-start gap-2 ${
                          activeRole === role
                            ? "bg-rose-500/10 dark:bg-rose-600/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 dark:border-rose-500/40 font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <div className="mt-0.5 w-2 h-2 rounded-full shrink-0 bg-slate-400 dark:bg-slate-500" />
                        <div>
                          <div className="text-xs">{label}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal leading-snug">{desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500 font-bold px-3 py-1">Operational Modules</div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const isAllowed = item.allowedRoles.includes(activeRole);
              const badgeCount = getBadgeCount(item.badgeKey);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md shadow-rose-900/20"
                      : isAllowed
                      ? "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                      : "text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-not-allowed opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : isAllowed ? "text-slate-500 dark:text-slate-400" : "text-slate-400 dark:text-slate-600"}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!isAllowed && <Lock className="w-3 h-3 text-slate-400 dark:text-slate-600" />}
                    {badgeCount > 0 && isAllowed && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/20 dark:border-amber-500/30">
                        {badgeCount}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Theme Switcher & Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-2">
            <div className="truncate pr-1">
              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">{currentStaff.email}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">MFA ENFORCED</div>
            </div>

            <div className="flex items-center gap-1">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition cursor-pointer shadow-sm"
                >
                  {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                </button>
              )}
              <button
                onClick={handleLogout}
                title="Logout session"
                className="p-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 transition cursor-pointer shadow-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white capitalize">
                  {currentNavItem ? currentNavItem.label : "Admin Portal"}
                </h1>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
                  Scope: <span className="text-rose-600 dark:text-rose-400 font-semibold">{activeRole}</span> • Audit Mode Active
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400">Quality Control:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{pendingQcCount}</span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-slate-500 dark:text-slate-400">KYC Queue:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{pendingOrgCount}</span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-slate-500 dark:text-slate-400">Disputes:</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">{activeDisputesCount}</span>
              </div>

              {mounted && (
                <button
                  onClick={toggleTheme}
                  title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1.5 transition font-medium shadow-sm cursor-pointer"
                >
                  {resolvedTheme === "dark" ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="hidden sm:inline">Dark Mode</span>
                    </>
                  )}
                </button>
              )}

              <Link
                href="/admin/audit"
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1.5 transition font-medium shadow-sm"
              >
                <History className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span className="hidden sm:inline">System Logs</span>
              </Link>
            </div>
          </header>

          {/* Subpage View or Permission Guard */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
            {!hasAccess ? (
              <div className="p-8 rounded-2xl bg-rose-500/10 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 text-center max-w-md mx-auto my-12">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-700/50 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  Your current staff role <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">[{activeRole}]</span> is not authorized to access this operational module. Please use an assigned role with access or contact a Super Admin.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    href="/admin"
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
                  >
                    Back to Overview
                  </Link>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminProvider>
  );
}
