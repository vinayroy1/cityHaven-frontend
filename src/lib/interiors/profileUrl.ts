/** "New Delhi" -> "new-delhi". The [city] segment is cosmetic (profiles load by slug), so old links keep working. */
export const interiorCitySlug = (city?: string | null) =>
  (city || "india")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "india";

/** Public profile path for an interior designer / studio. */
export const interiorProfilePath = (p: { primaryCity?: string | null; slug?: string | null }) =>
  `/interior-designers/${interiorCitySlug(p.primaryCity)}/${p.slug}`;
