import { Home, Building, Building2 } from "lucide-react";
import { BACKEND_ENUMS, PROPERTY_TYPES, PROPERTY_SUBTYPES, PROPERTY_SUBCATEGORIES, LOCATED_INSIDE_OPTIONS } from "@/constants/backend-schema";
import type { PropertyListingFormValues, ListingType } from "@/types/propertyListing.types";

export type OptionItem = {
  id: string;
  slug: string;
  label: string;
};

export type SubTypeOption = {
  id: string;
  slug: string;
  label: string;
  categories?: OptionItem[];
  locatedInsideOptions?: OptionItem[];
};

export type PropertyTypeOption = {
  id: string;
  slug: string;
  label: string;
  resCom: "RESIDENTIAL" | "COMMERCIAL";
  icon: typeof Home;
  accent: string;
  subTypeGroupSlug: string;
};

export type ListingTypeOption = {
  value: ListingType;
  label: string;
  allowedPropertyTypeSlugs: string[];
  forcedSubTypeGroupSlug?: string;
};

export const listingTypeOptions: ListingTypeOption[] = BACKEND_ENUMS.ListingType.map((lt) => {
  if (lt === "PG") return { value: lt, label: "PG / Co-living", allowedPropertyTypeSlugs: ["pg"], forcedSubTypeGroupSlug: "pg" };
  if (lt === "SELL") return { value: lt, label: "Sell", allowedPropertyTypeSlugs: ["residential", "commercial"] };
  return { value: lt, label: "Rent", allowedPropertyTypeSlugs: ["residential", "commercial"] };
});

const typeIcon: Record<string, typeof Home> = {
  residential: Home,
  commercial: Building,
  pg: Building2,
};

const typeAccent: Record<string, string> = {
  residential: "from-emerald-400 to-teal-500",
  commercial: "from-amber-500 to-orange-400",
  pg: "from-sky-500 to-indigo-400",
};

export const propertyTypes: PropertyTypeOption[] = PROPERTY_TYPES.map((t, idx) => ({
  id: String(idx + 1),
  slug: t.slug,
  label: t.name,
  resCom: t.resCom,
  icon: typeIcon[t.slug] ?? Home,
  accent: typeAccent[t.slug] ?? "from-emerald-400 to-teal-500",
  subTypeGroupSlug: t.slug,
}));

export const propertySubTypeCatalog: Record<string, SubTypeOption[]> = {
  ...PROPERTY_TYPES.reduce<Record<string, SubTypeOption[]>>((acc, t) => {
    const subtypes = PROPERTY_SUBTYPES.filter((s) => s.propertyTypeSlug === t.slug).map((s, idx) => {
      const subCats = PROPERTY_SUBCATEGORIES.filter((c) => c.propertySubTypeSlug === s.slug).map((c, cidx) => ({
        id: `${idx + 1}-${cidx + 1}`,
        slug: c.slug,
        label: c.name,
      }));
      const locatedInside = LOCATED_INSIDE_OPTIONS.filter((li) => li.propertySubTypeSlug === s.slug).map((li, lidx) => ({
        id: `${idx + 1}-L${lidx + 1}`,
        slug: li.slug,
        label: li.name,
      }));
      return {
        id: `${idx + 1}`,
        slug: s.slug,
        label: s.name,
        categories: subCats.length ? subCats : undefined,
        locatedInsideOptions: locatedInside.length ? locatedInside : undefined,
      };
    });
    acc[t.slug] = subtypes;
    return acc;
  }, {}),
};

export const propertyTypeCatalog: (PropertyTypeOption & { subTypes: SubTypeOption[] })[] = propertyTypes.map((type) => ({
  ...type,
  subTypes: propertySubTypeCatalog[type.subTypeGroupSlug] ?? [],
}));

export const getListingConfig = (listingType?: ListingType) =>
  listingTypeOptions.find((option) => option.value === listingType) ?? listingTypeOptions[0];

export const getPropertyTypeById = (id?: string) => propertyTypes.find((p) => p.id === id);

export const getAllowedPropertyTypes = (listingType?: ListingType) => {
  const config = getListingConfig(listingType);
  return propertyTypes.filter((type) => config.allowedPropertyTypeSlugs.includes(type.slug));
};

export const getSubTypesForSelection = (listingType?: ListingType, propertyTypeId?: string) => {
  const config = getListingConfig(listingType);
  const propertyType = getPropertyTypeById(propertyTypeId);
  const subTypeGroup = config.forcedSubTypeGroupSlug ?? propertyType?.subTypeGroupSlug;
  return subTypeGroup ? propertySubTypeCatalog[subTypeGroup] ?? [] : [];
};

export const cityOptions = [
  { id: "1", name: "Bengaluru" },
  { id: "2", name: "Mumbai" },
  { id: "3", name: "Delhi NCR" },
  { id: "4", name: "Hyderabad" },
];

