import { Home, Building, Building2 } from "lucide-react";
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

export const listingTypeOptions: ListingTypeOption[] = [
  { value: "SELL", label: "Sell", allowedPropertyTypeSlugs: ["residential", "commercial"] },
  { value: "RENT", label: "Rent", allowedPropertyTypeSlugs: ["residential", "commercial"] },
  { value: "PG", label: "PG / Co-living", allowedPropertyTypeSlugs: ["residential"], forcedSubTypeGroupSlug: "pg" },
];

export const propertyTypes: PropertyTypeOption[] = [
  {
    id: "1",
    slug: "residential",
    label: "Residential",
    resCom: "RESIDENTIAL",
    icon: Home,
    accent: "from-emerald-400 to-teal-500",
    subTypeGroupSlug: "residential",
  },
  {
    id: "2",
    slug: "commercial",
    label: "Commercial",
    resCom: "COMMERCIAL",
    icon: Building,
    accent: "from-amber-500 to-orange-400",
    subTypeGroupSlug: "commercial",
  },
  {
    id: "3",
    slug: "pg",
    label: "PG / Co-living",
    resCom: "RESIDENTIAL",
    icon: Building2,
    accent: "from-sky-500 to-indigo-400",
    subTypeGroupSlug: "pg",
  },
];

export const propertySubTypeCatalog: Record<string, SubTypeOption[]> = {
  residential: [
    { id: "1", slug: "apartment", label: "Apartment" },
    { id: "2", slug: "independent-house-villa", label: "Independent House / Villa" },
    { id: "3", slug: "independent-builder-floor", label: "Independent / Builder Floor" },
    { id: "4", slug: "1rk-studio", label: "1 RK / Studio Apartment" },
    { id: "5", slug: "serviced-apartment", label: "Serviced Apartment" },
    { id: "6", slug: "res-plot-land", label: "Plot / Land" },
    { id: "7", slug: "farmhouse", label: "Farmhouse" },
    { id: "8", slug: "res-other", label: "Other" },
  ],
  commercial: [
    {
      id: "9",
      slug: "office",
      label: "Office",
      categories: [
        { id: "1", slug: "ready-to-move-office-space", label: "Ready to move office space" },
        { id: "2", slug: "bare-shell-office-space", label: "Bare shell office space" },
        { id: "3", slug: "co-working-office-space", label: "Co-working office space" },
      ],
      locatedInsideOptions: [
        { id: "11", slug: "mall", label: "Mall" },
        { id: "12", slug: "commercial-project", label: "Commercial Project" },
        { id: "13", slug: "retail-complex", label: "Retail Complex/Building" },
        { id: "14", slug: "market-high-street", label: "Market / High Street" },
        { id: "15", slug: "it-park", label: "IT Park" },
        { id: "16", slug: "business-park", label: "Business Park" },
        { id: "17", slug: "business-center", label: "Business Center" },
        { id: "18", slug: "corporate-tower", label: "Corporate Tower" },
        { id: "19", slug: "commercial-complex", label: "Commercial Complex" },
        { id: "20", slug: "others", label: "Others" },
      ],
    },
    {
      id: "10",
      slug: "retail",
      label: "Retail",
      categories: [
        { id: "4", slug: "commercial-shops", label: "Commercial Shops" },
        { id: "5", slug: "commercial-showrooms", label: "Commercial Showrooms" },
      ],
      locatedInsideOptions: [
        { id: "1", slug: "mall", label: "Mall" },
        { id: "2", slug: "commercial-project", label: "Commercial Project" },
        { id: "3", slug: "retail-complex", label: "Retail Complex/Building" },
        { id: "4", slug: "market-high-street", label: "Market / High Street" },
        { id: "5", slug: "it-park", label: "IT Park" },
        { id: "6", slug: "business-park", label: "Business Park" },
        { id: "7", slug: "business-center", label: "Business Center" },
        { id: "8", slug: "corporate-tower", label: "Corporate Tower" },
        { id: "9", slug: "commercial-complex", label: "Commercial Complex" },
        { id: "10", slug: "others", label: "Others" },
      ],
    },
    { id: "11", slug: "commercial-plot-land", label: "Plot / Land" },
    { id: "12", slug: "storage", label: "Storage" },
    { id: "13", slug: "industry", label: "Industry" },
    { id: "14", slug: "hospitality", label: "Hospitality" },
    { id: "15", slug: "commercial-other", label: "Other" },
  ],
  pg: [
    { id: "16", slug: "pg-private-room", label: "Private Room" },
    { id: "17", slug: "pg-shared-room", label: "Shared Room" },
    { id: "18", slug: "pg-bed", label: "Bed / Dormitory" },
  ],
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

export const amenityOptions = [
  { id: 1, label: "Gym", group: "Society" },
  { id: 2, label: "Pool", group: "Society" },
  { id: 3, label: "Clubhouse", group: "Society" },
  { id: 4, label: "Power Backup", group: "Safety" },
  { id: 5, label: "24x7 Security", group: "Safety" },
  { id: 6, label: "CCTV", group: "Safety" },
  { id: 7, label: "Garden", group: "Lifestyle" },
  { id: 8, label: "Play Area", group: "Lifestyle" },
  { id: 9, label: "Lift", group: "Convenience" },
  { id: 10, label: "EV Charging", group: "Convenience" },
];

export const authorityOptions = [
  { id: 1, label: "RERA" },
  { id: 2, label: "Development Authority" },
  { id: 3, label: "Fire NOC" },
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
