import React from "react";
import { SectionHeading } from "./SectionHeading";

type Props = { groups: { title: string; items: string[] }[] };

export function InspirationGrid({ groups }: Props) {
  return (
    <section className="mx-auto mt-12 max-w-6xl px-6">
      <SectionHeading title="Explore real estate across India" cta="View all cities" />
      <div className="grid gap-6 md:grid-cols-3">
        {groups.map((group) => (
          <div key={group.title} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{group.title}</p>
            <div className="grid gap-2 text-sm text-slate-600">
              {group.items.map((item) => (
                <span key={item} className="flex items-center justify-between">
                  {item}
                  <span className="text-xs text-slate-400">›</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
