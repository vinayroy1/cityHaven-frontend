export type StayType =
  | "HOTEL"
  | "GUEST_HOUSE"
  | "LODGE"
  | "HOMESTAY"
  | "HOSTEL"
  | "DHARAMSHALA"
  | "RESORT"
  | "SERVICE_APARTMENT";

export type StayStatus = "DRAFT" | "PUBLISHED" | "PAUSED" | "ARCHIVED";

export interface StayBookingLink {
  platform: string;
  url: string;
}

export interface StayRoom {
  id?: number;
  name: string;
  bedType?: string | null;
  maxAdults: number;
  maxChildren: number;
  roomCount: number;
  pricePerNight?: number | null;
  weekendPrice?: number | null;
  monthlyPrice?: number | null;
  isFree: boolean;
  donationBased: boolean;
  ac: boolean;
  attachedBath: boolean;
  features: string[];
  photos: string[];
  bookUrl?: string | null;
  isAvailable: boolean;
}

export interface Stay {
  id: number;
  slug: string;
  ownerId: number;
  type: StayType;
  status: StayStatus;
  name: string;
  tagline?: string | null;
  description?: string | null;
  starRating?: number | null;
  countryCode: string;
  stateName?: string | null;
  cityName: string;
  locality?: string | null;
  address?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  nearbyLandmarks?: unknown;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  coupleFriendly: boolean;
  familyOnly: boolean;
  idRequired: boolean;
  petsAllowed: boolean;
  alcoholAllowed: boolean;
  curfewTime?: string | null;
  houseRules?: string | null;
  facilities: string[];
  coverImage?: string | null;
  photos: string[];
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  bookingLinks?: StayBookingLink[] | null;
  minPrice?: number | null;
  viewCount: number;
  bookingClicks: number;
  isVerified: boolean;
  publishedAt?: string | null;
  rooms: StayRoom[];
  owner?: { id: number; name?: string | null; profileImage?: string | null };
  _count?: { enquiries: number };
}

export type StayInput = Omit<
  Stay,
  "id" | "slug" | "ownerId" | "status" | "minPrice" | "viewCount" | "bookingClicks" | "isVerified" | "publishedAt" | "owner" | "_count" | "nearbyLandmarks" | "bookingLinks"
> & { bookingLinks: StayBookingLink[]; publish?: boolean };

export interface StaySearchParams {
  countryCode?: string;
  city?: string;
  locality?: string;
  type?: StayType;
  priceMax?: number;
  ac?: boolean;
  coupleFriendly?: boolean;
  familyFriendly?: boolean;
  free?: boolean;
  sort?: "recommended" | "price_low" | "price_high" | "newest";
  page?: number;
}

export interface StayEnquiryInput {
  name: string;
  phone: string;
  roomTypeId?: number | null;
  checkIn?: string | null;
  checkOut?: string | null;
  guests?: number | null;
  message?: string | null;
}
