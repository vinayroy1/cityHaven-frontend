import React from "react";
import type { LucideIcon } from "lucide-react";

type Highlight = { title: string; detail: string; icon: LucideIcon };

type AboutHighlightsProps = {
  aboutCopy: string;
  highlights: Highlight[];
  amenities?: string[];
};

export function AboutHighlights({ aboutCopy, highlights, amenities = [] }: AboutHighlightsProps) {
  return (
    <section id="overview" className="scroll-mt-24 border-b border-zinc-200 pb-8">
      <h2 className="text-lg font-semibold">About this property</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{aboutCopy}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {highlights.map(({ title, detail, icon: Icon }) => (
          <div key={title} className="flex gap-3 py-2">
            <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center text-emerald-700">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-slate-600">{detail}</p>
            </div>
          </div>
        ))}
      </div>
      {amenities.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold text-slate-900">Amenities</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <span key={amenity} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
