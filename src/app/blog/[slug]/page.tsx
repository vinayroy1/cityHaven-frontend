import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, Eye } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogContent } from "@/components/blog/BlogContent";
import { ShareArticleButton } from "@/components/blog/ShareArticleButton";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { buildCanonical } from "@/constants/seo";
import { DEFAULT_POSTS } from "@/constants/defaultBlogs";
import type { BlogPost } from "@/types/blog.types";

type DetailData = { post: BlogPost; related: BlogPost[] };
type Props = { params: Promise<{ slug: string }> };

async function getArticle(slug: string): Promise<DetailData | null> {
  try {
    const endpoint = toInternalApiUrl(API_ENDPOINTS.blog.detail(slug));
    const response = await fetch(endpoint, { next: { revalidate: 300, tags: [`blog-${slug}`] } });
    if (response.ok) {
      const json = await response.json();
      if (json.data && json.data.post) return json.data;
    }
  } catch {
    // fallback
  }
  const post = DEFAULT_POSTS.find((p) => p.slug === slug);
  if (!post) return null;
  const related = DEFAULT_POSTS.filter((p) => p.id !== post.id).slice(0, 3);
  return { post, related };
}

export async function generateStaticParams() {
  return DEFAULT_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const data = await getArticle(slug); if (!data) return { title: "Article not found" };
  const { post } = data; const canonical = post.canonicalUrl || buildCanonical(`/blog/${post.slug}`); const image = post.ogImage || post.coverImage || undefined;
  return { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, alternates: { canonical }, openGraph: { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, url: canonical, type: "article", publishedTime: post.publishedAt || undefined, authors: [post.author.name || "Awasio Editorial"], images: image ? [{ url: image, alt: post.coverImageAlt || post.title }] : undefined }, twitter: { card: "summary_large_image", title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, images: image ? [image] : undefined } };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params; const data = await getArticle(slug); if (!data) notFound(); const { post, related } = data;
  const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Recently";
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt, image: post.ogImage || post.coverImage, datePublished: post.publishedAt, dateModified: post.updatedAt, author: { "@type": "Person", name: post.author.name || "Awasio Editorial" }, publisher: { "@type": "Organization", name: "Awasio", url: buildCanonical("/") }, mainEntityOfPage: buildCanonical(`/blog/${post.slug}`) };
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <HeaderNav />
      <main>
        <article>
          <header className="relative overflow-hidden border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(244,63,94,.10),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(99,102,241,.09),transparent_32%)]" />
            <div className="relative mx-auto max-w-4xl px-3.5 py-4 sm:px-6 sm:py-14">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-rose-600"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to insights</span>
              </Link>
              <div className="mt-3 sm:mt-5 flex flex-wrap gap-1.5">
                {post.category && (
                  <Link
                    href={`/blog?category=${post.category.slug}`}
                    className="rounded-full bg-rose-100 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                  >
                    {post.category.name}
                  </Link>
                )}
                {post.tags.map(({ tag }) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
              <h1 className="mt-2.5 sm:mt-5 text-2xl sm:text-4xl lg:text-5xl font-black leading-snug sm:leading-tight tracking-tight text-slate-950 dark:text-white">
                {post.title}
              </h1>
              <p className="mt-2 sm:mt-4 max-w-3xl text-xs sm:text-base lg:text-lg leading-relaxed sm:leading-8 text-slate-600 dark:text-slate-300">
                {post.excerpt}
              </p>
              <div className="mt-3.5 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-4 border-t border-slate-200 pt-3 sm:pt-4 text-[11px] sm:text-xs font-semibold text-slate-500 dark:border-slate-800">
                <span className="text-slate-800 dark:text-slate-200">{post.author.name || "Awasio Editorial"}</span>
                <span>{date}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {post.readingMinutes} min read
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {post.viewCount} reads
                </span>
                <ShareArticleButton title={post.title} />
              </div>
            </div>
          </header>
          {post.coverImage && (
            <div className="mx-auto max-w-6xl px-3.5 pt-4 sm:px-6 sm:pt-8">
              <img
                src={post.coverImage}
                alt={post.coverImageAlt || post.title}
                className="max-h-[300px] sm:max-h-[520px] w-full rounded-2xl sm:rounded-3xl object-cover shadow-xl"
              />
            </div>
          )}
          <div className="mx-auto max-w-3xl px-3.5 py-6 sm:px-6 sm:py-12">
            <BlogContent blocks={post.content} />
          </div>
        </article>
        {related.length > 0 && (
          <section className="border-t border-slate-200 bg-slate-50 py-8 sm:py-12 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mx-auto max-w-6xl px-3.5 sm:px-6">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[.18em] text-rose-600">
                Keep reading
              </p>
              <h2 className="mt-1 text-xl sm:text-3xl font-black">Related insights</h2>
              <div className="mt-4 sm:mt-6 grid gap-3.5 sm:gap-5 md:grid-cols-3">
                {related.map((item) => (
                  <BlogCard key={item.id} post={item} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <FooterLinks />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
