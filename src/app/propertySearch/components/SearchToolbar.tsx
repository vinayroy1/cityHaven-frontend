import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export function SearchToolbar({
  onOpenFilters,
  onSearchSubmit,
  initialQuery = "",
}: {
  onOpenFilters?: () => void;
  onSearchSubmit?: (query: string) => void;
  initialQuery?: string;
}) {
  const [query, setQuery] = React.useState(initialQuery);

  React.useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit?.(query.trim());
  };

  return (
    <div className="rounded-2xl border border-rose-100/90 bg-gradient-to-r from-white via-rose-50/70 to-emerald-50/60 p-4 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)]">
      <form className="flex flex-wrap items-center gap-3" onSubmit={handleSubmit}>
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full border border-rose-100/80 bg-white/95 px-3 py-2 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.35)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <Search className="h-4 w-4" />
          </span>
          <input
            className="w-full bg-transparent px-1 text-sm outline-none"
            placeholder="Search by locality, project, builder..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-2 text-xs font-semibold text-white shadow-[0_14px_30px_-18px_rgba(15,23,42,0.6)] transition hover:-translate-y-0.5"
          >
            <Search className="h-3 w-3" /> Search
          </button>
        </div>
        <button
          className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 lg:hidden"
          type="button"
          onClick={onOpenFilters}
        >
          <SlidersHorizontal className="h-4 w-4 text-slate-500" /> Filters
        </button>
      </form>
    </div>
  );
}
