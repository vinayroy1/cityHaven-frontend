export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    yearBuilt: number;
    propertyType: 'house' | 'apartment' | 'condo' | 'townhouse';
    status: 'available' | 'sold' | 'pending';
  };
  images: string[];
  amenities: string[];
  agent: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  priceRange?: {
    min: number;
    max: number;
  };
  propertyType?: string[];
  bedrooms?: number;
  bathrooms?: number;
  location?: {
    city?: string;
    state?: string;
  };
}

export interface PropertySearchParams {
  query?: string;
  filters?: PropertyFilters;
  sortBy?: 'price' | 'date' | 'bedrooms' | 'bathrooms';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}