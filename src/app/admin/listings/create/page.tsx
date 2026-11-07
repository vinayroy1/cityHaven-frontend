"use client";

/**
 * Create a listing on behalf of an owner.
 *
 * Step 1: staff enter the owner's name, mobile and email. The backend finds or creates that
 * owner's account and returns a short-lived, listing-only token (see lib/auth/assistedSession).
 * Step 2: staff fill the normal listing form (property, stay, flatmate, interior, advisor). API
 * calls on this page carry the owner's token, so everything is saved under the owner's account.
 * Step 3: the owner is emailed a link to the new listing.
 */
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  BedDouble,
  Building2,
  CheckCircle2,
  Hotel,
  Loader2,
  Mail,
  Paintbrush,
  Phone,
  RotateCcw,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { adminApi, leadFinderApi } from "@/features/admin/api";
import { useAdmin } from "@/features/admin/adminStore";
import { apiFetch } from "@/lib/api/query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { SITE_URL } from "@/constants/seo";
import {
  clearAssistedSession,
  getAssistedSession,
  setAssistedSession,
  type AssistedSession,
} from "@/lib/auth/assistedSession";
import { PropertyListingFlow } from "@/components/propertyListing/PropertyListingFlow";
import { StayEditor } from "@/components/stays/StayEditor";
import { FlatmateListingWizard } from "@/components/flatmates/FlatmateListingWizard";
import { InteriorWizard } from "@/components/interiors/wizard";
import { AdvisorProfileEditor } from "@/app/dashboard/advisor-profile/AdvisorProfileEditor";

type ListingType = "PROPERTY" | "STAY" | "FLATMATE" | "INTERIOR" | "ADVISOR";
const TYPES: Array<{ id: ListingType; label: string; icon: typeof Building2; hint: string }> = [
  { id: "PROPERTY", label: "Property", icon: Building2, hint: "Sale, rent, PG, commercial or plot" },
  { id: "STAY", label: "Hotel / Stay", icon: Hotel, hint: "Hotel, guest house, homestay, dharamshala" },
  { id: "FLATMATE", label: "Flatmate", icon: Users, hint: "Room available or looking for a flatmate" },
  { id: "INTERIOR", label: "Interior designer", icon: Paintbrush, hint: "Studio or designer profile" },
  { id: "ADVISOR", label: "Advisor profile", icon: UserCheck, hint: "Real-estate agent / advisor" },
];
const CAN_CREATE = ["SUPER_ADMIN", "OPERATIONS_MANAGER", "CATALOG_SPECIALIST"];

const field =
  "w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white";

function errorText(e: unknown, fallback: string) {
  const err = e as { response?: { data?: { message?: string } }; data?: { message?: string }; message?: string };
  return err?.response?.data?.message || err?.data?.message || err?.message || fallback;
}

