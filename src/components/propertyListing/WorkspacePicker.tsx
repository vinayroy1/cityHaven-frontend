"use client";

import React from "react";
import { User, Building2, ShieldAlert, CheckCircle2, Crown, ShieldCheck } from "lucide-react";
import { useMyOrganizationsQuery, type Organization, type OrganizationRole } from "@/features/organizations/api";
import { cn } from "@/components/ui/utils";

const roleTone: Record<OrganizationRole | "MEMBER", { bg: string; text: string; border: string }> = {
  OWNER: { bg: "bg-amber-50 dark:bg-amber-950/60", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  ADMIN: { bg: "bg-rose-50 dark:bg-rose-950/60", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
  MANAGER: { bg: "bg-sky-50 dark:bg-sky-950/60", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-800" },
  AGENT: { bg: "bg-emerald-50 dark:bg-emerald-950/60", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  VIEWER: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700" },
  MEMBER: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700" },
};

interface WorkspacePickerProps {
  selectedOrgId?: string;
  onSelectPersonal: () => void;
  onSelectOrg: (org: Organization) => void;
}

export function WorkspacePicker({ selectedOrgId, onSelectPersonal, onSelectOrg }: WorkspacePickerProps) {
  const { data: organizations = [], isLoading } = useMyOrganizationsQuery();

  const isPersonal = !selectedOrgId;
  const activeOrg = organizations.find((o) => String(o.id) === String(selectedOrgId));
  const isViewer = activeOrg?.role?.name === "VIEWER";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-4 w-4 text-rose-500" />
            Publishing Workspace & Scope
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select whether this listing is posted under your personal account or an organization team.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Personal Account Option */}
        <button
          type="button"
          onClick={onSelectPersonal}
          className={cn(
            "relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all",
            isPersonal
              ? "border-slate-900 bg-slate-900/5 ring-2 ring-slate-900/20 dark:border-white dark:bg-white/10 dark:ring-white/20"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-sm",
                  isPersonal
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                )}
              >
                <User className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Personal Account
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Individual / Owner listing
                </span>
              </div>
            </div>
            {isPersonal && <CheckCircle2 className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />}
          </div>
        </button>

        {/* Organizations List */}
        {isLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 p-4 text-xs text-slate-400 dark:border-slate-800">
            Loading organizations...
          </div>
        ) : (
          organizations.map((org) => {
            const isSelected = String(selectedOrgId) === String(org.id);
            const roleName = org.role?.name || "MEMBER";
            const tone = roleTone[roleName] || roleTone.MEMBER;
            const orgIsViewer = roleName === "VIEWER";

            return (
              <button
                key={org.id}
                type="button"
                onClick={() => onSelectOrg(org)}
                className={cn(
                  "relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all",
                  isSelected
                    ? "border-rose-500 bg-rose-500/5 ring-2 ring-rose-500/20 dark:border-rose-400 dark:bg-rose-400/10 dark:ring-rose-400/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg text-sm",
                        isSelected
                          ? "bg-rose-600 text-white dark:bg-rose-500"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      )}
                    >
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block truncate max-w-[170px]">
                        {org.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                            tone.bg,
                            tone.text,
                            tone.border
                          )}
                        >
                          {roleName === "OWNER" && <Crown className="h-2.5 w-2.5" />}
                          {["ADMIN", "MANAGER", "AGENT"].includes(roleName) && (
                            <ShieldCheck className="h-2.5 w-2.5" />
                          )}
                          {roleName}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          #{org.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Viewer Warning Alert if Viewer selected */}
      {isViewer && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200">
          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Viewer Role Restriction</span>
            <span>
              Your assigned role in <strong>{activeOrg?.name}</strong> is <strong>Viewer</strong>. Viewers have read-only permissions and cannot create or publish property listings. Please switch to your Personal Account or ask an organization Admin/Owner to upgrade your membership.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
