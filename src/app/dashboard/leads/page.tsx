"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  MessageSquare,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { apiFetch } from "@/lib/api/query";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatPill } from "../components/StatPill";
import {
  getVisitBookings,
  updateVisitBookingStatus,
  type VisitBooking,
} from "@/lib/services/visitBookings";
import { ALL_AGENTS } from "@/data/agents";

type ApiLead = {
  id: number;
  status?: string | null;
  guestName?: string | null;
  guestContact?: string | null;
  message?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  propertyId?: number | null;
  buyer?: { name?: string | null; mobileNumber?: string | null } | null;
  property?: {
    id?: number;
    title?: string | null;
    cityName?: string | null;
    locality?: string | null;
    listingType?: string | null;
    price?: number | string | null;
  } | null;
};

type UnifiedLead = {
  id: string | number;
  isTourBooking: boolean;
  agentId?: string;
  agentName?: string;
  agentAvatar?: string;
  visitorName: string;
  visitorPhone: string;
  tourDay?: string;
  tourSlot?: string;
  propertyTitle: string;
  cityName?: string;
  locality?: string;
  price?: string | number | null;
  message?: string | null;
  status: "NEW" | "CONTACTED" | "VISIT_SCHEDULED" | "WON";
  updatedAt?: string | null;
  createdAt?: string | null;
  notes?: string;
};

const STAGES = [
  { key: "NEW", title: "New", next: "CONTACTED", action: "Mark contacted" },
  { key: "CONTACTED", title: "Contacted", next: "VISIT_SCHEDULED", action: "Move to visit" },
  { key: "VISIT_SCHEDULED", title: "Visits Scheduled", next: "WON", action: "Mark won" },
  { key: "WON", title: "Closed / Won", next: "CONTACTED", action: "Reopen" },
] as const;

function formatPrice(value?: string | number | null) {
  if (!value) return null;
  if (typeof value === "number") return `₹ ${value.toLocaleString("en-IN")}`;
  return String(value);
}

