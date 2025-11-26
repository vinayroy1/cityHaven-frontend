import React from "react";
import { similarProperties } from "../data";
import { ResultCard } from "./ResultCard";
import { AlertTriangle } from "lucide-react";

export function ResultsList() {
  return (
    <div className="flex-1 space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          No results matching your search
        </div>
        <p className="mt-1 text-xs text-slate-600">Try removing some filters to get more results.</p>
      </div>

      <h2 className="text-lg font-semibold text-slate-900">Similar properties matching your search</h2>
      <div className="space-y-3">
        {similarProperties.map((item) => (
          <ResultCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}
