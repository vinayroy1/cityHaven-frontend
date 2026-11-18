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
