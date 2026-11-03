/** Skeletons for the locality guide routes (shown by loading.tsx while server data loads). */
import { HeaderNav } from "@/app/homePage/components/HeaderNav";

const Bone = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-pulse bg-slate-200/70 dark:bg-slate-800 ${/\brounded-/.test(className) ? "" : "rounded-xl"} ${className}`}
  />
);

function HeroShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative border-b border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] dark:opacity-10" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/30" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-6 sm:pt-8">{children}</div>
    </section>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f7f8f6] pb-24 dark:bg-slate-950" aria-busy="true" aria-label="Loading">
      <HeaderNav />
      {children}
    </main>
  );
}

/** /nearby/[slug] */
export function LocalityGuideSkeleton() {
  return (
    <Page>
      <HeroShell>
        <Bone className="h-3 w-40" />
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Bone className="h-6 w-28 rounded-full" />
            <Bone className="h-11 w-64 sm:w-80" />
            <Bone className="h-4 w-72 sm:w-[28rem]" />
          </div>
          <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:min-w-[300px]">
            <Bone className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Bone className="h-4 w-32" />
              <Bone className="h-3 w-28" />
              <Bone className="h-3 w-24" />
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex justify-between">
                <Bone className="h-8 w-8" />
                <Bone className="h-3 w-12" />
              </div>
              <Bone className="mt-3 h-3 w-24" />
              <Bone className="mt-2 h-6 w-16" />
              <Bone className="mt-1.5 h-3 w-full" />
            </div>
          ))}
        </div>
      </HeroShell>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <Bone className="mb-3 h-5 w-52" />
          <div className="rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex gap-2 overflow-hidden border-b border-slate-100 px-3 py-3 dark:border-slate-800">
              {Array.from({ length: 6 }).map((_, i) => (
                <Bone key={i} className="h-8 w-20 shrink-0 rounded-full" />
              ))}
            </div>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-800">
                <Bone className="h-10 w-10 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Bone className="h-3.5 w-3/5" />
                  <Bone className="h-3 w-2/5" />
                </div>
                <Bone className="h-4 w-12" />
                <Bone className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="hidden space-y-4 lg:block">
          <div className="space-y-3 rounded-3xl bg-slate-900 p-5 dark:bg-slate-800">
            <div className="h-3 w-24 animate-pulse rounded bg-white/20" />
            <div className="h-6 w-48 animate-pulse rounded bg-white/20" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-2xl bg-white/10" />
            ))}
          </div>
          <Bone className="h-40 rounded-3xl" />
        </div>
      </div>
    </Page>
  );
}

/** /nearby/city/[city] */
export function CityGuideSkeleton() {
  return (
    <Page>
      <HeroShell>
        <Bone className="h-3 w-36" />
        <Bone className="mt-4 h-11 w-72 sm:w-[30rem]" />
        <Bone className="mt-3 h-4 w-80 max-w-full sm:w-[34rem]" />
        <div className="mt-5 grid max-w-2xl gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
          <Bone className="h-11" />
          <Bone className="h-11" />
        </div>
      </HeroShell>
      <div className="mx-auto max-w-6xl px-4 pt-7 sm:px-6">
        <Bone className="h-5 w-44" />
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <Bone className="h-4 w-3/4" />
              <Bone className="h-3 w-1/2" />
            </div>
          ))}
        </div>
        <Bone className="mt-8 h-5 w-40" />
        <div className="mt-3 flex flex-wrap gap-1">
          {Array.from({ length: 18 }).map((_, i) => (
            <Bone key={i} className="h-8 w-8 rounded-lg" />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <Bone key={i} className="h-4" />
          ))}
        </div>
      </div>
    </Page>
  );
}

/** /nearby */
export function NearbyIndexSkeleton() {
  return (
    <Page>
      <HeroShell>
        <div className="mx-auto flex max-w-3xl flex-col items-center py-3 text-center lg:py-8">
          <Bone className="h-6 w-56 rounded-full" />
          <Bone className="mt-5 h-11 w-full max-w-xl" />
          <Bone className="mt-3 h-11 w-2/3 max-w-md" />
          <Bone className="mt-5 h-4 w-full max-w-lg" />
          <div className="mt-8 grid w-full max-w-2xl gap-2.5 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[2fr_3fr]">
            <Bone className="h-11" />
            <Bone className="h-11" />
          </div>
        </div>
      </HeroShell>
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <Bone className="h-5 w-40" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2.5 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <Bone className="h-4 w-2/3" />
              <Bone className="h-3 w-1/3" />
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}
