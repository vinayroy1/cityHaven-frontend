"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Save, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateBlogPostMutation,
  useGetBlogMediaUploadUrlMutation,
  useUpdateBlogPostMutation,
} from "@/features/blog/api";
import type { BlogContentBlock, BlogPost, BlogPostInput, BlogPostStatus } from "@/types/blog.types";

const field = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
const emptyBlock = (): BlogContentBlock => ({ type: "paragraph", text: "" });

function initialInput(post?: BlogPost): BlogPostInput {
  return post ? {
    title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content,
    coverImage: post.coverImage || "", coverImageAlt: post.coverImageAlt || "", status: post.status,
    isFeatured: post.isFeatured, featuredOrder: post.featuredOrder,
    categoryName: post.category?.name || "", categoryColor: post.category?.color || "#f43f5e",
    tags: post.tags.map(({ tag }) => tag.name), seoTitle: post.seoTitle || "",
    seoDescription: post.seoDescription || "", canonicalUrl: post.canonicalUrl || "",
    ogImage: post.ogImage || "", scheduledAt: post.scheduledAt || null,
  } : {
    title: "", excerpt: "", content: [emptyBlock()], status: "DRAFT", isFeatured: false,
    featuredOrder: 0, tags: [], categoryColor: "#f43f5e",
  };
}

