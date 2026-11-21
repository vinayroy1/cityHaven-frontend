// SEO content for every "list with Awasio" page: the public listing flows (property, project, flatmate)
// and the landing pages for flows that live behind /dashboard (interiors, stays, construction, pandit,
// advisors), which Google can't index. Rendered by <ListingSeoContent /> as real server HTML.

export type ListingSeoKey =
  | "property"
  | "project"
  | "flatmate"
  | "interior"
  | "stay"
  | "construction"
  | "pandit"
  | "advisor";

export interface ListingSeo {
  key: ListingSeoKey;
  /** Public, indexable URL of this page. */
  path: string;
  /** Where "Start listing" goes (the actual flow). Same as `path` when the flow is on the page. */
  ctaHref: string;
  ctaLabel: string;
  /** Short name used in the cross-links ("List your hotel"). */
  navLabel: string;
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  intro: string;
  steps: { title: string; text: string }[];
  benefits: { title: string; text: string }[];
  audience: string;
  faqs: { q: string; a: string }[];
  /** City links: label + URL of that city's public listings for this category. */
  cityHeading: string;
  cityPath: (slug: string) => string;
  /** Cities to link; `slug` must be the public URL slug for this category. */
  citySlugs?: "property" | "directory";
}

const PROPERTY_CITIES = [
  ["Mumbai", "mumbai"], ["Delhi", "new-delhi"], ["Bengaluru", "bengaluru"], ["Hyderabad", "hyderabad"], ["Pune", "pune"],
  ["Chennai", "chennai"], ["Gurugram", "gurugram"], ["Noida", "noida"], ["Kolkata", "kolkata"], ["Ahmedabad", "ahmedabad"],
] as const;
const DIRECTORY_CITIES = [
  ["Mumbai", "mumbai"], ["Delhi", "delhi"], ["Bengaluru", "bengaluru"], ["Hyderabad", "hyderabad"], ["Pune", "pune"],
  ["Chennai", "chennai"], ["Gurugram", "gurugram"], ["Noida", "noida"], ["Kolkata", "kolkata"], ["Ahmedabad", "ahmedabad"],
] as const;
export const listingCities = (s: ListingSeo) => (s.citySlugs === "property" ? PROPERTY_CITIES : DIRECTORY_CITIES);

