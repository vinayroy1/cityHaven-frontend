export interface AgentListing {
  id: number;
  title: string;
  price: string;
  location: string;
  type: string;
  beds: number;
  image: string;
}

export type AgentSubscriptionTier = "FREE_VERIFIED" | "CITY_SPOTLIGHT" | "PRO_ADVISOR";

export interface Agent {
  id: string;
  name: string;
  role: string;
  agency: string;
  reraId: string;
  avatar: string;
  coverImage?: string;
  city: string;
  area: string;
  experience: string;
  tours: string;
  listingsCount: number;
  rating: string;
  reviewsCount: number;
  focus: string;
  phone: string;
  email: string;
  badge: "Top Rated" | "Premier Agent" | "Top Producer" | "Super Agent" | "Fast Responder";
  services: string[];
  languages: string[];
  bio: string;
  responseTime: string;
  featuredListings: AgentListing[];
  reviews: {
    author: string;
    date: string;
    rating: number;
    comment: string;
  }[];
  subscriptionTier: AgentSubscriptionTier;
  isHomepageFeatured: boolean;
}

export const ALL_AGENTS: Agent[] = [
  {
    id: "aarav-kapoor",
    name: "Aarav Kapoor",
    role: "Senior Property Advisor",
    agency: "Urban Nest Realty",
    reraId: "DLRERA2021A0042",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    city: "Delhi",
    area: "South Delhi & Chhatarpur",
    experience: "9+ yrs",
    tours: "140+ visits",
    listingsCount: 42,
    rating: "4.9",
    reviewsCount: 88,
    focus: "Builder floors & farmhouses",
    phone: "+91 98101 24590",
    email: "aarav.kapoor@urbannest.in",
    badge: "Top Rated",
    services: ["Private site visits", "Price negotiation", "Title verification", "Registry guidance"],
    languages: ["English", "Hindi", "Punjabi"],
    bio: "With over 9 years of dedicated on-ground experience in South Delhi's premium residential pockets, Aarav specializes in luxury builder floors, boutique bungalows, and South Delhi redevelopment properties. He coordinates seamless site walkthroughs and transparent seller discussions.",
    responseTime: "< 15 mins",
    featuredListings: [
      {
        id: 101,
        title: "4 BHK Ultra-Luxury Builder Floor",
        price: "₹ 6.50 Cr",
        location: "Greater Kailash 1, South Delhi",
        type: "Sale",
        beds: 4,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: 102,
        title: "Boutique Park-Facing Villa",
        price: "₹ 11.25 Cr",
        location: "Panchsheel Park, South Delhi",
        type: "Sale",
        beds: 5,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: 103,
        title: "Spacious 3 BHK with Private Terrace",
        price: "₹ 3.85 Cr",
        location: "Hauz Khas Enclave, Delhi",
        type: "Sale",
        beds: 3,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
      },
    ],
    reviews: [
      {
        author: "Siddharth Malhotra",
        date: "2 weeks ago",
        rating: 5,
        comment: "Aarav organized two comprehensive site visits on the weekend. He pointed out clear title details and helped negotiate a 6% discount with the developer.",
      },
      {
        author: "Pooja Vashisht",
        date: "1 month ago",
        rating: 5,
        comment: "Extremely professional walkthrough. He knew every builder in GK-1 and saved us weeks of aimless visiting.",
      },
    ],
    subscriptionTier: "PRO_ADVISOR",
    isHomepageFeatured: true,
  },
  {
    id: "meera-singhania",
    name: "Meera Singhania",
    role: "Luxury Residential Specialist",
    agency: "Prime Door Advisors",
    reraId: "HRERA2019A0118",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    coverImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    city: "Gurugram",
    area: "Golf Course Rd & Cyber City",
    experience: "11+ yrs",
    tours: "210+ visits",
    listingsCount: 68,
    rating: "4.9",
    reviewsCount: 114,
    focus: "High-rises & gated communities",
    phone: "+91 98112 34901",
    email: "meera@primedoor.com",
    badge: "Premier Agent",
    services: ["Physical walkthroughs", "Doc verification", "NRI property care", "Clubhouse inspection"],
    languages: ["English", "Hindi"],
    bio: "Meera is an established veteran in Gurugram's luxury corridor, handling properties across DLF Phase 5, Golf Course Road, and Golf Course Extension. She offers end-to-end site visit itineraries and verified builder contracts.",
    responseTime: "< 10 mins",
    featuredListings: [
      {
        id: 201,
        title: "DLF The Camellias Sky Villa",
        price: "₹ 24.5 Cr",
        location: "Golf Course Road, Gurugram",
        type: "Sale",
        beds: 4,
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: 202,
        title: "Luxury High-Rise with Golf Course View",
        price: "₹ 8.90 Cr",
        location: "Sector 42, Gurugram",
        type: "Sale",
        beds: 3,
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
      },
    ],
    reviews: [
      {
        author: "Devendra Agarwal",
        date: "3 weeks ago",
        rating: 5,
        comment: "Meera is hands down the best advisor on Golf Course Road. She arranged security gate clearance and verified maintenance dues prior to the visit.",
      },
    ],
    subscriptionTier: "PRO_ADVISOR",
    isHomepageFeatured: true,
  },
  {
    id: "rohan-varma",
    name: "Rohan Varma",
    role: "Ready-to-Move Consultant",
    agency: "Metroline Properties",
    reraId: "UPRERA2020A0341",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
    coverImage: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
    city: "Noida",
    area: "Sector 62, 75 & Expressway",
    experience: "7+ yrs",
    tours: "95+ visits",
    listingsCount: 37,
    rating: "4.8",
    reviewsCount: 62,
    focus: "Flats & investment properties",
    phone: "+91 98120 45678",
    email: "rohan@metrolinehomes.com",
    badge: "Fast Responder",
    services: ["Assisted visits", "Registry guidance", "Bank loan liaising", "Rental yield audit"],
    languages: ["English", "Hindi"],
    bio: "Rohan specializes in ready-to-move societies along Noida Expressway and central sectors. Known for quick responses and realistic price valuation insights.",
    responseTime: "< 5 mins",
    featuredListings: [
      {
        id: 301,
        title: "3 BHK Golf-Facing Apartment",
        price: "₹ 1.85 Cr",
        location: "Sector 128, Noida Expressway",
        type: "Sale",
        beds: 3,
        image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=80",
      },
    ],
    reviews: [
      {
        author: "Ananya Roy",
        date: "Just now",
        rating: 5,
        comment: "Rohan answered all questions on Noida registry charges and arranged immediate keys for the site visit.",
      },
    ],
    subscriptionTier: "CITY_SPOTLIGHT",
    isHomepageFeatured: true,
  },
  {
    id: "kavita-deshmukh",
    name: "Kavita Deshmukh",
    role: "Coastal & High-Rise Expert",
    agency: "Harbour Key Homes",
    reraId: "MAHARERA2018A0091",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    city: "Mumbai",
    area: "Bandra, Juhu & Powai",
    experience: "10+ yrs",
    tours: "180+ visits",
    listingsCount: 54,
    rating: "4.9",
    reviewsCount: 97,
    focus: "Sea-facing flats & penthouses",
    phone: "+91 98200 78901",
    email: "kavita@harbourkey.in",
    badge: "Top Producer",
    services: ["VIP guided tours", "Society NOC help", "High-value negotiations", "Legal diligence"],
    languages: ["English", "Hindi", "Marathi"],
    bio: "Kavita represents premium residential properties across Mumbai's western suburbs. With over a decade of trust among high-net-worth buyers, she ensures discretion and smooth site visits.",
    responseTime: "< 20 mins",
    featuredListings: [
      {
        id: 401,
        title: "Sea-View 4 BHK Residence",
        price: "₹ 16.5 Cr",
        location: "Carter Road, Bandra West, Mumbai",
        type: "Sale",
        beds: 4,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
      },
    ],
    reviews: [
      {
        author: "Karan Joharwal",
        date: "2 months ago",
        rating: 5,
        comment: "Flawless site visit coordination. Kavita arranged a private sunset viewing and society secretary interaction.",
      },
    ],
    subscriptionTier: "CITY_SPOTLIGHT",
    isHomepageFeatured: true,
  },
  {
    id: "vikram-malhotra",
    name: "Vikram Malhotra",
    role: "Tech Corridor Specialist",
    agency: "Silicon Edge Realty",
    reraId: "K-RERA2021A0087",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    city: "Bengaluru",
    area: "Whitefield, HSR & Indiranagar",
    experience: "8+ yrs",
    tours: "130+ visits",
    listingsCount: 46,
    rating: "4.9",
    reviewsCount: 79,
    focus: "Villas & premium IT flats",
    phone: "+91 98450 12345",
    email: "vikram@siliconedge.in",
    badge: "Super Agent",
    services: ["Same-day walkthroughs", "Khata verification", "Gated villa specialist", "Tech corridor advice"],
    languages: ["English", "Hindi", "Kannada"],
    bio: "Vikram assists tech professionals and executives finding gated community villas and luxury apartments near Bengaluru's prime tech parks.",
    responseTime: "< 15 mins",
    featuredListings: [
      {
        id: 501,
        title: "Luxury Garden Villa",
        price: "₹ 4.80 Cr",
        location: "Whitefield, Bengaluru",
        type: "Sale",
        beds: 4,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80",
      },
    ],
    reviews: [
      {
        author: "Ritu Nair",
        date: "3 weeks ago",
        rating: 5,
        comment: "Super knowledgeable on A-Khata documentation. The site visit was well-organized with printed society layouts.",
      },
    ],
    subscriptionTier: "FREE_VERIFIED",
    isHomepageFeatured: false,
  },
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    role: "Modern Living Consultant",
    agency: "Aura Prime Estates",
    reraId: "MAHARERA2022A0145",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    city: "Pune",
    area: "Koregaon Park & Baner",
    experience: "6+ yrs",
    tours: "85+ visits",
    listingsCount: 29,
    rating: "4.8",
    reviewsCount: 53,
    focus: "Gated townships & duplexes",
    phone: "+91 98230 45612",
    email: "priya@auraprime.com",
    badge: "Fast Responder",
    services: ["Private site visits", "Township review", "Investor portfolio management"],
    languages: ["English", "Hindi", "Marathi"],
    bio: "Priya guides clients through top residential communities in Pune's IT and upscale lifestyle hubs like Koregaon Park, Kalyani Nagar, and Baner.",
    responseTime: "< 10 mins",
    featuredListings: [
      {
        id: 601,
        title: "Boutique 3.5 BHK Penthouse",
        price: "₹ 2.95 Cr",
        location: "Koregaon Park, Pune",
        type: "Sale",
        beds: 3,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
      },
    ],
    reviews: [
      {
        author: "Manoj Deshpande",
        date: "1 month ago",
        rating: 5,
        comment: "Priya arranged the tour within 2 hours of booking. Very attentive and courteous.",
      },
    ],
    subscriptionTier: "FREE_VERIFIED",
    isHomepageFeatured: false,
  },
];

