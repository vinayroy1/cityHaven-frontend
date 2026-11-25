import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_SECTIONS, type PublicSection } from "@/lib/revalidatePublic";

// Expires ISR caches for a public section after a write, so the next visit renders fresh data instead of the stale copy.
// Only invalidates caches (allowlisted names); reads and writes no data.
const TARGETS: Record<PublicSection, { tag?: string; path: string }> = {
  pandits: { tag: "pandits", path: "/pandit-vastu" },
  interiors: { tag: "interiors", path: "/interior-designers" },
  construction: { tag: "construction", path: "/construction-companies" },
  architects: { tag: "architects", path: "/architects" },
  projects: { path: "/new-projects" },
  agents: { path: "/agents" },
  flatmates: { path: "/flatmate" },
};

export async function POST(request: Request) {
  let body: { sections?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const sections = (Array.isArray(body.sections) ? body.sections : [])
    .filter((s): s is PublicSection => (PUBLIC_SECTIONS as readonly string[]).includes(String(s)))
    .slice(0, PUBLIC_SECTIONS.length);
  for (const s of new Set(sections)) {
    const t = TARGETS[s];
    // expire: 0 -> the next visit blocks on fresh data instead of serving stale.
    if (t.tag) revalidateTag(t.tag, { expire: 0 });
    revalidatePath(t.path, "layout");
  }
  return NextResponse.json({ ok: true, revalidated: sections.length });
}
