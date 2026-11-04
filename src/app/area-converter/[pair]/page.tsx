import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildCanonical } from "@/constants/seo";
import { AreaPage } from "@/components/area/AreaPage";
import { ALL_PAIRS, convertArea, fmtArea, pairSlug, parsePair } from "@/components/area/units";

export const dynamicParams = false;
export const generateStaticParams = () => ALL_PAIRS.map(([a, b]) => ({ pair: pairSlug(a, b) }));

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }): Promise<Metadata> {
  const p = parsePair((await params).pair);
  if (!p) return {};
  const [a, b] = p;
  const one = fmtArea(convertArea(1, a, b));
  const title = `${a.plural} to ${b.plural} (${a.short} to ${b.short}) Converter`;
  const description = `Convert ${a.plural.toLowerCase()} to ${b.plural.toLowerCase()} instantly. 1 ${a.name.toLowerCase()} = ${one} ${b.short}. Free calculator with conversion table.`;
  const url = buildCanonical(`/area-converter/${pairSlug(a, b)}`);
  return {
    title,
    description,
    keywords: [
      `${a.short} to ${b.short}`,
      `${a.plural.toLowerCase()} to ${b.plural.toLowerCase()}`,
      `convert ${a.short} to ${b.short}`,
      `1 ${a.short} in ${b.short}`,
      `${a.short} to ${b.short} calculator`,
      `${b.short} to ${a.short}`,
    ],
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function PairPage({ params }: { params: Promise<{ pair: string }> }) {
  const p = parsePair((await params).pair);
  if (!p) notFound();
  const [a, b] = p;
  const one = fmtArea(convertArea(1, a, b));
  const back = fmtArea(convertArea(1, b, a));
  const faqs = [
    { q: `How many ${b.plural.toLowerCase()} are in 1 ${a.name.toLowerCase()}?`, a: `1 ${a.name.toLowerCase()} equals ${one} ${b.plural.toLowerCase()}.` },
    { q: `How do I convert ${a.short} to ${b.short}?`, a: `Multiply the value in ${a.plural.toLowerCase()} by ${one}. For example, 100 ${a.short} = ${fmtArea(convertArea(100, a, b))} ${b.short}.` },
    { q: `How many ${a.plural.toLowerCase()} are in 1 ${b.name.toLowerCase()}?`, a: `1 ${b.name.toLowerCase()} equals ${back} ${a.plural.toLowerCase()}.` },
  ];
  return (
    <AreaPage
      h1={`${a.plural} to ${b.plural} Converter`}
      intro={`1 ${a.short} = ${one} ${b.short}. Enter any value to convert ${a.plural.toLowerCase()} to ${b.plural.toLowerCase()} and every other unit.`}
      from={a.key}
      to={b.key}
      value="1"
      faqs={faqs}
      table={[a, b]}
      path={`/area-converter/${pairSlug(a, b)}`}
      crumb={`${a.short} to ${b.short}`}
    />
  );
}
