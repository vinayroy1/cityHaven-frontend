"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { SavePropertyButton } from "@/app/propertySearch/components/ResultCardSummary";

type Props = {
  id?: string;
  title: string;
  location: string;
  price: string;
  badge?: string;
  image: string;
};

export function ListingCard({ id, title, location, price, badge, image }: Props) {
  const href = id ? `/properties/${id}` : "/propertySearch";

  return (
    <div className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <Link href={href} className="block">
          <img src={image} alt={title} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" />
        </Link>
        {badge && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow">
            {badge}
          </span>
        )}
        {id && <SavePropertyButton propertyId={id} />}
      </div>
      <Link href={href} className="block space-y-1 p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Verified</p>
        </div>
        <h3 className="text-base font-semibold text-slate-900 line-clamp-1">{title}</h3>
        <p className="text-sm text-slate-600 line-clamp-1">{location}</p>
        <p className="text-sm font-semibold text-slate-900">{price}</p>
      </Link>
    </div>
  );
}
