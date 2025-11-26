import React from "react";
import Link from "next/link";

type Props = { title: string; cta?: string; href?: string };

export function SectionHeading({ title, cta, href = "/propertySearch" }: Props) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      {cta && (
        <Link href={href} className="text-sm font-semibold text-slate-800 hover:text-red-500">
          {cta}
        </Link>
      )}
    </div>
  );
}
