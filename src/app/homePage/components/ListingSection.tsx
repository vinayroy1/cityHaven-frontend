import React from "react";
import { ListingCard } from "./ListingCard";
import { SectionHeading } from "./SectionHeading";

type Listing = { id?: string; title: string; location: string; price: string; badge?: string; image: string };

type Props = { title: string; listings: Listing[]; cta?: string; ctaHref?: string };

export function ListingSection({ title, listings, cta, ctaHref = "/propertySearch" }: Props) {
  return (
    <section className="mx-auto mt-8 max-w-6xl px-6" id="homes">
      <SectionHeading title={title} cta={cta} href={ctaHref} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {listings.map((item) => (
          <ListingCard key={`${item.id ?? item.title}`} {...item} />
        ))}
      </div>
    </section>
  );
}