export const localityOptions: Record<string, { id: string; name: string }[]> = {
  "1": [
    { id: "11", name: "HSR Layout" },
    { id: "12", name: "Whitefield" },
    { id: "13", name: "Indiranagar" },
  ],
  "2": [
    { id: "21", name: "Bandra" },
    { id: "22", name: "Andheri" },
    { id: "23", name: "Powai" },
  ],
  "3": [
    { id: "31", name: "Gurgaon" },
    { id: "32", name: "Noida" },
    { id: "33", name: "South Delhi" },
  ],
  "4": [
    { id: "41", name: "Hitech City" },
    { id: "42", name: "Kondapur" },
  ],
};

export const projectOptions = [
  { id: "701", cityId: "1", label: "Skyline Residences" },
  { id: "702", cityId: "1", label: "Lakeside Habitat" },
  { id: "801", cityId: "2", label: "Oceanic Heights" },
  { id: "901", cityId: "3", label: "Capital Greens" },
];

// Mirrors the seeded `Amenity` catalog (awasio-backend prisma/seeds.ts).
// Chip values are amenity slugs; the API resolves them to DB ids
// (`amenitySlug`), so the frontend never depends on database ids.
export const amenityOptions: { slug: string; label: string; category: string }[] = [
  { slug: "maintenance-staff", label: "Maintenance Staff", category: "Amenities" },
  { slug: "water-storage", label: "Water Storage", category: "Amenities" },
  { slug: "waste-disposal", label: "Waste Disposal", category: "Amenities" },
  { slug: "rain-water-harvesting", label: "Rain Water Harvesting", category: "Amenities" },
  { slug: "visitor-parking", label: "Visitor Parking", category: "Amenities" },
  { slug: "feng-shui-vaastu-compliant", label: "Feng Shui / Vaastu Compliant", category: "Amenities" },
  { slug: "park", label: "Park", category: "Amenities" },
  { slug: "private-garden-terrace", label: "Private Garden / Terrace", category: "Amenities" },
  { slug: "high-ceiling-height", label: "High Ceiling Height", category: "Property Features" },
  { slug: "false-ceiling-lighting", label: "False Ceiling Lighting", category: "Property Features" },
  { slug: "internet-wifi-connectivity", label: "Internet/WiFi Connectivity", category: "Property Features" },
  { slug: "centrally-air-conditioned", label: "Centrally Air Conditioned", category: "Property Features" },
  { slug: "water-purifier", label: "Water purifier", category: "Property Features" },
  { slug: "security-fire-alarm", label: "Security / Fire Alarm", category: "Property Features" },
  { slug: "recently-renovated", label: "Recently Renovated", category: "Property Features" },
  { slug: "natural-light", label: "Natural Light", category: "Property Features" },
  { slug: "airy-rooms", label: "Airy Rooms", category: "Property Features" },
  { slug: "spacious-interiors", label: "Spacious Interiors", category: "Property Features" },
  { slug: "fitness-centre-gym", label: "Fitness Centre / GYM", category: "Society/Building Features" },
  { slug: "swimming-pool", label: "Swimming Pool", category: "Society/Building Features" },
  { slug: "club-house-community-center", label: "Club house / Community Center", category: "Society/Building Features" },
  { slug: "security-personnel", label: "Security Personnel", category: "Society/Building Features" },
  { slug: "separate-entry-servant-room", label: "Separate entry for servant room", category: "Additional Features" },
  { slug: "no-open-drainage-around", label: "No open drainage around", category: "Additional Features" },
  { slug: "bank-attached-property", label: "Bank Attached Property", category: "Additional Features" },
  { slug: "low-density-society", label: "Low Density Society", category: "Additional Features" },
  { slug: "municipal-corporation", label: "Municipal corporation", category: "Water Source" },
  { slug: "borewell-tank", label: "Borewell/Tank", category: "Water Source" },
  { slug: "24x7-water", label: "24x7 Water", category: "Water Source" },
  { slug: "pool-overlooking", label: "Pool", category: "Overlooking" },
  { slug: "park-garden-overlooking", label: "Park/Garden", category: "Overlooking" },
  { slug: "club-overlooking", label: "Club", category: "Overlooking" },
  { slug: "main-road-overlooking", label: "Main Road", category: "Overlooking" },
  { slug: "others-overlooking", label: "Others", category: "Overlooking" },
  { slug: "in-gated-society", label: "In a gated society", category: "Other Features" },
  { slug: "corner-property", label: "Corner Property", category: "Other Features" },
  { slug: "pet-friendly", label: "Pet Friendly", category: "Other Features" },
  { slug: "wheelchair-friendly", label: "Wheelchair friendly", category: "Other Features" },
  { slug: "no-power-backup", label: "None", category: "Power Back up" },
  { slug: "partial-power-backup", label: "Partial", category: "Power Back up" },
  { slug: "full-power-backup", label: "Full", category: "Power Back up" },
  { slug: "north-facing", label: "North", category: "Property Facing" },
  { slug: "south-facing", label: "South", category: "Property Facing" },
  { slug: "east-facing", label: "East", category: "Property Facing" },
  { slug: "west-facing", label: "West", category: "Property Facing" },
  { slug: "north-east-facing", label: "North-East", category: "Property Facing" },
  { slug: "north-west-facing", label: "North-West", category: "Property Facing" },
  { slug: "south-east-facing", label: "South-East", category: "Property Facing" },
  { slug: "south-west-facing", label: "South-West", category: "Property Facing" },
  { slug: "polished-concrete-flooring", label: "Polished Concrete", category: "Type of Flooring" },
  { slug: "marble-flooring", label: "Marble", category: "Type of Flooring" },
  { slug: "concrete-flooring", label: "Concrete", category: "Type of Flooring" },
  { slug: "granite-flooring", label: "Granite", category: "Type of Flooring" },
  { slug: "ceramic-flooring", label: "Ceramic", category: "Type of Flooring" },
  { slug: "mosaic-flooring", label: "Mosaic", category: "Type of Flooring" },
  { slug: "cement-flooring", label: "Cement", category: "Type of Flooring" },
  { slug: "stone-flooring", label: "Stone", category: "Type of Flooring" },
  { slug: "vinyl-flooring", label: "Vinyl", category: "Type of Flooring" },
  { slug: "wood-flooring", label: "Wood", category: "Type of Flooring" },
  { slug: "vitrified-flooring", label: "Vitrified", category: "Type of Flooring" },
  { slug: "spartex-flooring", label: "Spartex", category: "Type of Flooring" },
  { slug: "ips-finish-flooring", label: "IPS Finish", category: "Type of Flooring" },
  { slug: "others-flooring", label: "Others", category: "Type of Flooring" },
  { slug: "close-to-metro-station", label: "Close to Metro Station", category: "Location Advantages" },
  { slug: "close-to-school", label: "Close to School", category: "Location Advantages" },
  { slug: "close-to-hospital", label: "Close to Hospital", category: "Location Advantages" },
  { slug: "close-to-market", label: "Close to Market", category: "Location Advantages" },
  { slug: "close-to-railway-station", label: "Close to Railway Station", category: "Location Advantages" },
  { slug: "close-to-airport", label: "Close to Airport", category: "Location Advantages" },
  { slug: "close-to-mall", label: "Close to Mall", category: "Location Advantages" },
  { slug: "close-to-highway", label: "Close to Highway", category: "Location Advantages" },
];

