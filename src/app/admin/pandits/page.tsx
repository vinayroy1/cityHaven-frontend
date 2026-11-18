"use client";

/**
 * Admin queue for pandits & vastu consultants. Approving publishes the listing (charging the owner's
 * monthly fee); with too few credits it is approved and paused until they top up. Reviews can be hidden.
 */
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Circle, Eye, EyeOff, ExternalLink, Loader2, Mail, Phone, RefreshCw, Star, User } from "lucide-react";
import { adminApi, type AdminPanditItem } from "@/features/admin/api";
import { cn } from "@/lib/utils";
import { CONSULT_MODE_OPTIONS, LANGUAGE_OPTIONS, SEGMENT_LABEL, TRADITION_OPTIONS, formatInr, label, panditName, panditProfilePath, serviceLabel } from "@/features/pandit/options";
import type { PanditReview } from "@/features/pandit/types";

const QUEUES: [string, string][] = [
  ["pending", "Pending review"],
  ["live", "Live"],
  ["changes", "Drafts & changes"],
  ["paused", "Paused"],
  ["rejected", "Rejected"],
];

const OUTCOME: Record<string, string> = {
  PUBLISHED: "Approved and live",
  APPROVED_PAYMENT_DUE: "Approved. Owner needs credits to go live",
  APPROVED_INCOMPLETE: "Approved, but required details are missing; sent back to the owner",
  REQUEST_CHANGES: "Changes requested",
  REJECT: "Rejected",
};

export default function AdminPanditsPage() {
  const [queue, setQueue] = useState("pending");
  const [items, setItems] = useState<AdminPanditItem[]>([]);
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
      .listPanditQueue(queue)
      .then((res) => {
        if (!alive) return;
        setItems(res.items ?? []);
        setCounts(res.counts ?? {});
        setSelectedId((cur) => (res.items?.some((i) => i.id === cur) ? cur : res.items?.[0]?.id ?? null));
      })
      .catch((e) => alive && toast.error(e instanceof Error ? e.message : "Couldn't load listings"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [queue, tick]);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Pandits & vastu consultants</h1>
          <p className="text-sm text-slate-500">Review submitted listings and moderate reviews. Approving publishes the listing.</p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUEUES.map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setQueue(k);
              load();
            }}
            className={cn("rounded-full px-3 py-1.5 text-sm font-medium", queue === k ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300")}
          >
            {l} <span className="opacity-70">({counts[k] ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <ul className="max-h-[70vh] space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-1 dark:border-slate-800">
          {loading && <li className="p-4 text-sm text-slate-500">Loading…</li>}
          {!loading && items.length === 0 && <li className="p-4 text-sm text-slate-500">Nothing here.</li>}
          {items.map((i) => (
            <li key={i.id}>
              <button type="button" onClick={() => setSelectedId(i.id)} className={cn("w-full rounded-lg px-3 py-2 text-left", selectedId === i.id ? "bg-rose-50 dark:bg-rose-950/40" : "hover:bg-slate-50 dark:hover:bg-slate-800")}>
                <p className="truncate text-sm font-semibold">{panditName(i)}</p>
                <p className="truncate text-xs text-slate-500">{SEGMENT_LABEL[i.segment]} · {i.city} · {i.readiness?.pct ?? 0}% complete</p>
              </button>
            </li>
          ))}
        </ul>
        {selected ? <Detail key={selected.id} item={selected} onDone={load} /> : <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">Select a listing</div>}
      </div>
    </div>
  );
}

function Reviews({ id }: { id: number }) {
  const [rows, setRows] = useState<PanditReview[] | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    adminApi.listPanditReviews(id).then((r) => alive && setRows(r ?? [])).catch(() => alive && setRows([]));
    return () => {
      alive = false;
    };
  }, [id]);
  if (!rows) return <p className="text-sm text-slate-500">Loading reviews…</p>;
  if (!rows.length) return <p className="text-sm text-slate-500">No reviews yet.</p>;
  const toggle = async (r: PanditReview) => {
    setBusy(r.id);
    try {
      await adminApi.setPanditReviewHidden(r.id, !r.isHidden);
      setRows((list) => list!.map((x) => (x.id === r.id ? { ...x, isHidden: !r.isHidden } : x)));
      toast.success(r.isHidden ? "Review visible again" : "Review hidden");
    } catch {
      toast.error("Couldn't update the review");
    } finally {
      setBusy(null);
    }
  };
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.id} className={cn("rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800", r.isHidden && "opacity-50")}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">{r.author} · <span className="inline-flex items-center gap-0.5 text-amber-600">{r.rating}<Star className="h-3 w-3 fill-current" /></span></span>
            <button type="button" disabled={busy === r.id} onClick={() => void toggle(r)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
              {r.isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />} {r.isHidden ? "Show" : "Hide"}
            </button>
          </div>
          {r.comment && <p className="mt-1 text-slate-600 dark:text-slate-300">{r.comment}</p>}
        </li>
      ))}
    </ul>
  );
}

