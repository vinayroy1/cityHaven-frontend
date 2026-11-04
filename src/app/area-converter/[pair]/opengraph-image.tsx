import { areaOgImage, ogSize } from "@/components/area/ogImage";
import { ALL_PAIRS, convertArea, fmtArea, pairSlug, parsePair } from "@/components/area/units";

export const alt = "Area unit conversion";
export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = () => ALL_PAIRS.map(([a, b]) => ({ pair: pairSlug(a, b) }));

export default async function Image({ params }: { params: Promise<{ pair: string }> }) {
  const p = parsePair((await params).pair);
  if (!p) return areaOgImage("Area Converter", "1 acre = 43,560 sq ft");
  const [a, b] = p;
  return areaOgImage(`${a.plural} to ${b.plural}`, `1 ${a.short} = ${fmtArea(convertArea(1, a, b))} ${b.short}`);
}
