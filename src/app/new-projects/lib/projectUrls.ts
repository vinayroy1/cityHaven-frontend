import { countrySegment } from "@/lib/seo/countryPath";
import { toSearchSlug } from "@/components/search/searchQuery";

/**
 * Project URLs. India has no country segment (existing, indexed URLs stay as they are);
 * every other country is prefixed with its lowercase ISO code:
 *
 *   /new-projects/noida/sector-150            /new-projects/ae/dubai/jvc
 *   /new-projects/daxin-vistas-bhondsi-...    /new-projects/ae/emaar-sunset-jvc-dubai
 */
export { splitCountry } from "@/lib/seo/countryPath";

export function projectDetailPath(project: { slug: string; countryCode?: string | null }): string {
  const cc = countrySegment(project.countryCode);
  return `/new-projects/${cc ? `${cc}/` : ""}${project.slug}`;
}

export function projectSearchPath(city?: string, localities: string[] = [], countryCode?: string | null): string {
  const cc = countrySegment(countryCode);
  const segments = [city ?? "", ...localities.slice(0, 2)].map(toSearchSlug).filter(Boolean);
  if (!segments.length) return "/new-projects";
  return `/new-projects/${cc ? `${cc}/` : ""}${segments.join("/")}`;
}

/** Status landing pages: /new-projects/{city}[/{locality}]/{status-slug}. */
export const PROJECT_STATUS_SLUGS = {
  "new-launch": "NEW_LAUNCH",
  "under-construction": "UNDER_CONSTRUCTION",
  "ready-to-move": "READY_TO_MOVE",
} as const;
export type ProjectStatusSlug = keyof typeof PROJECT_STATUS_SLUGS;
export type ProjectStatusValue = (typeof PROJECT_STATUS_SLUGS)[ProjectStatusSlug];

export const PROJECT_STATUS_LABEL: Record<ProjectStatusValue, string> = {
  NEW_LAUNCH: "New Launch",
  UNDER_CONSTRUCTION: "Under Construction",
  READY_TO_MOVE: "Ready to Move",
};

export function statusFromSlug(slug?: string | null): ProjectStatusValue | null {
  if (!slug) return null;
  return (PROJECT_STATUS_SLUGS as Record<string, ProjectStatusValue>)[slug.toLowerCase()] ?? null;
}

export function statusToSlug(status?: string | null): ProjectStatusSlug | null {
  const hit = Object.entries(PROJECT_STATUS_SLUGS).find(([, v]) => v === status);
  return hit ? (hit[0] as ProjectStatusSlug) : null;
}

/** City / locality page, optionally narrowed to a status. Status pages need a city. */
export function projectStatusPath(city: string, localities: string[], countryCode: string | null | undefined, status?: string | null): string {
  const base = projectSearchPath(city, localities, countryCode);
  const slug = statusToSlug(status);
  return slug && base !== "/new-projects" ? `${base}/${slug}` : base;
}