export const LISTING_SEO: Record<ListingSeoKey, ListingSeo> = {
  property: {
    key: "property",
    path: "/propertyListing",
    ctaHref: "/propertyListing",
    ctaLabel: "Post property free",
    navLabel: "Post property free",
    title: "Free Property Listing: Post Property for Rent or Sale Online",
    description:
      "List your property for free on Awasio. Post a flat, house, PG, plot or office for rent or sale in minutes, with no brokerage and 0% commission. Owners and brokers get verified tenant and buyer enquiries.",
    keywords: [
      "free property listing", "property listing", "post property free", "list property online", "list property for rent",
      "list property for sale", "post property for rent free", "sell property online", "rent out flat online",
      "property listing site india", "post property without broker", "free classifieds property",
    ],
    h1: "Free Property Listing: Post Your Property for Rent or Sale",
    intro:
      "Awasio is a free property listing site for owners and brokers. Post a flat, independent house, villa, PG, plot, shop or office for rent or sale and reach verified tenants and buyers directly, with no listing fee and 0% commission to Awasio.",
    steps: [
      { title: "Add property details", text: "Pick rent or sale, the property type, location, size, price and amenities." },
      { title: "Upload photos", text: "Add clear photos of every room. Listings with photos get far more enquiries." },
      { title: "Go live and get enquiries", text: "After a quick quality check your listing goes live and verified tenants or buyers contact you directly." },
    ],
    benefits: [
      { title: "100% free listing", text: "Posting a property costs nothing, and every new account gets 1,000 free credits." },
      { title: "No brokerage, 0% commission", text: "Deal directly with tenants and buyers. Awasio takes no cut of your rent or sale." },
      { title: "Verified enquiries", text: "Every enquiry comes from a phone-verified user, so fewer time-wasters." },
      { title: "All property types", text: "Apartments, builder floors, villas, PG / co-living, plots, shops, offices and warehouses." },
    ],
    audience: "Property owners, landlords, brokers and agents listing residential or commercial property anywhere in India.",
    faqs: [
      { q: "Is property listing free on Awasio?", a: "Yes. Posting a property for rent or sale on Awasio is free, and Awasio charges 0% commission on the deal." },
      { q: "How do I list my property online?", a: "Open Post Property, choose rent or sale, fill in the location, price and details, upload photos and submit. Most listings go live after a short quality check." },
      { q: "Can I post my property without a broker?", a: "Yes. Owners list directly and tenants or buyers contact them directly, so there is no brokerage." },
      { q: "Which properties can I list?", a: "Flats and apartments, independent houses, builder floors, villas, PG and co-living rooms, plots and land, and commercial spaces such as shops, offices and warehouses." },
      { q: "How long does it take for my listing to go live?", a: "Usually within a few hours. Listings are checked for accurate details and genuine photos before they are published." },
      { q: "Can brokers and agents list properties too?", a: "Yes. Brokers and agents can post properties and manage all their listings from one dashboard." },
    ],
    cityHeading: "Browse property listings by city",
    cityPath: (c) => `/rent/${c}`,
    citySlugs: "property",
  },
  project: {
    key: "project",
    path: "/post-project",
    ctaHref: "/post-project",
    ctaLabel: "List your project",
    navLabel: "List a new project",
    title: "List Your Real Estate Project Free: Builders & Developers",
    description:
      "Builders and developers can list new residential and commercial projects on Awasio for free. Add towers, floor plans, prices, RERA number and brochure, and get direct leads from verified home buyers.",
    keywords: [
      "list real estate project", "post new project", "builder project listing", "list project online free",
      "real estate project marketing", "new launch project listing", "developer listing portal", "rera project listing",
    ],
    h1: "List Your New Real Estate Project for Free",
    intro:
      "Showcase new launches, under-construction and ready-to-move projects to home buyers searching on Awasio. Add configurations, prices, amenities, RERA details and brochures, and receive leads directly from verified buyers.",
    steps: [
      { title: "Add project basics", text: "Project name, builder, location, status, RERA number and possession date." },
      { title: "Add configurations and media", text: "BHK types, sizes and prices, plus photos, floor plans and the brochure." },
      { title: "Publish and receive leads", text: "Your project appears in New Projects search and buyers contact you directly." },
    ],
    benefits: [
      { title: "Free project page", text: "A dedicated, search-friendly page for every project with all configurations." },
      { title: "Direct buyer leads", text: "Enquiries go straight to your sales team, not to a middleman." },
      { title: "RERA-ready", text: "Show your RERA registration so buyers trust the listing." },
      { title: "Boost when you need it", text: "Use your 1,000 free credits to feature the project in its city." },
    ],
    audience: "Builders, developers, channel partners and marketing teams with residential, commercial or township projects.",
    faqs: [
      { q: "Is it free to list a project on Awasio?", a: "Yes. Builders and developers can list projects free and use 1,000 free credits to promote them." },
      { q: "What details do I need to list a project?", a: "Project name, location, status, configurations with sizes and prices, photos, and ideally the RERA number and brochure." },
      { q: "Can I list under-construction and new launch projects?", a: "Yes. New launch, under-construction and ready-to-move projects can all be listed." },
      { q: "Who receives the buyer enquiries?", a: "Enquiries go directly to the contact you add on the project, usually your sales team." },
    ],
    cityHeading: "New projects by city",
    cityPath: (c) => `/new-projects/${c}`,
    citySlugs: "property",
  },
  flatmate: {
    key: "flatmate",
    path: "/flatmates/post",
    ctaHref: "/flatmates/post",
    ctaLabel: "Post room or requirement",
    navLabel: "Find a flatmate",
    title: "Find Flatmates & Post Room for Rent Free: No Brokerage",
    description:
      "Post a room for rent or your flatmate requirement for free on Awasio. Find compatible flatmates and roommates by budget, location and lifestyle with zero brokerage.",
    keywords: [
      "find flatmate", "flatmate finder", "room for rent", "post room for rent free", "roommate finder",
      "flat sharing", "shared accommodation", "need flatmate", "room on sharing basis", "flatmates without brokerage",
    ],
    h1: "Find a Flatmate or Post a Room for Rent: Free",
    intro:
      "Have a spare room or need someone to share a flat with? Post it free on Awasio and match with flatmates by budget, area, move-in date and lifestyle, with no brokerage.",
    steps: [
      { title: "Room or requirement", text: "Say whether you have a room to share or you're looking for one." },
      { title: "Add budget and preferences", text: "Rent share, location, move-in date, food and lifestyle preferences." },
      { title: "Connect directly", text: "Interested flatmates contact you directly. No broker in between." },
    ],
    benefits: [
      { title: "Free to post", text: "Posting a room or requirement is free, with 1,000 free credits on signup." },
      { title: "Zero brokerage", text: "Talk to flatmates directly and split the rent, not a broker's fee." },
      { title: "Lifestyle matching", text: "Filter by food habits, smoking, pets, working hours and gender preference." },
      { title: "Verified people", text: "Every member is phone-verified for safer flat sharing." },
    ],
    audience: "Working professionals, students and anyone renting out a room or looking for shared accommodation.",
    faqs: [
      { q: "Is posting a flatmate requirement free?", a: "Yes. Posting a room for rent or a flatmate requirement on Awasio is free." },
      { q: "How do I find a flatmate near my office?", a: "Post your requirement with your preferred area and budget, or browse flatmate listings for your city and filter by locality." },
      { q: "Is there any brokerage?", a: "No. You contact flatmates directly and there is no brokerage." },
      { q: "Can I list a single room in my flat?", a: "Yes. You can list one room or a bed in a shared room with the rent share and move-in date." },
    ],
    cityHeading: "Flatmates by city",
    cityPath: (c) => `/flatmate/${c}`,
    citySlugs: "property",
  },
  interior: {
    key: "interior",
    path: "/list-interior-business",
    ctaHref: "/dashboard/interior-profile",
    ctaLabel: "List your interior business free",
    navLabel: "List your interior business",
    title: "List Your Interior Design Business Free: Get Client Leads",
    description:
      "Interior designers, modular kitchen and wardrobe makers and turnkey studios: list your business free on Awasio. Show your portfolio, packages and prices and get leads from homeowners in your city.",
    keywords: [
      "list interior design business", "interior designer listing", "get interior design leads", "interior designer registration",
      "list modular kitchen business", "interior design clients", "free business listing interior designer", "home interior leads",
    ],
    h1: "List Your Interior Design Business and Get Client Leads",
    intro:
      "Homeowners on Awasio are looking for interior designers right after they buy or rent a home. List your studio or freelance practice free, show your portfolio and starting prices, and receive enquiries directly from clients in your city.",
    steps: [
      { title: "Create your profile", text: "Business or individual, services, design styles, cities you serve and starting rates." },
      { title: "Add portfolio and packages", text: "Completed projects with photos, plus 1 BHK / 2 BHK / 3 BHK packages." },
      { title: "Get verified and receive leads", text: "After verification your listing goes live and clients call, WhatsApp or request quotes." },
    ],
    benefits: [
      { title: "Free listing", text: "Listing your interior business is free, with 1,000 free credits to boost it." },
      { title: "High-intent clients", text: "Reach people who have just bought or rented a home and need interiors." },
      { title: "Portfolio that sells", text: "Showcase projects, packages, materials, brands and warranties on one page." },
      { title: "Verified badge", text: "Verified studios stand out and earn more trust from clients." },
    ],
    audience: "Interior designers, design studios, modular kitchen and wardrobe makers, turnkey interior firms and freelance designers.",
    faqs: [
      { q: "Is listing an interior design business on Awasio free?", a: "Yes. Creating and publishing your interior design listing is free." },
      { q: "How do I get interior design leads?", a: "List your business with portfolio photos, packages and the cities you serve. Clients searching your city can call, WhatsApp or request a quote directly." },
      { q: "Can freelance interior designers list?", a: "Yes. Both individual designers and studios or companies can list." },
      { q: "What do I need to get verified?", a: "Basic business or identity documents. Verified listings get a badge and rank better in search." },
    ],
    cityHeading: "Interior designers by city",
    cityPath: (c) => `/interior-designers/${c}`,
  },
  stay: {
    key: "stay",
    path: "/list-your-hotel",
    ctaHref: "/dashboard/stays/new",
    ctaLabel: "List your property free",
    navLabel: "List your hotel or homestay",
    title: "List Your Hotel, Homestay or Guest House Free: Direct Bookings",
    description:
      "List your hotel, homestay, guest house, resort or service apartment on Awasio for free. Show rooms, prices and photos and get direct enquiries from guests with no commission.",
    keywords: [
      "list my hotel", "list hotel online free", "list homestay", "list guest house", "hotel listing site",
      "homestay registration", "get direct hotel bookings", "list resort online", "service apartment listing", "zero commission hotel listing",
    ],
    h1: "List Your Hotel, Homestay or Guest House for Free",
    intro:
      "Reach travellers and families looking for a place to stay. List your hotel, homestay, guest house, resort or service apartment on Awasio free, and receive direct enquiries without paying commission on every booking.",
    steps: [
      { title: "Add your property", text: "Property type, location, amenities, check-in rules and contact details." },
      { title: "Add rooms and photos", text: "Room types, prices and clear photos of rooms and common areas." },
      { title: "Go live and get guests", text: "After a quick review, guests find you in search and contact you directly." },
    ],
    benefits: [
      { title: "Free to list", text: "No listing fee, and 1,000 free credits to feature your property." },
      { title: "No booking commission", text: "Guests contact you directly, so you keep the full room rate." },
      { title: "All stay types", text: "Hotels, homestays, guest houses, resorts, hostels and service apartments." },
      { title: "Local search visibility", text: "Show up when people search stays in your city or near a landmark." },
    ],
    audience: "Hotel owners, homestay and guest house hosts, resorts, hostels and service apartment operators.",
    faqs: [
      { q: "Is it free to list a hotel on Awasio?", a: "Yes. Listing your hotel, homestay or guest house is free." },
      { q: "Does Awasio charge commission on bookings?", a: "No. Guests contact you directly and Awasio takes no booking commission." },
      { q: "Can I list a homestay or a single room?", a: "Yes. Homestays, guest houses and small properties can be listed, including single rooms." },
      { q: "How do guests contact me?", a: "Guests call, WhatsApp or send an enquiry from your listing, and it reaches you directly." },
    ],
    cityHeading: "Hotels and stays by city",
    cityPath: (c) => `/stays/${c}`,
  },
  construction: {
    key: "construction",
    path: "/list-construction-company",
    ctaHref: "/dashboard/construction-profile",
    ctaLabel: "List your company free",
    navLabel: "List your construction company",
    title: "List Your Construction Company Free: Get House Construction Leads",
    description:
      "Builders, contractors and construction companies: list your business free on Awasio. Show rates per sq.ft, completed homes and warranties and get house construction leads from plot owners.",
    keywords: [
      "list construction company", "construction business listing", "house construction leads", "contractor listing",
      "get construction projects", "builder registration", "civil contractor listing", "turnkey construction leads",
    ],
    h1: "List Your Construction Company and Get Project Leads",
    intro:
      "Plot owners on Awasio are looking for reliable builders to construct their homes. List your construction company or contracting business free, show your rate per sq.ft and completed homes, and receive leads directly.",
    steps: [
      { title: "Create your company profile", text: "Services, rate per sq.ft, cities served, experience and warranty." },
      { title: "Add completed projects", text: "Photos of homes you've built, with size and location." },
      { title: "Get verified and receive leads", text: "Verified companies go live and plot owners request quotes directly." },
    ],
    benefits: [
      { title: "Free listing", text: "List your company free and boost it with 1,000 free credits." },
      { title: "Ready-to-build clients", text: "Reach plot owners actively planning house construction." },
      { title: "Show your rates", text: "Transparent per sq.ft pricing attracts serious enquiries." },
      { title: "Residential and infra", text: "List house construction, civil work, labour contracts or infrastructure work." },
    ],
    audience: "Construction companies, builders, civil and labour contractors, and turnkey house construction firms.",
    faqs: [
      { q: "Is listing my construction company free?", a: "Yes. Listing a construction company or contracting business on Awasio is free." },
      { q: "How do I get house construction leads?", a: "List your company with your rate per sq.ft, cities served and completed homes. Plot owners searching your city request quotes directly." },
      { q: "Can civil and labour contractors list?", a: "Yes. Turnkey builders, civil contractors and labour contractors can all list." },
      { q: "Can infrastructure contractors list?", a: "Yes. Infrastructure and government contractors have a separate category." },
    ],
    cityHeading: "Construction companies by city",
    cityPath: (c) => `/construction-companies/${c}`,
  },
  pandit: {
    key: "pandit",
    path: "/list-pandit-services",
    ctaHref: "/dashboard/pandit-profile",
    ctaLabel: "List your services free",
    navLabel: "List pandit or vastu services",
    title: "List Your Pandit or Vastu Services Free: Get Puja Bookings",
    description:
      "Pandits, purohits and vastu consultants: list your services free on Awasio. Get bookings for griha pravesh, bhoomi pujan, house warming puja and vastu consultations in your city.",
    keywords: [
      "list pandit services", "pandit registration", "pandit for griha pravesh", "get puja bookings",
      "vastu consultant listing", "purohit listing", "online pandit booking register", "vastu consultant registration",
    ],
    h1: "List Your Pandit or Vastu Services and Get Bookings",
    intro:
      "Families moving into a new home book pandits for griha pravesh and other pujas, and vastu consultants for their homes and offices. List your services free on Awasio and receive bookings directly.",
    steps: [
      { title: "Create your profile", text: "Pujas or vastu services you offer, languages, cities and dakshina or fees." },
      { title: "Add experience and photos", text: "Years of experience, tradition, and photos from past ceremonies." },
      { title: "Go live and get bookings", text: "Families find you in search and contact you directly." },
    ],
    benefits: [
      { title: "Free listing", text: "No fee to list, with 1,000 free credits to boost your profile." },
      { title: "Bookings from new homeowners", text: "Reach families buying or moving into new homes." },
      { title: "Pandit and vastu", text: "List puja services, vastu consultation or both." },
      { title: "Direct contact", text: "Families call or WhatsApp you directly." },
    ],
    audience: "Pandits, purohits, priests and vastu consultants serving homes and businesses.",
    faqs: [
      { q: "Is it free to list pandit services on Awasio?", a: "Yes. Pandits and vastu consultants can list their services free." },
      { q: "Which pujas can I list?", a: "Griha pravesh, bhoomi pujan, house warming, Satyanarayan katha, vastu shanti and other ceremonies you perform." },
      { q: "Can vastu consultants list?", a: "Yes. Vastu consultants can list home, office and plot consultations." },
      { q: "How do families contact me?", a: "They call, WhatsApp or send an enquiry from your profile, and it reaches you directly." },
    ],
    cityHeading: "Pandits and vastu consultants by city",
    cityPath: (c) => `/pandit-vastu/${c}`,
  },
  advisor: {
    key: "advisor",
    path: "/become-property-advisor",
    ctaHref: "/dashboard/advisor-profile",
    ctaLabel: "Create your advisor profile",
    navLabel: "Join as a property agent",
    title: "Real Estate Agent Registration: List Your Profile Free",
    description:
      "Real estate agents, brokers and property advisors: create your profile free on Awasio. Show your areas, deals and reviews and get buyer, seller and tenant leads in your city.",
    keywords: [
      "real estate agent registration", "property agent listing", "broker registration", "get real estate leads",
      "property dealer listing", "list as property consultant", "real estate agent profile", "free leads for brokers",
    ],
    h1: "Join Awasio as a Property Agent or Advisor",
    intro:
      "Buyers, sellers and tenants on Awasio look for trusted local agents. Create your free advisor profile, show the areas you cover and your experience, and receive leads directly.",
    steps: [
      { title: "Create your profile", text: "Your name, agency, city, areas you cover and years of experience." },
      { title: "Add listings and specialities", text: "Rent, resale, new projects or commercial, plus your active listings." },
      { title: "Get leads", text: "People searching agents in your area contact you directly." },
    ],
    benefits: [
      { title: "Free profile", text: "Creating an agent profile is free, with 1,000 free credits." },
      { title: "Local leads", text: "Show up when people search agents in your locality." },
      { title: "List properties too", text: "Post and manage all your property listings from the same account." },
      { title: "Build trust", text: "Reviews and a verified badge help you win more clients." },
    ],
    audience: "Real estate agents, brokers, channel partners and property consultants.",
    faqs: [
      { q: "Is agent registration on Awasio free?", a: "Yes. Creating your agent or advisor profile is free." },
      { q: "How do I get real estate leads?", a: "Create your profile with your areas and specialities and list your properties. Buyers and tenants searching your area contact you directly." },
      { q: "Can I list properties as an agent?", a: "Yes. Agents can post properties for rent or sale and manage them from one dashboard." },
      { q: "Do I need RERA registration?", a: "Adding your RERA agent number is recommended and builds trust with clients." },
    ],
    cityHeading: "Property agents by city",
    cityPath: (c) => `/agents/${c}`,
  },
};

export const LISTING_SEO_ORDER: ListingSeoKey[] = [
  "property", "project", "flatmate", "interior", "stay", "construction", "pandit", "advisor",
];
