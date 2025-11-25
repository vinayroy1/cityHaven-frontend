import React from "react";

type Props = { title: string; cta?: string };

export function SectionHeading({ title, cta }: Props) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      {cta && (
        <a href="#" className="text-sm font-semibold text-slate-800 hover:text-red-500">
          {cta}
        </a>
      )}
    </div>
  );
}
