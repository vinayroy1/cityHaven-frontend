import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { buildCanonical } from "@/constants/seo";
import { fromSearchSlug, toSearchSlug } from "@/components/search/searchQuery";
import { NewProjectsClient } from "../../components/NewProjectsClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

type Props = { params: Promise<{ segments?: string[] }> };

function parseSegments(segments: string[]) {
  if (segments.length < 1 || segments.length > 3) return null;
  return {
    city: fromSearchSlug(segments[0]),
    localities: segments.slice(1, 3).map(fromSearchSlug).filter(Boolean),
  };
}

async function getProjectCount(city: string, localities: string[]): Promise<number | null> {
  try {
    let endpoint = API_ENDPOINTS.projects.search;
    if (endpoint.includes("localhost:4000")) {
      const serverBase =
        process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://awasio-backend:4000/api";
      endpoint = `${serverBase}/v1/projects`;
    }
    const url = new URL(endpoint);
    url.searchParams.set("city", city);
    if (localities.length) url.searchParams.set("locality", localities.join(","));
    url.searchParams.set("page", "1");
    url.searchParams.set("pageSize", "1");
    const response = await fetch(url, { next: { revalidate: 3600 }, headers: { Accept: "application/json" } });
    if (!response.ok) return null;
    const payload = await response.json();
    const total = Number(payload?.data?.total ?? payload?.total);
    return Number.isFinite(total) ? total : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments = [] } = await params;
  const location = parseSegments(segments);
  if (!location) return {};
  const label = [...location.localities, location.city].join(", ");
  const count = await getProjectCount(location.city, location.localities);
  const countLabel = count !== null && count > 0 ? `${count} ` : "";
  const title = `${countLabel}New Residential Projects in ${label} | Awasio`;
  const description = `Explore ${countLabel || "verified "}new residential projects, prices, configurations and possession timelines in ${label}.`;
  const canonical = buildCanonical(`/new-projects/in/${segments.join("/")}`);
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, type: "website" } };
}

export default async function ProjectLocationSearchPage({ params }: Props) {
  const { segments = [] } = await params;
  const location = parseSegments(segments);
  if (!location) notFound();

  const canonicalSegments = [location.city, ...location.localities].map(toSearchSlug);
  if (canonicalSegments.some((value, index) => value !== segments[index])) {
    permanentRedirect(`/new-projects/in/${canonicalSegments.join("/")}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <HeaderNav />
      <main className="flex-1">
        <NewProjectsClient initialCity={location.city} initialLocalities={location.localities} />
      </main>
      <FooterLinks />
    </div>
  );
}
