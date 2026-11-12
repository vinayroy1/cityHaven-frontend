"use client";

/**
 * Interior designer review queue: submitted studios wait here for staff to approve (goes live),
 * request changes (owner gets the note) or reject. ID / GST documents can be viewed and verified.
 */
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Circle, ExternalLink, FileText, Loader2, Mail, Phone, RefreshCw, User } from "lucide-react";
import { adminApi, type AdminInteriorItem } from "@/features/admin/api";
import { cn } from "@/lib/utils";

const QUEUES = [
  { id: "pending", label: "Waiting for review" },
  { id: "changes", label: "Changes requested" },
  { id: "live", label: "Live" },
  { id: "rejected", label: "Rejected" },
  { id: "drafts", label: "Drafts" },
] as const;

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
const nameOf = (p: AdminInteriorItem) => p.businessName || p.displayName || `Profile #${p.id}`;

export default function AdminInteriorsPage() {
  const [queue, setQueue] = useState<string>("pending");
  const [items, setItems] = useState<AdminInteriorItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [tick, setTick] = useState(0);
  // Callers switch `loading` on (tabs / refresh / decisions); the effect only sets state in callbacks.
  const load = useCallback(() => {
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let alive = true;
    adminApi
      .listInteriorQueue(queue)
      .then((res) => {
        if (!alive) return;
        setItems(res.items ?? []);
        setCounts(res.counts ?? {});
        setSelectedId((cur) => (res.items?.some((i) => i.id === cur) ? cur : res.items?.[0]?.id ?? null));
      })
      .catch((e) => alive && toast.error(e instanceof Error ? e.message : "Couldn't load interior designers"))
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
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Interior designers</h1>
          <p className="text-sm text-slate-500">Review submitted studios. Approving publishes the profile.</p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUEUES.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => {
              if (q.id === queue) return;
              setLoading(true);
              setQueue(q.id);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium",
              queue === q.id
                ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                : "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300",
            )}
          >
            {q.label} <span className="opacity-70">({counts[q.id] ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <ul className="space-y-2">
          {loading && !items.length && <li className="p-4 text-sm text-slate-500">Loading…</li>}
          {!loading && !items.length && <li className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">Nothing here.</li>}
          {items.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition",
                  p.id === selectedId ? "border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800" : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900",
                )}
              >
                <p className="font-semibold text-slate-900 dark:text-white">{nameOf(p)}</p>
                <p className="text-xs text-slate-500">
                  {[p.primaryLocality, p.primaryCity].filter(Boolean).join(", ") || "No location"} · #{p.id}
                </p>
                <p className="mt-1 text-xs text-slate-500">Submitted {fmt(p.lastSubmittedAt)}</p>
              </button>
            </li>
          ))}
        </ul>

        {selected ? <InteriorDetail key={selected.id} p={selected} onDone={load} /> : null}
      </div>
    </div>
  );
}

