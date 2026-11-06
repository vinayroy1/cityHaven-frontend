/**
 * Server-only loader for the home page "Nearby" spotlight: a few popular localities with
 * their score and nearest landmarks. Uses the same API as /nearby (cached 24h there).
 */
import { fetchNearbyData } from "@/components/nearby/NearbyPlaces";
import { flattenGroups, connectivityScore } from "@/components/nearby/LocalityGuide";
import { categoryOf, type CategoryKey } from "@/components/nearby/nearbyCategories";

export type SpotlightStop = { cat: CategoryKey; name: string; km: number; count: number };
export type SpotlightLocality = {
  name: string;
  city: string;
  slug: string;
  score: number;
  verdict: string;
  within2: number;
  stops: SpotlightStop[];
};

/** Popular localities per portal country (same picks as the /nearby page). */
const SPOTLIGHT_BY_COUNTRY: Record<string, Array<[string, string]>> = {
  IN: [["Koramangala", "Bengaluru"], ["Andheri West", "Mumbai"], ["Gachibowli", "Hyderabad"], ["Hinjewadi", "Pune"], ["Saket", "New Delhi"]],
  NP: [["Thamel", "Kathmandu"], ["Lakeside", "Pokhara"], ["Baneshwor", "Kathmandu"], ["Jhamsikhel", "Lalitpur"], ["Maharajgunj", "Kathmandu"]],
  BD: [["Gulshan 2", "Dhaka"], ["Dhanmondi", "Dhaka"], ["Banani", "Dhaka"], ["Uttara", "Dhaka"], ["Agrabad", "Chattogram"]],
  LK: [["Kollupitiya", "Colombo"], ["Bambalapitiya", "Colombo"], ["Wellawatte", "Colombo"], ["Nugegoda", "Colombo"], ["Peradeniya", "Kandy"]],
};

const CATS: CategoryKey[] = ["metro", "hospital", "school", "mall", "it", "airport"];

/** Spotlight localities for every portal country, keyed by country code (picked client-side). */
export async function getNearbySpotlightByCountry(): Promise<Record<string, SpotlightLocality[]>> {
  const entries = await Promise.all(
    Object.entries(SPOTLIGHT_BY_COUNTRY).map(async ([cc, list]) => [cc, await loadCountry(list).catch(() => [])] as const),
  );
  return Object.fromEntries(entries);
}

async function loadCountry(list: Array<[string, string]>): Promise<SpotlightLocality[]> {
  const res = await Promise.all(
    list.map(async ([locality, cityName]) => {
      const d = await fetchNearbyData({ locality, cityName });
      if (!d?.locality?.path || !d.groups) return null;
      const resolved = (d.locality.cityName || "").trim().toLowerCase();
      if (resolved && resolved !== cityName.toLowerCase()) return null;
      const items = flattenGroups(d.groups);
      const { score, verdict, within2 } = connectivityScore(items);
      const stops: SpotlightStop[] = [];
      for (const cat of CATS) {
        const list = items.filter((i) => categoryOf(i) === cat).sort((a, b) => a.distanceKm - b.distanceKm);
        if (list[0]) stops.push({ cat, name: list[0].name, km: list[0].distanceKm, count: list.filter((i) => i.distanceKm <= 3).length });
      }
      if (stops.length < 3) return null;
      return { name: d.locality.name || locality, city: d.locality.cityName || cityName, slug: d.locality.path, score, verdict, within2, stops };
    }),
  );
  return res.filter((x): x is SpotlightLocality => x !== null).slice(0, 4);
}
