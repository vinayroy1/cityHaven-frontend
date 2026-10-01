import React from "react";
import { ListingCard } from "./ListingCard";
import { SectionHeading } from "./SectionHeading";

type Listing = { id?: string; title: string; location: string; price: string; badge?: string; image: string };

type Props = { title: string; listings: Listing[]; cta?: string; ctaHref?: string };

export function ListingSection({ title, listings, cta, ctaHref = "/propertySearch" }: Props) {
  return (
    <section className="mx-auto mt-8 max-w-6xl px-6" id="homes">
      <SectionHeading title={title} cta={cta} href={ctaHref} />
      <div className="flex w-full gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 md:grid-cols-3 lg:grid-cols-5">
        {listings.map((item) => (
          <div key={`${item.id ?? item.title}`} className="w-[76vw] max-w-[295px] shrink-0 snap-start sm:w-auto sm:max-w-none">
            <ListingCard {...item} />
          </div>
        ))}
      </div>
    </section>
  );
}