export const authorityOptions = [
  { id: 1, label: "RERA" },
  { id: 2, label: "Development Authority" },
  { id: 3, label: "Fire NOC" },
];

export const amenityCategories = [
  { id: 1, name: "Amenities", description: "Basic amenities and facilities available" },
  { id: 2, name: "Property Features", description: "Specific features of the property unit" },
  { id: 3, name: "Society/Building Features", description: "Amenities provided by the society or building" },
  { id: 4, name: "Additional Features", description: "Extra features and advantages" },
  { id: 5, name: "Water Source", description: "Water supply sources available" },
  { id: 6, name: "Overlooking", description: "Views from the property" },
  { id: 7, name: "Other Features", description: "Additional property characteristics" },
  { id: 8, name: "Power Back up", description: "Power backup availability" },
  { id: 9, name: "Property Facing", description: "Direction the property faces" },
  { id: 10, name: "Type of Flooring", description: "Flooring material type" },
  { id: 11, name: "Width of Facing Road", description: "Numeric field section" },
  { id: 12, name: "Location Advantages", description: "Nearby landmarks and location benefits" },
];

export const furnishingItems = ["Wardrobe", "Geyser", "Modular Kitchen", "Air Conditioning", "Fans & Lights"];

export const stepList = [
  { id: 1, label: "Basic & Context", caption: "Listing type & classification" },
  { id: 2, label: "Location & Project", caption: "City, locality, project" },
  { id: 3, label: "Property Details", caption: "Structure & layout" },
  { id: 4, label: "Price & Availability", caption: "Commercials & timeline" },
  { id: 5, label: "Amenities & Legal", caption: "Features, ownership" },
  { id: 6, label: "Media + Review", caption: "Photos, story & publish" },
];

export const stepValidations: Record<number, (keyof PropertyListingFormValues | string)[]> = {
  1: ["context.listingType", "context.propertyTypeId", "context.propertySubTypeId"],
  2: ["location.cityId", "location.localityId"],
  3: ["details.carpetArea", "details.bathrooms"],
  4: ["pricing.price", "availability.availabilityStatus"],
  5: ["amenities.ownershipType"],
  6: ["meta.title"],
};
