"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareArticleButton({ title }: { title: string }) {
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); toast.success("Article link copied"); }
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") toast.error("Could not share this article");
    }
  }
  return <button type="button" onClick={share} aria-label="Share article" className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900"><Share2 className="h-3.5 w-3.5" />Share</button>;
}
