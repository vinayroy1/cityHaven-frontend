"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  FileText,
  Mail,
  MessageSquare,
  Bell,
  BadgeCheck,
  Heart,
  Settings,
  Plus,
  ArrowUpRight,
  Coins,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "./PageHeader";
import { SectionCard } from "./SectionCard";
import { StatPill } from "./StatPill";
import { useMyPropertiesQuery, useMyEnquiriesQuery } from "@/features/propertyListing/api";
import { useGetMyFlatmateListingsQuery } from "@/features/flatmates/api";
import { useGetDocumentStatsQuery } from "@/features/documents/api";
import { useGetBillingSummaryQuery } from "@/features/contactVerify/api";

export function DashboardClient() {
  const { data: propertiesData, isLoading: isPropsLoading } = useMyPropertiesQuery();
  const { data: flatmatesData, isLoading: isFlatmatesLoading } = useGetMyFlatmateListingsQuery();
  const { data: docStats, isLoading: isDocLoading } = useGetDocumentStatsQuery();
  const { data: enquiriesData, isLoading: isEnquiriesLoading } = useMyEnquiriesQuery({});
  const { data: billingData } = useGetBillingSummaryQuery();

  const propertiesList = useMemo(() => {
    if (Array.isArray(propertiesData)) return propertiesData;
    if (Array.isArray(propertiesData?.items)) return propertiesData.items;
    return [];
  }, [propertiesData]);

  const activePropertiesCount = useMemo(() => {
    return propertiesList.filter((p: any) => p.status === "ACTIVE" || p.isActive).length;
  }, [propertiesList]);

  const flatmatesCount = useMemo(() => {
    return Array.isArray(flatmatesData) ? flatmatesData.length : 0;
  }, [flatmatesData]);

  const totalDocsCount = docStats?.totalDocuments ?? 0;
  const verifiedDocsCount = docStats?.verifiedProofs ?? 0;

  const enquiriesCount = useMemo(() => {
    if (Array.isArray(enquiriesData?.items)) return enquiriesData.items.length;
    return 0;
  }, [enquiriesData]);

  const balanceCredits = billingData?.data?.credits ?? (billingData as any)?.credits ?? null;

  // Primary hubs (Top 4 workspaces)
  const primaryHubs = [
    {
      href: "/dashboard/properties",
      title: "My Properties",
      subtitle: "Active listings, drafts & boosts",
      description: "Post, edit, boost visibility, and track verification status of all your homes.",
      badge: `${propertiesList.length} ${propertiesList.length === 1 ? "Property" : "Properties"}`,
      badgeTone: "rose",
      icon: Building2,
      iconClass: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
    },
    {
      href: "/dashboard/flatmates",
      title: "Roommates & Co-Living",
      subtitle: "Seeker profiles & shared flats",
      description: "Manage seeker listings, buddy-up search, spare room postings, and flatmate inquiries.",
      badge: `${flatmatesCount} ${flatmatesCount === 1 ? "Listing" : "Listings"}`,
      badgeTone: "emerald",
      icon: Users,
      iconClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
    {
      href: "/dashboard/enquiries",
      title: "Leads & Enquiries",
      subtitle: "Buyer & tenant workspace",
      description: "Track incoming inquiries, contact unlock requests, scheduled site visits, and chats.",
      badge: `${enquiriesCount} ${enquiriesCount === 1 ? "Lead" : "Leads"}`,
      badgeTone: "sky",
      icon: Mail,
      iconClass: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    },
    {
      href: "/dashboard/documents",
      title: "Documents & Proofs",
      subtitle: "Title deeds, NOCs & templates",
      description: "Upload property ownership proofs, electricity bills, society NOCs, and legal templates.",
      badge: totalDocsCount > 0 ? `${totalDocsCount} Uploaded` : "Secure Storage",
      badgeTone: "amber",
      icon: FileText,
      iconClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    },
  ];

  // Secondary tools (Appears exactly once without duplicates)
  const secondaryTools = [
    {
      href: "/dashboard/messages",
      title: "Messages",
      description: "Chat in real time with prospective buyers, tenants, and roommates.",
      icon: MessageSquare,
      iconClass: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400",
    },
    {
      href: "/dashboard/notifications",
      title: "Notifications & Alerts",
      description: "Instant updates on listing status, document approvals, and lead requests.",
      icon: Bell,
      iconClass: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
    },
    {
      href: "/dashboard/organization",
      title: "Organization & Team",
      description: "Manage agency workspace, employees, permissions, and team listings.",
      icon: Building2,
      iconClass: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400",
    },
    {
      href: "/dashboard/advisor-profile",
      title: "Advisor & RERA Profile",
      description: "Agent license, RERA credentials, and in-person walkthrough service badges.",
      icon: BadgeCheck,
      iconClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    },
    {
      href: "/dashboard/favorites",
      title: "Saved Properties",
      description: "Quick access to your shortlisted homes and bookmarked properties.",
      icon: Heart,
      iconClass: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
    },
    {
      href: "/dashboard/settings",
      title: "Account Settings",
      description: "Profile preferences, password & security, alerts, and contact info.",
      icon: Settings,
      iconClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3.5 py-6 sm:px-6 sm:py-8 overflow-hidden sm:overflow-visible">
      {/* Top Page Header with Direct Actions */}
      <PageHeader
        tag="Control Center"
        title="Dashboard"
        subtitle="Manage your listings, inquiries, flatmates, and compliance in one place."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/80 px-3.5 py-2 text-xs font-semibold text-amber-900 shadow-xs transition hover:bg-amber-100 hover:-translate-y-0.5 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200"
            >
              <Coins className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>{balanceCredits !== null ? `${balanceCredits} Credits` : "Plans & Credits"}</span>
            </Link>
            <Link
              href="/flatmates/post"
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 shadow-xs transition hover:bg-rose-100 hover:-translate-y-0.5 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Post Flatmate</span>
            </Link>
            <Link
              href="/propertyListing"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_30px_-15px_rgba(15,23,42,0.8)] transition hover:bg-slate-800 hover:-translate-y-0.5 dark:bg-rose-600 dark:hover:bg-rose-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Post Property</span>
            </Link>
          </div>
        }
      />

      {/* Live Stats Overview Banner */}
      <SectionCard>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatPill
            label="Properties"
            value={isPropsLoading ? "—" : propertiesList.length}
            hint={isPropsLoading ? "Loading..." : `${activePropertiesCount} active (live)`}
            tone="rose"
            href="/dashboard/properties"
          />
          <StatPill
            label="Flatmates & Rooms"
            value={isFlatmatesLoading ? "—" : flatmatesCount}
            hint={isFlatmatesLoading ? "Loading..." : "Seekers & room posts"}
            tone="emerald"
            href="/dashboard/flatmates"
          />
          <StatPill
            label="Documents & Proofs"
            value={isDocLoading ? "—" : totalDocsCount}
            hint={isDocLoading ? "Loading..." : `${verifiedDocsCount} verified proof${verifiedDocsCount === 1 ? "" : "s"}`}
            tone="amber"
            href="/dashboard/documents"
          />
          <StatPill
            label="Leads & Enquiries"
            value={isEnquiriesLoading ? "—" : enquiriesCount}
            hint={isEnquiriesLoading ? "Loading..." : "Buyer & tenant requests"}
            tone="slate"
            href="/dashboard/enquiries"
          />
        </div>
      </SectionCard>

      {/* Core Workspaces (Top 4 Hubs - No redundant buttons) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Primary Workspaces
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {primaryHubs.map((hub) => {
            const Icon = hub.icon;
            return (
              <Link
                key={hub.href}
                href={hub.href}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-rose-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${hub.iconClass} shadow-xs`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-600 transition dark:bg-slate-800 dark:text-slate-500 dark:group-hover:bg-rose-950/60 dark:group-hover:text-rose-400">
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">
                    {hub.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {hub.subtitle}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {hub.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {hub.badge}
                  </span>
                  <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 group-hover:underline">
                    Manage →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tools & Account Services (Single source of truth, no duplicates) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tools & Communication
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {secondaryTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tool.iconClass} shadow-xs`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition truncate">
                      {tool.title}
                    </h3>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-rose-600 dark:text-slate-500 dark:group-hover:text-rose-400 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
