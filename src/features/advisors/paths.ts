import { flatDetailPath, listingPath } from "@/lib/seo/countryPath";

const BASE = "/agents";

/** /agents[/cc]/<slug>: one URL per advisor (the slug, never the numeric id); non-India carries its country. */
export const agentPath = (a: { id: string | number; slug?: string | null; countryCode?: string | null }) =>
  flatDetailPath(BASE, String(a.slug || a.id), a.countryCode);

/** Directory pages: /agents[/cc]/city[/locality]. */
export const agentsListPath = (city?: string | null, locality?: string | null, countryCode?: string | null) =>
  listingPath(BASE, city, locality, countryCode);
