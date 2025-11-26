import React from "react";
import type { LucideIcon } from "lucide-react";

type Highlight = { title: string; detail: string; icon: LucideIcon };

type AboutHighlightsProps = {
  aboutCopy: string;
  highlights: Highlight[];
};

export function AboutHighlights({ aboutCopy, highlights }: AboutHighlightsProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold">About this property</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{aboutCopy}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {highlights.map(({ title, detail, icon: Icon }) => (
          <div key={title} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
            <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-800 shadow-sm">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-slate-600">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