function Detail({ item: p, onDone }: { item: AdminPanditItem; onDone: () => void }) {
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const missing = (p.readiness?.items ?? []).filter((i) => !i.done).sort((a, b) => Number(b.required) - Number(a.required));

  const decide = async (decision: "APPROVE" | "REQUEST_CHANGES" | "REJECT") => {
    if (decision !== "APPROVE" && !notes.trim()) {
      toast.error("Add a note so the owner knows what to change");
      return;
    }
    setBusy(decision);
    try {
      const r = await adminApi.reviewPandit(p.id, decision, notes);
      toast.success(OUTCOME[r?.outcome ?? decision] ?? "Done");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the decision");
    } finally {
      setBusy(null);
    }
  };

  const rows: [string, string][] = [
    ["Kind", `${SEGMENT_LABEL[p.segment]} · ${p.providerType === "TEAM" ? "Team" : "Individual"}`],
    ["Services", p.services.map(serviceLabel).join(", ")],
    ["Fees", p.rateCard.map((r) => `${serviceLabel(r.service)}: ${formatInr(r.priceFrom, p.countryCode)}`).join(" · ")],
    ["Languages", p.languages.map((l) => label(LANGUAGE_OPTIONS, l)).join(", ")],
    ["Traditions / modes", [...p.traditions.map((t) => label(TRADITION_OPTIONS, t)), ...p.consultModes.map((m) => label(CONSULT_MODE_OPTIONS, m))].join(", ")],
    ["Qualification", [p.qualification, p.gurukul].filter(Boolean).join(" — ")],
    ["Experience", p.experienceYears ? `${p.experienceYears} years` : ""],
    ["Rating", p.ratingCount ? `${p.ratingAvg.toFixed(1)} from ${p.ratingCount}` : ""],
  ];

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{panditName(p)}</h2>
          <p className="text-sm text-slate-500">{[p.locality, p.city, p.state].filter(Boolean).join(", ")} · {p.status}</p>
        </div>
        <Link href={panditProfilePath(p)} target="_blank" className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600">
          Preview <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-3 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-3 dark:bg-slate-800/50">
        <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-slate-400" /> {p.owner?.name || "—"}</span>
        <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-slate-400" /> {p.phone || p.owner?.mobileNumber || "—"}</span>
        <span className="flex items-center gap-1.5 truncate"><Mail className="h-4 w-4 text-slate-400" /> {p.email || p.owner?.email || "—"}</span>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd>{v || "—"}</dd></div>
        ))}
        {p.address && <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Address (private)</dt><dd>{p.address}</dd></div>}
        {p.about && <div className="sm:col-span-2"><dt className="text-xs text-slate-500">About</dt><dd className="whitespace-pre-line">{p.about}</dd></div>}
        {p.reviewNotes && <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Last review note</dt><dd className="whitespace-pre-line">{p.reviewNotes}</dd></div>}
      </dl>

      {(p.photo || p.gallery.length > 0) && (
        <div className="flex gap-2 overflow-x-auto">
          {[p.photo, ...p.gallery].filter(Boolean).slice(0, 9).map((u) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={u!} src={u!} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
          ))}
        </div>
      )}

      <div>
        <p className="mb-1 text-sm font-semibold">{missing.length ? `Not filled yet (${missing.filter((m) => m.required).length} required, ${missing.filter((m) => !m.required).length} optional)` : "Profile checklist complete"}</p>
        <ul className="space-y-1">
          {missing.map((i) => (
            <li key={i.id} className="flex items-center gap-2 text-sm">
              <Circle className={cn("h-3.5 w-3.5", i.required ? "text-amber-500" : "text-sky-500")} /> {i.label}
              <span className={cn("text-xs", i.required ? "text-rose-600" : "text-slate-400")}>{i.required ? "required" : "optional"}</span>
            </li>
          ))}
          {!missing.length && <li className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Everything filled in.</li>}
        </ul>
      </div>

      <div className="space-y-2">
        <label htmlFor="p-review-notes" className="text-sm font-semibold">Note to the owner</label>
        <textarea id="p-review-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Required when requesting changes or rejecting" />
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={!!busy} onClick={() => void decide("APPROVE")} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy === "APPROVE" && <Loader2 className="h-4 w-4 animate-spin" />} Approve & publish
          </button>
          <button type="button" disabled={!!busy} onClick={() => void decide("REQUEST_CHANGES")} className="rounded-lg border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-800 disabled:opacity-60 dark:text-amber-300">Request changes</button>
          <button type="button" disabled={!!busy} onClick={() => void decide("REJECT")} className="rounded-lg border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-60">Reject</button>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
        <p className="mb-2 text-sm font-semibold">Reviews</p>
        <Reviews id={p.id} />
      </div>
    </div>
  );
}
