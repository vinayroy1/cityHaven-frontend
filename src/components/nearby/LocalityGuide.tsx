/** Server-rendered pieces of the locality guide: connectivity score ring and highlight cards. */
import type { Groups } from "./NearbyPlaces";
import { CATEGORY_META, categoryOf, fmtKm, type CategoryKey, type ExplorerItem } from "./nearbyCategories";

export const flattenGroups = (g: Groups): ExplorerItem[] => [
  ...g.transit, ...g.healthcare, ...g.education, ...g.lifestyle, ...(g.services ?? []),
];

function byCategory(items: ExplorerItem[]) {
  const m = new Map<CategoryKey, ExplorerItem[]>();
  for (const it of [...items].sort((a, b) => a.distanceKm - b.distanceKm)) {
    const c = categoryOf(it);
    if (c) m.set(c, [...(m.get(c) ?? []), it]);
  }
  return m;
}

const near = (d?: number) => (d == null ? 0 : d <= 1 ? 1 : d <= 2 ? 0.85 : d <= 4 ? 0.6 : d <= 7 ? 0.35 : 0.1);

/** 0–100 score: density of places within 2 km + closeness of metro, hospital and school. */
export function connectivityScore(items: ExplorerItem[]) {
  const m = byCategory(items);
  const within2 = items.filter((i) => i.distanceKm <= 2).length;
  const transit = Math.max(near(m.get("metro")?.[0]?.distanceKm), near(m.get("rail")?.[0]?.distanceKm) * 0.8);
  const score = Math.round(
    35 * Math.min(1, within2 / 40) +
      25 * transit +
      20 * near(m.get("hospital")?.[0]?.distanceKm) +
      20 * near(m.get("school")?.[0]?.distanceKm),
  );
  const verdict = score >= 80 ? "Excellent" : score >= 65 ? "Very good" : score >= 45 ? "Good" : "Developing";
  return { score, verdict, within2 };
}

export function ScoreRing({ score, verdict }: { score: number; verdict: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" className="stroke-slate-100 dark:stroke-slate-800" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className="stroke-emerald-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black leading-none text-slate-900 dark:text-white">{score}</span>
        <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600">{verdict}</span>
      </div>
    </div>
  );
}

const TILES: CategoryKey[] = ["metro", "hospital", "school", "college", "mall", "airport"];

export function HighlightTiles({ items }: { items: ExplorerItem[] }) {
  const m = byCategory(items);
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
      {TILES.map((cat) => {
        const list = m.get(cat) ?? [];
        const first = list[0];
        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;
        return (
          <div
            key={cat}
            className="rounded-2xl border border-slate-200/80 bg-white p-3.5 transition hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${meta.dot}`}>
                <Icon className="h-4 w-4" />
              </span>
              {list.length > 0 && <span className="text-[11px] font-medium text-slate-400">{list.length} nearby</span>}
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Nearest {meta.label.replace(/s$/, "").toLowerCase()}</p>
            {first ? (
              <>
                <p className="mt-0.5 text-xl font-black text-slate-900 dark:text-white">{fmtKm(first.distanceKm)}</p>
                <p className="truncate text-xs text-slate-500" title={first.name}>
                  {first.name}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm font-semibold text-slate-400">None close by</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
