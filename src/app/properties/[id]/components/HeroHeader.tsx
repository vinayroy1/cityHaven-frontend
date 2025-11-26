import React from "react";
import { Heart, Share2 } from "lucide-react";

type HeroHeaderProps = {
  propertyId: string;
  title: string;
  subtitle: string;
  price: string;
  priceHint: string;
  tags: string[];
};

export function HeroHeader({ propertyId, title, subtitle, price, priceHint, tags }: HeroHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Agricultural / Farm Land</p>
          <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 shadow-sm transition hover:-translate-y-0.5">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 shadow-sm transition hover:-translate-y-0.5">
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-slate-900">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-sm text-slate-500">{priceHint}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {tag}
            </span>
          ))}
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Property ID: {propertyId}</span>
      </div>
    </div>
  );
}
