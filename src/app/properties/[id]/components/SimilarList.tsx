import React from "react";

type SimilarItem = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  area: string;
  image: string;
};

type SimilarListProps = { items: SimilarItem[] };

export function SimilarList({ items }: SimilarListProps) {
  const visible = items.slice(0, 3);
  if (!visible.length) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Similar in this micro-market</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Recommended</span>
      </div>
      <div className="mt-3 space-y-3">
        {visible.map((item) => (
          <article key={item.id} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="h-16 w-16 overflow-hidden rounded-xl">
              <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-600">{item.subtitle}</p>
              <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-800">
                <span>{item.price}</span>
                <span className="text-slate-400">•</span>
                <span>{item.area}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-emerald-700">Owner</span>
              <a href={`/properties/${item.id}`} className="text-xs font-semibold text-sky-700 hover:text-sky-600">
                View
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
