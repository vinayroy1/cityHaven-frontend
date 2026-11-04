"use client";

/**
 * Compact "nearby places" summary used inside listing forms (property + flatmate).
 * Collapsed: one line of chips with the nearest place per category. Expanded: a short list.
 */
import { useEffect, useState } from "react";
import { ChevronDown, GraduationCap, Hospital, Loader2, MapPin, ShoppingBag, Train, type LucideIcon } from "lucide-react";

type Item = { name: string; distanceKm: number; duration?: string; key?: string };
export type CompactLandmarks = {
  transit?: Item[];
  healthcare?: Item[];
  education?: Item[];
  lifestyle?: Item[];
  all?: unknown[];
} | null;

const CATS: Array<{ key: "transit" | "healthcare" | "education" | "lifestyle"; label: string; icon: LucideIcon; tone: string }> = [
  { key: "transit", label: "Transit", icon: Train, tone: "text-sky-600" },
  { key: "healthcare", label: "Hospital", icon: Hospital, tone: "text-rose-600" },
  { key: "education", label: "School", icon: GraduationCap, tone: "text-amber-600" },
  { key: "lifestyle", label: "Shopping", icon: ShoppingBag, tone: "text-emerald-600" },
];

const km = (n: number) => (n < 1 ? `${Math.round(n * 1000)} m` : `${Number(n.toFixed(1))} km`);

export const hasLandmarks = (d: CompactLandmarks) => !!d && CATS.some((c) => (d[c.key]?.length ?? 0) > 0);

export function NearbyLandmarksCompact({ data, loading }: { data: CompactLandmarks; loading?: boolean }) {
  const [open, setOpen] = useState(false);
  if (!loading && !hasLandmarks(data)) return null;

  const cats = CATS.filter((c) => (data?.[c.key]?.length ?? 0) > 0);
  const total = cats.reduce((s, c) => s + (data?.[c.key]?.length ?? 0), 0);

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Nearby places
        </span>
        {loading ? (
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <Loader2 className="h-3 w-3 animate-spin" /> Finding…
          </span>
        ) : (
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Auto-added ✓</span>
        )}
      </div>

      {!loading && (
        <>
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cats.map((c) => {
              const first = [...(data![c.key] ?? [])].sort((a, b) => a.distanceKm - b.distanceKm)[0];
              const Icon = c.icon;
              return (
                <span
                  key={c.key}
                  title={first.name}
                  className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Icon className={`h-3 w-3 ${c.tone}`} />
                  <span className="max-w-[7.5rem] truncate">{first.name}</span>
                  <b className="font-semibold text-slate-900 dark:text-white">{km(first.distanceKm)}</b>
                </span>
              );
            })}
          </div>

          {total > cats.length && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-1.5 flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
            >
              {open ? "Hide" : `View all ${total}`}
              <ChevronDown className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
            </button>
          )}

          {open && (
            <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
              {cats.flatMap((c) =>
                (data![c.key] ?? []).map((it, i) => (
                  <div key={`${c.key}-${i}`} className="flex min-w-0 items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <c.icon className={`h-3 w-3 shrink-0 ${c.tone}`} />
                    <span className="min-w-0 flex-1 truncate">{it.name}</span>
                    <span className="shrink-0 font-semibold text-slate-800 dark:text-slate-200">{km(it.distanceKm)}</span>
                  </div>
                )),
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Fetches landmarks for a locality + city (debounced, latest request wins). */
export function useLocalityLandmarks(locality: string | undefined, city: string | undefined, enabled = true) {
  const loc = locality?.trim() ?? "";
  const c = city?.trim() ?? "";
  const query = enabled && loc && c ? `${loc}|${c}` : "";
  const [result, setResult] = useState<{ query: string; data: CompactLandmarks }>({ query: "", data: null });

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      let data: CompactLandmarks = null;
      try {
        const res = await fetch(
          `/api/google/nearby-landmarks?locality=${encodeURIComponent(loc)}&city=${encodeURIComponent(c)}&address=${encodeURIComponent(`${loc}, ${c}`)}`,
        );
        const d = res.ok ? await res.json() : null;
        if (d?.success) {
          data = {
            transit: (d.transit || []).slice(0, 5),
            healthcare: (d.healthcare || []).slice(0, 5),
            education: (d.education || []).slice(0, 5),
            lifestyle: (d.lifestyle || []).slice(0, 5),
          };
        }
      } catch {
        /* landmarks are optional */
      }
      if (!cancelled) setResult({ query, data });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, loc, c]);

  const fresh = query !== "" && result.query === query;
  return { data: fresh ? result.data : null, loading: query !== "" && !fresh };
}
