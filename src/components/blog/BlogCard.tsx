import Link from "next/link";
import { ArrowUpRight, Clock3, Eye } from "lucide-react";
import type { BlogPost } from "@/types/blog.types";

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently";
  return (
    <article className={`group overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-2xs transition duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-900/70 ${featured ? "grid md:grid-cols-[1.15fr_.85fr]" : "flex h-full flex-col"}`}>
      <Link href={`/blog/${post.slug}`} className={`relative block overflow-hidden bg-slate-100 dark:bg-slate-800 ${featured ? "aspect-[16/9] sm:aspect-auto sm:min-h-64 md:min-h-full" : "aspect-[16/10]"}`}>
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.coverImageAlt || post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,63,94,.32),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,.25),transparent_38%),linear-gradient(135deg,#0f172a,#1e293b)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
        {post.category && <span className="absolute left-3 top-3 sm:left-4 sm:top-4 rounded-full border border-white/30 bg-white/90 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-bold text-slate-900 shadow-sm backdrop-blur dark:bg-slate-950/85 dark:text-white">{post.category.name}</span>}
      </Link>
      <div className={`flex flex-1 flex-col ${featured ? "justify-center p-3.5 sm:p-7" : "p-3.5 sm:p-5"}`}>
        <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span>{date}</span><span className="h-1 w-1 rounded-full bg-rose-400" /><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />{post.readingMinutes} min</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />{post.viewCount}</span>
        </div>
        <h2 className={`mt-2 sm:mt-3 font-bold sm:font-black leading-snug sm:leading-tight tracking-tight text-slate-950 transition group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400 ${featured ? "text-base sm:text-2xl lg:text-3xl line-clamp-2 sm:line-clamp-none" : "line-clamp-2 text-sm sm:text-lg"}`}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className={`mt-1.5 sm:mt-2.5 text-xs sm:text-sm leading-relaxed sm:leading-6 text-slate-600 dark:text-slate-300 ${featured ? "line-clamp-2 sm:line-clamp-4" : "line-clamp-2 sm:line-clamp-3"}`}>{post.excerpt}</p>
        <div className="mt-3 sm:mt-5 flex items-center justify-between border-t border-slate-100 pt-2.5 sm:pt-4 dark:border-slate-800">
          <div className="min-w-0"><p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{post.author.name || "Awasio Editorial"}</p><p className="text-[10px] sm:text-[11px] text-slate-500">Awasio Insights</p></div>
          <Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`} className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-slate-950 text-white transition group-hover:bg-rose-600 dark:bg-slate-800 dark:group-hover:bg-rose-600"><ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Link>
        </div>
      </div>
    </article>
  );
}
