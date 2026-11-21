import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, HardHat, Users } from "lucide-react";

/** Supply-side call to action shown on public construction pages. */
export function ListYourCompany() {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 p-6 text-white sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
            <HardHat className="h-4 w-4" /> For builders & contractors
          </p>
          <h2 className="mt-2 text-2xl font-black">Get enquiries from people building their homes</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
            <li className="flex items-center gap-2"><Users className="h-4 w-4 text-amber-300" /> Homeowners with plots, ready to build</li>
            <li className="flex items-center gap-2"><BadgeIndianRupee className="h-4 w-4 text-amber-300" /> Show your package rates and completed homes</li>
          </ul>
        </div>
        <Link href="/list-construction-company" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 text-sm font-black text-slate-950 transition hover:bg-amber-300">
          List your company <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
