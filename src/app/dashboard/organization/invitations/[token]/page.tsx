"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import {
  useAcceptOrganizationInvitationMutation,
  useRejectOrganizationInvitationMutation,
} from "@/features/organizations/api";

function getErrorMessage(error: unknown) {
  const err = error as { data?: { message?: string }; message?: string; status?: string | number };
  return err?.data?.message || err?.message || (err?.status ? `Request failed (${err.status})` : "Something went wrong");
}

export default function OrganizationInvitationPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [acceptInvitation, acceptState] = useAcceptOrganizationInvitationMutation();
  const [rejectInvitation, rejectState] = useRejectOrganizationInvitationMutation();

  useEffect(() => {
    const authToken = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
    if (!authToken) {
      window.setTimeout(() => setHasToken(false), 0);
      router.replace(`/login?redirect=/dashboard/organization/invitations/${token}`);
      return;
    }
    window.setTimeout(() => setHasToken(true), 0);
  }, [router, token]);

  const accept = async () => {
    if (!token) return;
    setMessage("");
    try {
      await acceptInvitation(token).unwrap();
      router.replace("/dashboard/organization");
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  const reject = async () => {
    if (!token) return;
    setMessage("");
    try {
      await rejectInvitation(token).unwrap();
      setMessage("Invitation rejected.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  if (hasToken !== true) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-950">Workspace invitation</h1>
            <p className="mt-1 text-sm text-slate-500">Accept to join the organization team.</p>
          </div>
        </div>

        {message && <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{message}</p>}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={accept}
            disabled={acceptState.isLoading || rejectState.isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {acceptState.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Accept
          </button>
          <button
            type="button"
            onClick={reject}
            disabled={acceptState.isLoading || rejectState.isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {rejectState.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Reject
          </button>
        </div>

        <Link href="/dashboard/organization" className="mt-4 inline-flex text-sm font-bold text-rose-600 hover:text-rose-700">
          Back to organization
        </Link>
      </section>
    </main>
  );
}
