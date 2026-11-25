import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, PencilRuler, Users } from "lucide-react";

/** Supply-side call to action shown on public architect pages. */
export function ListYourCompany() {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 p-6 text-white sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
            <PencilRuler className="h-4 w-4" /> For architects, engineers & naksha designers
          </p>
          <h2 className="mt-2 text-2xl font-black">Get naksha and design enquiries from people planning their homes</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
            <li className="flex items-center gap-2"><Users className="h-4 w-4 text-sky-300" /> Plot owners who need a naksha, 3D elevation or map approval</li>
            <li className="flex items-center gap-2"><BadgeIndianRupee className="h-4 w-4 text-sky-300" /> Show your packages and plans with plot size and facing</li>
          </ul>
        </div>
        <Link href="/list-architect-naksha-business" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-400 px-6 text-sm font-black text-slate-950 transition hover:bg-sky-300">
          List free <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
