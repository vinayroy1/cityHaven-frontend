/**
 * /nearby/sitemaps/{prefix}.xml: locality guide pages of one non-Indian country (ae, au, uk, np, bd, lk).
 * Lists each top city page (/nearby/ae/dubai) and its indexable localities (/nearby/ae/dubai/jumeirah).
 * India stays in /nearby/sitemap.xml, untouched; a failure here never affects it.
 */
import { SITE_URL } from "@/constants/seo";
import { getGuideCities, getGuideCityPage, guideCityKey } from "@/components/nearby/guideData";
import { PREFIX_TO_COUNTRY } from "../../_views/prefix";


export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const prefix = file.replace(/\.xml$/, "").toLowerCase();
  const cc = Object.hasOwn(PREFIX_TO_COUNTRY, prefix) ? PREFIX_TO_COUNTRY[prefix] : undefined;
  if (!file.endsWith(".xml") || !cc) return new Response("Not found", { status: 404 });

  const cities = await getGuideCities(cc);
  // No data (or backend down): 503 so search engines retry instead of dropping the URLs.
  if (!cities.length) return new Response("Unavailable", { status: 503, headers: { "Retry-After": "3600" } });

  const urls: Array<{ loc: string; priority: string }> = [];
  for (let i = 0; i < cities.length; i += 6) {
    const batch = cities.slice(i, i + 6);
    const pages = await Promise.all(batch.map((c) => getGuideCityPage(guideCityKey(c))));
    batch.forEach((c, j) => {
      const key = guideCityKey(c);
      // Only real prefixed keys: an unprefixed one would be a redirect, never list those.
      if (!key.startsWith(`${prefix}/`)) return;
      const locs = pages[j]?.localities ?? [];
      if (!locs.length) return; // empty city page = thin content
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
