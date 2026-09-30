"use client";
import React, { useState } from "react";
import { MapPin, Share2 } from "lucide-react";

type HeroHeaderProps = {
  propertyId: string;
  title: string;
  subtitle: string;
  price: string;
  priceHint: string;
  category: string;
  tags: string[];
};

export function HeroHeader({ propertyId, title, subtitle, price, priceHint, category, tags }: HeroHeaderProps) {
  const [shareStatus, setShareStatus] = useState("");
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus("Link copied");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setShareStatus("Could not share link");
    }
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-emerald-700">{category}</p>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">ID {propertyId}</span>
          </div>
          <h1 className="mt-2 break-words text-2xl font-semibold text-zinc-950 sm:text-3xl">{title}</h1>
          <p className="mt-3 flex items-start gap-2 text-sm text-zinc-600"><MapPin className="h-4 w-4 shrink-0 text-emerald-600" />{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span role="status" className="text-xs text-zinc-600">{shareStatus}</span>
          <button type="button" onClick={share} title="Share property" aria-label="Share property" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs font-medium text-zinc-500">Asking price</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-950">{price}</span>
            <span className="text-sm font-medium text-slate-500">{priceHint}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
