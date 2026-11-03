"use client";
/**
 * Interactive "everything nearby" list for a locality: category tabs with counts, every place
 * sorted by distance, walk/drive time, directions and "show more".
 */
import { useMemo, useState } from "react";
import { LayoutGrid, Navigation } from "lucide-react";
import { CATEGORY_META, ORDER, categoryOf, fmtKm, travel, type CategoryKey, type ExplorerItem } from "./nearbyCategories";

const PAGE = 10;

export function LocalityExplorer({ items }: { items: ExplorerItem[] }) {
  const byCat = useMemo(() => {
    const m = new Map<CategoryKey, ExplorerItem[]>();
    const seen = new Set<string>();
    for (const it of [...items].sort((a, b) => a.distanceKm - b.distanceKm)) {
      const c = categoryOf(it);
      const k = `${c}:${it.name.toLowerCase()}`;
      if (!c || seen.has(k)) continue;
      seen.add(k);
      m.set(c, [...(m.get(c) ?? []), it]);
    }
    return m;
  }, [items]);

  const cats = ORDER.filter((c) => byCat.get(c)?.length);
  const [active, setActive] = useState<CategoryKey | "all">("all");
  const [shown, setShown] = useState(PAGE);

  const list = useMemo(() => {
    if (active !== "all") return (byCat.get(active) ?? []).map((it) => ({ it, cat: active }));
    return cats
      .flatMap((c) => (byCat.get(c) ?? []).map((it) => ({ it, cat: c })))
      .sort((a, b) => a.it.distanceKm - b.it.distanceKm);
  }, [active, byCat, cats]);

  const total = cats.reduce((n, c) => n + (byCat.get(c)?.length ?? 0), 0);
  const pick = (c: CategoryKey | "all") => {
    setActive(c);
    setShown(PAGE);
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Category tabs */}
      <div className="sticky top-16 z-10 rounded-t-3xl border-b border-slate-100 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex gap-2 overflow-x-auto px-3 py-3 [scrollbar-width:none] sm:px-4">
          {(["all", ...cats] as const).map((c) => {
            const meta = c === "all" ? { label: "All", icon: LayoutGrid, chip: "bg-slate-900 dark:bg-white dark:text-slate-900" } : CATEGORY_META[c];
            const Icon = meta.icon;
            const count = c === "all" ? total : byCat.get(c)?.length ?? 0;
            const on = active === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => pick(c)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  on ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {meta.label}
                <span className={`rounded-full px-1.5 text-[10px] ${on ? "bg-white/25" : "bg-white text-slate-500 dark:bg-slate-700 dark:text-slate-300"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {list.slice(0, shown).map(({ it, cat }) => {
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          return (
            <li key={`${cat}-${it.key ?? it.name}`} className="flex items-center gap-3 px-4 py-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${meta.dot}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{it.name}</p>
                <p className="text-xs text-slate-500">
                  {meta.label.replace(/s$/, "")} · {travel(it.distanceKm)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                  {fmtKm(it.distanceKm)}
                </span>
                {it.lat != null && it.lng != null && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${it.lat},${it.lng}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    aria-label={`Directions to ${it.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                  >
                    <Navigation className="h-4 w-4" />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {list.length > shown && (
        <div className="p-3">
          <button
            type="button"
            onClick={() => setShown((n) => n + 20)}
            className="w-full rounded-2xl border border-slate-200 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Show {Math.min(20, list.length - shown)} more · {list.length - shown} left
          </button>
        </div>
      )}
    </div>
  );
}
