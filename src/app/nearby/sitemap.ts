/**
 * /nearby/sitemap.xml — locality guide pages for the top 100 cities: one city guide page each
 * plus every indexable locality (enough landmarks, one page per shared map point).
 */
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/seo";
import { getGuideCities, getGuideLocalities, guideCityKey } from "@/components/nearby/guideData";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cities = await getGuideCities();
  const now = new Date();
  const out: MetadataRoute.Sitemap = [{ url: `${SITE_URL}/nearby`, lastModified: now, changeFrequency: "monthly", priority: 0.7 }];

  // Small batches: 100 parallel requests overload the backend and silently drop cities.
  const perCity: Awaited<ReturnType<typeof getGuideLocalities>>[] = [];
  for (let i = 0; i < cities.length; i += 6) {
    perCity.push(...(await Promise.all(cities.slice(i, i + 6).map((c) => getGuideLocalities(guideCityKey(c))))));
  }
  cities.forEach((c, i) => {
    out.push({ url: `${SITE_URL}/nearby/city/${guideCityKey(c)}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
    for (const l of perCity[i]?.localities ?? []) {
      out.push({ url: `${SITE_URL}/nearby/${l.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.5 });
    }
  });
  return out;
}
