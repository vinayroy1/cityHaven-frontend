import type { BlogContentBlock } from "@/types/blog.types";

/** Stable anchor id for a heading, shared by BlogContent (ids) and the table of contents (links). */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export type TocItem = { id: string; text: string };

/** Level-2 headings, de-duplicated ids, in document order. */
export function tableOfContents(blocks: BlogContentBlock[]): TocItem[] {
  const seen = new Map<string, number>();
  const items: TocItem[] = [];
  for (const block of blocks) {
    if (block.type !== "heading" || block.level !== 2) continue;
    const base = headingId(block.text);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    items.push({ id: n ? `${base}-${n + 1}` : base, text: block.text });
  }
  return items;
}

/** View counts are only shown once they are meaningful social proof. */
export const SHOW_VIEWS_FROM = 50;

/** Cover styling for posts without an uploaded image, keyed by category slug. */
const CATEGORY_GRADIENTS: Record<string, string> = {
  "buying-guides": "from-rose-600 via-rose-500 to-orange-400",
  renting: "from-sky-700 via-sky-600 to-cyan-400",
  flatmates: "from-violet-700 via-fuchsia-600 to-pink-400",
  "pg-co-living": "from-indigo-700 via-violet-600 to-purple-400",
  "commercial-property": "from-slate-800 via-slate-700 to-amber-500",
  "new-projects": "from-emerald-700 via-teal-600 to-cyan-400",
  investment: "from-amber-600 via-orange-500 to-rose-400",
  interiors: "from-stone-700 via-amber-700 to-amber-400",
  "legal-finance": "from-blue-900 via-indigo-700 to-sky-500",
  "neighbourhood-guides": "from-green-800 via-emerald-600 to-lime-400",
  "for-owners": "from-teal-800 via-teal-600 to-emerald-400",
};

export function categoryGradient(slug?: string | null): string {
  return (slug && CATEGORY_GRADIENTS[slug]) || "from-slate-900 via-slate-800 to-rose-700";
}