function InteriorDetail({ p, onDone }: { p: AdminInteriorItem; onDone: () => void }) {
  const [notes, setNotes] = useState(p.reviewNotes ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const missing = (p.readiness?.items ?? []).filter((i) => !i.done);
  const contact = p.contact;
  const gallery = p.workGallery ?? [];
  const publicUrl = p.slug && p.primaryCity ? `/interior-designers/${encodeURIComponent(p.primaryCity.toLowerCase())}/${p.slug}` : null;

  const decide = async (decision: "APPROVE" | "REQUEST_CHANGES" | "REJECT") => {
    if (decision !== "APPROVE" && !notes.trim()) return toast.error("Write a note for the owner first.");
    setBusy(decision);
    try {
      const res = (await adminApi.reviewInterior(p.id, decision, notes)) as { status?: string; statusReason?: string | null };
      if (decision === "APPROVE") {
        toast.success(res?.status === "PUBLISHED" ? "Approved and live." : res?.statusReason === "PAYMENT_DUE" ? "Approved. Goes live once the owner pays the monthly fee." : "Approved.");
      } else toast.success(decision === "REJECT" ? "Rejected." : "Changes requested. The owner will see your note.");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the decision");
    } finally {
      setBusy(null);
    }
  };

  const openDoc = async (id: string) => {
    try {
      const { url } = await adminApi.interiorDocumentUrl(Number(id));
      window.open(url, "_blank", "noopener");
    } catch {
      toast.error("Couldn't open the document");
    }
  };
  const reviewDoc = async (id: string, status: "VERIFIED" | "REJECTED") => {
    try {
      await adminApi.reviewInteriorDocument(Number(id), status, status === "REJECTED" ? notes : undefined);
      toast.success(status === "VERIFIED" ? "Document verified" : "Document rejected");
      onDone();
    } catch {
      toast.error("Couldn't update the document");
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start gap-4">
        {p.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.logo} alt="" className="h-16 w-16 rounded-xl border border-slate-200 object-cover dark:border-slate-700" />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{nameOf(p)}</h2>
          <p className="text-sm text-slate-500">
            {p.providerType === "COMPANY" ? "Company" : "Individual designer"} · {[p.primaryLocality, p.primaryCity].filter(Boolean).join(", ")} · status {p.status}
          </p>
          {p.tagline && <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{p.tagline}</p>}
        </div>
        {publicUrl && p.status === "PUBLISHED" && (
          <Link href={publicUrl} target="_blank" className="inline-flex items-center gap-1 text-sm font-semibold underline">
            Public page <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Box title="Owner account">
          <Line icon={User}>{p.owner?.name || "—"}</Line>
          <Line icon={Phone}>{p.owner?.mobileNumber || "—"}</Line>
          <Line icon={Mail}>{p.owner?.email || "—"}</Line>
        </Box>
        <Box title="Enquiry contact">
          <Line icon={User}>{contact?.contactName || "—"}</Line>
          <Line icon={Phone}>{contact?.phone || "—"}</Line>
          <Line icon={Mail}>{contact?.email || "—"}</Line>
        </Box>
      </div>

      {p.about && (
        <Box title="About">
          <p className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">{p.about}</p>
        </Box>
      )}

      <Box title="Services & styles">
        <p className="text-sm text-slate-700 dark:text-slate-300">{(p.servicesOffered ?? []).join(" · ") || "—"}</p>
        <p className="mt-1 text-xs text-slate-500">{(p.designStyles ?? []).join(" · ")}</p>
        <p className="mt-1 text-xs text-slate-500">
          {p.isCustomQuotationOnly ? "Quote only" : p.startingRateMin ? `From ₹${p.startingRateMin.toLocaleString("en-IN")}` : "No price"} · {(p.packages ?? []).length} packages ·{" "}
          {(p.projects ?? []).length} projects · {gallery.length} gallery photos
        </p>
      </Box>

      {(gallery.length > 0 || p.coverBanner) && (
        <Box title="Photos">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {[p.coverBanner, ...gallery].filter((u): u is string => !!u).map((u, i) => (
              <a key={`${u}-${i}`} href={u} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden rounded-lg bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="h-full w-full object-cover" loading="lazy" />
              </a>
            ))}
          </div>
        </Box>
      )}

      <Box title={`Documents (${(p.credentials ?? []).length})`}>
        {!(p.credentials ?? []).length && <p className="text-sm text-slate-500">None uploaded (optional for now).</p>}
        <ul className="space-y-2">
          {(p.credentials ?? []).map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-slate-500" />
              <span className="font-medium">{d.type}</span>
              {d.number && <span className="text-slate-500">{d.number}</span>}
              <span className={cn("rounded-full px-2 py-0.5 text-xs", d.status === "VERIFIED" ? "bg-emerald-100 text-emerald-800" : d.status === "REJECTED" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800")}>{d.status}</span>
              <button type="button" onClick={() => void openDoc(d.id)} className="ml-auto underline">View</button>
              {d.status !== "VERIFIED" && <button type="button" onClick={() => void reviewDoc(d.id, "VERIFIED")} className="font-semibold text-emerald-700 underline">Verify</button>}
              {d.status !== "REJECTED" && <button type="button" onClick={() => void reviewDoc(d.id, "REJECTED")} className="text-rose-700 underline">Reject</button>}
            </li>
          ))}
        </ul>
      </Box>

      <Box title={missing.length ? `Not filled yet (${missing.length})` : "Profile checklist"}>
        {missing.length ? (
          <ul className="space-y-1">
            {missing.map((i) => (
              <li key={`${i.id}-${i.level}`} className="flex items-center gap-2 text-sm">
                <Circle className="h-3.5 w-3.5 text-amber-500" /> {i.label}
                {i.level === "SUBMIT" && <span className="text-xs text-rose-600">required</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Everything filled in.</p>
        )}
        {p.readiness && !p.readiness.canPublish && (
          <p className="mt-2 text-xs text-slate-500">Approving marks it verified, but it only goes live once the items above are filled in.</p>
        )}
      </Box>

      <div className="space-y-2">
        <label htmlFor="review-notes" className="text-sm font-semibold">Note to the owner</label>
        <textarea
          id="review-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Needed for 'Request changes' and 'Reject', e.g. Please add a clearer logo."
          className="w-full rounded-xl border border-slate-300 bg-transparent p-3 text-sm dark:border-slate-700"
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={!!busy} onClick={() => void decide("APPROVE")} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy === "APPROVE" && <Loader2 className="h-4 w-4 animate-spin" />} Approve
          </button>
          <button type="button" disabled={!!busy} onClick={() => void decide("REQUEST_CHANGES")} className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-800 disabled:opacity-60 dark:text-amber-300">
            {busy === "REQUEST_CHANGES" && <Loader2 className="h-4 w-4 animate-spin" />} Request changes
          </button>
          <button type="button" disabled={!!busy} onClick={() => void decide("REJECT")} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-60">
            {busy === "REJECT" && <Loader2 className="h-4 w-4 animate-spin" />} Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </section>
  );
}

function Line({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
      <Icon className="h-3.5 w-3.5 text-slate-400" /> {children}
    </p>
  );
}
