/**
 * /sitemaps/{file}.xml -> Direct top-level access for Google Search Console
 * e.g. /sitemaps/uk.xml, /sitemaps/my.xml, etc.
 */
import { SITE_URL } from "@/constants/seo";
import { getGuideCities, getGuideCityPage, guideCityKey } from "@/components/nearby/guideData";
import { PREFIX_TO_COUNTRY } from "@/app/nearby/_views/prefix";
import { toSearchSlug } from "@/components/search/searchQuery";
import { getAllProjectsForSitemap, projectsForSitemap } from "@/lib/seo/projectSitemaps";

export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const prefix = file.replace(/\.xml$/, "").toLowerCase();
  if (file.endsWith(".xml") && prefix.startsWith("projects-")) return projectSitemap(prefix.slice("projects-".length));
  const cc = Object.hasOwn(PREFIX_TO_COUNTRY, prefix) ? PREFIX_TO_COUNTRY[prefix] : undefined;
  if (!file.endsWith(".xml") || !cc) return new Response("Not found", { status: 404 });

  const cities = await getGuideCities(cc);
  if (!cities.length) return new Response("Unavailable", { status: 503, headers: { "Retry-After": "3600" } });

  const urls: Array<{ loc: string; priority: string }> = [];
  for (let i = 0; i < cities.length; i += 6) {
    const batch = cities.slice(i, i + 6);
    const pages = await Promise.all(batch.map((c) => getGuideCityPage(guideCityKey(c))));
    batch.forEach((c, j) => {
      const key = guideCityKey(c);
      if (!key.startsWith(`${prefix}/`)) return;
      const locs = pages[j]?.localities ?? [];
      if (!locs.length) return;
      urls.push({ loc: `${SITE_URL}/nearby/${key}`, priority: "0.6" });
      for (const l of locs) urls.push({ loc: `${SITE_URL}/nearby/${key}/${l.key}`, priority: "0.5" });
    });
  }
  if (!urls.length) return new Response("Not found", { status: 404 });

  const now = new Date().toISOString();
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .slice(0, 50000)
      .map((u) => `<url><loc>${esc(u.loc)}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>${u.priority}</priority></url>`)
      .join("\n") +
    `\n</urlset>\n`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}

/** /sitemaps/projects-<state>.xml: the state's project city pages and every project page. */
async function projectSitemap(key: string): Promise<Response> {
  const all = await getAllProjectsForSitemap();
  if (!all.length) return new Response("Unavailable", { status: 503, headers: { "Retry-After": "3600" } });
  const projects = projectsForSitemap(key, all);
  if (!projects || !projects.length) return new Response("Not found", { status: 404 });

  const now = new Date().toISOString();
  const cities = [...new Set(projects.map((p) => toSearchSlug(p.cityName ?? "")).filter(Boolean))];
  const rows = [
    ...cities.map((c) => ({ loc: `${SITE_URL}/new-projects/${c}`, lastmod: now, freq: "daily", priority: "0.8" })),
    ...projects.map((p) => ({ loc: `${SITE_URL}/new-projects/${p.slug}`, lastmod: p.updatedAt || now, freq: "weekly", priority: "0.7" })),
  ];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    rows
      .slice(0, 50000)
      .map((u) => `<url><loc>${esc(u.loc)}</loc><lastmod>${new Date(u.lastmod).toISOString()}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.priority}</priority></url>`)
      .join("\n") +
    `\n</urlset>\n`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
