"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  Crown,
  Loader2,
  MailPlus,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  CreditCard,
  History,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import {
  Organization,
  OrganizationMember,
  OrganizationRole,
  useCreateOrganizationMutation,
  useInviteOrganizationMemberMutation,
  useMyOrganizationsQuery,
  useOrganizationActivityQuery,
  useOrganizationInvitationsQuery,
  useOrganizationMembersQuery,
  useOrganizationPropertiesQuery,
  useRevokeOrganizationInvitationMutation,
  useRemoveOrganizationMemberMutation,
  useTransferOrganizationOwnerMutation,
  useUpdateOrganizationMemberMutation,
} from "@/features/organizations/api";
import {
  useGetBillingSummaryQuery,
  useGetOrgCreditTransactionsQuery,
} from "@/features/contactVerify/api";

const roleOptions: Array<{ value: OrganizationRole; label: string; description: string }> = [
  { value: "OWNER", label: "Owner", description: "Billing, team, listings, and org settings" },
  { value: "ADMIN", label: "Admin", description: "Manage team, listings, and leads" },
  { value: "MANAGER", label: "Manager", description: "Assign work and review team inventory" },
  { value: "AGENT", label: "Agent", description: "Create listings and handle assigned leads" },
  { value: "VIEWER", label: "Viewer", description: "Read-only access for reports and audits" },
];

const assignableRoleOptions = roleOptions.filter((role) => role.value !== "OWNER") as Array<{
  value: Exclude<OrganizationRole, "OWNER">;
  label: string;
  description: string;
}>;

const roleTone: Record<string, string> = {
  OWNER: "border-amber-200 bg-amber-50 text-amber-800",
  ADMIN: "border-rose-200 bg-rose-50 text-rose-700",
  MANAGER: "border-sky-200 bg-sky-50 text-sky-700",
  AGENT: "border-emerald-200 bg-emerald-50 text-emerald-700",
  VIEWER: "border-slate-200 bg-slate-50 text-slate-700",
};

function getErrorMessage(error: unknown) {
  const err = error as { data?: { message?: string }; message?: string; status?: string | number };
  return err?.data?.message || err?.message || (err?.status ? `Request failed (${err.status})` : "Something went wrong");
}

function memberName(member: OrganizationMember) {
  return member.user?.name || member.user?.mobileNumber || member.user?.email || `User #${member.userId}`;
}

function roleLabel(role?: string | null) {
  if (!role) return "Member";
  return role[0] + role.slice(1).toLowerCase();
}

