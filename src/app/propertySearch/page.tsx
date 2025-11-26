import React from "react";
import { HeaderNav } from "../homePage/components/HeaderNav";
import { SearchToolbar } from "./components/SearchToolbar";
import { FiltersPanel } from "./components/FiltersPanel";
import { ResultsList } from "./components/ResultsList";
import { AppliedFilters } from "./components/AppliedFilters";
import { appliedFilters } from "./data";

export default function PropertySearchPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <HeaderNav />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
        <nav className="text-xs text-slate-500">Home › Commercial Property in T.N.H.B.Phase 1 Vellore for Sale</nav>
        <h1 className="text-xl font-semibold text-slate-900">Commercial Property in T.N.H.B.Phase 1 Vellore for Sale</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:hidden">
          <AppliedFilters filters={appliedFilters} />
        </div>
        <SearchToolbar />

        <div className="flex flex-col gap-4 lg:flex-row">
          <FiltersPanel />
          <ResultsList />
        </div>
      </div>
    </main>
  );
}
