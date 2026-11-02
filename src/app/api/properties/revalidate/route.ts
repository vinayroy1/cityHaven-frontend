import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { propertyDetailCacheTag } from "@/lib/propertyListing/cacheTags";

// Called by the listing editor after a successful update so the ISR-cached
// detail page (/properties/[id], keyed by id or slug) doesn't serve the old
// data. Only invalidates cache entries; it reads and writes no data itself.
export async function POST(request: Request) {
  let body: { keys?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const keys = Array.isArray(body.keys) ? body.keys : [];
  const valid = keys
    .map((k) => String(k ?? "").trim())
    .filter((k) => /^[a-z0-9-]{1,200}$/i.test(k))
    .slice(0, 4);
  for (const key of valid) {
    // expire: 0 -> the next visit blocks on fresh data instead of serving stale.
    revalidateTag(propertyDetailCacheTag(key), { expire: 0 });
  }
  return NextResponse.json({ ok: true, revalidated: valid.length });
}
