import React from "react";
import { MapPin } from "lucide-react";

type LocationCardProps = {
  headline: string;
  description: string;
  nearby: string[];
  infra: string[];
};

export function LocationCard({ headline, description, nearby, infra }: LocationCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Location & connectivity</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <MapPin className="h-4 w-4" /> Open in maps
        </span>
      </div>
      <div className="mt-3 rounded-2xl bg-gradient-to-r from-sky-50 to-emerald-50 p-4">
        <p className="text-sm font-semibold text-slate-900">{headline}</p>
        <p className="text-xs text-slate-600">{description}</p>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-3">
            <p className="font-semibold text-slate-900">Nearby</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {nearby.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-3">
            <p className="font-semibold text-slate-900">Infrastructure</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {infra.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
