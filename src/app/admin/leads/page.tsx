"use client";

/**
 * Leads board: every business saved from the Lead Finder, with status, owner, follow-ups and the
 * call/notes history. Opening a lead loads fresh Google details (phone, website, rating) and lets
 * sales log the call, then jump straight into creating the listing for the owner.
 */
import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  PlusCircle,
  RefreshCw,
  Search,
  Star,
  X,
} from "lucide-react";
import { useAdmin } from "@/features/admin/adminStore";
import { LeadIntakeForm } from "@/features/admin/leadIntake";
import { PropertyListingCitySelector } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { useCountryCode } from "@/lib/country/useCountry";
import {
  LEAD_STATUSES,
  LEAD_TYPES,
  leadFinderApi,
  type LeadPlaceDetails,
  type LeadStats,
  type LeadStatus,
  type LeadType,
  type SourcingLead,
} from "@/features/admin/api";

const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "New",
  NO_ANSWER: "No answer",
  CALL_BACK: "Call back",
  INTERESTED: "Interested",
  DOCS_PENDING: "Docs pending",
  LISTED: "Listed",
  NOT_INTERESTED: "Not interested",
  DO_NOT_CONTACT: "Do not contact",
};
const STATUS_TONE: Record<LeadStatus, string> = {
  NEW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  NO_ANSWER: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  CALL_BACK: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  INTERESTED: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  DOCS_PENDING: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  LISTED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  NOT_INTERESTED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  DO_NOT_CONTACT: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};
const TYPE_LABEL: Record<LeadType, string> = { PG: "PG", STAY: "Hotel/Stay", RENTAL: "Rental", PROJECT: "Project", BUILDER: "Builder", AGENT: "Agent", INTERIOR: "Interior designer" };
/** Which listing form a lead usually becomes. PROJECT/BUILDER have no preset: staff choose in the hub. */
const LISTING_FOR: Record<LeadType, string | null> = { PG: "property", STAY: "stay", RENTAL: "property", PROJECT: null, BUILDER: null, AGENT: "advisor", INTERIOR: "interior" };

const errorText = (e: unknown, fallback: string) => {
  const err = e as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || fallback;
};
const when = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—");
const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white";

