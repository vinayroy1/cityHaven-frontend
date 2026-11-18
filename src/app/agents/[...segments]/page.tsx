import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getAllAgentIds } from "@/data/agents";
import { agentPath, agentsListPath } from "@/features/advisors/paths";
import { splitCountry, titleFromSlug } from "@/lib/seo/countryPath";
import { AgentsDirectoryView } from "../components/AgentsDirectoryView";
import { fetchAdvisors, resolveAgent } from "../lib/server-data";
import { AgentProfileView, profileMetadata } from "./profile";

export const revalidate = 120;

// Demo advisors are prerendered; everything else renders on first request (ISR).
export async function generateStaticParams() {
  return getAllAgentIds().map((id) => ({ segments: [id] }));
}

type Props = { params: Promise<{ segments: string[] }> };

/**
 * /agents[/cc]/<slug>             advisor profile (the slug; a numeric id redirects to it)
 * /agents[/cc]/<city>             city page (when the single segment is not an advisor)
 * /agents[/cc]/<city>/<locality>  locality page
 * India has no country segment; other countries use their ISO code (see lib/seo/countryPath).
 */
async function resolve(segments: string[]) {
  const { country, rest } = splitCountry(segments.map((s) => s.toLowerCase()));
  if (rest.length === 1) {
    const agent = await resolveAgent(rest[0]);
    if (agent) return { kind: "agent" as const, agent };
  }
  if (rest.length !== 1 && rest.length !== 2) return null;
  const city = titleFromSlug(rest[0]);
  const locality = rest[1] ? titleFromSlug(rest[1]) : "";
  const agents = await fetchAdvisors({ city, locality });
  // The results decide the real country (an unprefixed Dubai page moves to /agents/ae/dubai).
  const actual = agents[0]?.countryCode ?? country;
  return { kind: "place" as const, country, city, locality, agents, canonical: agentsListPath(city, locality || null, actual) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve((await params).segments);
  if (!r) return {};
  if (r.kind === "agent") return profileMetadata(r.agent);
  const where = [r.locality, r.city].filter(Boolean).join(", ");
  const title = `Verified Real Estate Advisors in ${where} | Awasio`;
  const description = `Find RERA-registered real estate advisors and local property guides in ${where}. Book free in-person site visits, get pricing guidance and help with negotiation.`;
  const url = `https://awasio.com${r.canonical}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // Thin pages stay out of the index until they have advisors.
    robots: r.agents.length ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, siteName: "Awasio", type: "website" },
  };
}

export default async function AgentsRoute({ params }: Props) {
  const segments = (await params).segments;
  const path = `/agents/${segments.join("/")}`;
  const r = await resolve(segments);
  if (!r) notFound();

  if (r.kind === "agent") {
    // One URL per advisor: the slug (never the numeric id), prefixed outside India.
    const canonical = agentPath(r.agent);
    if (canonical !== path) permanentRedirect(canonical);
    return <AgentProfileView agent={r.agent} />;
  }

  // An empty city / area still renders (empty state, noindex) so picking it never lands on a 404.
  if (r.canonical !== path) permanentRedirect(r.canonical);
  return <AgentsDirectoryView city={r.city} locality={r.locality} country={r.country} agents={r.agents} />;
}
