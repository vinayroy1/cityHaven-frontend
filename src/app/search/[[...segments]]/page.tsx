import { redirect } from "next/navigation";
import { buildSearchHref, fromSearchSlug, parseSearchParams } from "@/components/search/searchQuery";

type LegacySearchProps = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyStructuredSearch({ params, searchParams }: LegacySearchProps) {
  const { segments = [] } = await params;
  const query = await searchParams;
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) value.forEach((entry) => urlParams.append(key, entry));
    else if (value) urlParams.set(key, value);
  }

  const state = parseSearchParams(urlParams);
  const locationSegments = segments[0] === "india" ? segments.slice(1) : segments;
  if (locationSegments[0]) state.cityName = fromSearchSlug(locationSegments[0]);
  state.localities = locationSegments.slice(1, 3).map((value) => ({ label: fromSearchSlug(value) }));
  redirect(buildSearchHref(state));
}