function OwnerForm({ onStarted, initial }: { onStarted: (s: AssistedSession) => void; initial?: { name?: string; mobile?: string; email?: string } }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [mobile, setMobile] = useState(initial?.mobile ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Enter the owner's full name.");
    if (mobile.replace(/\D/g, "").length < 8) return setError("Enter the owner's mobile number.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter the owner's email address.");
    setBusy(true);
    try {
      const res = await adminApi.startAssistedSession({ name: name.trim(), mobile: mobile.trim(), email: email.trim() });
      onStarted(setAssistedSession(res.token, res.owner));
      toast.success(res.owner.isNew ? "New owner account created" : "Existing owner account found");
    } catch (err) {
      setError(errorText(err, "Could not start the owner session."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">1. Owner details</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          The listing is saved in this owner&apos;s account. If no account exists for this mobile or email, one is created. They can later sign in with either.
        </p>
      </div>
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {[
        { label: "Owner name", icon: User, value: name, set: setName, type: "text", placeholder: "Full name", auto: "name" },
        { label: "Mobile number", icon: Phone, value: mobile, set: setMobile, type: "tel", placeholder: "10-digit mobile", auto: "tel" },
        { label: "Email", icon: Mail, value: email, set: setEmail, type: "email", placeholder: "owner@example.com", auto: "email" },
      ].map((f) => (
        <div key={f.label}>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {f.label} <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <f.icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type={f.type} autoComplete={f.auto} value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder} required className={field} />
          </div>
        </div>
      ))}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Continue
      </button>
    </form>
  );
}

function CreateListingHub() {
  const params = useSearchParams();
  const { currentStaff } = useAdmin();
  const initialType = (params.get("type") || "").toUpperCase() as ListingType;
  const leadId = Number(params.get("leadId")) || null;
  const [session, setSession] = useState<AssistedSession | null>(null);
  const [type, setType] = useState<ListingType | null>(TYPES.some((t) => t.id === initialType) ? initialType : null);
  const [done, setDone] = useState<{ title: string; url: string; emailed: boolean; note?: string } | null>(null);
  const [finishing, setFinishing] = useState(false);

  // Restore an unexpired session after a refresh (sessionStorage only exists in the browser).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(getAssistedSession());
  }, []);

  const allowed = currentStaff?.roles.some((r) => CAN_CREATE.includes(r));
  if (currentStaff && !allowed) {
    return <p className="text-sm text-slate-600">Your role can&apos;t create listings for owners. Ask a super admin or operations manager.</p>;
  }

  const finish = async (listingType: ListingType, title: string, path: string) => {
    if (!session) return;
    const url = `${SITE_URL}${path}`;
    let emailed = false;
    let note: string | undefined;
    try {
      const r = await adminApi.notifyAssistedOwner({ ownerId: session.owner.id, listingType, title, url });
      emailed = !!r?.sent;
      note = r?.message;
    } catch (err) {
      note = errorText(err, "Owner email could not be sent.");
    }
    // Came from the Leads board: mark that lead as Listed and link the listing to it.
    if (leadId) {
      try {
        await leadFinderApi.markListed(leadId, { listedType: listingType, listedUrl: url, listedOwnerId: session.owner.id });
      } catch (err) {
        toast.error(errorText(err, "Listing saved, but the lead could not be marked as listed."));
      }
    }
    setDone({ title, url, emailed, note });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Interior / advisor profiles are edited in place; look up their public link when staff finish.
  const finishProfile = async (listingType: "INTERIOR" | "ADVISOR") => {
    setFinishing(true);
    try {
      if (listingType === "INTERIOR") {
        const p = await apiFetch<{ slug?: string; primaryCity?: string; displayName?: string; businessName?: string }>({ url: API_ENDPOINTS.interiors.me });
        if (!p?.slug || !p?.primaryCity) throw new Error("Save the interior profile first.");
        await finish(listingType, p.displayName || p.businessName || "Interior designer profile", `/interior-designers/${encodeURIComponent(p.primaryCity.toLowerCase())}/${p.slug}`);
      } else {
        const p = await apiFetch<{ slug?: string; id?: number; name?: string }>({ url: API_ENDPOINTS.advisors.me });
        if (!p?.slug && !p?.id) throw new Error("Save the advisor profile first.");
        await finish(listingType, p.name || "Advisor profile", `/agents/${p.slug || p.id}`);
      }
    } catch (err) {
      toast.error(errorText(err, "Could not find the saved profile."));
    } finally {
      setFinishing(false);
    }
  };

  const reset = (keepOwner: boolean) => {
    setDone(null);
    setType(null);
    if (!keepOwner) {
      clearAssistedSession();
      setSession(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
          <Building2 className="h-6 w-6 text-rose-500" /> Create listing for an owner
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Fill the same form owners use; the listing is saved in the owner&apos;s account and they&apos;re emailed a link.</p>
      </div>

      {!session ? (
        <OwnerForm onStarted={setSession} initial={{ name: params.get("ownerName") ?? "", mobile: params.get("ownerMobile") ?? "", email: params.get("ownerEmail") ?? "" }} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Listing for</span>
              <div className="font-bold text-slate-900 dark:text-white">
                {session.owner.name || "Owner"}{" "}
                {session.owner.isNew && <span className="ml-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">new account</span>}
              </div>
              <div className="text-xs text-slate-500">
                {session.owner.mobileNumber} · {session.owner.email}
              </div>
            </div>
            <button type="button" onClick={() => reset(false)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              <RotateCcw className="h-3.5 w-3.5" /> Change owner
            </button>
          </div>

          {done ? (
            <div className="max-w-xl space-y-3 rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-sm dark:border-emerald-900/50 dark:bg-slate-900">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <p className="text-base font-bold text-slate-900 dark:text-white">{done.title}</p>
              <a href={done.url} target="_blank" rel="noreferrer" className="block break-all text-sm font-semibold text-rose-600 hover:underline">
                {done.url}
              </a>
              <p className="text-xs text-slate-500">
                {done.emailed ? `Owner emailed at ${session.owner.email}.` : `Owner was not emailed${done.note ? `: ${done.note}` : "."} Share the link with them yourself.`}
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {leadId && (
                  <Link href={`/admin/leads?open=${leadId}`} className="rounded-xl border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50">
                    Back to lead
                  </Link>
                )}
                <button type="button" onClick={() => reset(true)} className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700">
                  Another listing for this owner
                </button>
                <button type="button" onClick={() => reset(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">
                  New owner
                </button>
              </div>
            </div>
          ) : !type ? (
            <div>
              <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">2. What are you listing?</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <t.icon className="h-5 w-5 text-rose-600" />
                    <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{t.label}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">{t.hint}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <button type="button" onClick={() => setType(null)} className="text-xs font-semibold text-slate-500 hover:text-rose-600">
                  ← Change listing type
                </button>
                {(type === "INTERIOR" || type === "ADVISOR") && (
                  <button
                    type="button"
                    disabled={finishing}
                    onClick={() => finishProfile(type)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    {finishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />} Done, email owner the link
                  </button>
                )}
              </div>

              {type === "PROPERTY" && (
                <PropertyListingFlow
                  adminMode
                  assistedOwner={session.owner}
                  onAssistedSaved={(c) => finish("PROPERTY", c.title || "Property listing", `/properties/${c.slug || c.id}`)}
                />
              )}
              {type === "STAY" && (
                <StayEditor
                  onSaved={(s, published) =>
                    published ? finish("STAY", s.name, `/stays/${s.slug}`) : toast.success("Draft saved in the owner's account.")
                  }
                />
              )}
              {type === "FLATMATE" && <FlatmateListingWizard onSaved={(s) => finish("FLATMATE", s.title || "Flatmate listing", `/flatmates/${s.slug}`)} />}
              {type === "INTERIOR" && <InteriorWizard />}
              {type === "ADVISOR" && <AdvisorProfileEditor embedded />}
            </div>
          )}
        </>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <BedDouble className="h-3.5 w-3.5" /> The owner session lasts 2 hours and can only create or edit listings. Every action is logged.
        <Link href="/admin" className="ml-auto underline">
          Back to admin
        </Link>
      </p>
    </div>
  );
}

export default function AdminCreateListingPage() {
  return (
    <Suspense fallback={null}>
      <CreateListingHub />
    </Suspense>
  );
}
