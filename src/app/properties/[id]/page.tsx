import React from "react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { similarProperties } from "@/app/propertySearch/data";
import { BadgeCheck, CalendarClock, Landmark, MapPin, Maximize, Ruler, ShieldCheck, Sparkles } from "lucide-react";
import { HeroHeader } from "./components/HeroHeader";
import { QuickFactsGrid } from "./components/QuickFactsGrid";
import { GalleryStrip } from "./components/GalleryStrip";
import { AboutHighlights } from "./components/AboutHighlights";
import { LocationCard } from "./components/LocationCard";
import { OwnerContactCard } from "./components/OwnerContactCard";
import { TransactionCard } from "./components/TransactionCard";
import { EnquiryStatsCard } from "./components/EnquiryStatsCard";
import { SimilarList } from "./components/SimilarList";

const propertyImages = [
  "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1500&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1464890100898-a385f744067f?auto=format&fit=crop&w=1200&q=80",
];

const quickFacts = [
  { label: "Plot area", value: "3.5 acres", hint: "146,410 sqft", icon: Maximize },
  { label: "Price", value: "₹2.45 Cr", hint: "₹70,00,000 per acre", icon: Sparkles },
  { label: "Location", value: "Tirupattur, Vellore", hint: "Tamil Nadu", icon: MapPin },
  { label: "Possession", value: "Immediate", hint: "Ready to move", icon: CalendarClock },
];

const highlights = [
  { title: "Wide frontage", detail: "80 ft highway touch with clear access", icon: Ruler },
  { title: "Clean title", detail: "Single owner • Encumbrance-free", icon: ShieldCheck },
  { title: "Water & soil ready", detail: "Loamy red soil • Borewell feasible", icon: Landmark },
  { title: "Ideal for farmstay", detail: "Surrounded by plantations & small homesteads", icon: BadgeCheck },
];

const aboutCopy =
  "Scenic agricultural / farm land placed at Mangamma Saalai, Aadhiyur, Tirupattur (635601). Green coconut groves nearby with a mild slope for quick drainage. Close to schools, banks, and the Tirupattur–Alangayam highway. Sold directly by owner with flexible visit timings.";

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const propertyId = params.id;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <HeaderNav />

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
        <nav className="text-xs text-slate-500">Home › Properties › Agricultural / Farm Land</nav>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row">
            <div className="flex-1 space-y-4">
              <HeroHeader
                propertyId={propertyId}
                title="3.5 acre freehold plot for sale"
                subtitle="Mangamma Saalai, Aadhiyur, Tirupattur, Vellore"
                price="₹2.45 Cr"
                priceHint="₹70,00,000 per acre"
                tags={["Resale", "Immediate possession", "Verified owner"]}
              />

              <QuickFactsGrid items={quickFacts} />
            </div>

            <div className="lg:max-w-sm">
              <OwnerContactCard name="Noorahmed" postedAgo="3 days ago" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            <GalleryStrip images={propertyImages} />
            <AboutHighlights aboutCopy={aboutCopy} highlights={highlights} />
            <LocationCard
              headline="Tirupattur, Vellore · Tamil Nadu"
              description="Just off Tirupattur–Alangayam highway • 3.5 km from bus stand"
              nearby={["Schools & colleges within 10 mins", "Banks & ATM within 2 km", "Weekly farmers market at 5 km"]}
              infra={["Black-topped road approach", "Electricity lines adjacent to plot", "Clear north-east ventilation"]}
            />
          </div>

          <aside className="space-y-4">
            <TransactionCard />
            <EnquiryStatsCard viewsThisWeek={312} responseRate="100%" />
            <SimilarList items={similarProperties} />
          </aside>
        </section>
      </div>
    </main>
  );
}
