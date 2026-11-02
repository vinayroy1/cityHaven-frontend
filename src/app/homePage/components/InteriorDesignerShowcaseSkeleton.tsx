/**
 * Loading placeholder for InteriorDesignerShowcaseCard. Mirrors the card's box model
 * (full-width, 4:3 hero, overlapping logo, flex-1 body with thumbnails pinned to the bottom)
 * so cards replace it without any size change. Kept in its own file so the homepage can
 * render it immediately without loading the card chunk.
 */
export function InteriorDesignerShowcaseSkeleton() {
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      aria-hidden
    >
      <div className="relative aspect-[4/3] w-full animate-pulse bg-slate-200 dark:bg-slate-800">
        <div className="absolute left-3 top-3 h-5 w-16 rounded-full bg-white/70 dark:bg-slate-700" />
        <div className="absolute bottom-3 right-3 space-y-1">
          <div className="ml-auto h-2.5 w-8 rounded bg-white/70 dark:bg-slate-700" />
          <div className="h-4 w-20 rounded bg-white/80 dark:bg-slate-700" />
        </div>
      </div>
      <div className="relative flex flex-1 flex-col px-4 pb-4 pt-8">
        <div className="absolute -top-7 left-4 h-14 w-14 animate-pulse rounded-2xl border-[3px] border-white bg-slate-300 shadow-md dark:border-slate-900 dark:bg-slate-700" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-1.5 h-3.5 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        {/* Style tags fit one row on wide cards but wrap to two in the 4-up desktop grid. */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          <div className="h-[21px] w-16 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          <div className="h-[21px] w-24 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          <div className="hidden basis-full lg:block" />
          <div className="hidden h-[21px] w-14 animate-pulse rounded-full bg-slate-100 lg:block dark:bg-slate-800" />
        </div>
        <div className="mt-auto pt-3">
          <div className="grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
