/**
 * Public directory/detail pages are ISR-cached (60–120s, stale-while-revalidate). Without a nudge, the first visit after
 * a new listing / edit / approval gets the old copy (often "no data") and only a refresh shows it. After any successful
 * write we ask /api/revalidate to expire the section so the next visit renders fresh.
 */
export const PUBLIC_SECTIONS = ["pandits", "interiors", "construction", "architects", "projects", "agents", "flatmates"] as const;
export type PublicSection = (typeof PUBLIC_SECTIONS)[number];

// RTK Query api slice -> section
const BY_REDUCER: Record<string, PublicSection> = {
  panditApi: "pandits",
  interiorsApi: "interiors",
  constructionApi: "construction",
  architectApi: "architects",
  projectsApi: "projects",
  advisorsApi: "agents",
  flatmatesApi: "flatmates",
};

// Backend URL prefix (user or /admin/ routes) -> section
const BY_URL: [RegExp, PublicSection][] = [
  [/\/(admin\/)?pandits\b/, "pandits"],
  [/\/(admin\/)?interiors\b/, "interiors"],
  [/\/(admin\/)?construction\b/, "construction"],
  [/\/(admin\/)?architects\b/, "architects"],
  [/\/(admin\/)?(projects|project-claims|project-contacts)\b/, "projects"],
  [/\/(admin\/)?advisors\b/, "agents"],
  [/\/(admin\/)?flatmates\b/, "flatmates"],
];

export function sectionForReducer(reducerPath?: string): PublicSection | null {
  return (reducerPath && BY_REDUCER[reducerPath]) || null;
}

export function sectionForUrl(url?: string): PublicSection | null {
  if (!url) return null;
  for (const [re, s] of BY_URL) if (re.test(url)) return s;
  return null;
}

const pending = new Set<PublicSection>();
let timer: ReturnType<typeof setTimeout> | null = null;

/** Batched, fire-and-forget; never throws. */
export function revalidatePublic(section: PublicSection | null) {
  if (!section || typeof window === "undefined") return;
  pending.add(section);
  if (timer) return;
  timer = setTimeout(() => {
    const sections = [...pending];
    pending.clear();
    timer = null;
    fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections }),
      keepalive: true,
    }).catch(() => {});
  }, 300);
}
