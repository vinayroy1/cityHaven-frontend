"use client";
/** "Usually replies within an hour" badge for a listing's owner (hidden until they've earned it). */
import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { cn } from "@/components/ui/utils";

export function ResponseBadge({ kind, id, className }: { kind: "property" | "flatmate" | "interior"; id: number | string; className?: string }) {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`${API_ENDPOINTS.leads.responseBadge}?kind=${kind}&id=${encodeURIComponent(String(id))}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setLabel(d?.data?.label ?? null))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [kind, id]);
  if (!label) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
        className,
      )}
    >
      <Timer className="h-3 w-3" /> {label}
    </span>
  );
}
