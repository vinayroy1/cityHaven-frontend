"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Crown,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import {
  useAcceptOrganizationInvitationMutation,
  useGetPublicOrganizationInvitationQuery,
  useRejectOrganizationInvitationMutation,
} from "@/features/organizations/api";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";

function getErrorMessage(error: unknown) {
  const err = error as { data?: { message?: string }; message?: string; status?: string | number };
  return err?.data?.message || err?.message || (err?.status ? `Request failed (${err.status})` : "Something went wrong");
}

function roleLabel(role?: string | null) {
  if (!role) return "Member";
  return role[0] + role.slice(1).toLowerCase();
}

function roleDescription(role?: string | null) {
  switch (role) {
    case "ADMIN":
      return "Manage team members, property inventory, leads, and workspace permissions.";
    case "MANAGER":
      return "Assign leads, review team property listings, and monitor employee inventory.";
    case "AGENT":
      return "Create and publish listings, handle assigned leads, and unlock contact details using organization credits.";
    case "VIEWER":
      return "View organization inventory and lead reports in read-only mode.";
    default:
      return "Collaborate with the team on property listings and lead management.";
  }
}

export default function OrganizationInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ token: string }>();
  const token = params?.token || "";

  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<{ email?: string; name?: string; mobileNumber?: string } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isJoinedSuccess, setIsJoinedSuccess] = useState(false);

  // Fetch invitation publicly (works even if user is not logged in yet)
  const {
    data: invitation,
    isLoading: isInvLoading,
    error: invError,
  } = useGetPublicOrganizationInvitationQuery(token, { skip: !token });

  const [acceptInvitation, { isLoading: isAccepting }] = useAcceptOrganizationInvitationMutation();
  const [rejectInvitation, { isLoading: isRejecting }] = useRejectOrganizationInvitationMutation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const authToken = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
    const userRaw = localStorage.getItem(APP_CONFIG.AUTH.USER_KEY);
    setHasToken(Boolean(authToken));
    if (userRaw) {
      try {
        setCurrentUser(JSON.parse(userRaw));
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  const isEmailMismatch =
    Boolean(hasToken && currentUser?.email && invitation?.email) &&
    currentUser!.email!.trim().toLowerCase() !== invitation!.email!.trim().toLowerCase();

  const handleAccept = async () => {
    setActionError(null);

    // If another account is logged in, switch to the invited email directly
    if (isEmailMismatch) {
      handleSwitchAccount();
      return;
    }

    // If user is NOT logged in, redirect them to login / signup screen first
    if (!hasToken) {
      const emailQuery = invitation?.email ? `&email=${encodeURIComponent(invitation.email)}` : "";
      router.push(`/login?redirect=/dashboard/organization/invitations/${token}${emailQuery}`);
      return;
    }

    // User is logged in with matching email: execute accept invitation API
    try {
      await acceptInvitation(token).unwrap();
      setIsJoinedSuccess(true);
      setTimeout(() => {
        router.replace("/dashboard/organization");
      }, 1600);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const handleReject = async () => {
    setActionError(null);
    if (!hasToken) {
      router.push("/");
      return;
    }
    try {
      await rejectInvitation(token).unwrap();
      router.replace("/dashboard");
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.USER_KEY);
    window.dispatchEvent(new Event("auth-change"));
    const emailQuery = invitation?.email ? `&email=${encodeURIComponent(invitation.email)}` : "";
    router.push(`/login?redirect=/dashboard/organization/invitations/${token}${emailQuery}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      <HeaderNav />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-lg">
          {/* Loading State */}
          {isInvLoading && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-rose-600" />
              <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Verifying invitation...</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Fetching workspace details</p>
            </div>
          )}

          {/* Error / Invalid / Expired State */}
          {!isInvLoading && (invError || !invitation) && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <AlertCircle className="h-7 w-7" />
              </div>
              <h1 className="mt-4 text-xl font-black text-slate-950 dark:text-white">Invitation Unavailable</h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                {getErrorMessage(invError) || "This workspace invitation may have expired, already been accepted, or was revoked by the organization owner."}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/"
                  className="w-full sm:w-auto rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950"
                >
                  Return to Home
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-200"
                >
                  Sign In to Awasio
                </Link>
              </div>
            </div>
          )}

          {/* Success State */}
          {isJoinedSuccess && (
            <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl dark:border-emerald-900/60 dark:bg-slate-900 animate-in fade-in zoom-in-95">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">Welcome to the Team!</h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                You have successfully joined <strong>{invitation?.organization?.name}</strong>. Redirecting to workspace...
              </p>
              <div className="mt-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              </div>
            </div>
          )}

          {/* Invitation Card */}
          {!isInvLoading && invitation && !isJoinedSuccess && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-2">
              {/* Organization Header */}
              <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5 dark:border-slate-800">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shadow-2xs">
                  <Building2 className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    <Sparkles className="h-3 w-3" />
                    <span>Workspace Invitation</span>
                  </div>
                  <h1 className="truncate text-xl sm:text-2xl font-black text-slate-950 dark:text-white mt-0.5">
                    {invitation.organization?.name}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {invitation.organization?.type?.toLowerCase() || "Organization"} workspace
                  </p>
                </div>
              </div>

              {/* Invitation Details Body */}
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">You are invited to join as:</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-black text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {roleLabel(invitation.roleName)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {roleDescription(invitation.roleName)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-850">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Invited Email</span>
                    <span className="font-bold text-slate-900 dark:text-white">{invitation.email || "Specified member"}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Valid until</span>
                    <span>{new Date(invitation.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Email Mismatch Notice */}
                {isEmailMismatch && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-200 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Logged in with a different account</p>
                        <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                          You are currently signed in as <strong>{currentUser?.email}</strong>, but this workspace invitation was sent to <strong>{invitation.email}</strong>.
                        </p>
                      </div>
                    </div>
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={handleSwitchAccount}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition"
                      >
                        <LogIn className="h-3.5 w-3.5" />
                        <span>Log in or Sign up as {invitation.email}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Not Logged In Helper Box */}
                {!hasToken && (
                  <div className="flex items-start gap-2.5 rounded-2xl border border-sky-200 bg-sky-50/80 p-3 text-xs text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200">
                    <LogIn className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Don&apos;t have an account yet? Clicking <strong>Accept Invitation</strong> will direct you to quick sign up, and then immediately connect you to this workspace.
                    </p>
                  </div>
                )}

                {/* Action Error Banner */}
                {actionError && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{actionError}</span>
                  </div>
                )}

                {/* Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={isAccepting || isRejecting}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAccepting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Joining Workspace...</span>
                      </>
                    ) : isEmailMismatch ? (
                      <>
                        <LogIn className="h-4 w-4" />
                        <span>Log in or Sign up as {invitation.email}</span>
                      </>
                    ) : !hasToken ? (
                      <>
                        <LogIn className="h-4 w-4" />
                        <span>Continue to Accept & Join</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Accept Invitation</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isAccepting || isRejecting}
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    <span>Decline</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  Back to Awasio Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
