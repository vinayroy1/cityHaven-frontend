/**
 * "What's nearby" for the property page. Uses the landmarks saved with the listing; if none were
 * saved (older listings), falls back to the locality's precomputed landmarks from our DB.
 * Server component, so the content is in the HTML for SEO.
 */
import { Bus, GraduationCap, HeartPulse, Navigation, ShoppingBag, TrainFront } from "lucide-react";
import { toInternalApiUrl } from "@/lib/api/internalApi";

type Item = { key?: string; name: string; distanceKm: number; type?: string; lat?: number | null; lng?: number | null };
export type Groups = { transit: Item[]; healthcare: Item[]; education: Item[]; lifestyle: Item[] };

const GROUPS: Array<{ key: keyof Groups; label: string; icon: typeof Bus; tone: string }> = [
  { key: "transit", label: "Transit", icon: TrainFront, tone: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300" },
  { key: "healthcare", label: "Hospitals", icon: HeartPulse, tone: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" },
  { key: "education", label: "Schools & colleges", icon: GraduationCap, tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  { key: "lifestyle", label: "Malls & offices", icon: ShoppingBag, tone: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" },
];

const TYPE_LABEL: Record<string, string> = {
  METRO_STATION: "Metro",
  RAILWAY_STATION: "Railway",
  BUS_TERMINAL: "Bus",
  AIRPORT: "Airport",
  HOSPITAL: "Hospital",
  SCHOOL_COLLEGE: "School / College",
  SHOPPING_MALL: "Mall",
  IT_PARK: "IT Park",
};

function normalize(raw: unknown): Groups | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const pick = (k: string): Item[] =>
    Array.isArray(r[k])
      ? (r[k] as Item[]).filter((x) => x && typeof x.name === "string" && Number.isFinite(Number(x.distanceKm)))
      : [];
  const g = { transit: pick("transit"), healthcare: pick("healthcare"), education: pick("education"), lifestyle: pick("lifestyle") };
  return Object.values(g).some((l) => l.length) ? g : null;
}

export type NearbyLocality = {
  id: number;
  name: string | null;
  slug: string | null;
  cityName: string | null;
  /** Guide path "{cityKey}/{localityKey}" → /nearby/{path}. */
  path?: string | null;
};

/** Landmarks + resolved locality from the backend (by slug, id, name+city or lat/lng). */
export async function fetchNearbyData(p: {
  expanded?: boolean;
  cityKey?: string;
  localityKey?: string;
  slug?: string | null;
  localityId?: number | string | null;
  locality?: string | null;
  cityName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<{
  groups: Groups | null;
  locality: NearbyLocality | null;
  coordinates?: { lat: number; lng: number };
  indexable?: boolean;
  pincode?: string;
} | null> {
  const qs = new URLSearchParams();
  if (p.expanded) qs.set("expanded", "1");
  if (p.slug) qs.set("slug", p.slug);
  if (p.cityKey && p.localityKey) {
    qs.set("cityKey", p.cityKey);
    qs.set("localityKey", p.localityKey);
  }
  if (p.localityId) qs.set("localityId", String(p.localityId));
  if (p.locality) qs.set("locality", p.locality);
  if (p.cityName) qs.set("city", p.cityName);
  if (p.latitude != null && p.longitude != null) {
    qs.set("lat", String(p.latitude));
    qs.set("lng", String(p.longitude));
  }
  if (!qs.toString()) return null;
  try {
    const res = await fetch(toInternalApiUrl(`/v1/locations/nearby-landmarks?${qs}`), { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const d = await res.json();
    return { groups: normalize(d), locality: d.locality ?? null, coordinates: d.coordinates, indexable: d.indexable, pincode: d.pincode };
  } catch {
    return null;
  }
}

const fmtKm = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

export function NearbyGrid({ groups, limit = 4, title = "What's nearby" }: { groups: Groups; limit?: number; title?: string | null }) {
  const closest = (["transit", "healthcare", "education"] as const)
    .map((k) => [...groups[k]].sort((a, b) => a.distanceKm - b.distanceKm)[0])
    .filter(Boolean);
  return (
    <>
      {title && <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h2>}
      {closest.length > 0 && (
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          {closest.map((c) => `${c.name} ${fmtKm(c.distanceKm)}`).join(" · ")}
        </p>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {GROUPS.filter((g) => groups[g.key].length).map(({ key, label, icon: Icon, tone }) => (
          <div key={key} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <div className="mb-2 flex items-center gap-2">
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{label}</span>
            </div>
            <ul className="space-y-1.5">
              {[...groups[key]]
                .sort((a, b) => a.distanceKm - b.distanceKm)
                .slice(0, limit)
                .map((it) => (
                  <li key={it.key ?? `${it.name}-${it.distanceKm}`} className="flex items-center justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate text-slate-700 dark:text-slate-300">
                      {it.name}
                      {it.type && TYPE_LABEL[it.type] && key === "transit" && (
                        <span className="ml-1 text-slate-400">· {TYPE_LABEL[it.type]}</span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <span className="font-semibold text-slate-900 dark:text-white">{fmtKm(it.distanceKm)}</span>
                      {it.lat != null && it.lng != null && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${it.lat},${it.lng}`}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          aria-label={`Directions to ${it.name}`}
                          className="text-slate-400 hover:text-emerald-600"
                        >
                          <Navigation className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-slate-400">
        Approximate straight-line distances from the locality centre. Map data © OpenStreetMap contributors, Overture Maps.
      </p>
    </>
  );
}

export async function NearbyPlaces(props: {
  stored?: unknown;
  localityId?: number | string | null;
  locality?: string | null;
  cityName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const groups = normalize(props.stored) ?? (await fetchNearbyData(props))?.groups ?? null;
  if (!groups) return null;
  return (
    <section id="nearby" className="scroll-mt-24 border-t border-zinc-200 py-6 dark:border-slate-800">
      <NearbyGrid groups={groups} />
    </section>
  );
}