export default function OrganizationDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("AGENCY");
  const [orgAddress, setOrgAddress] = useState("");
  const [inviteMobile, setInviteMobile] = useState("");
  const [memberRole, setMemberRole] = useState<Exclude<OrganizationRole, "OWNER">>("AGENT");
  const [lastInviteLink, setLastInviteLink] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<OrganizationMember | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
    if (!token) {
      window.setTimeout(() => setHasToken(false), 0);
      router.replace("/login?redirect=/dashboard/organization");
      return;
    }
    window.setTimeout(() => setHasToken(true), 0);
  }, [router]);

  const {
    data: organizations = [],
    isLoading: isOrgLoading,
    isFetching: isOrgFetching,
    error: orgError,
    refetch: refetchOrgs,
  } = useMyOrganizationsQuery(undefined, { skip: hasToken !== true });

  const selectedOrg = useMemo(
    () => organizations.find((org) => org.id === selectedOrgId) || organizations[0],
    [organizations, selectedOrgId],
  );

  const {
    data: members = [],
    isLoading: isMembersLoading,
    isFetching: isMembersFetching,
    error: membersError,
    refetch: refetchMembers,
  } = useOrganizationMembersQuery(selectedOrg?.id ?? 0, { skip: !selectedOrg?.id });

  const {
    data: invitations = [],
    isFetching: isInvitationsFetching,
    refetch: refetchInvitations,
  } = useOrganizationInvitationsQuery(selectedOrg?.id ?? 0, { skip: !selectedOrg?.id });

  const { data: activity = [], refetch: refetchActivity } = useOrganizationActivityQuery(selectedOrg?.id ?? 0, {
    skip: !selectedOrg?.id,
  });

  const {
    data: orgProperties = [],
    isFetching: isPropertiesFetching,
    refetch: refetchProperties,
  } = useOrganizationPropertiesQuery(selectedOrg?.id ?? 0, { skip: !selectedOrg?.id });

  // Billing summary & Credit transactions ledger
  const { data: billingSummaryData, refetch: refetchBilling } = useGetBillingSummaryQuery(
    { target: "ORG", organizationId: selectedOrg?.id },
    { skip: !selectedOrg?.id }
  );
  const billingSummary = billingSummaryData?.data;

  const { data: creditLedgerData, refetch: refetchLedger } = useGetOrgCreditTransactionsQuery(
    { organizationId: selectedOrg?.id ?? 0 },
    { skip: !selectedOrg?.id }
  );
  const creditLedger = creditLedgerData?.data?.items ?? [];

  const [createOrganization, { isLoading: isCreatingOrg }] = useCreateOrganizationMutation();
  const [inviteMember, { isLoading: isInvitingMember }] = useInviteOrganizationMemberMutation();
  const [revokeInvitation, { isLoading: isRevokingInvitation }] = useRevokeOrganizationInvitationMutation();
  const [transferOwner, { isLoading: isTransferringOwner }] = useTransferOrganizationOwnerMutation();
  const [updateMember, { isLoading: isUpdatingMember }] = useUpdateOrganizationMemberMutation();
  const [removeMember, { isLoading: isRemovingMember }] = useRemoveOrganizationMemberMutation();

  const myRole = selectedOrg?.role?.name;
  const canManageTeam = myRole === "OWNER" || myRole === "ADMIN";
  const canTransferOwner = myRole === "OWNER";
  const shouldEmphasizeCreate = searchParams.get("create") === "1";

  const memberStats = useMemo(() => {
    return members.reduce<Record<string, number>>((acc, member) => {
      const role = member.role?.name || "MEMBER";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
  }, [members]);

  const pendingInvitesCount = invitations.filter((invite) => invite.status === "PENDING").length;
  const seatsLimit = billingSummary?.allowances?.seats?.limit ?? 2;
  const seatsUsed = members.length + pendingInvitesCount;
  const isSeatFull = seatsUsed >= seatsLimit;

  const createOrg = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError(null);
    try {
      const org = await createOrganization({
        name: orgName.trim(),
        type: orgType,
        address: orgAddress.trim() || undefined,
        countryCode: "IN",
      }).unwrap();
      setOrgName("");
      setOrgAddress("");
      setSelectedOrgId(org.id);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const inviteUserToOrg = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOrg?.id) return;
    setActionError(null);
    setLastInviteLink("");
    try {
      const invitation = await inviteMember({ orgId: selectedOrg.id, mobileNumber: inviteMobile.trim(), role: memberRole }).unwrap();
      setInviteMobile("");
      setMemberRole("AGENT");
      if (invitation.token && typeof window !== "undefined") {
        setLastInviteLink(`${window.location.origin}/login?redirect=/dashboard/organization/invitations/${invitation.token}`);
      }
      void refetchBilling();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const transferOwnership = async (member: OrganizationMember) => {
    if (!selectedOrg?.id || member.role?.name === "OWNER") return;
    setActionError(null);
    try {
      await transferOwner({ orgId: selectedOrg.id, memberId: member.id }).unwrap();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const revokePendingInvitation = async (invitationId: number) => {
    if (!selectedOrg?.id) return;
    setActionError(null);
    try {
      await revokeInvitation({ orgId: selectedOrg.id, invitationId }).unwrap();
      void refetchBilling();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const changeRole = async (member: OrganizationMember, role: OrganizationRole) => {
    if (!selectedOrg?.id || member.role?.name === role) return;
    setActionError(null);
    try {
      await updateMember({ orgId: selectedOrg.id, memberId: member.id, role }).unwrap();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const deleteMember = async (member: OrganizationMember) => {
    if (!selectedOrg?.id) return;
    setActionError(null);
    try {
      await removeMember({ orgId: selectedOrg.id, memberId: member.id }).unwrap();
      setMemberToDelete(null);
      void refetchBilling();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const refreshAll = () => {
    refetchOrgs();
    if (selectedOrg?.id) {
      refetchMembers();
      refetchProperties();
      refetchInvitations();
      refetchActivity();
      refetchBilling();
      refetchLedger();
    }
  };

  if (hasToken === false || hasToken === null) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-150">
      <HeaderNav />
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-rose-600">
              <Building2 className="h-4 w-4" />
              Organization workspace
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {selectedOrg?.name || "Company & Team Workspace"}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Manage agency or builder teams, seat allowances, contact unlocking, and property listings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={refreshAll}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              <RefreshCw className={`h-4 w-4 ${isOrgFetching || isMembersFetching || isPropertiesFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/dashboard/properties?scope=org"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              Org listings
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {(actionError || orgError || membersError) && (
          <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{actionError || getErrorMessage(orgError || membersError)}</span>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="flex flex-col gap-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-950">Workspaces</h2>
                {isOrgLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
              </div>

              <div className="space-y-2">
                {organizations.map((org: Organization) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => setSelectedOrgId(org.id)}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      selectedOrg?.id === org.id
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BriefcaseBusiness className="h-4 w-4 shrink-0" />
                      <span className="truncate text-sm font-bold">{org.name}</span>
                    </div>
                    <p className={`mt-1 text-xs ${selectedOrg?.id === org.id ? "text-slate-300" : "text-slate-500"}`}>
                      {org.type || "Organization"} · {roleLabel(org.role?.name)}
                    </p>
                  </button>
                ))}

                {!isOrgLoading && organizations.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                    No organization found. Create one below to start managing a team.
                  </div>
                )}
              </div>
            </section>

            {/* Capacity & Quotas Card */}
            {selectedOrg && (
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-rose-600" />
                    <h2 className="text-sm font-black text-slate-950">Plan & Allowances</h2>
                  </div>
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                    {billingSummary?.activeSubscription?.plan?.name || "Free Organization"}
                  </span>
                </div>

                <div className="mt-3 space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Employee Seats</span>
                      <span>{seatsUsed} / {seatsLimit} used</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${isSeatFull ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(100, (seatsUsed / seatsLimit) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {members.length} active + {pendingInvitesCount} pending invite{pendingInvitesCount === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-2">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Contact Unlocks</span>
                      <span className="font-bold text-emerald-700">{billingSummary?.credits ?? 0} available</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">Shared across all authorized employees</p>
                  </div>

                  <div className="border-t border-slate-100 pt-2">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Active Listings</span>
                      <span>{billingSummary?.allowances?.listings?.current ?? orgProperties.length} / {billingSummary?.allowances?.listings?.limit ?? 5}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/pricing?tab=organization&orgId=${selectedOrg.id}`}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Upgrade Plan / Buy Contact Packs
                    </Link>
                  </div>
                </div>
              </section>
            )}

            <section className={`rounded-lg border bg-white p-4 shadow-sm ${shouldEmphasizeCreate ? "border-rose-300 ring-2 ring-rose-100" : "border-slate-200"}`}>
              <h2 className="text-sm font-black text-slate-950">Create organization</h2>
              <form onSubmit={createOrg} className="mt-3 space-y-3">
                <label className="block">
                  <span className="text-xs font-bold text-slate-600">Company / agency name</span>
                  <input
                    value={orgName}
                    onChange={(event) => setOrgName(event.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    placeholder="Awasio Realty"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-slate-600">Type</span>
                  <select
                    value={orgType}
                    onChange={(event) => setOrgType(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  >
                    <option value="AGENCY">Agency</option>
                    <option value="BUILDER">Builder</option>
                    <option value="OWNER_COMPANY">Owner company</option>
                    <option value="COMPANY">Company</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-slate-600">Office address</span>
                  <input
                    value={orgAddress}
                    onChange={(event) => setOrgAddress(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    placeholder="Area, city"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isCreatingOrg || !orgName.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingOrg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create workspace
                </button>
              </form>
            </section>
          </aside>

          <section className="flex min-w-0 flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  <Users className="h-4 w-4" />
                  Seats Used
                </div>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {seatsUsed} <span className="text-sm font-semibold text-slate-400">/ {seatsLimit}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {isSeatFull ? "Seat limit reached" : `${seatsLimit - seatsUsed} seat(s) available`}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  <LockKeyhole className="h-4 w-4" />
                  Org Allowance
                </div>
                <p className="mt-2 text-2xl font-black text-emerald-700">{billingSummary?.credits ?? 0}</p>
                <p className="mt-1 text-xs text-slate-500">Shared contact credits</p>
              </div>

              <Link
                href={selectedOrg?.id ? `/dashboard/properties?scope=org&orgId=${selectedOrg.id}` : "/dashboard/properties?scope=org"}
                className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-rose-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 group-hover:text-rose-600 dark:text-slate-400">
                    <Building2 className="h-4 w-4" />
                    Listings
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-rose-600" />
                </div>
                <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{orgProperties.length}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Attached to this org · View all →</p>
              </Link>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  <ShieldCheck className="h-4 w-4" />
                  Agents & Managers
                </div>
                <p className="mt-2 text-2xl font-black text-slate-950">{(memberStats.AGENT || 0) + (memberStats.MANAGER || 0)}</p>
                <p className="mt-1 text-xs text-slate-500">Listing and lead handlers</p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="flex min-w-0 flex-col gap-4">
                <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col gap-2 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-base font-black text-slate-950 dark:text-white">{selectedOrg?.name || "Organization team"}</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Team members and permissions inside this workspace.
                      </p>
                    </div>
                    <Link
                      href={selectedOrg?.id ? `/propertyListing?orgId=${selectedOrg.id}` : "/propertyListing"}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Post under org
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-[0.1em] text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-3 font-bold">Employee</th>
                          <th className="px-4 py-3 font-bold">Contact</th>
                          <th className="px-4 py-3 font-bold">Role & Permissions</th>
                          <th className="px-4 py-3 text-right font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {members.map((member) => {
                          const role = member.role?.name || "MEMBER";
                          const isOwner = role === "OWNER";
                          return (
                            <tr key={member.id} className="align-middle hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {memberName(member).slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate font-bold text-slate-950 dark:text-white max-w-[160px]">{memberName(member)}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Member ID #{member.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 text-xs">
                                <p className="font-semibold text-slate-900 dark:text-slate-200">{member.user?.mobileNumber || "Mobile not added"}</p>
                                <p className="text-slate-400 dark:text-slate-500 truncate max-w-[150px]">{member.user?.email || "Email not added"}</p>
                              </td>
                              <td className="px-4 py-3.5">
                                {isOwner ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300">
                                    <Crown className="h-3 w-3" />
                                    Owner
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={role}
                                      onChange={(event) => changeRole(member, event.target.value as OrganizationRole)}
                                      disabled={!canManageTeam || isUpdatingMember}
                                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                      {assignableRoleOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${roleTone[role] || roleTone.VIEWER}`}>
                                      {roleLabel(role)}
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex justify-end items-center gap-2">
                                  {canTransferOwner && !isOwner && (
                                    <button
                                      type="button"
                                      onClick={() => transferOwnership(member)}
                                      disabled={isTransferringOwner}
                                      className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50/70 px-2.5 py-1 text-xs font-bold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300"
                                      aria-label={`Transfer ownership to ${memberName(member)}`}
                                      title="Transfer organization ownership"
                                    >
                                      <Crown className="h-3.5 w-3.5" />
                                      <span className="hidden sm:inline">Make Owner</span>
                                    </button>
                                  )}
                                  {!isOwner && canManageTeam ? (
                                    <button
                                      type="button"
                                      onClick={() => setMemberToDelete(member)}
                                      disabled={isRemovingMember}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/80 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60"
                                      aria-label={`Remove ${memberName(member)}`}
                                      title="Remove from organization"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>Remove</span>
                                    </button>
                                  ) : isOwner ? (
                                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                                      Owner
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {!isMembersLoading && members.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                              No team members returned for this organization.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Organization Properties Section */}
                <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col gap-2 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-rose-600" />
                      <div>
                        <h2 className="text-base font-black text-slate-950 dark:text-white">Organization Properties ({orgProperties.length})</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Listings published and managed under this organization workspace.
                        </p>
                      </div>
                    </div>
                    <Link
                      href={selectedOrg?.id ? `/dashboard/properties?scope=org&orgId=${selectedOrg.id}` : "/dashboard/properties?scope=org"}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
                    >
                      View all in properties manager →
                    </Link>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orgProperties.map((property: any) => (
                      <div key={property.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-950 dark:text-white truncate max-w-sm sm:max-w-md">
                              {property.title || `Property #${property.id}`}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span>{property.locality ? `${property.locality}, ` : ""}{property.cityName || "India"}</span>
                              <span>·</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{property.listingType || "SELL"}</span>
                              {property.price && (
                                <>
                                  <span>·</span>
                                  <span className="font-bold text-rose-600 dark:text-rose-400">
                                    ₹{Number(property.price).toLocaleString("en-IN")}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {property.status || "DRAFT"}
                          </span>
                          <Link
                            href={`/propertyListing?id=${property.id}`}
                            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    ))}

                    {orgProperties.length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                        No listings currently attached to this organization. Click &quot;Post under org&quot; to create one.
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <aside className="flex flex-col gap-4">
                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-rose-600" />
                      <h2 className="text-sm font-black text-slate-950">Invite employee</h2>
                    </div>
                    {isSeatFull && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                        Seats Full
                      </span>
                    )}
                  </div>

                  {isSeatFull ? (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                      <p className="font-semibold">Seat limit reached ({seatsUsed}/{seatsLimit} in use)</p>
                      <p className="mt-1 text-amber-700">
                        Pending invitations also reserve seats. Upgrade your organization subscription to invite more team members.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={inviteUserToOrg} className="mt-3 space-y-3">
                      <label className="block">
                        <span className="text-xs font-bold text-slate-600">Mobile number</span>
                        <input
                          value={inviteMobile}
                          onChange={(event) => setInviteMobile(event.target.value)}
                          required
                          inputMode="tel"
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                          placeholder="9876543210"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-bold text-slate-600">Role</span>
                        <select
                          value={memberRole}
                          onChange={(event) => setMemberRole(event.target.value as Exclude<OrganizationRole, "OWNER">)}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                        >
                          {assignableRoleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="submit"
                        disabled={isInvitingMember || !canManageTeam || !selectedOrg?.id || !inviteMobile.trim()}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isInvitingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailPlus className="h-4 w-4" />}
                        Send invite
                      </button>
                    </form>
                  )}

                  {lastInviteLink && (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                      <p className="font-bold">Invite link generated</p>
                      <p className="mt-1 break-all">{lastInviteLink}</p>
                    </div>
                  )}
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <MailPlus className="h-4 w-4 text-slate-600" />
                    <h2 className="text-sm font-black text-slate-950">Pending invites</h2>
                  </div>
                  <div className="mt-3 space-y-2">
                    {invitations.filter((invite) => invite.status === "PENDING").map((invite) => (
                      <div key={invite.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-black text-slate-900">{invite.mobileNumber}</p>
                            <p className="mt-1 text-xs text-slate-500">{roleLabel(invite.roleName)} · expires {new Date(invite.expiresAt).toLocaleDateString()}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => revokePendingInvitation(invite.id)}
                            disabled={isRevokingInvitation || !canManageTeam}
                            className="rounded-md border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 transition hover:bg-white disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>
                    ))}
                    {!isInvitationsFetching && invitations.filter((invite) => invite.status === "PENDING").length === 0 && (
                      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">No pending invitations.</p>
                    )}
                  </div>
                </section>

                {/* Org Contact Unlocks & Usage History */}
                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-600" />
                    <h2 className="text-sm font-black text-slate-950">Shared Contact Unlocks</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Contacts unlocked with organization allowance:</p>
                  <div className="mt-3 space-y-2">
                    {creditLedger.filter((item) => item.creditChange < 0).slice(0, 5).map((item) => (
                      <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs">
                        <div className="flex justify-between font-semibold text-slate-900">
                          <span className="truncate">{item.meta?.propertyTitle ? item.meta.propertyTitle : `Property #${item.meta?.propertyId || ""}`}</span>
                          <span className="text-rose-600 font-bold">{item.creditChange} credit</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Unlocked by <strong className="text-slate-700">{item.user?.name || item.meta?.actorName || `User #${item.userId}`}</strong>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                    {creditLedger.filter((item) => item.creditChange < 0).length === 0 && (
                      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                        No contacts unlocked by team yet.
                      </p>
                    )}
                  </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <h2 className="text-sm font-black text-slate-950">Role model</h2>
                  </div>
                  <div className="mt-3 space-y-2">
                    {roleOptions.map((role) => (
                      <div key={role.value} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs font-black text-slate-900">{role.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{role.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          </section>
        </div>
      </div>

      {/* Remove Member Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Remove Team Member</h3>
            </div>
            
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to remove <strong>{memberName(memberToDelete)}</strong> ({roleLabel(memberToDelete.role?.name)}) from <strong>{selectedOrg?.name}</strong>?
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
              They will immediately lose access to organization listings, shared contact unlocking credits, and team workspace tools.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                disabled={isRemovingMember}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMember(memberToDelete)}
                disabled={isRemovingMember}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
              >
                {isRemovingMember ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
