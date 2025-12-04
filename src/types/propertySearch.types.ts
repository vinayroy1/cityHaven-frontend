export type PropertySearchParams = {
  q?: string;
  cityId?: number | string;
  listingType?: string;
  bedrooms?: number | string;
  priceMin?: number | string;
  priceMax?: number | string;
  status?: string;
  sort?: string;
  cursor?: number | string | null;
  pageSize?: number | string;
};

export type PropertySearchMedia = {
  id?: number;
  url: string;
  type?: string;
};

export type PropertySearchItem = {
  id: number;
  title: string;
  description?: string | null;
  price?: number | null;
  deposit?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  carpetArea?: number | null;
  areaUnit?: string | null;
  listingType?: string | null;
  resCom?: string | null;
  cityName?: string | null;
  locality?: string | null;
  subLocality?: string | null;
  address?: string | null;
  propertyType?: { name?: string | null; slug?: string | null } | null;
  propertySubType?: { name?: string | null; slug?: string | null } | null;
  media?: PropertySearchMedia[];
  createdAt?: string;
};

export type PropertySearchResponse = {
  items: PropertySearchItem[];
  nextCursor: number | null;
  hasMore: boolean;
};
