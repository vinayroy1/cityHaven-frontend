import { cityDetailPath } from "@/lib/seo/countryPath";
/** "New Delhi" -> "new-delhi". The [city] segment is cosmetic (profiles load by slug), so old links keep working. */
export const interiorCitySlug = (city?: string | null) =>
  (city || "india")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "india";

/** Public profile path for an interior designer / studio. */
/** /interior-designers[/cc]/city/slug: non-India profiles carry their country code (see countryPath). */
export const interiorProfilePath = (p: { primaryCity?: string | null; slug?: string | null; countryCode?: string | null }) =>
  cityDetailPath("/interior-designers", interiorCitySlug(p.primaryCity), p.slug ?? "", p.countryCode);
