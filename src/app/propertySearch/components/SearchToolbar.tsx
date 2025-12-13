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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <form className="flex flex-wrap items-center gap-3" onSubmit={handleSubmit}>
        <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 px-3 py-2 shadow-sm min-w-[220px]">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            className="w-full bg-transparent px-1 text-sm outline-none"
            placeholder='Search by locality, project, builder...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
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