function timeLabel(value?: string | null) {
  if (!value) return "Recently";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [localVisits, setLocalVisits] = useState<VisitBooking[]>([]);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState("ALL");

  const syncVisits = () => {
    setLocalVisits(getVisitBookings());
  };

  useEffect(() => {
    syncVisits();
    const handleVisitChange = () => syncVisits();
    window.addEventListener("awasio:visit-booked", handleVisitChange);
    window.addEventListener("awasio:visit-updated", handleVisitChange);
    return () => {
      window.removeEventListener("awasio:visit-booked", handleVisitChange);
      window.removeEventListener("awasio:visit-updated", handleVisitChange);
    };
  }, []);

  const leadsQuery = useQuery({
    queryKey: ["dashboard-leads"],
    queryFn: async () => {
      try {
        const assigned = await apiFetch<{ items?: ApiLead[] } | ApiLead[]>({
          url: API_ENDPOINTS.leads.assigned,
          params: { pageSize: 100 },
        });
        if (Array.isArray(assigned)) return assigned;
        return assigned.items ?? [];
      } catch {
        return [];
      }
    },
  });

  const updateApiStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiFetch({
        url: API_ENDPOINTS.leads.status(id),
        init: {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-leads"] }),
  });

  // Convert API leads to Unified format
  const apiLeads = leadsQuery.data ?? [];
  const unifiedApiLeads: UnifiedLead[] = useMemo(() => {
    return apiLeads.map((lead) => ({
      id: lead.id,
      isTourBooking: false,
      visitorName: lead.buyer?.name || lead.guestName || "Prospective buyer",
      visitorPhone: lead.buyer?.mobileNumber || lead.guestContact || "",
      propertyTitle: lead.property?.title || "Property Enquiry",
      cityName: lead.property?.cityName || undefined,
      locality: lead.property?.locality || undefined,
      price: lead.property?.price,
      message: lead.message,
      status: (lead.status as any) || "NEW",
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    }));
  }, [apiLeads]);

  // Convert local visit bookings to Unified format
  const unifiedVisitBookings: UnifiedLead[] = useMemo(() => {
    return localVisits.map((v) => ({
      id: v.id,
      isTourBooking: true,
      agentId: v.agentId,
      agentName: v.agentName,
      agentAvatar: v.agentAvatar,
      visitorName: v.visitorName,
      visitorPhone: v.visitorPhone,
      tourDay: v.tourDay,
      tourSlot: v.tourSlot,
      propertyTitle: v.propertyTitle,
      cityName: v.cityName,
      locality: v.locality,
      status: v.status,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      notes: v.notes,
    }));
  }, [localVisits]);

  // Combined Leads
  const allLeads = useMemo(() => {
    const combined = [...unifiedVisitBookings, ...unifiedApiLeads];
    if (selectedAgentFilter === "ALL") return combined;
    return combined.filter(
      (item) => item.agentId === selectedAgentFilter || !item.isTourBooking
    );
  }, [unifiedVisitBookings, unifiedApiLeads, selectedAgentFilter]);

  const handleStageTransition = (lead: UnifiedLead, nextStage: string) => {
    if (lead.isTourBooking) {
      updateVisitBookingStatus(String(lead.id), nextStage as any);
      syncVisits();
    } else {
      updateApiStatus.mutate({ id: Number(lead.id), status: nextStage });
    }
  };

  const grouped = useMemo(() => {
    return STAGES.reduce<Record<string, UnifiedLead[]>>((acc, stage) => {
      acc[stage.key] = allLeads.filter((lead) => (lead.status || "NEW") === stage.key);
      return acc;
    }, {});
  }, [allLeads]);

  const visits = grouped.VISIT_SCHEDULED?.length ?? 0;
  const closed = grouped.WON?.length ?? 0;
  const conversion = allLeads.length ? Math.round((closed / allLeads.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-150 dark:bg-slate-950 dark:text-slate-100">
      <HeaderNav />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          tag="Agent CRM"
          title="Leads & Site Visit Bookings"
          subtitle="Manage buyer tour requests, in-person walkthrough appointments, and client deal progression."
          backHref="/dashboard"
          actions={
            <div className="flex items-center gap-2">
              <select
                value={selectedAgentFilter}
                onChange={(e) => setSelectedAgentFilter(e.target.value)}
                aria-label="Filter by assigned advisor"
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="ALL">All Advisors & Properties</option>
                {ALL_AGENTS.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.city})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  syncVisits();
                  leadsQuery.refetch();
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${leadsQuery.isFetching ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          }
        />

        {/* Stats Matrix */}
        <SectionCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill
              label="Total Active Inquiries"
              value={String(allLeads.length)}
              hint="Tours & CRM leads"
              tone="rose"
            />
            <StatPill
              label="New Inbound Requests"
              value={String(grouped.NEW?.length ?? 0)}
              hint="Awaiting first call"
              tone="emerald"
            />
            <StatPill
              label="Scheduled Walkthroughs"
              value={String(visits)}
              hint="In-person site visits"
              tone="amber"
            />
            <StatPill
              label="Close Rate"
              value={`${conversion}%`}
              hint="Deals closed"
              tone="slate"
            />
          </div>
        </SectionCard>

        {/* Pipeline Kanban Board */}
        {allLeads.length === 0 ? (
          <SectionCard>
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <UserRoundCheck className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                No active bookings or leads
              </p>
              <p className="max-w-md text-xs text-slate-500 dark:text-slate-400">
                Site visit requests booked by clients from the homepage, property search, or advisor profiles will automatically appear here.
              </p>
            </div>
          </SectionCard>
        ) : (
          <div className="grid gap-4 lg:grid-cols-4">
            {STAGES.map((stage) => {
              const stageItems = grouped[stage.key] ?? [];
              return (
                <SectionCard
                  key={stage.key}
                  title={`${stage.title} (${stageItems.length})`}
                  className="lg:h-full"
                >
                  <div className="space-y-3">
                    {stageItems.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-400">No leads in this stage</p>
                    ) : (
                      stageItems.map((lead) => {
                        const cleanPhone = lead.visitorPhone.replace(/\D/g, "");
                        const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Hi ${lead.visitorName}, this is ${lead.agentName || "Awasio Advisor"} regarding your property walkthrough request for ${lead.propertyTitle}.`
                        )}`;

                        return (
                          <div
                            key={lead.id}
                            className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                          >
                            {/* Lead Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
                                  {lead.visitorName}
                                </p>
                                <p className="truncate text-xs font-medium text-slate-600 dark:text-slate-400">
                                  {lead.propertyTitle}
                                </p>
                              </div>
                              <span className="shrink-0 text-[10px] font-semibold uppercase text-rose-500">
                                {timeLabel(lead.updatedAt || lead.createdAt)}
                              </span>
                            </div>

                            {/* In-Person Tour Details Badge */}
                            {lead.isTourBooking && (
                              <div className="mt-2.5 rounded-lg bg-rose-50/80 p-2 text-xs dark:bg-rose-950/40">
                                <p className="font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 text-[11px]">
                                  <CalendarClock className="h-3.5 w-3.5 text-rose-600" />
                                  <span>{lead.tourDay} • {lead.tourSlot}</span>
                                </p>
                                {lead.agentName && (
                                  <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                    Assigned Advisor: <strong className="text-slate-900 dark:text-slate-200">{lead.agentName}</strong>
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Location & Price */}
                            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              {lead.price && (
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                                  {formatPrice(lead.price)}
                                </span>
                              )}
                              {lead.cityName && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  <MapPin className="h-3 w-3 text-rose-500" />
                                  {lead.locality ? `${lead.locality}, ` : ""}
                                  {lead.cityName}
                                </span>
                              )}
                            </div>

                            {/* Notes / Message */}
                            {(lead.notes || lead.message) && (
                              <p className="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400 italic">
                                &quot;{lead.notes || lead.message}&quot;
                              </p>
                            )}

                            {/* Actions */}
                            <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                              <div className="flex items-center gap-1.5">
                                {lead.visitorPhone && (
                                  <a
                                    href={`tel:${cleanPhone}`}
                                    aria-label="Call lead"
                                    title={`Call ${lead.visitorPhone}`}
                                    className="rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                  >
                                    <PhoneCall className="h-3.5 w-3.5" />
                                  </a>
                                )}
                                {cleanPhone && (
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="WhatsApp lead"
                                    title="WhatsApp client"
                                    className="rounded-lg border border-emerald-200 p-1.5 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleStageTransition(lead, stage.next)}
                                className="rounded-lg bg-rose-600 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-rose-700 active:scale-95"
                              >
                                {stage.action}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </SectionCard>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
