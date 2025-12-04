import React from "react";
import { Heart, ImageIcon, Phone } from "lucide-react";

type Props = { title?: string; subtitle?: string; price?: string; area?: string; age?: string; owner?: string; image?: string };

export function ResultCard({ title, subtitle, price, area, age, owner, image }: Props) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:flex-row">
      <div className="relative w-full md:w-56">
        <img src={image || "/placeholder.png"} alt={title || "property"} className="h-48 w-full object-cover md:h-full" />
        <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow">
          <Heart className="h-4 w-4" />
        </button>
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow">Request Photos</span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-lg font-semibold text-slate-900">{title}</p>
            <p className="text-sm text-slate-600">{subtitle}</p>
          </div>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Resale</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-900">
          <span>{price}</span>
          <span className="text-slate-500">|</span>
          <span>{area}</span>
        </div>

        <p className="text-xs text-slate-600">Urgent sale with low price. Prime locality near highway.</p>
        <p className="text-xs text-slate-500">{age} · {owner}</p>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm">
            <ImageIcon className="h-4 w-4" /> View gallery
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 shadow-sm">
            View number
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
            <Phone className="h-4 w-4" /> Contact
          </button>
        </div>
      </div>
    </article>
  );
}
