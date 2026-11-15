"use client";

import React from "react";
import Link from "next/link";
import { Inbox, Loader2, Lock, MessageCircle, Phone, Unlock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/components/ui/utils";
import { useMyConstructionLeadsQuery, useUnlockConstructionLeadMutation, useUpdateConstructionLeadMutation } from "@/features/construction/api";
import { BUILDING_TYPE_OPTIONS, ENQUIRY_TYPE_OPTIONS, FLOOR_OPTIONS, LEAD_STATUS_OPTIONS, START_WHEN_OPTIONS, label } from "@/features/construction/options";
import type { ConstructionLead, LeadStatus } from "@/features/construction/types";

const timeAgo = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${Math.max(1, m)} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

function LeadCard({ lead, unlockCost }: { lead: ConstructionLead; unlockCost: number }) {
  const [unlock, { isLoading: unlocking }] = useUnlockConstructionLeadMutation();
  const [update, { isLoading: updating }] = useUpdateConstructionLeadMutation();
  const facts = [
    lead.organization ?? "",
    lead.enquiryType ? label(ENQUIRY_TYPE_OPTIONS, lead.enquiryType) : "",
    lead.floors ? label(FLOOR_OPTIONS, lead.floors) : "",
    lead.plotSizeSqft ? `${lead.plotSizeSqft.toLocaleString("en-IN")} sq.ft plot` : "",
    lead.buildingType ? label(BUILDING_TYPE_OPTIONS, lead.buildingType) : "",
    lead.budgetLakhs ? `₹${lead.budgetLakhs} L budget` : "",
    lead.startWhen ? `Start: ${label(START_WHEN_OPTIONS, lead.startWhen)}` : "",
    lead.city ?? "",
  ].filter(Boolean);
  const status = LEAD_STATUS_OPTIONS.find((s) => s.value === lead.status);
  const wa = lead.phone.replace(/\D/g, "").slice(-10);

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{lead.name}</p>
          <p className="text-xs text-slate-500">{timeAgo(lead.createdAt)}</p>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold", status?.tone)}>{status?.label}</span>
      </div>
      {facts.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {facts.map((f) => (
            <span key={f} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">{f}</span>
          ))}
        </div>
      )}
      {lead.message && <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{lead.message}</p>}

      {lead.isUnlocked ? (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            <a href={`tel:+91${wa}`} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white hover:bg-emerald-700">
              <Phone className="h-4 w-4" /> {lead.phone}
            </a>
            <a href={`https://wa.me/91${wa}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-emerald-200 px-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
          {lead.email && <p className="text-xs text-slate-500">{lead.email}</p>}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            Status
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={lead.status}
              disabled={updating}
              onChange={(e) => void update({ id: lead.id, status: e.target.value as LeadStatus }).unwrap().catch(() => toast.error("Couldn't update"))}
            >
              {LEAD_STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500">
            <Lock className="h-4 w-4" /> {lead.phone}
          </span>
          <button
            type="button"
            disabled={unlocking}
            onClick={() =>
              void unlock(lead.id)
                .unwrap()
                .then(() => toast.success("Lead unlocked"))
                .catch((err) => toast.error(err?.data?.message || "Couldn't unlock this lead"))
            }
            className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
            Unlock{unlockCost ? ` · ${unlockCost} credits` : ""}
          </button>
        </div>
      )}
    </li>
  );
}

export function LeadsPanel({ profileId }: { profileId: number }) {
  const { data, isLoading, isError, refetch } = useMyConstructionLeadsQuery(profileId);
  if (isLoading) return <div className="h-40 animate-pulse rounded-3xl bg-white dark:bg-slate-900" />;
  if (isError)
    return (
      <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">
        Couldn&apos;t load leads. <button type="button" className="font-bold underline" onClick={() => void refetch()}>Retry</button>
      </div>
    );
  const items = data?.items ?? [];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Enquiries</h2>
          <p className="text-sm text-slate-500">Unlock a lead to see the customer&apos;s number and call them.</p>
        </div>
        <Link href="/pricing" className="text-sm font-semibold text-rose-600 hover:underline">Buy credits</Link>
      </div>
      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <Inbox className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">No enquiries yet</p>
          <p className="mt-1 text-sm text-slate-500">Add projects and photos to get more enquiries once your listing is live.</p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((l) => <LeadCard key={l.id} lead={l} unlockCost={data?.unlockCost ?? 0} />)}
        </ul>
      )}
    </div>
  );
}
