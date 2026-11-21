import Link from "next/link";
import { ArrowRight, Flame, Star, Users } from "lucide-react";

/** Supply-side call to action on public pandit / vastu pages. */
export function ListYourService() {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-orange-950 to-rose-950 p-6 text-white sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Flame className="h-4 w-4" /> For pandits, purohits & vastu experts
          </p>
          <h2 className="mt-2 text-2xl font-black">Get puja and vastu bookings from families near you</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
            <li className="flex items-center gap-2"><Users className="h-4 w-4 text-amber-300" /> People moving into new homes and building on plots</li>
            <li className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-300" /> Show your pujas, dakshina and reviews in one place</li>
          </ul>
        </div>
        <Link href="/list-pandit-services" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 text-sm font-black text-slate-950 transition hover:bg-amber-300">
          List your services <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
