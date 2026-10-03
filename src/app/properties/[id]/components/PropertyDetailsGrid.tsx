import React from "react";

export type DetailGroup = {
  title: string;
  items: Array<{ label: string; value?: string | number | boolean | null }>;
};

function display(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export function PropertyDetailsGrid({ groups }: { groups: DetailGroup[] }) {
  const visibleGroups = groups
    .map((group) => ({ ...group, items: group.items.map((item) => ({ ...item, value: display(item.value) })).filter((item) => item.value) }))
    .filter((group) => group.items.length > 0);

  if (!visibleGroups.length) return null;

  return (
    <section id="details" className="scroll-mt-24 border-b border-zinc-200 pb-8 dark:border-slate-800">
      <div className="pb-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Property details</h2>
      </div>
      <div className="space-y-6">
        {visibleGroups.map((group) => (
          <section key={group.title}>
            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{group.title}</h3>
            <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
              {group.items.map((item) => (
                <div key={item.label} className="grid min-w-0 grid-cols-2 gap-3 border-b border-zinc-100 py-3 dark:border-slate-800">
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</dt>
                  <dd className="break-words text-sm font-medium text-zinc-900 dark:text-slate-200">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </section>
  );
}
