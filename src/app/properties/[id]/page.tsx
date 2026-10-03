import React, { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { BadgeCheck, Bath, BedDouble, CalendarClock, Home, Landmark, Maximize } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { buildCanonical, SITE_URL } from "@/constants/seo";
import { AboutHighlights } from "./components/AboutHighlights";
import { GalleryStrip } from "./components/GalleryStrip";
import { HeroHeader } from "./components/HeroHeader";
import { LocationCard } from "./components/LocationCard";
import { OwnerContactCard } from "./components/OwnerContactCard";
import { PropertyDetailsGrid, type DetailGroup } from "./components/PropertyDetailsGrid";
import { QuickFactsGrid, type QuickFact } from "./components/QuickFactsGrid";
import { TransactionCard } from "./components/TransactionCard";

type PropertyMedia = { url?: string | null; type?: string | null };
type AmenityGroup = {
  categoryName?: string | null;
  amenities?: Array<{ id?: number; name?: string | null; slug?: string | null; value?: unknown }>;
};
type PropertyDetails = {
  id: number;
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  price?: number | null;
  priceType?: string | null;
  deposit?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  balconies?: number | null;
  washrooms?: number | null;
  totalRooms?: number | null;
  totalFloors?: number | null;
  floorNumber?: string | null;
  carpetArea?: number | null;
  carpetAreaUnit?: string | null;
  builtUpArea?: number | null;
  builtUpAreaUnit?: string | null;
  superBuiltUpArea?: number | null;
  superBuiltUpAreaUnit?: string | null;
  plotArea?: number | null;
  plotAreaUnit?: string | null;
  plotLength?: number | null;
  plotBreadth?: number | null;
  widthOfFacingRoad?: number | null;
  widthUnit?: string | null;
  areaUnit?: string | null;
  listingType?: string | null;
  resCom?: string | null;
  postedAs?: string | null;
  furnishing?: string | null;
  possessionStatus?: string | null;
  possessionType?: string | null;
  possessionBy?: string | null;
  possessionByMonth?: string | null;
  ageOfProperty?: string | null;
  transactionType?: string | null;
  ownershipType?: string | null;
  availabilityStatus?: string | null;
  availableFrom?: string | null;
  maintenance?: number | null;
  maintenancePaymentPeriod?: string | null;
  brokerage?: number | null;
  brokerageType?: string | null;
  pricePerSqFt?: number | null;
  priceNegotiable?: boolean | null;
  allInclusivePrice?: boolean | null;
  taxAndGovtExcluded?: boolean | null;
  parkingAvailable?: boolean | null;
  noOfParkings?: number | null;
  lift?: boolean | null;
  foodIncluded?: boolean | null;
  acAvailable?: boolean | null;
  attachedBathroom?: boolean | null;
  attachedBalcony?: boolean | null;
  roomType?: string | null;
  sharingCapacity?: number | null;
  availableBeds?: number | null;
  totalBeds?: number | null;
  availableFor?: string | null;
  pantryType?: string | null;
  conferenceRoom?: boolean | null;
  receptionArea?: boolean | null;
  centralAirConditioning?: boolean | null;
  zoneType?: string | null;
  locatedInside?: { name?: string | null } | null;
  cityName?: string | null;
  locality?: string | null;
  subLocality?: string | null;
  address?: string | null;
  createdAt?: string | null;
  media?: PropertyMedia[];
  owner?: { name?: string | null; mobileNumber?: string | null } | null;
  city?: { name?: string | null } | null;
  localityRef?: { name?: string | null } | null;
  project?: { name?: string | null } | null;
  propertyType?: { name?: string | null; slug?: string | null } | null;
  propertySubType?: { name?: string | null; slug?: string | null } | null;
  propertySubCategory?: { name?: string | null } | null;
  amenitiesByCategory?: AmenityGroup[];
};

const FALLBACK_IMAGES = ["/property-placeholder.webp"];

const getProperty = cache(async (id: string): Promise<PropertyDetails | null> => {
  const response = await fetch(API_ENDPOINTS.propertyListing.update(id), {
    next: { revalidate: 60 },
  });
  if (response.status === 404) return null;
  if (!response.ok) return null;
  const payload = (await response.json()) as { data?: PropertyDetails };
  return payload.data ?? null;
});

function formatEnum(value?: string | null) {
  if (!value) return "";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatMoney(value?: number | null) {
  if (!value && value !== 0) return "Price on request";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(value % 10000000 ? 2 : 0)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(value % 100000 ? 2 : 0)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function compact(items: Array<string | null | undefined>) {
  return items.filter(Boolean).join(", ");
}

function getArea(property: PropertyDetails) {
  if (property.carpetArea) return { label: "Carpet area", value: `${property.carpetArea.toLocaleString("en-IN")} ${formatEnum(property.carpetAreaUnit ?? property.areaUnit) || "sqft"}` };
  if (property.builtUpArea) return { label: "Built-up area", value: `${property.builtUpArea.toLocaleString("en-IN")} ${formatEnum(property.builtUpAreaUnit ?? property.areaUnit) || "sqft"}` };
  if (property.plotArea) return { label: "Plot area", value: `${property.plotArea.toLocaleString("en-IN")} ${formatEnum(property.plotAreaUnit ?? property.areaUnit) || "sqft"}` };
  return { label: "Area", value: "Ask owner" };
}

function formatArea(value?: number | null, unit?: string | null) {
  if (!value && value !== 0) return null;
  return `${value.toLocaleString("en-IN")} ${formatEnum(unit) || "sq.ft"}`;
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function postedAgo(createdAt?: string | null) {
  if (!createdAt) return "recently";
  const days = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

function buildQuickFacts(property: PropertyDetails): QuickFact[] {
  const area = getArea(property);
  const facts: QuickFact[] = [
    { label: area.label, value: area.value, hint: property.propertySubType?.name ?? property.propertyType?.name ?? "Listed area", icon: Maximize },
  ];

  if (property.bedrooms || property.bathrooms || property.balconies) {
    facts.push({
      label: "Configuration",
      value: [property.bedrooms ? `${property.bedrooms} BHK` : null, property.bathrooms ? `${property.bathrooms} Bath` : null]
        .filter(Boolean)
        .join(" · "),
      hint: property.balconies ? `${property.balconies} balconies` : "Room details",
      icon: BedDouble,
    });
  } else if (property.propertySubType?.name || property.propertyType?.name) {
    facts.push({
      label: "Property type",
      value: property.propertySubType?.name ?? property.propertyType?.name ?? "Property",
      hint: formatEnum(property.resCom) || "Listing category",
      icon: Home,
    });
  }

  if (property.furnishing) {
    facts.push({
      label: "Furnishing",
      value: formatEnum(property.furnishing),
      hint: formatEnum(property.possessionStatus) || "Interior details",
      icon: Home,
    });
  } else if (property.possessionStatus || property.availabilityStatus) {
    facts.push({
      label: "Availability",
      value: formatEnum(property.possessionStatus ?? property.availabilityStatus),
      hint: property.availableFrom ? `From ${formatDate(property.availableFrom)}` : "Possession details",
      icon: CalendarClock,
    });
  }

  facts.push({ label: "Listed by", value: formatEnum(property.postedAs) || "Owner", hint: `Posted ${postedAgo(property.createdAt)}`, icon: BadgeCheck });
  return facts.slice(0, 4);
}

function buildHighlights(property: PropertyDetails) {
  return [
    ...(property.furnishing ? [{ title: formatEnum(property.furnishing), detail: "Furnishing", icon: Home }] : []),
    { title: formatEnum(property.transactionType) || "Transparent transaction", detail: formatEnum(property.ownershipType) || "Ownership details available on enquiry.", icon: Landmark },
    { title: property.bathrooms ? `${property.bathrooms} bathrooms` : "Usable layout", detail: property.balconies ? `${property.balconies} balconies included` : "Review room and area details before visit.", icon: Bath },
    { title: "Visit friendly", detail: "Share your contact details to schedule a callback or site visit.", icon: CalendarClock },
  ];
}

function buildDetailGroups(property: PropertyDetails): DetailGroup[] {
  return [
    {
      title: "Basic details",
      items: [
        { label: "Listing type", value: formatEnum(property.listingType) },
        { label: "Category", value: formatEnum(property.resCom) },
        { label: "Property type", value: property.propertyType?.name },
        { label: "Property subtype", value: property.propertySubType?.name },
        { label: "Sub-category", value: property.propertySubCategory?.name },
        { label: "Located inside", value: property.locatedInside?.name },
        { label: "Posted as", value: formatEnum(property.postedAs) },
        { label: "Status", value: formatEnum(property.availabilityStatus) },
      ],
    },
    {
      title: "Configuration",
      items: [
        { label: "Bedrooms", value: property.bedrooms },
        { label: "Bathrooms", value: property.bathrooms },
        { label: "Balconies", value: property.balconies },
        { label: "Washrooms", value: property.washrooms },
        { label: "Total rooms", value: property.totalRooms },
        { label: "Floor", value: formatEnum(property.floorNumber) },
        { label: "Total floors", value: property.totalFloors },
        { label: "Furnishing", value: formatEnum(property.furnishing) },
        { label: "Age of property", value: formatEnum(property.ageOfProperty) },
      ],
    },
    {
      title: "Area",
      items: [
        { label: "Carpet area", value: formatArea(property.carpetArea, property.carpetAreaUnit ?? property.areaUnit) },
        { label: "Built-up area", value: formatArea(property.builtUpArea, property.builtUpAreaUnit ?? property.areaUnit) },
        { label: "Super built-up area", value: formatArea(property.superBuiltUpArea, property.superBuiltUpAreaUnit ?? property.areaUnit) },
        { label: "Plot area", value: formatArea(property.plotArea, property.plotAreaUnit ?? property.areaUnit) },
        { label: "Plot length", value: formatArea(property.plotLength, property.widthUnit) },
        { label: "Plot breadth", value: formatArea(property.plotBreadth, property.widthUnit) },
        { label: "Facing road width", value: formatArea(property.widthOfFacingRoad, property.widthUnit) },
      ],
    },
    {
      title: "Pricing",
      items: [
        { label: "Price", value: property.price ? formatMoney(property.price) : null },
        { label: "Deposit", value: property.deposit ? formatMoney(property.deposit) : null },
        { label: "Price per sq.ft", value: property.pricePerSqFt ? formatMoney(property.pricePerSqFt) : null },
        { label: "Maintenance", value: property.maintenance ? formatMoney(property.maintenance) : null },
        { label: "Maintenance period", value: formatEnum(property.maintenancePaymentPeriod) },
        { label: "Brokerage", value: property.brokerage ? formatMoney(property.brokerage) : null },
        { label: "Brokerage type", value: formatEnum(property.brokerageType) },
        { label: "Negotiable", value: property.priceNegotiable },
        { label: "All inclusive", value: property.allInclusivePrice },
        { label: "Tax/Govt excluded", value: property.taxAndGovtExcluded },
      ],
    },
    {
      title: "Availability",
      items: [
        { label: "Possession status", value: formatEnum(property.possessionStatus) },
        { label: "Possession type", value: formatEnum(property.possessionType) },
        { label: "Possession by", value: formatEnum(property.possessionBy) },
        { label: "Possession month", value: formatEnum(property.possessionByMonth) },
        { label: "Available from", value: formatDate(property.availableFrom) },
      ],
    },
    {
      title: "Facilities",
      items: [
        { label: "Parking available", value: property.parkingAvailable },
        { label: "No. of parkings", value: property.noOfParkings },
        { label: "Lift", value: property.lift },
        { label: "AC available", value: property.acAvailable },
        { label: "Attached bathroom", value: property.attachedBathroom },
        { label: "Attached balcony", value: property.attachedBalcony },
        { label: "Food included", value: property.foodIncluded },
      ],
    },
    {
      title: "PG / Commercial",
      items: [
        { label: "Room type", value: formatEnum(property.roomType) },
        { label: "Sharing capacity", value: property.sharingCapacity },
        { label: "Available beds", value: property.availableBeds },
        { label: "Total beds", value: property.totalBeds },
        { label: "Available for", value: formatEnum(property.availableFor) },
        { label: "Pantry type", value: formatEnum(property.pantryType) },
        { label: "Conference room", value: property.conferenceRoom },
        { label: "Reception area", value: property.receptionArea },
        { label: "Central AC", value: property.centralAirConditioning },
        { label: "Zone type", value: formatEnum(property.zoneType) },
      ],
    },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  let property: PropertyDetails | null = null;
  try {
    property = await getProperty(id);
  } catch {
    property = null;
  }

  if (!property) {
    return {
      title: "Property Listing Not Found",
      description: "The requested property listing could not be found on Awasio.",
    };
  }

  const title = property.title || `${property.bedrooms ? `${property.bedrooms} BHK ` : ""}${property.propertySubType?.name ?? property.propertyType?.name ?? "Property"} in ${property.locality ?? property.cityName ?? "India"}`;
  const location = compact([property.subLocality, property.localityRef?.name ?? property.locality, property.city?.name ?? property.cityName]);
  const price = formatMoney(property.price);
  const area = getArea(property);
  const description = property.description
    ? (property.description.length > 155 ? `${property.description.slice(0, 152)}...` : property.description)
    : `${title} available for ${property.listingType?.toLowerCase() || "sale/rent"} in ${location || "prime location"}. Price: ${price}. Carpet area: ${area.value}. Verified listings on Awasio.`;

  const ogImages = property.media?.map((m) => m.url).filter(Boolean) as string[] | undefined;
  const canonicalUrl = buildCanonical(`/properties/${property.slug || id}`);

  return {
    title: `${title} | ${price}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ${price} | Awasio`,
      description,
      url: canonicalUrl,
      type: "website",
      images: ogImages && ogImages.length > 0 ? ogImages.slice(0, 4).map((url) => ({ url })) : [`${SITE_URL}/property-placeholder.webp`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${price}`,
      description,
      images: ogImages && ogImages.length > 0 ? [ogImages[0]] : [`${SITE_URL}/property-placeholder.webp`],
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  // Consolidate legacy numeric URLs or older paths to the canonical SEO slug
  if (property.slug && id !== property.slug) {
    permanentRedirect(`/properties/${property.slug}`);
  }

  const images = property.media?.map((item) => item.url).filter(Boolean) as string[] | undefined;
  const location = compact([property.subLocality, property.localityRef?.name ?? property.locality, property.city?.name ?? property.cityName]);
  const title = property.title || `${property.bedrooms ? `${property.bedrooms} BHK ` : ""}${property.propertySubType?.name ?? property.propertyType?.name ?? "Property"} in ${property.locality ?? property.cityName ?? "Awasio"}`;
  const price = formatMoney(property.price);
  const area = getArea(property);
  const tags = [formatEnum(property.listingType), formatEnum(property.resCom), property.postedAs ? `Posted by ${formatEnum(property.postedAs)}` : null, property.project?.name].filter(Boolean) as string[];
  const amenities = property.amenitiesByCategory?.flatMap((group) => group.amenities?.map((item) => item.name).filter(Boolean) ?? []) as string[] | undefined;

  const schemaType = property.resCom?.toLowerCase() === "commercial"
    ? "CommercialRealEstate"
    : (property.propertySubType?.name?.toLowerCase().includes("house") || property.propertySubType?.name?.toLowerCase().includes("villa") ? "SingleFamilyResidence" : "Apartment");

  const propertyJsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: title,
    description: property.description || `${title} in ${location || "prime location"}`,
    url: buildCanonical(`/properties/${property.slug || id}`),
    ...(images && images.length > 0 ? { image: images } : {}),
    ...(property.bedrooms ? { numberOfRooms: property.bedrooms, numberOfBedrooms: property.bedrooms } : {}),
    ...(property.bathrooms ? { numberOfBathroomsTotal: property.bathrooms } : {}),
    ...(property.carpetArea ? {
      floorSize: {
        "@type": "QuantitativeValue",
        value: property.carpetArea,
        unitText: property.carpetAreaUnit || "SQFT",
      },
    } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: property.localityRef?.name ?? property.locality ?? property.cityName ?? "India",
      addressRegion: property.cityName ?? "India",
      addressCountry: "IN",
    },
    offers: {
      "@type": "Offer",
      price: property.price || 0,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      businessFunction: property.listingType?.toLowerCase().includes("rent") ? "https://schema.org/LeaseOut" : "https://schema.org/Sell",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: buildCanonical("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Properties",
        item: buildCanonical("/propertySearch"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: buildCanonical(`/properties/${property.slug || id}`),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900 [letter-spacing:0] dark:bg-slate-950 dark:text-slate-100 transition-colors duration-150">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <HeaderNav />

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:py-7">
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-slate-400"><a href="/" className="hover:text-emerald-700 dark:hover:text-emerald-400">Home</a><span>/</span><a href="/propertySearch" className="hover:text-emerald-700 dark:hover:text-emerald-400">Properties</a><span>/</span><span>{property.propertySubType?.name ?? property.propertyType?.name ?? "Details"}</span></nav>

        <section className="py-4">
          <HeroHeader
            propertyId={String(property.id)}
            title={title}
            subtitle={location || property.address || "Location available on request"}
            price={price}
            priceHint={property.priceType ? formatEnum(property.priceType) : area.value}
            category={property.propertySubCategory?.name ?? property.propertySubType?.name ?? property.propertyType?.name ?? "Property details"}
            tags={tags}
          />
          <div className="mt-5">
            <QuickFactsGrid items={buildQuickFacts(property)} />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="min-w-0 space-y-8">
            <GalleryStrip images={images?.length ? images : FALLBACK_IMAGES} title={property.propertySubType?.name ?? "Property gallery"} subtitle={`${images?.length ?? 0} photos available`} />
            <nav aria-label="Property sections" className="flex gap-6 overflow-x-auto border-b border-zinc-200 dark:border-slate-800 text-sm font-semibold">
              {[['overview', 'Overview'], ['details', 'Property details'], ['location', 'Location']].map(([anchor, label]) => <a key={anchor} href={`#${anchor}`} className="shrink-0 border-b-2 border-transparent pb-3 text-zinc-600 dark:text-slate-400 transition hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400">{label}</a>)}
            </nav>
            <AboutHighlights aboutCopy={property.description || "This property is listed on Awasio with key pricing, location, media, and owner information. Contact the owner to confirm visit slots, documents, and negotiation details."} highlights={buildHighlights(property)} amenities={amenities} />
            <PropertyDetailsGrid groups={buildDetailGroups(property)} />
            <LocationCard
              headline={location || property.address || "Location details"}
              description={property.address || "Exact address can be confirmed with the owner after enquiry."}
              nearby={[property.project?.name ? `Project: ${property.project.name}` : "Locality details available", property.cityName ? `City: ${property.cityName}` : "City information available on request"]}
              infra={[area.value, property.furnishing ? `${formatEnum(property.furnishing)} furnishing` : "Furnishing details on request", property.possessionStatus ? formatEnum(property.possessionStatus) : "Possession details on request"]}
            />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <OwnerContactCard
              propertyId={property.id}
              name={property.owner?.name || "Property owner"}
              postedAgo={postedAgo(property.createdAt)}
              title={title}
              locality={property.locality ?? property.cityName}
              cityName={property.cityName}
              price={price}
            />
            <TransactionCard transactionType={property.transactionType} ownershipType={property.ownershipType} listingType={property.listingType} deposit={property.deposit} />
          </aside>
        </section>
      </div>
    </main>
  );
}
