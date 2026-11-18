import { flatDetailPath, listingPath } from "@/lib/seo/countryPath";

/** /flatmates[/cc]/<slug>: non-India listings carry their country code (see lib/seo/countryPath). */
export const flatmatePath = (l: { slug: string; countryCode?: string | null }) => flatDetailPath("/flatmates", l.slug, l.countryCode);

/** Search pages: /flatmate[/cc]/city[/locality]. */
export const flatmateSearchPath = (city?: string | null, locality?: string | null, countryCode?: string | null) =>
  listingPath("/flatmate", city, locality, countryCode);
