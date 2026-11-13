export const dynamic = "force-dynamic";
import { PROJECT_SITEMAP_FILES } from "@/lib/seo/projectSitemaps";

const SITEMAPS = [
  "https://awasio.com/sitemap.xml",
  "https://awasio.com/nearby/sitemap.xml",
  "https://awasio.com/nearby/sitemaps/uk.xml",
  "https://awasio.com/nearby/sitemaps/my.xml",
  "https://awasio.com/nearby/sitemaps/sa.xml",
  "https://awasio.com/nearby/sitemaps/ie.xml",
  "https://awasio.com/nearby/sitemaps/nz.xml",
  "https://awasio.com/nearby/sitemaps/sg.xml",
  "https://awasio.com/nearby/sitemaps/au.xml",
  "https://awasio.com/nearby/sitemaps/ae.xml",
  "https://awasio.com/nearby/sitemaps/om.xml",
  "https://awasio.com/nearby/sitemaps/np.xml",
  "https://awasio.com/nearby/sitemaps/bd.xml",
  "https://awasio.com/nearby/sitemaps/lk.xml",
  "https://awasio.com/nearby/sitemaps/kw.xml",
  "https://awasio.com/nearby/sitemaps/qa.xml",
  "https://awasio.com/nearby/sitemaps/bh.xml",
  ...PROJECT_SITEMAP_FILES.map((f) => `https://awasio.com/sitemaps/${f}`),
];

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAPS.map((url) => `  <sitemap>\n    <loc>${url}</loc>\n  </sitemap>`).join("\n")}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