function Badge({ status }: { status: LeadStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>;
}

function LeadDrawer({ id, onClose, onChanged }: { id: number; onClose: () => void; onChanged: () => void }) {
  const { staffList } = useAdmin();
  const [lead, setLead] = useState<SourcingLead | null>(null);
  const [place, setPlace] = useState<LeadPlaceDetails | null>(null);
  const [placeError, setPlaceError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [owner, setOwner] = useState({ ownerName: "", ownerMobile: "", ownerEmail: "" });
  const [follow, setFollow] = useState("");

  const load = useCallback(
    async (refresh = false) => {
      setLoading(true);
      try {
        const r = await leadFinderApi.get(id, refresh);
        setLead(r.lead);
        setPlace(r.place);
        setPlaceError(r.placeError);
        setOwner({ ownerName: r.lead.ownerName ?? "", ownerMobile: r.lead.ownerMobile ?? "", ownerEmail: r.lead.ownerEmail ?? "" });
        setFollow(r.lead.nextFollowUpAt ? r.lead.nextFollowUpAt.slice(0, 10) : "");
      } catch (e) {
        toast.error(errorText(e, "Could not load the lead."));
        onClose();
      } finally {
        setLoading(false);
      }
    },
    [id, onClose],
  );
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => void load(), [load]);

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setSaving(true);
    try {
      await fn();
      toast.success(ok);
      setNote("");
      await load();
      onChanged();
    } catch (e) {
      toast.error(errorText(e, "Could not save."));
    } finally {
      setSaving(false);
    }
  };

  const followISO = follow ? new Date(`${follow}T09:00:00`).toISOString() : null;
  const wa = place?.phoneInternational ? `https://wa.me/${place.phoneInternational.replace(/\D/g, "")}` : null;
  const activeStaff = staffList.filter((s) => s.status === "ACTIVE");

  const createHref = useMemo(() => {
    if (!lead) return "#";
    const p = new URLSearchParams({ leadId: String(lead.id) });
    const t = LISTING_FOR[lead.type];
    if (t) p.set("type", t);
    if (owner.ownerName) p.set("ownerName", owner.ownerName);
    if (owner.ownerMobile) p.set("ownerMobile", owner.ownerMobile);
    if (owner.ownerEmail) p.set("ownerEmail", owner.ownerEmail);
    return `/admin/listings/create?${p.toString()}`;
  }, [lead, owner]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-[1px]" onClick={onClose}>
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Lead #{id}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading || !lead ? (
          <div className="flex justify-center p-16">
            <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
          </div>
        ) : (
          <div className="space-y-5 p-5">
            {/* Google details (fresh, never stored) */}
            <section className="space-y-2 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-base font-bold text-slate-900 dark:text-white">{place?.name || "Business details unavailable"}</div>
                  <div className="mt-0.5 flex items-start gap-1 text-xs text-slate-500">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {place?.address || `${lead.locality ? `${lead.locality}, ` : ""}${lead.cityName}`}
                  </div>
                </div>
                <button type="button" onClick={() => load(true)} title="Reload from Google" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
              {placeError && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2 text-[11px] text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {placeError}
                </div>
              )}
              {place && (
                <>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {place.phone ? (
                      <a
                        href={`tel:${place.phoneInternational || place.phone}`}
                        onClick={() => void leadFinderApi.logActivity(id, { action: "CALL", note: "Call started" }).then(onChanged).catch(() => undefined)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
                      >
                        <Phone className="h-3.5 w-3.5" /> Call {place.phone}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">No phone listed on Google</span>
                    )}
                    {wa && (
                      <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50">
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    )}
                    {place.mapsUrl && (
                      <a href={place.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600">
                        Maps <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {place.website && (
                      <a href={place.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600">
                        <Globe className="h-3 w-3" /> Website
                      </a>
                    )}
                  </div>
                  {place.rating != null && (
                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {place.rating} ({place.ratingCount ?? 0} reviews)
                    </div>
                  )}
                  {place.hours.length > 0 && (
                    <details className="text-[11px] text-slate-500">
                      <summary className="cursor-pointer font-semibold">Opening hours</summary>
                      <ul className="mt-1 space-y-0.5">{place.hours.map((h) => <li key={h}>{h}</li>)}</ul>
                    </details>
                  )}
                </>
              )}
            </section>

            {/* Status + follow-up + assignment */}
            <section className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Status
                <select
                  value={lead.status}
                  disabled={saving}
                  onChange={(e) => void act(() => leadFinderApi.update(id, { status: e.target.value as LeadStatus }), "Status updated")}
                  className={`${input} mt-1`}
                >
                  {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Assigned to
                <select
                  value={lead.assignedToId ?? ""}
                  disabled={saving}
                  onChange={(e) => void act(() => leadFinderApi.update(id, { assignedToId: e.target.value ? Number(e.target.value) : null }), "Reassigned")}
                  className={`${input} mt-1`}
                >
                  <option value="">Unassigned</option>
                  {activeStaff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 sm:col-span-2">
                Next follow-up
                <div className="mt-1 flex gap-2">
                  <input type="date" value={follow} onChange={(e) => setFollow(e.target.value)} className={input} />
                  <button type="button" disabled={saving} onClick={() => void act(() => leadFinderApi.update(id, { nextFollowUpAt: followISO }), "Follow-up saved")} className="shrink-0 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">
                    <CalendarClock className="h-4 w-4" />
                  </button>
                </div>
              </label>
            </section>

            {/* Quick call outcome */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Log a call</h3>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="What did the owner say?" className={input} />
              <div className="flex flex-wrap gap-2">
                {([
                  ["NO_ANSWER", "No answer"],
                  ["CALL_BACK", "Call back"],
                  ["INTERESTED", "Interested"],
                  ["NOT_INTERESTED", "Not interested"],
                ] as Array<[LeadStatus, string]>).map(([s, label]) => (
                  <button key={s} type="button" disabled={saving} onClick={() => void act(() => leadFinderApi.logActivity(id, { action: "CALL", status: s, note: note || undefined, nextFollowUpAt: s === "NO_ANSWER" || s === "CALL_BACK" ? followISO ?? new Date(Date.now() + 864e5).toISOString() : undefined }), `Logged: ${label}`)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-200">
                    {label}
                  </button>
                ))}
                <button type="button" disabled={saving || !note.trim()} onClick={() => void act(() => leadFinderApi.logActivity(id, { action: "NOTE", note }), "Note added")} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200">
                  Add note only
                </button>
              </div>
            </section>

            {/* Owner details + create listing */}
            <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Owner details (as told on the call)</h3>
              <div className="grid gap-2 sm:grid-cols-3">
                <input value={owner.ownerName} onChange={(e) => setOwner({ ...owner, ownerName: e.target.value })} placeholder="Owner name" className={input} />
                <input value={owner.ownerMobile} onChange={(e) => setOwner({ ...owner, ownerMobile: e.target.value })} placeholder="Mobile" inputMode="tel" className={input} />
                <input value={owner.ownerEmail} onChange={(e) => setOwner({ ...owner, ownerEmail: e.target.value })} placeholder="Email" type="email" className={input} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" disabled={saving} onClick={() => void act(() => leadFinderApi.update(id, { ownerName: owner.ownerName || null, ownerMobile: owner.ownerMobile || null, ownerEmail: owner.ownerEmail || null }), "Owner details saved")} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">
                  Save details
                </button>
                {lead.status === "LISTED" && lead.listedUrl ? (
                  <a href={lead.listedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white">
                    <CheckCircle2 className="h-4 w-4" /> Listed · view
                  </a>
                ) : (
                  <Link href={createHref} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700">
                    <PlusCircle className="h-4 w-4" /> Create listing for this owner
                  </Link>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Owner name, mobile and email are required to create the listing. Only details the owner gives you are saved here.</p>
            </section>

            <LeadIntakeForm key={JSON.stringify(lead.intake ?? {})} type={lead.type} value={lead.intake} saving={saving} onSave={(intake) => void act(() => leadFinderApi.update(id, { intake }), "Details saved")} />

            {/* History */}
            <section>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">History</h3>
              {(lead.activities ?? []).length === 0 ? (
                <p className="text-xs text-slate-400">No activity yet.</p>
              ) : (
                <ul className="space-y-2">
                  {lead.activities!.map((a) => (
                    <li key={a.id} className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-950/60">
                      <div className="flex items-center justify-between gap-2 text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {a.action === "CALL" && <PhoneCall className="mr-1 inline h-3 w-3" />}
                          {a.staffName} · {a.action.toLowerCase()}
                          {a.status && ` → ${STATUS_LABEL[a.status]}`}
                        </span>
                        <span>{new Date(a.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      {a.note && <p className="mt-1 text-slate-700 dark:text-slate-300">{a.note}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}

function LeadsBoard() {
  const params = useSearchParams();
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [type, setType] = useState<LeadType | "">("");
  const [assigned, setAssigned] = useState<"" | "me" | "none">("");
  const [due, setDue] = useState(false);
  const country = useCountryCode();
  const [city, setCity] = useState("");
  const [cityState, setCityState] = useState<string | undefined>();
  const [locality, setLocality] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Awaited<ReturnType<typeof leadFinderApi.list>> | null>(null);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<number | null>(params.get("open") ? Number(params.get("open")) : null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, st] = await Promise.all([
        leadFinderApi.list({ status: status || undefined, type: type || undefined, city: city.trim() || undefined, locality: locality.trim() || undefined, assigned: assigned || undefined, due: due ? "today" : undefined, page }),
        leadFinderApi.stats(),
      ]);
      setData(list);
      setStats(st);
    } catch (e) {
      setError(errorText(e, "Could not load leads."));
    } finally {
      setLoading(false);
    }
  }, [status, type, city, locality, assigned, due, page]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => void refresh(), [refresh]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const usage = stats?.usage;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Leads</h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Call, follow up and turn businesses into listings.</p>
        </div>
        <Link href="/admin/lead-finder" className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700">
          <Search className="h-4 w-4" /> Find more
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Follow-ups due", value: stats.dueToday, tone: "text-amber-600", onClick: () => { setDue(true); setStatus(""); setPage(1); } },
            { label: "Calls today", value: stats.callsToday },
            { label: "Listed this week", value: stats.listedThisWeek, tone: "text-emerald-600" },
            { label: "Google use today", value: `${usage!.searches.used}/${usage!.searches.cap} · ${usage!.lookups.used}/${usage!.lookups.cap}`, small: "searches · lookups" },
          ].map((s) => (
            <button key={s.label} type="button" onClick={s.onClick} disabled={!s.onClick} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm disabled:cursor-default dark:border-slate-800 dark:bg-slate-900">
              <div className="text-[11px] text-slate-500">{s.label}</div>
              <div className={`mt-1 text-xl font-bold ${s.tone ?? "text-slate-900 dark:text-white"}`}>{s.value}</div>
              {s.small && <div className="text-[10px] text-slate-400">{s.small}</div>}
            </button>
          ))}
        </div>
      )}

      {/* Status chips */}
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={() => { setStatus(""); setDue(false); setPage(1); }} className={`rounded-full border px-3 py-1 text-xs font-semibold ${!status && !due ? "border-rose-600 bg-rose-600 text-white" : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"}`}>
          All {data ? Object.values(data.counts).reduce((a, b) => a + (b ?? 0), 0) : ""}
        </button>
        {LEAD_STATUSES.map((s) => (
          <button key={s} type="button" onClick={() => { setStatus(s); setDue(false); setPage(1); }} className={`rounded-full border px-3 py-1 text-xs font-semibold ${status === s ? "border-rose-600 bg-rose-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"}`}>
            {STATUS_LABEL[s]} {data?.counts[s] ?? 0}
          </button>
        ))}
        {due && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Showing follow-ups due</span>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={type} onChange={(e) => { setType(e.target.value as LeadType | ""); setPage(1); }} className={`${input} min-w-0 flex-1 sm:!w-auto sm:flex-none`}>
          <option value="">All types</option>
          {LEAD_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
        </select>
        <select value={assigned} onChange={(e) => { setAssigned(e.target.value as "" | "me" | "none"); setPage(1); }} className={`${input} min-w-0 flex-1 sm:!w-auto sm:flex-none`}>
          <option value="">Everyone&apos;s leads</option>
          <option value="me">Assigned to me</option>
          <option value="none">Unassigned</option>
        </select>
        <div className="w-full sm:w-52">
          <PropertyListingCitySelector
            value={city}
            selectedState={cityState}
            countryCode={country}
            placeholder="All cities"
            onChange={(c) => {
              setCity(c.name);
              setCityState(c.state);
              setLocality("");
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-56">
          <PropertyListingLocalitySelector
            key={`${country}-${city}`}
            value={locality}
            cityName={city}
            selectedState={cityState}
            countryCode={country}
            placeholder={city ? `Locality in ${city}` : "Pick a city first"}
            onChange={(l) => {
              setLocality(l.name || "");
              setPage(1);
            }}
          />
        </div>
        {(city || locality) && (
          <button type="button" onClick={() => { setCity(""); setCityState(undefined); setLocality(""); setPage(1); }} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
            Clear location
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950/80">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="hidden px-4 py-3 sm:table-cell">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="hidden px-4 py-3 md:table-cell">Assigned</th>
              <th className="px-4 py-3">Follow-up</th>
              <th className="hidden px-4 py-3 lg:table-cell">Last contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading && !data ? (
              <tr><td colSpan={6} className="p-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-rose-500" /></td></tr>
            ) : !data?.items.length ? (
              <tr><td colSpan={6} className="p-10 text-center text-slate-500">No leads here yet. Use Find more to search and save businesses.</td></tr>
            ) : (
              data.items.map((l) => (
                <tr key={l.id} onClick={() => setOpenId(l.id)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="max-w-[180px] px-4 py-3 sm:max-w-[260px]">
                    <div className="truncate font-semibold text-slate-900 dark:text-white">{l.place?.name || `Lead #${l.id}`}</div>
                    <div className="truncate text-slate-500">{l.place?.address || [l.locality, l.cityName].filter(Boolean).join(", ")}</div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">{TYPE_LABEL[l.type]}</td>
                  <td className="px-4 py-3"><Badge status={l.status} /></td>
                  <td className="hidden px-4 py-3 md:table-cell">{l.assignedToName ?? <span className="text-slate-400">Unassigned</span>}</td>
                  <td className={`whitespace-nowrap px-4 py-3 ${l.nextFollowUpAt && new Date(l.nextFollowUpAt) <= new Date() && !["LISTED", "NOT_INTERESTED", "DO_NOT_CONTACT"].includes(l.status) ? "font-semibold text-amber-600" : ""}`}>{when(l.nextFollowUpAt)}</td>
                  <td className="hidden px-4 py-3 text-slate-500 lg:table-cell">{when(l.lastContactAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {data && data.total > data.pageSize && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2.5 text-xs dark:border-slate-800">
            <span className="text-slate-500">{data.total} leads · page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-200 px-3 py-1 font-semibold disabled:opacity-40 dark:border-slate-700">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-200 px-3 py-1 font-semibold disabled:opacity-40 dark:border-slate-700">Next</button>
            </div>
          </div>
        )}
      </div>

      {openId != null && <LeadDrawer id={openId} onClose={() => setOpenId(null)} onChanged={() => void refresh()} />}
    </div>
  );
}

export default function AdminLeadsPage() {
  return (
    <Suspense fallback={null}>
      <LeadsBoard />
    </Suspense>
  );
}
