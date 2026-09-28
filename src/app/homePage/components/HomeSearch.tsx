"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/search/SearchBar";
import {
  buildSearchParams,
  initialSearchState,
  type SearchState,
} from "@/components/search/searchQuery";

export function HomeSearch() {
  const router = useRouter();
  const [state, setState] = React.useState<SearchState>(() => initialSearchState());

  const submit = (next: SearchState) => {
    setState(next);
    router.push(`/propertySearch?${buildSearchParams(next).toString()}`);
  };

  return (
    <section className="relative z-30 mx-auto mt-8 max-w-4xl px-4 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.4)] sm:p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-rose-600">
          Find your next home, PG, plot or workspace
        </p>
        <SearchBar variant="hero" value={state} onChange={setState} onSubmit={submit} />
      </div>
    </section>
  );
}
