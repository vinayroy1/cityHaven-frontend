"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, Check, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { InteriorWizardValues } from "@/types/interior.types";
import { useCreateOrganizationMutation, useMyOrganizationsQuery } from "@/features/organizations/api";
import { useLinkInteriorOrganizationMutation } from "@/features/interiors/api";
import { EmptyState, TextInput, apiErrorMessage as errorMessage, primaryBtn, secondaryBtn, setPath, usePathValue } from "./ui";

const CAN_LINK = new Set(["OWNER", "ADMIN"]);

export function OrganizationLinker({ form }: CustomStepProps<InteriorWizardValues>) {
  const orgId = usePathValue<number | null>(form, "identity.organizationId");
  const businessName = usePathValue<string>(form, "identity.businessName");
  const { data: orgs = [], isLoading } = useMyOrganizationsQuery();
  const [createOrg, { isLoading: creating }] = useCreateOrganizationMutation();
  const [linkOrg, { isLoading: linking }] = useLinkInteriorOrganizationMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");

  const eligible = orgs.filter((o) => CAN_LINK.has(o.role?.name ?? ""));
  const others = orgs.filter((o) => !CAN_LINK.has(o.role?.name ?? ""));

  const link = async (id: number) => {
    try {
      await linkOrg({ organizationId: id }).unwrap();
      setPath(form, "identity.organizationId", id);
      toast.success("Organization linked");
    } catch (e) {
      toast.error(errorMessage(e, "Could not link organization"));
    }
  };

  const create = async () => {
    const n = name.trim();
    if (n.length < 2) return toast.error("Enter your company name");
    try {
      const org = await createOrg({ name: n, type: "INTERIOR_DESIGN" }).unwrap();
      setShowCreate(false);
      setName("");
      if (!businessName) setPath(form, "identity.businessName", n);
      await link(org.id);
    } catch (e) {
      toast.error(errorMessage(e, "Could not create organization"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="size-4 animate-spin" /> Loading your organizations…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {eligible.length === 0 && !showCreate && (
        <EmptyState
          icon={<Building2 className="size-5" />}
          title="Link your company"
          description="Company listings are tied to an organization so your team can manage leads together."
          action={
            <button type="button" className={primaryBtn} onClick={() => setShowCreate(true)}>
              <Plus className="size-4" /> Create organization
            </button>
          }
        />
      )}

      {eligible.length > 0 && (
        <div role="radiogroup" aria-label="Organization" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {eligible.map((o) => {
            const active = orgId === o.id;
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={linking}
                onClick={() => link(o.id)}
                className={cn(
                  "flex min-w-0 items-center gap-3 rounded-xl border-2 p-3 text-left transition",
                  active ? "border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800" : "border-slate-200 hover:border-slate-400 dark:border-slate-800",
                )}
              >
                {o.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.logo} alt="" className="size-10 rounded-lg object-cover" />
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold dark:bg-slate-800">
                    {o.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{o.name}</span>
                  <span className="block text-xs text-slate-500">{o.role?.name?.toLowerCase()}</span>
                </span>
                {active && <Check className="size-5 shrink-0 text-emerald-600" />}
              </button>
            );
          })}
          {!showCreate && (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 p-3 text-sm font-medium text-slate-600 hover:border-slate-500 dark:border-slate-700"
            >
              <Plus className="size-4" /> New organization
            </button>
          )}
        </div>
      )}

      {showCreate && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-end dark:border-slate-800">
          <TextInput
            className="flex-1"
            label="Company name"
            value={name}
            onChange={setName}
            placeholder="As registered"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), create())}
          />
          <div className="flex gap-2">
            <button type="button" className={secondaryBtn} onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="button" className={primaryBtn} onClick={create} disabled={creating || linking}>
              {(creating || linking) && <Loader2 className="size-4 animate-spin" />} Create & link
            </button>
          </div>
        </div>
      )}

      {others.length > 0 && (
        <p className="text-xs text-slate-500">
          {others.length} other organization{others.length > 1 ? "s" : ""} hidden — only owners and admins can link a listing.{" "}
          <Link href="/dashboard/organization" className="underline">
            Manage organizations
          </Link>
        </p>
      )}
    </div>
  );
}

export default OrganizationLinker;
