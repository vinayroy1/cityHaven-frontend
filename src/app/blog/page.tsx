import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { BlogCard } from "@/components/blog/BlogCard";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { buildCanonical } from "@/constants/seo";
import { getDefaultBlogListResponse } from "@/constants/defaultBlogs";
import type { BlogListResponse } from "@/types/blog.types";

export const metadata: Metadata = {
  title: "Real Estate Insights, Guides & Market Trends | Awasio",
  description: "Practical property buying, renting, flatmate, investment and neighborhood guides from Awasio's real estate editorial team.",
  alternates: { canonical: buildCanonical("/blog") },
  openGraph: { title: "Awasio Insights - Property Guides & Market Intelligence", description: "Better property decisions start with better information.", url: buildCanonical("/blog"), type: "website" },
};

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

async function getPosts(params: URLSearchParams): Promise<BlogListResponse> {
  try {
    const rawEndpoint = `${API_ENDPOINTS.blog.list}?${params.toString()}`;
    const endpoint = toInternalApiUrl(rawEndpoint);
    const response = await fetch(endpoint, { next: { revalidate: 300, tags: ["blog"] } });
    if (response.ok) {
      const json = await response.json();
      if (json.data && json.data.items && json.data.items.length > 0) {
        return json.data;
      }
    }
  } catch {
    // fallback gracefully to curated insights
  }
  return getDefaultBlogListResponse({
    q: params.get("q") || undefined,
    category: params.get("category") || undefined,
    tag: params.get("tag") || undefined,
    sort: params.get("sort") || undefined,
    page: Number(params.get("page")) || 1,
    pageSize: Number(params.get("pageSize")) || 12,
  });
}

export default async function BlogPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const q = one(raw.q) || "";
  const category = one(raw.category) || "";
  const tag = one(raw.tag) || "";
  const sort = one(raw.sort) || "latest";
  const page = Math.max(1, Number(one(raw.page)) || 1);
  const query = new URLSearchParams({ page: String(page), pageSize: "12", sort });
  if (q) query.set("q", q);
  if (category) query.set("category", category);
  if (tag) query.set("tag", tag);
  const data = await getPosts(query);
  const items = data?.items ?? [];
  const showFeature = page === 1 && !q && !category && !tag && items.length > 0;
  const featured = showFeature ? items.find((item) => item.isFeatured) || items[0] : null;
  const gridItems = featured ? items.filter((item) => item.id !== featured.id) : items;
  const pageHref = (nextPage: number) => { const next = new URLSearchParams(query); next.set("page", String(nextPage)); return `/blog?${next}`; };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <HeaderNav />
      <main>
        {/* Compact Hero Section */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(244,63,94,.10),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(99,102,241,.09),transparent_30%)]" />
          <div className="relative mx-auto max-w-6xl px-3.5 py-4 sm:px-6 sm:py-12">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                <Sparkles className="h-3 w-3" />
                <span>Awasio Insights</span>
              </div>
              <Link
                href="/propertySearch"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 sm:hidden"
              >
                <span>Explore properties</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-2.5 sm:mt-5 grid items-end gap-3 sm:gap-6 lg:grid-cols-[1fr_auto]">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                  Clarity for every property decision.
                </h1>
                <p className="mt-1 sm:mt-3 max-w-2xl text-xs sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  Expert guides, locality intelligence and practical advice for buyers, renters, owners and flatmates across India.
                </p>
              </div>
              <Link
                href="/propertySearch"
                className="hidden sm:inline-flex w-fit items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 shrink-0"
              >
                <span>Explore properties</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Search, Filters, and Articles */}
        <div className="mx-auto max-w-6xl px-3 py-3 sm:px-6 sm:py-8">
          <form
            action="/blog"
            className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[1fr_180px_140px_auto] sm:gap-2.5"
          >
            {/* Search Input + Mobile Apply */}
            <div className="flex items-center gap-1.5 sm:contents">
              <label className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search guides and insights..."
                  className="h-9 sm:h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs sm:text-sm outline-none focus:border-rose-400 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>

              {/* Mobile Submit Button */}
              <button
                type="submit"
                className="sm:hidden inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-rose-600 px-3.5 text-xs font-bold text-white hover:bg-rose-700 shrink-0"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Find</span>
              </button>
            </div>

            {/* Category and Sort Dropdowns */}
            <div className="grid grid-cols-2 gap-1.5 sm:contents">
              <select
                name="category"
                defaultValue={category}
                className="h-8 sm:h-11 rounded-xl border border-slate-200 bg-slate-50 px-2 sm:px-3 text-xs sm:text-sm font-semibold outline-none dark:border-slate-700 dark:bg-slate-950 truncate"
              >
                <option value="">All categories</option>
                {data?.facets?.categories.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>

              <select
                name="sort"
                defaultValue={sort}
                className="h-8 sm:h-11 rounded-xl border border-slate-200 bg-slate-50 px-2 sm:px-3 text-xs sm:text-sm font-semibold outline-none dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most read</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>

            {/* Desktop Apply Button */}
            <button
              type="submit"
              className="hidden sm:inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white hover:bg-rose-700 shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Apply</span>
            </button>
          </form>

          {data?.facets?.tags?.length ? (
            <div className="mt-2.5 sm:mt-4 -mx-3 px-3 sm:mx-0 sm:px-0 flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
              {data.facets.tags.slice(0, 12).map((item) => (
                <Link
                  key={item.id}
                  href={`/blog?tag=${item.slug}`}
                  className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs font-semibold transition ${
                    tag === item.slug
                      ? "border-rose-600 bg-rose-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  #{item.name}
                </Link>
              ))}
            </div>
          ) : null}

          {featured && (
            <section className="mt-4 sm:mt-8">
              <div className="mb-2 sm:mb-4 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-[.15em] text-slate-500 dark:text-slate-400">
                  Editor&apos;s pick
                </h2>
              </div>
              <BlogCard post={featured} featured />
            </section>
          )}

          <section className="mt-6 sm:mt-10">
            <div className="mb-3 sm:mb-5 flex items-end justify-between">
              <div>
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[.18em] text-rose-600 dark:text-rose-400">
                  Knowledge library
                </p>
                <h2 className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-black text-slate-950 dark:text-white">
                  {q ? `Results for “${q}”` : category ? "Category articles" : "Latest stories"}
                </h2>
              </div>
              {data && (
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500">
                  {data.total} articles
                </p>
              )}
            </div>

            {gridItems.length ? (
              <div className="grid gap-3.5 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {gridItems.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
                <BookOpen className="mx-auto h-8 w-8 text-rose-400" />
                <h3 className="mt-3 text-lg font-bold">No articles found</h3>
                <p className="mt-1.5 text-xs text-slate-500">
                  Try another keyword or clear the selected filters.
                </p>
                <Link
                  href="/blog"
                  className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white dark:bg-rose-600"
                >
                  View all insights
                </Link>
              </div>
            )}
          </section>

          {data && data.totalPages > 1 && (
            <nav aria-label="Blog pagination" className="mt-8 sm:mt-10 flex items-center justify-center gap-2.5 sm:gap-3">
              {page > 1 && (
                <Link
                  href={pageHref(page - 1)}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold dark:border-slate-800 dark:bg-slate-900"
                >
                  Previous
                </Link>
              )}
              <span className="text-xs text-slate-500">
                Page {page} of {data.totalPages}
              </span>
              {page < data.totalPages && (
                <Link
                  href={pageHref(page + 1)}
                  className="rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white"
                >
                  Next
                </Link>
              )}
            </nav>
          )}
        </div>
      </main>
      <FooterLinks />
    </div>
  );
}
