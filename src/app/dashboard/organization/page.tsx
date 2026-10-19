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
  Check,
  Copy,
  CreditCard,
  History,
  LockKeyhole,
  MailCheck,
  MailPlus,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
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
  useResendOrganizationInvitationMutation,
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
  const err = error as {
    data?: {
      message?: string;
      errors?: Array<{ message?: string; path?: string }>;
    };
    message?: string;
    status?: string | number;
  };
  if (err?.data?.errors && Array.isArray(err.data.errors) && err.data.errors.length > 0) {
    const errorDetails = err.data.errors.map((e) => e.message).filter(Boolean).join(". ");
    if (errorDetails) return errorDetails;
  }
  return err?.data?.message || err?.message || (err?.status ? `Request failed (${err.status})` : "Something went wrong");
}

function memberName(member: OrganizationMember) {
  return member.user?.name || member.user?.mobileNumber || member.user?.email || `User #${member.userId}`;
}

function roleLabel(role?: string | null) {
  if (!role) return "Member";
  return role[0] + role.slice(1).toLowerCase();
}

function OrganizationDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("AGENCY");
  const [orgAddress, setOrgAddress] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [memberRole, setMemberRole] = useState<Exclude<OrganizationRole, "OWNER">>("AGENT");
  const [lastInviteLink, setLastInviteLink] = useState("");
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [resendSuccessId, setResendSuccessId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<OrganizationMember | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

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
  const [resendInvitation] = useResendOrganizationInvitationMutation();
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
    setInviteSuccessMsg(null);
    setLastInviteLink("");
    setCopiedLink(false);
    const targetEmail = inviteEmail.trim().toLowerCase();
    try {
      const invitation = await inviteMember({
        orgId: selectedOrg.id,
        email: targetEmail,
        role: memberRole,
      }).unwrap();
      setInviteEmail("");
      setMemberRole("AGENT");
      if (invitation.token && typeof window !== "undefined") {
        setLastInviteLink(`${window.location.origin}/dashboard/organization/invitations/${invitation.token}`);
      }
      if (invitation.emailSent) {
        setInviteSuccessMsg(`Invitation email sent directly to ${targetEmail} with joining link!`);
      } else {
        setInviteSuccessMsg(`Invitation created for ${targetEmail}.`);
      }
      void refetchBilling();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const handleResendInvitation = async (invitationId: number, email?: string | null) => {
    if (!selectedOrg?.id) return;
    setActionError(null);
    setResendingId(invitationId);
    try {
      const res = await resendInvitation({ orgId: selectedOrg.id, invitationId }).unwrap();
      setResendSuccessId(invitationId);
      if (res?.token && typeof window !== "undefined") {
        setLastInviteLink(`${window.location.origin}/dashboard/organization/invitations/${res.token}`);
      }
      setInviteSuccessMsg(`Invitation email resent to ${email || "member"}!`);
      setTimeout(() => setResendSuccessId(null), 3500);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setResendingId(null);
    }
  };

  const copyInviteLink = async (url: string) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
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
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:gap-5 px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="flex flex-col gap-2.5 sm:gap-4 border-b border-slate-200/80 pb-3 sm:pb-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              <Building2 className="h-3.5 w-3.5" />
              <span>Organization workspace</span>
            </div>
            <h1 className="mt-0.5 sm:mt-2 text-xl font-black tracking-tight text-slate-950 sm:text-3xl dark:text-white">
              {selectedOrg?.name || "Company & Team Workspace"}
            </h1>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 hidden sm:block max-w-2xl">
              Manage agency or builder teams, seat allowances, contact unlocking, and property listings.
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <button
              type="button"
              onClick={refreshAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isOrgFetching || isMembersFetching || isPropertiesFetching ? "animate-spin text-rose-600 dark:text-rose-400" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/dashboard/properties?scope=org"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white shrink-0"
            >
              <span>Org listings</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {(actionError || orgError || membersError) && (
          <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{actionError || getErrorMessage(orgError || membersError)}</span>
          </div>
        )}

        {isOrgLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading organization workspace...</p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="mx-auto w-full max-w-2xl py-2 sm:py-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                    Create Your Organization Workspace
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Collaborate with your team, share contact unlock credits, and publish listings under your company brand.
                  </p>
                </div>
              </div>

              <form onSubmit={createOrg} className="mt-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Company / Agency Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    value={orgName}
                    onChange={(event) => setOrgName(event.target.value)}
                    required
                    placeholder="e.g. Skyline Real Estate, Apex Builders"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Workspace Type
                    </label>
                    <select
                      value={orgType}
                      onChange={(event) => setOrgType(event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="AGENCY">Agency</option>
                      <option value="BUILDER">Builder</option>
                      <option value="OWNER_COMPANY">Owner Company</option>
                      <option value="COMPANY">Company</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Office Address <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      value={orgAddress}
                      onChange={(event) => setOrgAddress(event.target.value)}
                      placeholder="e.g. Sector 62, Noida"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingOrg || !orgName.trim()}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-60 dark:bg-rose-600 dark:hover:bg-rose-700"
                >
                  {isCreatingOrg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span>Create Workspace</span>
                </button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  What you get with an organization
                </p>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-850">
                    <Users className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    <h3 className="mt-1.5 text-xs font-bold text-slate-900 dark:text-white">Team Management</h3>
                    <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">Invite managers and agents with custom permissions.</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-850">
                    <LockKeyhole className="h-4 w-4 text-amber-500" />
                    <h3 className="mt-1.5 text-xs font-bold text-slate-900 dark:text-white">Pooled Credits</h3>
                    <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">Share contact unlocks and lead allowances across all staff.</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-850">
                    <Building2 className="h-4 w-4 text-indigo-500" />
                    <h3 className="mt-1.5 text-xs font-bold text-slate-900 dark:text-white">Company Listings</h3>
                    <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">Publish properties directly under your official brand.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="order-2 lg:order-1 flex flex-col gap-3 sm:gap-4">
              <section className="rounded-xl sm:rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-black text-slate-950 dark:text-white">Workspaces</h2>
                  <div className="flex items-center gap-2">
                    {isOrgLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
                    <button
                      type="button"
                      onClick={() => setShowCreateForm((prev) => !prev)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
                    >
                      {showCreateForm ? "Hide" : "+ New"}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {organizations.map((org: Organization) => (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => setSelectedOrgId(org.id)}
                      className={`w-full rounded-lg border p-2.5 sm:p-3 text-left transition ${
                        selectedOrg?.id === org.id
                          ? "border-slate-950 bg-slate-950 text-white dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-100"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate text-xs sm:text-sm font-bold">{org.name}</span>
                      </div>
                      <p className={`mt-0.5 text-[11px] ${selectedOrg?.id === org.id ? "text-slate-300 dark:text-rose-300/80" : "text-slate-500 dark:text-slate-400"}`}>
                        {org.type || "Organization"} · {roleLabel(org.role?.name)}
                      </p>
                    </button>
                  ))}
                </div>

                {showCreateForm && (
                  <form onSubmit={createOrg} className="mt-3.5 border-t border-slate-100 pt-3 dark:border-slate-800 space-y-2.5">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">New workspace</p>
                    <label className="block">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Company / agency name</span>
                      <input
                        value={orgName}
                        onChange={(event) => setOrgName(event.target.value)}
                        required
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="Awasio Realty"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Type</span>
                      <select
                        value={orgType}
                        onChange={(event) => setOrgType(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="AGENCY">Agency</option>
                        <option value="BUILDER">Builder</option>
                        <option value="OWNER_COMPANY">Owner company</option>
                        <option value="COMPANY">Company</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Office address</span>
                      <input
                        value={orgAddress}
                        onChange={(event) => setOrgAddress(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="Area, city"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={isCreatingOrg || !orgName.trim()}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCreatingOrg ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      Create workspace
                    </button>
                  </form>
                )}
              </section>

              {/* Capacity & Quotas Card */}
              {selectedOrg && (
                <section className="rounded-xl sm:rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      <h2 className="text-xs sm:text-sm font-black text-slate-950 dark:text-white">Plan & Allowances</h2>
                    </div>
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      {billingSummary?.activeSubscription?.plan?.name || "Free Organization"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                        <span>Employee Seats</span>
                        <span>{seatsUsed} / {seatsLimit} used</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all ${isSeatFull ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(100, (seatsUsed / seatsLimit) * 100)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                        {members.length} active + {pendingInvitesCount} pending invite{pendingInvitesCount === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
                      <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                        <span>Contact Unlocks</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">{billingSummary?.credits ?? 0} available</span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">Shared across all authorized employees</p>
                    </div>

                    <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
                      <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                        <span>Active Listings</span>
                        <span>{billingSummary?.allowances?.listings?.current ?? orgProperties.length} / {billingSummary?.allowances?.listings?.limit ?? 5}</span>
                      </div>
                    </div>

                    <div className="pt-1.5">
                      <Link
                        href={`/pricing?tab=organization&orgId=${selectedOrg.id}`}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Upgrade Plan / Buy Packs
                      </Link>
                    </div>
                  </div>
                </section>
              )}
            </aside>

            <section className="order-1 lg:order-2 flex min-w-0 flex-col gap-3 sm:gap-4">
              {/* Mobile Workspace Switcher Bar (when multiple orgs exist) */}
              {organizations.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar lg:hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">Org:</span>
                  {organizations.map((org: Organization) => (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => setSelectedOrgId(org.id)}
                      className={`rounded-full px-2.5 py-1 text-xs font-bold transition whitespace-nowrap shrink-0 ${
                        selectedOrg?.id === org.id
                          ? "bg-slate-900 text-white shadow-2xs dark:bg-slate-100 dark:text-slate-950"
                          : "bg-white text-slate-700 border border-slate-200/90 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
                      }`}
                    >
                      {org.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Metrics Bar - Horizontal swipeable on mobile, Grid on desktop */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:grid sm:grid-cols-2 xl:grid-cols-4 sm:gap-3">
                <div className="rounded-xl sm:rounded-lg border border-slate-200 bg-white p-2.5 sm:p-4 shadow-2xs min-w-[95px] sm:min-w-0 shrink-0 sm:shrink dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Users className="h-3.5 w-3.5 text-rose-500" />
                    <span className="truncate">Seats</span>
                  </div>
                  <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-black text-slate-950 dark:text-white">
                    {seatsUsed} <span className="text-xs sm:text-sm font-semibold text-slate-400">/ {seatsLimit}</span>
                  </p>
                  <p className="mt-0.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                    {isSeatFull ? "Limit reached" : `${seatsLimit - seatsUsed} available`}
                  </p>
                </div>

                <div className="rounded-xl sm:rounded-lg border border-slate-200 bg-white p-2.5 sm:p-4 shadow-2xs min-w-[95px] sm:min-w-0 shrink-0 sm:shrink dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <LockKeyhole className="h-3.5 w-3.5 text-amber-500" />
                    <span className="truncate">Credits</span>
                  </div>
                  <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">{billingSummary?.credits ?? 0}</p>
                  <p className="mt-0.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">Contact credits</p>
                </div>

                <Link
                  href={selectedOrg?.id ? `/dashboard/properties?scope=org&orgId=${selectedOrg.id}` : "/dashboard/properties?scope=org"}
                  className="group rounded-xl sm:rounded-lg border border-slate-200 bg-white p-2.5 sm:p-4 shadow-2xs transition hover:border-rose-300 hover:shadow-xs min-w-[95px] sm:min-w-0 shrink-0 sm:shrink dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-rose-600 dark:text-slate-400">
                      <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="truncate">Listings</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-rose-600 hidden sm:block" />
                  </div>
                  <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-black text-slate-950 dark:text-white">{orgProperties.length}</p>
                  <p className="mt-0.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">View all →</p>
                </Link>

                <div className="rounded-xl sm:rounded-lg border border-slate-200 bg-white p-2.5 sm:p-4 shadow-2xs min-w-[95px] sm:min-w-0 shrink-0 sm:shrink dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="truncate">Team Handlers</span>
                  </div>
                  <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-black text-slate-950 dark:text-white">{(memberStats.AGENT || 0) + (memberStats.MANAGER || 0)}</p>
                  <p className="mt-0.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">Agents & Managers</p>
                </div>
              </div>

              <div className="grid gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
                  <section className="rounded-xl sm:rounded-lg border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-2 border-b border-slate-200 p-3.5 sm:p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-sm sm:text-base font-black text-slate-950 dark:text-white">{selectedOrg?.name || "Organization team"} ({members.length})</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Team members and permissions inside this workspace.
                        </p>
                      </div>
                      <Link
                        href={selectedOrg?.id ? `/propertyListing?orgId=${selectedOrg.id}` : "/propertyListing"}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 self-start sm:self-auto"
                      >
                        Post under org
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {/* Mobile Card View for Team Members */}
                    <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                      {members.map((member) => {
                        const role = member.role?.name || "MEMBER";
                        const isOwner = role === "OWNER";
                        return (
                          <div key={member.id} className="p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  {memberName(member).slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-slate-950 dark:text-white max-w-[170px]">{memberName(member)}</p>
                                  <p className="text-[10px] text-slate-400">ID #{member.id}</p>
                                </div>
                              </div>
                              {isOwner ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300">
                                  <Crown className="h-3 w-3" />
                                  Owner
                                </span>
                              ) : (
                                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${roleTone[role] || roleTone.VIEWER}`}>
                                  {roleLabel(role)}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/50 p-2 rounded-lg">
                              {member.user?.mobileNumber && <span>📞 {member.user.mobileNumber}</span>}
                              {member.user?.email && <span className="truncate max-w-[190px]">✉️ {member.user.email}</span>}
                              {!member.user?.mobileNumber && !member.user?.email && <span>No contact added</span>}
                            </div>

                            {!isOwner && canManageTeam && (
                              <div className="flex items-center justify-between gap-2 pt-0.5">
                                <select
                                  value={role}
                                  onChange={(event) => changeRole(member, event.target.value as OrganizationRole)}
                                  disabled={isUpdatingMember}
                                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-800 outline-none transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                >
                                  {assignableRoleOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>

                                <div className="flex items-center gap-1.5">
                                  {canTransferOwner && (
                                    <button
                                      type="button"
                                      onClick={() => transferOwnership(member)}
                                      disabled={isTransferringOwner}
                                      className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300"
                                    >
                                      Make Owner
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setMemberToDelete(member)}
                                    disabled={isRemovingMember}
                                    className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/80 dark:bg-rose-950/60 dark:text-rose-300"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {!isMembersLoading && members.length === 0 && (
                        <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                          No team members returned for this organization.
                        </div>
                      )}
                    </div>

                    {/* Desktop Table for Team Members */}
                    <div className="hidden sm:block overflow-x-auto">
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
                  <section className="rounded-xl sm:rounded-lg border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-2 border-b border-slate-200 p-3.5 sm:p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        <div>
                          <h2 className="text-sm sm:text-base font-black text-slate-950 dark:text-white">Organization Properties ({orgProperties.length})</h2>
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
                        <div key={property.id} className="flex flex-col gap-2.5 p-3 sm:p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs sm:text-sm text-slate-950 dark:text-white truncate max-w-sm sm:max-w-md">
                                {property.title || `Property #${property.id}`}
                              </p>
                              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
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
                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {property.status || "DRAFT"}
                            </span>
                            <Link
                              href={`/propertyListing?id=${property.id}`}
                              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      ))}

                      {orgProperties.length === 0 && (
                        <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                          No listings currently attached to this organization. Click &quot;Post under org&quot; to create one.
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <aside className="flex flex-col gap-3 sm:gap-4">
                  <section className="rounded-xl sm:rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        <h2 className="text-xs sm:text-sm font-black text-slate-950 dark:text-white">Invite employee</h2>
                      </div>
                      {isSeatFull && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300">
                          Seats Full
                        </span>
                      )}
                    </div>

                    {isSeatFull ? (
                      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300">
                        <p className="font-semibold">Seat limit reached ({seatsUsed}/{seatsLimit} in use)</p>
                        <p className="mt-1 text-amber-700 dark:text-amber-400">
                          Pending invitations also reserve seats. Upgrade your subscription to invite more team members.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={inviteUserToOrg} className="mt-3 space-y-2.5">
                        <label className="block">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Email address</span>
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(event) => setInviteEmail(event.target.value)}
                            required
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs sm:text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            placeholder="colleague@company.com"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Role</span>
                          <select
                            value={memberRole}
                            onChange={(event) => setMemberRole(event.target.value as Exclude<OrganizationRole, "OWNER">)}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                          disabled={isInvitingMember || !canManageTeam || !selectedOrg?.id || !inviteEmail.trim()}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
                        >
                          {isInvitingMember ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MailPlus className="h-3.5 w-3.5" />}
                          Send invite
                        </button>
                      </form>
                    )}

                    {/* Invite feedback & link copy box */}
                    {inviteSuccessMsg && (
                      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-200">
                        <div className="flex items-start gap-2.5">
                          <MailCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1 space-y-2">
                            <p className="font-bold leading-snug">{inviteSuccessMsg}</p>
                            {lastInviteLink && (
                              <div className="space-y-1">
                                <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                                  Direct join link:
                                </p>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    readOnly
                                    value={lastInviteLink}
                                    className="w-full rounded-lg border border-emerald-300/80 bg-white px-2.5 py-1 text-[11px] text-slate-800 select-all outline-none dark:border-emerald-800 dark:bg-slate-900 dark:text-slate-100"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => copyInviteLink(lastInviteLink)}
                                    className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-emerald-700 transition"
                                  >
                                    {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    <span>{copiedLink ? "Copied" : "Copy"}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="rounded-xl sm:rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MailPlus className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        <h2 className="text-xs sm:text-sm font-black text-slate-950 dark:text-white">Pending invites</h2>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                        {invitations.filter((invite) => invite.status === "PENDING").length}
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-2">
                      {invitations.filter((invite) => invite.status === "PENDING").map((invite) => {
                        const isResending = resendingId === invite.id;
                        const isResent = resendSuccessId === invite.id;
                        return (
                          <div key={invite.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-850">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-black text-slate-900 dark:text-white">
                                    {invite.email || invite.mobileNumber}
                                  </p>
                                  <div className="mt-0.5 flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                      {roleLabel(invite.roleName)}
                                    </span>
                                    <span>·</span>
                                    <span>Expires {new Date(invite.expiresAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                                {invite.email && canManageTeam && (
                                  <button
                                    type="button"
                                    onClick={() => handleResendInvitation(invite.id, invite.email)}
                                    disabled={isResending || isResent}
                                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-bold transition shadow-2xs ${
                                      isResent
                                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                    }`}
                                    title="Resend invitation email with joining link"
                                  >
                                    {isResending ? (
                                      <Loader2 className="h-3 w-3 animate-spin text-rose-600" />
                                    ) : isResent ? (
                                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                      <Send className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                    )}
                                    <span>{isResending ? "Sending..." : isResent ? "Sent!" : "Resend email"}</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => revokePendingInvitation(invite.id)}
                                  disabled={isRevokingInvitation || !canManageTeam}
                                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                  Revoke
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {!isInvitationsFetching && invitations.filter((invite) => invite.status === "PENDING").length === 0 && (
                        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
                          No pending invitations.
                        </p>
                      )}
                    </div>
                  </section>

                  {/* Org Contact Unlocks & Usage History */}
                  <section className="rounded-xl sm:rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <h2 className="text-xs sm:text-sm font-black text-slate-950 dark:text-white">Shared Contact Unlocks</h2>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Contacts unlocked with organization allowance:</p>
                    <div className="mt-2.5 space-y-2">
                      {creditLedger.filter((item) => item.creditChange < 0).slice(0, 5).map((item) => (
                        <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-850">
                          <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                            <span className="truncate">{item.meta?.propertyTitle ? item.meta.propertyTitle : `Property #${item.meta?.propertyId || ""}`}</span>
                            <span className="text-rose-600 font-bold dark:text-rose-400">{item.creditChange} credit</span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            Unlocked by <strong className="text-slate-700 dark:text-slate-200">{item.user?.name || item.meta?.actorName || `User #${item.userId}`}</strong>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{new Date(item.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                      {creditLedger.filter((item) => item.creditChange < 0).length === 0 && (
                        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
                          No contacts unlocked by team yet.
                        </p>
                      )}
                    </div>
                  </section>

                  {/* Collapsible Role Permissions Guide */}
                  <details className="group rounded-xl sm:rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <summary className="flex cursor-pointer items-center justify-between text-xs sm:text-sm font-black text-slate-950 dark:text-white list-none select-none">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Role permissions guide</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="mt-3 space-y-2">
                      {roleOptions.map((role) => (
                        <div key={role.value} className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs dark:border-slate-800 dark:bg-slate-850">
                          <p className="font-bold text-slate-900 dark:text-white">{role.label}</p>
                          <p className="mt-0.5 text-slate-500 dark:text-slate-400">{role.description}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                </aside>
              </div>
            </section>
          </div>
        )}
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

export default function OrganizationDashboardPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading organization workspace...</div>}>
      <OrganizationDashboardContent />
    </React.Suspense>
  );
}
