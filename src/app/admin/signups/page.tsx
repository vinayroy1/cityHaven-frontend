"use client";

/**
 * Organic signups: who signed up on their own, where they came from (UTM / referrer / landing page),
 * what they were trying to do, and how far they got, so the team can call people who dropped off.
 */
import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, MessageCircle, Monitor, Phone, RefreshCw, Search, Smartphone } from "lucide-react";
import { adminApi, type AdminSignup, type AdminSignupsResponse, type SignupStage } from "@/features/admin/api";
import { cn } from "@/lib/utils";

const STAGES: { id: SignupStage; label: string; hint: string; tone: string }[] = [
  { id: "SIGNED_UP_ONLY", label: "Signed up only", hint: "Did nothing after signup", tone: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200" },
  { id: "ENGAGED", label: "Browsing", hint: "Unlocked contacts / booked visits, no listing", tone: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-200" },
  { id: "IN_PROGRESS", label: "Listing not live", hint: "Started a listing but it isn't live", tone: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200" },
  { id: "PUBLISHED", label: "Live listing", hint: "Has at least one live listing", tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200" },
];
const STAGE = Object.fromEntries(STAGES.map((s) => [s.id, s]));

const SOURCE_LABEL: Record<string, string> = {
  SIGNUP_FORM: "Signup form",
  GOOGLE: "Google sign-in",
  CONTACT_UNLOCK: "While unlocking a contact",
  SCHEDULE_VISIT: "While booking a visit",
  LEGACY_SELF: "Self signup (before tracking)",
  ASSISTED: "Created by staff",
  STAFF_INVITE: "Staff account",
  IMPORTED: "Imported / seeded",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });

function progress(u: AdminSignup) {
  const l = u.listings;
  const parts: string[] = [];
  if (l.properties) parts.push(`${l.properties} propert${l.properties > 1 ? "ies" : "y"} (${l.propertiesLive} live)`);
  if (l.business) parts.push(`${l.business} business listing${l.business > 1 ? "s" : ""} (${l.businessLive} live)`);
  if (l.projects) parts.push(`${l.projects} project${l.projects > 1 ? "s" : ""}`);
  if (l.flatmate) parts.push("flatmate profile");
  if (u.activity.unlocks) parts.push(`${u.activity.unlocks} contact unlock${u.activity.unlocks > 1 ? "s" : ""}`);
  if (u.activity.visits) parts.push(`${u.activity.visits} visit${u.activity.visits > 1 ? "s" : ""} booked`);
  return parts.length ? parts.join(" · ") : "No activity yet";
}

export default function AdminSignupsPage() {
  const [days, setDays] = useState(7);
  const [type, setType] = useState("organic");
  const [stage, setStage] = useState("");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState<AdminSignupsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminApi.listSignups({ days, type, stage: stage || undefined, q: query || undefined }));
    } catch (e) {
      setError((e as { message?: string })?.message || "Couldn't load signups");
    } finally {
      setLoading(false);
    }
  }, [days, type, stage, query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on filter change
    void load();
  }, [load]);

  const summary = data?.summary;
  const sources = Object.entries(summary?.bySource ?? {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Signups</h1>
          <p className="text-sm text-slate-500">Who signed up, where they came from, and who dropped off. Call them while they&apos;re still interested.</p>
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
          {[["organic", "Organic"], ["backend", "Staff / imported"], ["all", "All"]].map(([v, l]) => (
            <button key={v} type="button" onClick={() => setType(v)} className={cn("rounded-md px-3 py-1.5 text-xs font-semibold", type === v ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 dark:text-slate-300")}>
              {l}
            </button>
          ))}
        </div>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900">
          {[[1, "Last 24 hours"], [7, "Last 7 days"], [30, "Last 30 days"], [90, "Last 90 days"], [365, "Last year"]].map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select value={stage} onChange={(e) => setStage(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900">
          <option value="">All stages</option>
          <option value="DROPPED">Dropped off (no live listing)</option>
          {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <form onSubmit={(e) => { e.preventDefault(); setQuery(q.trim()); }} className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email or phone" className="h-9 w-56 rounded-lg border border-slate-200 bg-white pl-8 pr-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
        </form>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500">Signups</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.total}</p>
          </div>
          {STAGES.map((s) => (
            <button key={s.id} type="button" onClick={() => setStage(stage === s.id ? "" : s.id)} title={s.hint} className={cn("rounded-xl border p-3 text-left dark:border-slate-800", stage === s.id ? "border-slate-900 dark:border-white" : "border-slate-200 bg-white dark:bg-slate-900")}>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.byStage[s.id] ?? 0}</p>
            </button>
          ))}
        </div>
      )}
      {sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-500">Came from:</span>
          {sources.map(([s, n]) => (
            <span key={s} className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">{s} · {n}</span>
          ))}
        </div>
      )}

      {/* List */}
      {loading && !data ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
      ) : error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
      ) : !data?.items.length ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">No signups match these filters.</p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((u) => {
            const st = STAGE[u.stage];
            const wa = u.phone?.replace(/\D/g, "").slice(-10);
            return (
              <li key={u.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-white">{u.name || "No name"}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", st?.tone)}>{st?.label}</span>
                      <span className="text-xs text-slate-400">#{u.id}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Signed up {fmt(u.createdAt)} · {SOURCE_LABEL[u.signupSource] ?? u.signupSource}
                      {u.lastLogin ? ` · last login ${fmt(u.lastLogin)}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {u.phone && (
                      <>
                        <a href={`tel:+91${wa}`} className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-xs font-bold text-white hover:bg-emerald-700"><Phone className="h-3.5 w-3.5" /> {u.phone}</a>
                        <a href={`https://wa.me/91${wa}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1 rounded-lg border border-emerald-300 px-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
                      </>
                    )}
                    {u.email && (
                      <a href={`mailto:${u.email}`} className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"><Mail className="h-3.5 w-3.5" /> {u.email}</a>
                    )}
                  </div>
                </div>

                <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  <div><dt className="text-slate-400">Came from</dt><dd className="font-semibold text-slate-800 dark:text-slate-200">{u.source}{u.utm?.medium ? ` / ${u.utm.medium}` : ""}{u.utm?.campaign ? ` · ${u.utm.campaign}` : ""}</dd></div>
                  <div><dt className="text-slate-400">Landed on</dt><dd className="truncate font-mono text-slate-700 dark:text-slate-300" title={u.landingPage ?? ""}>{u.landingPage ?? "—"}</dd></div>
                  <div><dt className="text-slate-400">Wanted to</dt><dd className="font-semibold text-slate-800 dark:text-slate-200">{u.intent ?? "—"}</dd></div>
                  <div><dt className="text-slate-400">Device</dt><dd className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">{u.device === "Mobile" ? <Smartphone className="h-3.5 w-3.5" /> : u.device ? <Monitor className="h-3.5 w-3.5" /> : null}{u.device ?? "—"}</dd></div>
                </dl>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400"><span className="text-slate-400">Progress: </span>{progress(u)} · {u.credits} credits</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
