"use client";

/**
 * Builder claims on project pages listed from public RERA registers. Staff check the proof, then approve
 * (the page — plus any other unclaimed projects of the same builder ticked below — moves to the claimant's
 * account and their phone / email replace the listed contact) or reject with a reason the builder sees.
 */
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink, FileText, Loader2, Mail, Phone, RefreshCw, User } from "lucide-react";
import { adminApi, type AdminProjectClaim } from "@/features/admin/api";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "PENDING", label: "Waiting for review" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
] as const;

const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—");

export default function AdminProjectClaimsPage() {
  const [status, setStatus] = useState<string>("PENDING");
  const [items, setItems] = useState<AdminProjectClaim[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let alive = true;
    adminApi
      .listProjectClaims(status)
      .then((res) => {
        if (!alive) return;
        setItems(res.items ?? []);
        setCounts(res.counts ?? {});
        setSelectedId((cur) => (res.items?.some((i) => i.id === cur) ? cur : res.items?.[0]?.id ?? null));
      })
      .catch((e) => alive && toast.error(e instanceof Error ? e.message : "Couldn't load claims"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [status, tick]);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Project claims</h1>
          <p className="text-sm text-slate-500">Builders asking to take over register-listed project pages. Check the proof before approving.</p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              if (t.id === status) return;
              setLoading(true);
              setStatus(t.id);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              status === t.id ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900" : "border-slate-300 dark:border-slate-700",
            )}
          >
            {t.label} <span className="opacity-70">{counts[t.id] ?? 0}</span>
          </button>
        ))}
      </div>

      {loading && !items.length ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : !items.length ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">Nothing here.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <ul className="space-y-2">
            {items.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left text-sm",
                    c.id === selectedId ? "border-rose-400 bg-rose-50 dark:bg-rose-950/30" : "border-slate-200 dark:border-slate-800",
                  )}
                >
                  <div className="font-semibold text-slate-900 dark:text-white">{c.project.name}</div>
                  <div className="text-xs text-slate-500">
                    {c.project.cityName} · by {c.contactName}
                  </div>
                  <div className="text-[11px] text-slate-400">{fmt(c.createdAt)}</div>
                </button>
              </li>
            ))}
          </ul>
          {selected && <ClaimDetail key={selected.id} claim={selected} onDone={load} />}
        </div>
      )}
    </div>
  );
}

function ClaimDetail({ claim, onDone }: { claim: AdminProjectClaim; onDone: () => void }) {
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState<"APPROVE" | "REJECT" | null>(null);
  const [extra, setExtra] = useState<number[]>([]);
  const pending = claim.status === "PENDING";
  const p = claim.project;

  const openProof = async () => {
    try {
      const { url } = await adminApi.projectClaimProofUrl(claim.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't open the proof");
    }
  };

  const decide = async (decision: "APPROVE" | "REJECT") => {
    if (decision === "REJECT" && !notes.trim()) return toast.error("Add a reason so the builder knows why");
    if (decision === "APPROVE" && !window.confirm(`Move ${1 + extra.length} project(s) to ${claim.contactName} and replace the contact with ${claim.phone}?`)) return;
    setBusy(decision);
    try {
      await adminApi.reviewProjectClaim(claim.id, decision, notes, decision === "APPROVE" ? extra : undefined);
      toast.success(decision === "APPROVE" ? "Approved. The project is now in the builder's account." : "Claim rejected");
      onDone();
    } catch (e) {
      toast.error(e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : "Couldn't save the decision");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</h2>
          <Link href={`/new-projects/${p.slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline">
            View page <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <p className="text-sm text-slate-500">
          {p.developerName} · {p.locality}, {p.cityName}
          {p.stateName ? `, ${p.stateName}` : ""}
        </p>
        <p className="text-xs text-slate-500">RERA: {p.reraId || "—"} · Listed contact: {p.salesPhone}{p.salesEmail ? ` / ${p.salesEmail}` : ""}</p>
        {p.owner && (
          <p className="text-xs text-slate-500">
            Current account: {p.owner.name || p.owner.email} ({p.owner.lastLogin ? `signed in ${fmt(p.owner.lastLogin)}` : "created by import, never signed in"})
          </p>
        )}
        {pending && !claim.claimable && <p className="mt-1 text-xs font-semibold text-amber-600">A builder already manages this page — approving is blocked.</p>}
      </div>

      <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" /> {claim.contactName}
          {claim.designation ? <span className="text-slate-500">· {claim.designation}</span> : null}
        </div>
        <a href={`tel:+91${claim.phone}`} className="flex items-center gap-2 hover:underline">
          <Phone className="h-4 w-4 text-slate-400" /> +91 {claim.phone}
        </a>
        <a href={`mailto:${claim.email}`} className="flex items-center gap-2 hover:underline">
          <Mail className="h-4 w-4 text-slate-400" /> {claim.email}
        </a>
        <div className="text-xs text-slate-500">
          Account: {claim.user.name || "—"} · {claim.user.email || claim.user.mobileNumber} · joined {fmt(claim.user.createdAt)}
        </div>
        {claim.message && <p className="sm:col-span-2 text-slate-600 dark:text-slate-300">“{claim.message}”</p>}
        {claim.hasProof && (
          <button type="button" onClick={openProof} className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800">
            <FileText className="h-4 w-4" /> Open proof document
          </button>
        )}
      </div>

      {pending && claim.related.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Other unclaimed projects under “{p.developerName}”</p>
            <button
              type="button"
              className="text-xs text-rose-600 hover:underline"
              onClick={() => setExtra(extra.length === claim.related.length ? [] : claim.related.map((r) => r.id))}
            >
              {extra.length === claim.related.length ? "Clear" : "Select all"}
            </button>
          </div>
          <ul className="max-h-60 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2 text-sm dark:border-slate-800">
            {claim.related.map((r) => (
              <li key={r.id}>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-slate-900">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={extra.includes(r.id)}
                    onChange={(e) => setExtra(e.target.checked ? [...extra, r.id] : extra.filter((x) => x !== r.id))}
                  />
                  <span>
                    {r.name} <span className="text-xs text-slate-500">· {r.locality}, {r.cityName} · {r.reraId || "no RERA"}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-slate-500">Only tick the ones the proof (or a call) confirms belong to this builder — names can repeat across different firms.</p>
        </div>
      )}

      {pending ? (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Note (required to reject — the builder sees it)"
            className="w-full rounded-xl border border-slate-300 p-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!busy || !claim.claimable}
              onClick={() => decide("APPROVE")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy === "APPROVE" && <Loader2 className="h-4 w-4 animate-spin" />}
              Approve{extra.length ? ` (+${extra.length} more)` : ""}
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => decide("REJECT")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
            >
              {busy === "REJECT" && <Loader2 className="h-4 w-4 animate-spin" />}
              Reject
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          {claim.status === "APPROVED" ? "Approved" : "Rejected"} {fmt(claim.reviewedAt)}
          {claim.reviewNotes ? ` — ${claim.reviewNotes}` : ""}
        </p>
      )}
    </div>
  );
}
