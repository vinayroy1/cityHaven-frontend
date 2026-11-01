import { buildCanonical } from "@/constants/seo";

/** "navi-mumbai" -> "Navi Mumbai" */
export function cityLabel(citySlug: string): string {
  let raw = citySlug;
  try {
    raw = decodeURIComponent(citySlug);
  } catch {
    /* keep raw */
  }
  return raw
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function breadcrumbJsonLd(trail: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      ...(t.path ? { item: buildCanonical(t.path) } : {}),
    })),
  };
}