export default function BlogEditor({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [form, setForm] = useState<BlogPostInput>(() => initialInput(post));
  const [tagText, setTagText] = useState(() => post?.tags.map(({ tag }) => tag.name).join(", ") || "");
  const [scheduleValue, setScheduleValue] = useState(() => post?.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : "");
  const [createPost, createState] = useCreateBlogPostMutation();
  const [updatePost, updateState] = useUpdateBlogPostMutation();
  const [getUploadUrl, uploadState] = useGetBlogMediaUploadUrlMutation();
  const busy = createState.isLoading || updateState.isLoading;
  const words = useMemo(() => form.content.flatMap((block) => "text" in block ? block.text : block.type === "list" ? block.items.join(" ") : []).join(" ").trim().split(/\s+/).filter(Boolean).length, [form.content]);

  const patch = <K extends keyof BlogPostInput>(key: K, value: BlogPostInput[K]) => setForm((old) => ({ ...old, [key]: value }));
  const changeBlock = (index: number, next: BlogContentBlock) => patch("content", form.content.map((block, i) => i === index ? next : block));
  const removeBlock = (index: number) => patch("content", form.content.filter((_, i) => i !== index));
  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= form.content.length) return;
    const next = [...form.content]; [next[index], next[target]] = [next[target], next[index]]; patch("content", next);
  };
  const addBlock = (type: BlogContentBlock["type"]) => {
    const blocks: Record<BlogContentBlock["type"], BlogContentBlock> = {
      paragraph: emptyBlock(), heading: { type: "heading", level: 2, text: "" }, image: { type: "image", url: "", alt: "" },
      quote: { type: "quote", text: "" }, list: { type: "list", style: "bullet", items: [""] },
      callout: { type: "callout", tone: "tip", title: "", text: "" }, cta: { type: "cta", title: "", text: "", label: "Explore Awasio", url: "/propertySearch" },
    };
    patch("content", [...form.content, blocks[type]]);
  };

  async function uploadCover(file?: File) {
    if (!file) return;
    try {
      const signed = await getUploadUrl({ fileName: file.name, contentType: file.type }).unwrap();
      const response = await fetch(signed.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!response.ok) throw new Error("Upload failed");
      patch("coverImage", signed.publicUrl); if (!form.coverImageAlt) patch("coverImageAlt", form.title);
      toast.success("Cover uploaded");
    } catch { toast.error("Could not upload this image"); }
  }

  async function save(status: BlogPostStatus) {
    if (!form.title.trim() || !form.excerpt.trim()) return toast.error("Add a title and excerpt first");
    const content = form.content.filter((block) => block.type === "list" ? block.items.some(Boolean) : "text" in block ? Boolean(block.text?.trim()) : true);
    if (!content.length) return toast.error("Add at least one content block");
    if (status === "SCHEDULED" && !scheduleValue) return toast.error("Choose a publishing date");
    const payload: BlogPostInput = {
      ...form, content, status, tags: tagText.split(",").map((tag) => tag.trim()).filter(Boolean),
      scheduledAt: status === "SCHEDULED" ? new Date(scheduleValue).toISOString() : null,
    };
    try {
      if (post) await updatePost({ id: post.id, data: payload }).unwrap(); else await createPost(payload).unwrap();
      toast.success(status === "PUBLISHED" ? "Article published" : status === "SCHEDULED" ? "Article scheduled" : "Draft saved");
      router.push("/admin/blog");
    } catch (error: unknown) {
      const message = typeof error === "object" && error !== null && "data" in error
        ? (error as { data?: { message?: string } }).data?.message
        : undefined;
      toast.error(message || "Could not save article");
    }
  }

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Article title</label>
        <input className={`${field} text-lg font-bold sm:text-xl`} value={form.title} maxLength={180} onChange={(e) => patch("title", e.target.value)} placeholder="A helpful, search-friendly headline" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Category</label><input className={field} value={form.categoryName || ""} onChange={(e) => patch("categoryName", e.target.value)} placeholder="Buying Guide" /></div>
          <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Tags, comma separated</label><input className={field} value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="home loans, Bengaluru, checklist" /></div>
        </div>
        <label className="mb-2 mt-4 block text-xs font-bold uppercase tracking-wider text-slate-500">Excerpt</label>
        <textarea className={field} rows={3} maxLength={500} value={form.excerpt} onChange={(e) => patch("excerpt", e.target.value)} placeholder="A concise summary shown on cards and search results." />
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-900"><ImagePlus className="h-4 w-4" />{uploadState.isLoading ? "Uploading…" : "Upload cover"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => uploadCover(e.target.files?.[0])} /></label><input className={`${field} min-w-[220px] flex-1`} value={form.coverImage || ""} onChange={(e) => patch("coverImage", e.target.value)} placeholder="or paste an image URL" /></div>
          {form.coverImage && <div className="mt-4 overflow-hidden rounded-xl bg-slate-100"><img src={form.coverImage} alt={form.coverImageAlt || "Cover preview"} className="aspect-[16/7] w-full object-cover" /></div>}
          <input className={`${field} mt-3`} value={form.coverImageAlt || ""} onChange={(e) => patch("coverImageAlt", e.target.value)} placeholder="Describe the image for accessibility" />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-slate-900 dark:text-white">Story blocks</h2><p className="text-sm text-slate-500">Reorderable, reusable content for future layouts.</p></div><span className="text-xs font-semibold text-slate-500">{words} words · ~{Math.max(1, Math.ceil(words / 220))} min</span></div>
        <div className="space-y-3">{form.content.map((block, index) => <BlockEditor key={index} block={block} onChange={(next) => changeBlock(index, next)} onRemove={() => removeBlock(index)} onMove={(direction) => moveBlock(index, direction)} />)}</div>
        <div className="mt-4 flex flex-wrap gap-2">{(["paragraph", "heading", "image", "quote", "list", "callout", "cta"] as const).map((type) => <button key={type} type="button" onClick={() => addBlock(type)} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold capitalize text-slate-600 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300"><Plus className="h-3.5 w-3.5" />{type}</button>)}</div>
      </section>
    </div>

    <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="font-bold text-slate-900 dark:text-white">Publish</h2>
        <label className="mt-4 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={form.isFeatured} onChange={(e) => patch("isFeatured", e.target.checked)} className="h-4 w-4 accent-rose-600" />Feature this article</label>
        <label className="mb-2 mt-4 block text-xs font-bold uppercase tracking-wider text-slate-500">Schedule date</label><input type="datetime-local" className={field} value={scheduleValue} onChange={(e) => setScheduleValue(e.target.value)} />
        <div className="mt-5 grid gap-2"><button disabled={busy} onClick={() => save("PUBLISHED")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Publish now</button><button disabled={busy || !scheduleValue} onClick={() => save("SCHEDULED")} className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 disabled:opacity-50 dark:border-rose-900">Schedule</button><button disabled={busy} onClick={() => save("DRAFT")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"><Save className="h-4 w-4" />Save draft</button></div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"><h2 className="font-bold text-slate-900 dark:text-white">Search appearance</h2><label className="mb-2 mt-4 block text-xs font-bold uppercase tracking-wider text-slate-500">SEO title · {(form.seoTitle || "").length}/70</label><input className={field} maxLength={70} value={form.seoTitle || ""} onChange={(e) => patch("seoTitle", e.target.value)} placeholder={form.title || "Search result title"} /><label className="mb-2 mt-4 block text-xs font-bold uppercase tracking-wider text-slate-500">Description · {(form.seoDescription || "").length}/170</label><textarea className={field} rows={4} maxLength={170} value={form.seoDescription || ""} onChange={(e) => patch("seoDescription", e.target.value)} placeholder={form.excerpt || "Search result description"} /><label className="mb-2 mt-4 block text-xs font-bold uppercase tracking-wider text-slate-500">Canonical URL</label><input className={field} value={form.canonicalUrl || ""} onChange={(e) => patch("canonicalUrl", e.target.value)} placeholder="Defaults to the Awasio article URL" /></section>
    </aside>
  </div>;
}

function BlockEditor({ block, onChange, onRemove, onMove }: { block: BlogContentBlock; onChange: (block: BlogContentBlock) => void; onRemove: () => void; onMove: (direction: -1 | 1) => void }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-rose-600">{block.type}</span><div className="flex gap-1"><button type="button" onClick={() => onMove(-1)} className="rounded p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800"><ArrowUp className="h-3.5 w-3.5" /></button><button type="button" onClick={() => onMove(1)} className="rounded p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800"><ArrowDown className="h-3.5 w-3.5" /></button><button type="button" onClick={onRemove} className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"><Trash2 className="h-3.5 w-3.5" /></button></div></div>{block.type === "heading" ? <div className="flex gap-2"><select className={`${field} w-24`} value={block.level} onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 2 | 3 })}><option value={2}>H2</option><option value={3}>H3</option></select><input className={field} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Section heading" /></div> : block.type === "list" ? <div className="flex gap-2"><select className={`${field} w-28`} value={block.style} onChange={(e) => onChange({ ...block, style: e.target.value as "bullet" | "numbered" })}><option value="bullet">Bullets</option><option value="numbered">Numbers</option></select><textarea className={field} rows={4} value={block.items.join("\n")} onChange={(e) => onChange({ ...block, items: e.target.value.split("\n") })} placeholder="One item per line" /></div> : block.type === "image" ? <div className="grid gap-2"><input className={field} value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="Image URL" /><input className={field} value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} placeholder="Alt text" /><input className={field} value={block.caption || ""} onChange={(e) => onChange({ ...block, caption: e.target.value })} placeholder="Optional caption" /></div> : block.type === "cta" ? <div className="grid gap-2 sm:grid-cols-2"><input className={field} value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="CTA title" /><input className={field} value={block.label} onChange={(e) => onChange({ ...block, label: e.target.value })} placeholder="Button label" /><input className={field} value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="Destination URL" /><input className={field} value={block.text || ""} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Optional supporting text" /></div> : block.type === "callout" ? <div className="grid gap-2"><div className="flex gap-2"><select className={`${field} w-28`} value={block.tone} onChange={(e) => onChange({ ...block, tone: e.target.value as "info" | "tip" | "warning" })}><option value="tip">Tip</option><option value="info">Info</option><option value="warning">Warning</option></select><input className={field} value={block.title || ""} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Optional title" /></div><textarea className={field} rows={3} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Callout text" /></div> : <textarea className={field} rows={block.type === "paragraph" ? 5 : 3} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder={block.type === "quote" ? "Quote text" : "Write your story…"} />}</div>;
}