export function getAgentById(id: string): Agent | undefined {
  return ALL_AGENTS.find((agent) => agent.id === id);
}

export function getAllAgentIds(): string[] {
  return ALL_AGENTS.map((agent) => agent.id);
}

export function getAgentsByCity(city: string): Agent[] {
  return ALL_AGENTS.filter((agent) => agent.city.toLowerCase() === city.toLowerCase());
}

export function getHomepageFeaturedAgents(city?: string): Agent[] {
  const featured = ALL_AGENTS.filter((agent) => agent.isHomepageFeatured);
  if (!city) return featured;
  const inCity = featured.filter((agent) => agent.city.toLowerCase() === city.toLowerCase());
  return inCity.length ? inCity : featured;
}

export function getSimilarAgents(currentAgentId: string, city: string, limit: number = 3): Agent[] {
  const sameCity = ALL_AGENTS.filter(
    (agent) => agent.id !== currentAgentId && agent.city.toLowerCase() === city.toLowerCase()
  );
  if (sameCity.length >= limit) return sameCity.slice(0, limit);
  const others = ALL_AGENTS.filter(
    (agent) => agent.id !== currentAgentId && agent.city.toLowerCase() !== city.toLowerCase()
  );
  return [...sameCity, ...others].slice(0, limit);
}

