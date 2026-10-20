"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive, BookOpen, CalendarClock, Edit3, Eye, FileText, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useArchiveBlogPostMutation, useGetAdminBlogPostsQuery } from "@/features/blog/api";
import type { BlogPostStatus } from "@/types/blog.types";

const statuses: Array<{ label: string; value: BlogPostStatus | "" }> = [{ label: "All", value: "" }, { label: "Drafts", value: "DRAFT" }, { label: "Review", value: "IN_REVIEW" }, { label: "Scheduled", value: "SCHEDULED" }, { label: "Published", value: "PUBLISHED" }];

export default function AdminBlogPage() {
  const [status, setStatus] = useState<BlogPostStatus | "">("");
  const [search, setSearch] = useState("");
  const { data, isLoading, isFetching } = useGetAdminBlogPostsQuery({ status: status || undefined, q: search || undefined });
  const [archive] = useArchiveBlogPostMutation();
  const published = data?.items.filter((item) => item.status === "PUBLISHED").length || 0;
  const scheduled = data?.items.filter((item) => item.status === "SCHEDULED").length || 0;

  async function archivePost(id: number, title: string) {
    if (!window.confirm(`Archive “${title}”? It will disappear from the public blog.`)) return;
    try { await archive(id).unwrap(); toast.success("Article archived"); } catch { toast.error("Could not archive article"); }
  }

  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 p-6 text-white shadow-xl sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.22em] text-rose-300">Awasio editorial</p><h1 className="text-2xl font-black sm:text-3xl">Blog publishing studio</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">Create trustworthy real-estate guides, schedule releases, and control how every story appears in Google.</p></div><Link href="/admin/blog/new" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-950/30 transition hover:bg-rose-400"><Plus className="h-4 w-4" />New article</Link></div>
      <div className="mt-7 grid grid-cols-3 gap-3"><Metric icon={FileText} label="Articles" value={data?.total || 0} /><Metric icon={BookOpen} label="Published" value={published} /><Metric icon={CalendarClock} label="Scheduled" value={scheduled} /></div>
    </header>

    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{statuses.map((item) => <button key={item.label} onClick={() => setStatus(item.value)} className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${status === item.value ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300"}`}>{item.label}</button>)}</div><label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3 dark:border-slate-700 lg:w-80"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles" className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none" />{isFetching && <Loader2 className="h-4 w-4 animate-spin" />}</label></div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {isLoading ? <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-rose-500" /></div> : !data?.items.length ? <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><div className="rounded-full bg-rose-50 p-4 text-rose-500 dark:bg-rose-950/40"><BookOpen className="h-7 w-7" /></div><h2 className="mt-4 font-bold">No articles found</h2><p className="mt-1 text-sm text-slate-500">Start a useful guide or change the current filters.</p></div> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{data.items.map((post) => <article key={post.id} className="flex flex-col gap-4 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-900/60 sm:flex-row sm:items-center"><div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-950 dark:to-slate-900 sm:w-36">{post.coverImage ? <img src={post.coverImage} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><BookOpen className="h-7 w-7 text-rose-400" /></div>}</div><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><StatusBadge status={post.status} />{post.category && <span className="text-xs font-semibold text-slate-500">{post.category.name}</span>}</div><h2 className="truncate font-bold text-slate-900 dark:text-white">{post.title}</h2><p className="mt-1 line-clamp-1 text-sm text-slate-500">{post.excerpt}</p><div className="mt-2 flex items-center gap-4 text-xs text-slate-400"><span>{new Date(post.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span><span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{post.viewCount.toLocaleString("en-IN")}</span><span>{post.readingMinutes} min read</span></div></div><div className="flex shrink-0 items-center gap-2"><Link href={`/admin/blog/${post.id}/edit`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-200"><Edit3 className="h-3.5 w-3.5" />Edit</Link>{post.status === "PUBLISHED" && <Link href={`/blog/${post.slug}`} target="_blank" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-rose-600 dark:border-slate-700" aria-label="View article"><Eye className="h-4 w-4" /></Link>}<button onClick={() => archivePost(post.id, post.title)} className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:border-red-200 hover:text-red-500 dark:border-slate-700" aria-label="Archive article"><Archive className="h-4 w-4" /></button></div></article>)}</div>}
    </section>
  </div>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: number }) { return <div className="rounded-2xl bg-white/10 p-3 backdrop-blur sm:p-4"><Icon className="mb-2 h-4 w-4 text-rose-300" /><strong className="block text-xl sm:text-2xl">{value}</strong><span className="text-[11px] text-slate-300 sm:text-xs">{label}</span></div>; }
function StatusBadge({ status }: { status: BlogPostStatus }) { const style = status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : status === "SCHEDULED" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"; return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${style}`}>{status.replace("_", " ")}</span>; }
