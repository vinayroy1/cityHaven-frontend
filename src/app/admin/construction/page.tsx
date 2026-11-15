"use client";

/**
 * Admin queue for construction companies & contractors. Approving publishes the listing (charging the
 * owner's monthly fee); with too few credits it is approved and paused until they top up.
 */
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Circle, ExternalLink, Loader2, Mail, Phone, RefreshCw, User } from "lucide-react";
import { adminApi, type AdminConstructionItem } from "@/features/admin/api";
import { cn } from "@/lib/utils";
import { SECTOR_OPTIONS, SERVICE_OPTIONS, TURNOVER_OPTIONS, constructionProfilePath, formatCr, formatRate, isInfra, label } from "@/features/construction/options";

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

export default function AdminConstructionPage() {
  const [queue, setQueue] = useState("pending");
  const [items, setItems] = useState<AdminConstructionItem[]>([]);
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
      .listConstructionQueue(queue)
      .then((res) => {
        if (!alive) return;
        setItems(res.items ?? []);
        setCounts(res.counts ?? {});
        setSelectedId((cur) => (res.items?.some((i) => i.id === cur) ? cur : res.items?.[0]?.id ?? null));
      })
      .catch((e) => alive && toast.error(e instanceof Error ? e.message : "Couldn't load construction companies"))
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
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Construction companies</h1>
          <p className="text-sm text-slate-500">Review submitted builders and contractors. Approving publishes the listing.</p>
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
              <button
                type="button"
                onClick={() => setSelectedId(i.id)}
                className={cn("w-full rounded-lg px-3 py-2 text-left", selectedId === i.id ? "bg-rose-50 dark:bg-rose-950/40" : "hover:bg-slate-50 dark:hover:bg-slate-800")}
              >
                <p className="truncate text-sm font-semibold">{i.businessName}</p>
                <p className="truncate text-xs text-slate-500">{i.city} · {i.readiness?.pct ?? 0}% complete</p>
              </button>
            </li>
          ))}
        </ul>
        {selected ? <Detail key={selected.id} item={selected} onDone={load} /> : <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">Select a listing</div>}
      </div>
    </div>
  );
}

function Detail({ item: p, onDone }: { item: AdminConstructionItem; onDone: () => void }) {
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
      const r = await adminApi.reviewConstruction(p.id, decision, notes);
      toast.success(OUTCOME[r?.outcome ?? decision] ?? "Done");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the decision");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{p.businessName}</h2>
          <p className="text-sm text-slate-500">{[p.locality, p.city, p.state].filter(Boolean).join(", ")} · {p.providerType === "COMPANY" ? "Company" : "Contractor"} · {p.status}</p>
        </div>
        <Link href={constructionProfilePath(p)} target="_blank" className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600">
          Preview <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-3 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-3 dark:bg-slate-800/50">
        <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-slate-400" /> {p.owner?.name || p.ownerName || "—"}</span>
        <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-slate-400" /> {p.phone || p.owner?.mobileNumber || "—"}</span>
        <span className="flex items-center gap-1.5 truncate"><Mail className="h-4 w-4 text-slate-400" /> {p.email || p.owner?.email || "—"}</span>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {isInfra(p) ? (
          <>
            <div><dt className="text-xs text-slate-500">Segment</dt><dd className="font-semibold text-amber-700">Infrastructure / Govt contractor</dd></div>
            <div><dt className="text-xs text-slate-500">Sectors</dt><dd>{p.sectors.map((s) => label(SECTOR_OPTIONS, s)).join(", ") || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">Registrations</dt><dd>{p.registrations.map((r) => [r.authority, r.contractorClass, r.number].filter(Boolean).join(" · ")).join("; ") || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">Turnover / largest contract</dt><dd>{[p.turnoverBand ? label(TURNOVER_OPTIONS, p.turnoverBand) : "", formatCr(p.maxContractCr)].filter(Boolean).join(" · ") || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">Clients</dt><dd>{p.majorClients.join(", ") || "—"}</dd></div>
          </>
        ) : (
          <>
            <div><dt className="text-xs text-slate-500">Services</dt><dd>{p.services.map((s) => label(SERVICE_OPTIONS, s)).join(", ") || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">Pricing</dt><dd>{p.quoteOnly ? "Price on request" : p.packages.map((k) => `${k.name}: ${formatRate(k.ratePerSqft)}`).join(" · ") || "—"}</dd></div>
          </>
        )}
        <div><dt className="text-xs text-slate-500">GSTIN</dt><dd>{p.gstin || "—"}</dd></div>
        <div><dt className="text-xs text-slate-500">Projects / photos</dt><dd>{p.projectCount} projects · {p.workGallery.length} photos</dd></div>
        {p.about && <div className="sm:col-span-2"><dt className="text-xs text-slate-500">About</dt><dd className="whitespace-pre-line">{p.about}</dd></div>}
        {p.reviewNotes && <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Last review note</dt><dd className="whitespace-pre-line">{p.reviewNotes}</dd></div>}
      </dl>

      {p.workGallery.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {p.workGallery.slice(0, 8).map((u) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={u} src={u} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
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
        <label htmlFor="c-review-notes" className="text-sm font-semibold">Note to the owner</label>
        <textarea id="c-review-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Required when requesting changes or rejecting" />
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={!!busy} onClick={() => void decide("APPROVE")} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy === "APPROVE" && <Loader2 className="h-4 w-4 animate-spin" />} Approve & publish
          </button>
          <button type="button" disabled={!!busy} onClick={() => void decide("REQUEST_CHANGES")} className="rounded-lg border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-800 disabled:opacity-60 dark:text-amber-300">
            Request changes
          </button>
          <button type="button" disabled={!!busy} onClick={() => void decide("REJECT")} className="rounded-lg border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-60">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
