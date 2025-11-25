import React from "react";
import { Heart, ShieldCheck } from "lucide-react";

type Props = {
  title: string;
  location: string;
  price: string;
  badge?: string;
  image: string;
};

export function ListingCard({ title, location, price, badge, image }: Props) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <img src={image} alt={title} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" />
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow">
            {badge}
          </span>
        )}
        <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow">
          <Heart className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-1 p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Verified</p>
        </div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{location}</p>
        <p className="text-sm font-semibold text-slate-900">{price}</p>
      </div>
    </article>
  );
}
