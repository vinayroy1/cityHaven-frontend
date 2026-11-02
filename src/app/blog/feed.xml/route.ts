import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { buildCanonical } from "@/constants/seo";
import type { BlogPost } from "@/types/blog.types";

// RSS 2.0 feed of the latest published posts, refreshed with the blog list.
export const revalidate = 300;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export async function GET() {
  let posts: BlogPost[] = [];
  try {
    const res = await fetch(toInternalApiUrl(`${API_ENDPOINTS.blog.list}?page=1&pageSize=30&sort=latest`), {
      next: { revalidate: 300, tags: ["blog"] },
    });
    if (res.ok) posts = (await res.json())?.data?.items ?? [];
  } catch {
    // Serve an empty (still valid) feed if the API is unreachable.
  }

  const items = posts
    .map((p) => {
      const url = buildCanonical(`/blog/${p.slug}`);
      return [
        "<item>",
        `<title>${esc(p.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<description>${esc(p.excerpt)}</description>`,
        p.category ? `<category>${esc(p.category.name)}</category>` : "",
        p.publishedAt ? `<pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>` : "",
        "</item>",
      ].join("");
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Awasio Insights</title><link>${buildCanonical("/blog")}</link><description>Practical guides for buying, renting, flatmates, interiors and property investment in India.</description><language>en-IN</language><atom:link href="${buildCanonical("/blog/feed.xml")}" rel="self" type="application/rss+xml"/>${
    posts[0]?.publishedAt ? `<lastBuildDate>${new Date(posts[0].publishedAt).toUTCString()}</lastBuildDate>` : ""
  }${items}</channel></rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
