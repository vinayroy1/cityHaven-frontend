import Link from "next/link";
import { AlertTriangle, ArrowRight, Lightbulb, Info } from "lucide-react";
import type { BlogContentBlock } from "@/types/blog.types";

export function BlogContent({ blocks }: { blocks: BlogContentBlock[] }) {
  return <div className="space-y-7">{blocks.map((block, index) => {
    const key = `${block.type}-${index}`;
    if (block.type === "heading") return block.level === 2
      ? <h2 key={key} className="scroll-mt-24 pt-4 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">{block.text}</h2>
      : <h3 key={key} className="scroll-mt-24 pt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{block.text}</h3>;
    if (block.type === "paragraph") return <p key={key} className="text-[17px] leading-8 text-slate-700 dark:text-slate-300">{block.text}</p>;
    if (block.type === "image") return <figure key={key} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"><img src={block.url} alt={block.alt} className="max-h-[620px] w-full object-cover" />{block.caption && <figcaption className="px-5 py-3 text-center text-xs text-slate-500 dark:text-slate-400">{block.caption}</figcaption>}</figure>;
    if (block.type === "quote") return <blockquote key={key} className="rounded-r-3xl border-l-4 border-rose-500 bg-rose-50/80 px-6 py-5 text-xl font-semibold italic leading-8 text-slate-800 dark:bg-rose-950/25 dark:text-slate-100"><p>“{block.text}”</p>{block.attribution && <cite className="mt-3 block text-sm not-italic text-slate-500 dark:text-slate-400">— {block.attribution}</cite>}</blockquote>;
    if (block.type === "list") { const Tag = block.style === "numbered" ? "ol" : "ul"; return <Tag key={key} className={`space-y-3 pl-6 text-[17px] leading-7 text-slate-700 marker:font-bold marker:text-rose-500 dark:text-slate-300 ${block.style === "numbered" ? "list-decimal" : "list-disc"}`}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</Tag>; }
    if (block.type === "callout") { const Icon = block.tone === "warning" ? AlertTriangle : block.tone === "tip" ? Lightbulb : Info; const tone = block.tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100" : block.tone === "tip" ? "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100" : "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100"; return <aside key={key} className={`flex gap-4 rounded-2xl border p-5 ${tone}`}><Icon className="mt-0.5 h-5 w-5 shrink-0" /><div>{block.title && <p className="font-bold">{block.title}</p>}<p className="mt-1 text-sm leading-6 opacity-85">{block.text}</p></div></aside>; }
    return <aside key={key} className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-rose-950 p-6 text-white shadow-xl sm:p-8"><h3 className="text-2xl font-black">{block.title}</h3>{block.text && <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">{block.text}</p>}<Link href={block.url} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-rose-100">{block.label}<ArrowRight className="h-4 w-4" /></Link></aside>;
  })}</div>;
}
