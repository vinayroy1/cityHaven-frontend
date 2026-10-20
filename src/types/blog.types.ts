export type BlogPostStatus = "DRAFT" | "IN_REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

export type BlogContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "image"; url: string; alt: string; caption?: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "list"; style: "bullet" | "numbered"; items: string[] }
  | { type: "callout"; tone: "info" | "tip" | "warning"; title?: string; text: string }
  | { type: "cta"; title: string; text?: string; label: string; url: string };

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
}

export interface BlogTag { id: number; name: string; slug: string }

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: BlogContentBlock[];
  coverImage?: string | null;
  coverImageAlt?: string | null;
  status: BlogPostStatus;
  isFeatured: boolean;
  featuredOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  readingMinutes: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  author: { id: number; name?: string | null; profileImage?: string | null };
  category?: BlogCategory | null;
  tags: Array<{ tag: BlogTag }>;
}

export interface BlogListResponse {
  items: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets?: { categories: BlogCategory[]; tags: BlogTag[] };
}

export interface BlogPostInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: BlogContentBlock[];
  coverImage?: string;
  coverImageAlt?: string;
  status: BlogPostStatus;
  isFeatured: boolean;
  featuredOrder?: number;
  categoryName?: string;
  categoryColor?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  publishedAt?: string | null;
  scheduledAt?: string | null;
}
