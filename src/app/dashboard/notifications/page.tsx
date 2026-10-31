"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  FileCheck2,
  Calendar,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Inbox,
  Filter,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  type ApiNotification,
} from "@/features/notifications/api";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatPill } from "../components/StatPill";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { toast } from "sonner";

function formatRelativeTime(dateString: string): string {
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Recently";
  }
}

export default function NotificationsPage() {
  const { data: notifications = [], isLoading, isFetching, refetch } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "LEADS" | "VISITS">("ALL");

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.readAt).length,
    [notifications]
  );

  const leadsCount = useMemo(
    () => notifications.filter((n) => n.type === "NEW_LEAD" || n.title?.toLowerCase().includes("lead")).length,
    [notifications]
  );

  const visitsCount = useMemo(
    () => notifications.filter((n) => n.title?.toLowerCase().includes("visit") || n.body?.toLowerCase().includes("visit")).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "UNREAD") return !n.readAt;
      if (filter === "LEADS") return n.type === "NEW_LEAD" || n.title?.toLowerCase().includes("lead");
      if (filter === "VISITS") return n.title?.toLowerCase().includes("visit") || n.body?.toLowerCase().includes("visit");
      return true;
    });
  }, [notifications, filter]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications read");
    }
  };

  const handleMarkSingleRead = async (id: number) => {
    try {
      await markRead(id).unwrap();
    } catch {
      // Silently fail for background mark read
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900 transition-colors duration-150 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <HeaderNav />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          tag="Inbox"
          title="Notifications & Activity"
          subtitle="Real-time alerts across your buyer leads, phone unlocks, site visits, and property updates."
          backHref="/dashboard"
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={isMarkingAll}
                  className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950"
                >
                  Mark all read ({unreadCount})
                </button>
              )}
            </div>
          }
        />

        {/* Dynamic Matrix */}
        <SectionCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill
              label="Unread Alerts"
              value={String(unreadCount)}
              hint={unreadCount === 0 ? "You're all caught up" : "Requires attention"}
              tone={unreadCount > 0 ? "rose" : "slate"}
            />
            <StatPill
              label="Buyer & Tenant Leads"
              value={String(leadsCount)}
              hint="Phone number unlocks"
              tone="amber"
              href="/dashboard/leads"
            />
            <StatPill
              label="Visits & Walkthroughs"
              value={String(visitsCount)}
              hint="Appointments scheduled"
              tone="emerald"
              href="/dashboard/leads"
            />
            <StatPill
              label="Total Notifications"
              value={String(notifications.length)}
              hint="Past 30 days"
              tone="slate"
            />
          </div>
        </SectionCard>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Filter:</span>
            {(["ALL", "UNREAD", "LEADS", "VISITS"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilter(mode)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  filter === mode
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                    : "border border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"
                }`}
              >
                {mode === "ALL" && `All (${notifications.length})`}
                {mode === "UNREAD" && `Unread (${unreadCount})`}
                {mode === "LEADS" && `Leads (${leadsCount})`}
                {mode === "VISITS" && `Visits (${visitsCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Feed */}
        <SectionCard
          title="Activity Feed"
          subtitle="Real-time alerts triggered by buyer actions, document verifications, and listing status changes."
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <RefreshCw className="h-6 w-6 animate-spin text-rose-500" />
              <p className="mt-2 text-sm font-medium">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-800">
              <Inbox className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {filter === "UNREAD" ? "No unread notifications" : "No notifications yet"}
              </p>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                When buyers unlock your phone number, schedule visits, or verify documents, alerts will arrive here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((item) => {
                const isUnread = !item.readAt;
                const isLead = item.type === "NEW_LEAD" || item.title?.includes("Lead");
                const isVisit = item.title?.includes("Visit") || item.body?.includes("Visit");

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isUnread) handleMarkSingleRead(item.id);
                    }}
                    className={`flex flex-col gap-3 rounded-2xl border p-4 transition hover:border-slate-300 dark:hover:border-slate-700 sm:flex-row sm:items-center sm:justify-between cursor-pointer ${
                      isUnread
                        ? "border-rose-200 bg-rose-50/40 shadow-xs dark:border-rose-900/60 dark:bg-rose-950/20"
                        : "border-slate-100 bg-white/90 dark:border-slate-800/80 dark:bg-slate-900/80"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-inner ${
                          isLead
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                            : isVisit
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                        }`}
                      >
                        {isLead ? (
                          <Flame className="h-5 w-5" />
                        ) : isVisit ? (
                          <Calendar className="h-5 w-5" />
                        ) : (
                          <Bell className="h-5 w-5" />
                        )}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </p>
                          {isUnread && (
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                          {item.body}
                        </p>

                        {item.data && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            {item.data.propertyTitle && (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                🏠 {item.data.propertyTitle}
                              </span>
                            )}
                            {item.data.cityName && (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                📍 {item.data.cityName}
                              </span>
                            )}
                            {item.data.buyerPhone && (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                📞 {item.data.buyerPhone}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(item.createdAt)}
                      </span>

                      {item.data?.propertyId && (
                        <Link
                          href={`/properties/${item.data.propertyId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <span>Listing</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}

                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkSingleRead(item.id);
                          }}
                          className="rounded-full p-1 text-slate-400 transition hover:text-emerald-600"
                          title="Mark read"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </main>
  );
}
