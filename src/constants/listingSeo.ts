// SEO content for every "list with Awasio" page: the public listing flows (property, project, flatmate)
// and the landing pages for flows that live behind /dashboard (interiors, stays, construction, pandit,
// advisors), which Google can't index. Rendered by <ListingSeoContent /> as real server HTML.

import { PROPERTY_CATEGORY_PAGES, type PropertyCategoryKey } from "./propertyListingPages";

/** Classification a property category page pre-selects in the listing form (form context values). */
export type ListingPreset = {
  listingType?: "RENT" | "SELL" | "PG";
  resCom?: "RESIDENTIAL" | "COMMERCIAL";
  propertySubTypeSlug?: string;
  propertySubCategorySlug?: string;
};

export type ListingSeoKey =
  | PropertyCategoryKey
  | "property"
  | "project"
  | "flatmate"
  | "interior"
  | "stay"
  | "construction"
  | "architect"
  | "pandit"
  | "advisor";

export interface ListingSeo {
  key: ListingSeoKey;
  /** Public, indexable URL of this page. */
  path: string;
  /** Where "Start listing" goes (the actual flow). Same as `path` when the flow is on the page. */
  ctaHref: string;
  ctaLabel: string;
  /** Property category pages: the listing form opens pre-set to this. */
  preset?: ListingPreset;
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
  /** Extra long-form sections (real visible copy for search terms; `lang: "hi"` for Hindi). */
  guides?: { heading: string; lang?: string; paragraphs: string[] }[];
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
  ...PROPERTY_CATEGORY_PAGES,
  property: {
    key: "property",
    path: "/post-property-free",
    ctaHref: "/post-property-free",
    ctaLabel: "Post property free",
    navLabel: "Post property free",
    title: "Free Property Listing: Post Flat, House & Apartment for Rent or Sale",
    description:
      "Free property listing: post your flat, house, plot, shop, office or PG for rent or sale in minutes. No brokerage, 0% commission. मुफ्त प्रॉपर्टी लिस्टिंग।",
    keywords: [
      "free property listing", "property listing", "post property free", "list property online", "list property for rent",
      "list property for sale", "post property for rent free", "sell property online", "rent out flat online",
      "property listing site india", "post property without broker", "free classifieds property",
      "flat listing", "free flat listing", "apartment listing", "apartment listing free", "rental listing", "free rental listing",
      "sell listing", "property sell listing", "house listing", "house for rent listing", "post flat for rent", "post apartment for sale",
      "rent my flat", "sell my house online", "list my property", "free property ad", "property listing website free",
      "plot listing", "free plot listing", "land listing", "sell plot online", "residential plot for sale listing", "farmhouse listing",
      "commercial property listing", "commercial space listing", "free commercial property listing", "office space listing",
      "office space for rent listing", "coworking space listing", "list coworking space", "co-working space for rent",
      "shop listing", "shop for rent listing", "showroom for rent", "warehouse listing", "godown for rent listing",
      "industrial property listing", "pg listing", "free pg listing", "hostel listing", "1 rk for rent", "studio apartment listing",
      "builder floor listing", "villa listing", "independent house for sale listing",
      "प्लॉट बेचें", "जमीन बेचनी है", "दुकान किराये पर दें", "ऑफिस किराये पर दें", "गोदाम किराये पर", "पीजी लिस्टिंग",
      "plot bechna hai", "dukan kiraye par deni hai",
      "प्रॉपर्टी लिस्टिंग", "फ्री प्रॉपर्टी लिस्टिंग", "मकान किराये पर दें", "फ्लैट किराये पर दें", "प्रॉपर्टी बेचें",
      "मकान बेचना है", "किराये के लिए मकान पोस्ट करें", "बिना ब्रोकर के प्रॉपर्टी", "makan kiraye par dena hai", "property bechni hai",
    ],
    h1: "Free Property Listing: Post Your Flat, Apartment or House for Rent or Sale",
    intro:
      "Awasio is a free property listing site for owners and brokers. Post a flat listing, apartment listing, house, villa, PG, plot, shop or office as a rental listing or a sell listing, and reach verified tenants and buyers directly, with no listing fee and 0% commission to Awasio.",
    steps: [
      { title: "Add property details", text: "Pick rent or sale, the property type, location, size, price and amenities." },
      { title: "Upload photos", text: "Add clear photos of every room. Listings with photos get far more enquiries." },
      { title: "Go live and get enquiries", text: "After a quick quality check your listing goes live and verified tenants or buyers contact you directly." },
    ],
    benefits: [
      { title: "100% free listing", text: "Posting a property costs nothing, and every new account gets 1,000 free credits." },
      { title: "No brokerage, 0% commission", text: "Deal directly with tenants and buyers. Awasio takes no cut of your rent or sale." },
      { title: "Verified enquiries", text: "Every enquiry comes from a phone-verified user, so fewer time-wasters." },
      { title: "All property types", text: "Flats, houses, villas, builder floors, PG, plots and land, shops, offices, co-working spaces and warehouses." },
    ],
    audience: "Property owners, landlords, brokers and agents listing residential or commercial property anywhere in India.",
    faqs: [
      { q: "Is property listing free on Awasio?", a: "Yes. Posting a property for rent or sale on Awasio is free, and Awasio charges 0% commission on the deal." },
      { q: "How do I list my property online?", a: "Open Post Property, choose rent or sale, fill in the location, price and details, upload photos and submit. Most listings go live after a short quality check." },
      { q: "Can I post my property without a broker?", a: "Yes. Owners list directly and tenants or buyers contact them directly, so there is no brokerage." },
      { q: "Which properties can I list?", a: "Residential: flats and apartments, 1 RK and studio flats, serviced flats, independent houses and villas (kothi), builder floors, farmhouses, and residential plots. PG / hostel: private rooms, shared rooms and beds. Commercial: office space (ready to move, bare shell and co-working), shops and showrooms, commercial plots and land, warehouses and godowns, industrial property and hospitality property." },
      { q: "Can I list a plot or land for sale for free?", a: "Yes. Choose Sell, pick Plot / Land (residential or commercial), enter the plot area, dimensions, facing and expected price, and add photos. Plot listing on Awasio is free." },
      { q: "Can I list a co-working space or office for rent?", a: "Yes. Under Commercial → Office you can list a ready-to-move office, a bare-shell office or a co-working space, with seats, cabins, meeting rooms and the monthly rent." },
      { q: "How long does it take for my listing to go live?", a: "Usually within a few hours. Listings are checked for accurate details and genuine photos before they are published." },
      { q: "Can brokers and agents list properties too?", a: "Yes. Brokers and agents can post properties and manage all their listings from one dashboard." },
      { q: "How do I post a free flat or apartment listing for rent?", a: "Choose Rent, pick Flat / Apartment, enter the society or locality, BHK, rent, deposit and furnishing, add photos and submit. Your rental listing is free and tenants contact you directly." },
      { q: "How do I create a sell listing for my house or flat?", a: "Choose Sell, enter the property type, location, area and expected price, add photos and submit. Buyers see your sell listing and call or message you directly, with no brokerage." },
      { q: "क्या Awasio पर प्रॉपर्टी लिस्ट करना फ्री है?", a: "हाँ। Awasio पर मकान, फ्लैट या दुकान किराये पर देने या बेचने के लिए लिस्टिंग पूरी तरह फ्री है, और कोई कमीशन या ब्रोकरेज नहीं लगता।" },
      { q: "मकान या फ्लैट किराये पर कैसे दें?", a: "Post Property खोलें, Rent चुनें, लोकेशन, किराया, BHK और फोटो डालें और सबमिट करें। किरायेदार सीधे आपसे संपर्क करेंगे।" },
    ],
    guides: [
      {
        heading: "Flat listing, apartment listing and house listing",
        paragraphs: [
          "Whether you own a 1 BHK flat, a 3 BHK apartment in a gated society, a builder floor or an independent house, you can post it on Awasio for free. Add the society or locality, carpet area, floor, facing, furnishing and parking so tenants and buyers can filter to your listing.",
          "Flat and apartment listings with clear photos of every room, the kitchen, bathrooms and the view get many more enquiries than listings without photos. You can edit price and details anytime from your dashboard.",
        ],
      },
      {
        heading: "Free rental listing: rent out your property without a broker",
        paragraphs: [
          "A rental listing on Awasio lets you set the monthly rent, security deposit, maintenance, available-from date and preferred tenants (family, bachelors or company lease). Verified tenants contact you directly, so there is no brokerage for you or your tenant.",
          "Once you find a tenant, you can make a rental agreement and rent receipts with Awasio's free tools.",
        ],
      },
      {
        heading: "Sell listing: sell your flat, house or plot online",
        paragraphs: [
          "Create a sell listing with the expected price, area, age of property, ownership and approvals. Buyers searching your city and locality find your property and reach you directly, with 0% commission to Awasio.",
          "Plots, land, shops, offices and warehouses can be listed for sale or rent the same way.",
        ],
      },
      {
        heading: "Plot listing: sell or lease residential and commercial land",
        paragraphs: [
          "List a residential plot, commercial plot, farmhouse or agricultural land with the plot area, length and breadth, facing, road width, boundary wall and approvals. Buyers looking for plots in your city find your plot listing and contact you directly.",
        ],
      },
      {
        heading: "Commercial space, office and co-working space listing",
        paragraphs: [
          "Post a free commercial property listing for an office space, co-working space, shop, showroom, warehouse, godown or industrial shed, for rent, lease or sale. Add the carpet area, floor, washrooms, parking, power backup and fire safety details that businesses check first.",
          "Co-working operators and landlords can list ready-to-move offices, bare-shell offices and co-working spaces with seats, cabins and meeting rooms, and get enquiries from startups and companies directly.",
        ],
      },
      {
        heading: "PG, hostel and 1 RK listing",
        paragraphs: [
          "PG owners can list private rooms, shared rooms or single beds with food, electricity, curfew and gender preference. Studio, 1 RK and serviced flats can be listed for rent the same way.",
        ],
      },
      {
        heading: "मुफ्त में प्रॉपर्टी लिस्ट करें: मकान, फ्लैट किराये पर दें या बेचें",
        lang: "hi",
        paragraphs: [
          "Awasio पर आप अपना मकान, फ्लैट, अपार्टमेंट, कोठी, बिल्डर फ्लोर, PG, प्लॉट या जमीन, दुकान, शोरूम, ऑफिस, को-वर्किंग स्पेस या गोदाम बिल्कुल फ्री में किराये पर देने या बेचने के लिए लिस्ट कर सकते हैं। कोई लिस्टिंग फीस नहीं, कोई ब्रोकरेज नहीं, और Awasio कोई कमीशन नहीं लेता।",
          "किराये के लिए किराया, सिक्योरिटी डिपॉजिट और किरायेदार की पसंद (फैमिली, बैचलर) डालें। बेचने के लिए कीमत, एरिया और फोटो डालें। वेरिफाइड किरायेदार और खरीदार सीधे आपको कॉल या मैसेज करेंगे।",
        ],
      },
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
    title: "Free Interior Listing: List Your Interior Design Business Free",
    description:
      "Free interior designer listing on Awasio. List your interior business free, show portfolio, packages and prices, and get interior design leads from homeowners.",
    keywords: [
      "list interior design business", "interior designer listing", "get interior design leads", "interior designer registration",
      "list modular kitchen business", "interior design clients", "free business listing interior designer", "home interior leads",
      "free interior listing", "interior listing free", "interior listing", "free interior designer listing",
      "interior designer listing free", "list interior business free", "list interior business for free",
      "free listing for interior designers", "interior designer free listing", "interior design business listing free",
      "free interior design listing site", "interior listing site", "interior designer listing site india",
      "register interior design business free", "free interior designer registration", "post interior business free",
      "add interior business free", "interior company listing free", "interior decorator listing free",
      "modular kitchen listing free", "free leads for interior designers", "interior designer directory free listing",
      "interior designer free listing kaise kare", "interior business free me list kare", "interior designer listing free mein",
      "इंटीरियर डिज़ाइनर फ्री लिस्टिंग", "इंटीरियर बिज़नेस फ्री लिस्ट करें", "फ्री इंटीरियर लिस्टिंग",
    ],
    h1: "List Your Interior Design Business Free and Get Client Leads",
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
      { q: "Where can I get a free interior listing?", a: "On Awasio. Interior designers, decorators, modular kitchen makers and interior companies get a free interior listing with portfolio, packages and city pages." },
      { q: "Is interior designer listing free for interior companies too?", a: "Yes. Free interior designer listing is open to freelancers, studios and interior companies alike, with no listing fee." },
      { q: "इंटीरियर बिज़नेस फ्री में कैसे लिस्ट करें?", a: "Awasio पर प्रोफ़ाइल बनाएं, अपनी सेवाएं, शहर, पोर्टफोलियो और पैकेज जोड़ें। लिस्टिंग पूरी तरह फ्री है और ग्राहक सीधे कॉल या WhatsApp करते हैं।" },
    ],
    guides: [
      {
        heading: "Free interior listing for designers, decorators and interior companies",
        paragraphs: [
          "Looking for a free interior listing site? Awasio gives interior designers a free listing with no fee to list, no fee to publish and no commission on projects. List your interior business free, whether you are a freelance interior designer, an interior decorator, a modular kitchen and wardrobe maker or a turnkey interior company.",
          "Your free interior designer listing includes a portfolio of completed projects, 1 BHK, 2 BHK and 3 BHK packages, starting prices, design styles and the cities you serve. Homeowners who just bought or rented a home find your listing and send interior design leads directly by call, WhatsApp or quote request.",
        ],
      },
      {
        heading: "इंटीरियर डिज़ाइनर फ्री लिस्टिंग",
        lang: "hi",
        paragraphs: [
          "Awasio पर इंटीरियर बिज़नेस फ्री में लिस्ट करें। इंटीरियर डिज़ाइनर, डेकोरेटर, मॉड्यूलर किचन और इंटीरियर कंपनियां बिना किसी फीस के अपनी लिस्टिंग बना सकती हैं।",
          "अपना पोर्टफोलियो, पैकेज और रेट जोड़ें और अपने शहर के ग्राहकों से सीधे इंटीरियर डिज़ाइन लीड पाएं।",
        ],
      },
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
  architect: {
    key: "architect",
    path: "/list-architect-naksha-business",
    ctaHref: "/dashboard/architect-profile",
    ctaLabel: "List your practice free",
    navLabel: "List as architect / naksha designer",
    title: "Architect & Naksha Listing Free: Get House Plan Leads",
    description:
      "Architects, civil engineers and naksha designers: list free on Awasio. Show naksha prices, 3D elevations and plans by plot size and get leads from plot owners.",
    keywords: [
      "architect listing", "free architect listing", "list architect business", "architect leads", "naksha designer listing",
      "house naksha leads", "house plan design leads", "civil engineer listing", "3d elevation design leads", "get architecture clients",
      "architect registration online", "list naksha business free", "map approval drawings leads", "home planning business listing",
      "ghar ka naksha leads", "naksha banane ka kaam", "naksha business free listing", "architect ke liye leads kaise paye",
      "नक्शा बनाने वाले", "घर का नक्शा", "आर्किटेक्ट लिस्टिंग फ्री", "नक्शा डिज़ाइनर",
      // Both word orders of every core phrase.
      "architect listing free", "free listing for architects", "architects free listing", "list architect business free",
      "list architecture firm free", "architecture firm listing", "architecture firm listing free", "free architecture firm listing",
      "architect directory listing", "free architect directory listing", "architect listing site", "architect listing site india",
      "architect registration free", "free architect registration", "register architect business online", "register as architect online free",
      "naksha listing", "free naksha listing", "naksha listing free", "naksha designer listing free", "free naksha designer listing",
      "naksha business listing", "list naksha business", "naksha maker listing", "free listing for naksha designers",
      "house plan designer listing", "free house plan designer listing", "house plan designer listing free", "home planner listing",
      "home planning listing free", "free home planning listing", "house design business listing", "free house design listing",
      "civil engineer listing free", "free civil engineer listing", "civil engineer registration free", "structural engineer listing",
      "free structural engineer listing", "structural engineer listing free", "list civil engineering business", "civil engineer directory listing",
      "draftsman listing", "free draftsman listing", "autocad draftsman listing", "elevation designer listing", "3d elevation designer listing free",
      // Lead phrases, both ways.
      "leads for architects", "architect leads free", "free architect leads", "architecture leads", "architecture client leads",
      "naksha leads", "free naksha leads", "leads for naksha designers", "house plan leads", "leads for house plan designers",
      "civil engineer leads", "leads for civil engineers", "structural design leads", "3d elevation leads", "elevation design leads",
      "map approval leads", "building plan approval leads", "how to get clients for architects", "how to get architecture clients",
      "how to get naksha clients", "get clients for civil engineer", "plot owner leads", "house design enquiries",
      // Hinglish.
      "naksha listing free me", "naksha banane wale ki listing", "naksha designer free listing kaise kare", "architect free listing kaise kare",
      "ghar ka naksha banane wala", "naksha banwana hai", "makan ka naksha", "naksha pass karwana", "naksha ke liye clients",
      "civil engineer ke liye leads", "engineer listing free me", "naksha ka kaam chahiye", "naksha business kaise badhaye",
      // Hindi.
      "नक्शा लिस्टिंग फ्री", "फ्री नक्शा लिस्टिंग", "नक्शा डिज़ाइनर लिस्टिंग", "आर्किटेक्ट फ्री लिस्टिंग", "फ्री आर्किटेक्ट लिस्टिंग",
      "सिविल इंजीनियर लिस्टिंग", "मकान का नक्शा बनाने वाले", "नक्शा पास कराने वाले", "घर का नक्शा लीड", "आर्किटेक्ट के लिए ग्राहक",
    ],
    h1: "List Your Architecture or Naksha Practice Free and Get Plot Owner Leads",
    intro:
      "People who just bought a plot on Awasio need a naksha first. List free as a COA-registered architect, a civil or structural engineer, or a naksha designer, show your packages and plans by plot size and facing, and receive enquiries directly.",
    steps: [
      { title: "Create your profile", text: "Choose architect, engineer or naksha designer, then add services, prices and cities." },
      { title: "Add your designs", text: "Plans and 3D elevations with plot size (e.g. 30×40), facing and floors." },
      { title: "Get verified and receive leads", text: "Architects are checked on the COA register. Plot owners then request quotes directly." },
    ],
    benefits: [
      { title: "Free listing", text: "List free and boost your profile with 1,000 free credits." },
      { title: "Plot owners ready to build", text: "Reach people who need a naksha, elevation or map approval now." },
      { title: "Searched by plot size & facing", text: "People find plans like '30×40 east facing'; your portfolio shows up for them." },
      { title: "Work from anywhere", text: "Deliver drawings online and appear in every city, not just your own." },
    ],
    audience: "COA-registered architects and firms, civil and structural engineers, naksha designers, draftsmen and home planning studios.",
    faqs: [
      { q: "Is listing an architecture or naksha business free?", a: "Yes. Creating and publishing your listing on Awasio is free." },
      { q: "Can I list if I am not a registered architect?", a: "Yes. Civil engineers and naksha designers can list. Only COA-registered architects are shown with the title 'Architect', as required by the Architects Act, 1972." },
      { q: "How are architects verified?", a: "We check your COA registration number on the Council of Architecture register before your profile goes live, and show a 'COA verified' badge." },
      { q: "Can I get clients from other cities?", a: "Yes. Turn on 'deliver drawings online' and you appear when people search any city." },
      { q: "नक्शा बनाने वाले Awasio पर लिस्टिंग कैसे करें?", a: "प्रोफ़ाइल बनाएं, अपनी सेवाएं (2D नक्शा, 3D एलिवेशन, नक्शा पास), दाम और प्लॉट साइज़ के हिसाब से डिज़ाइन जोड़ें। लिस्टिंग फ्री है और ग्राहक सीधे संपर्क करते हैं।" },
      { q: "Where can I get a free architect listing?", a: "On Awasio. Architects, architecture firms, civil and structural engineers and naksha designers get a free listing with packages, a portfolio of house plans and city pages." },
      { q: "Is naksha designer listing free?", a: "Yes. Free naksha listing is open to naksha designers, draftsmen and home planners. There is no fee to list or publish." },
      { q: "Can civil engineers get a free listing?", a: "Yes. Civil engineer listing is free. Add your qualification, services such as structural drawings or estimates, and whether you can sign drawings for map approval." },
      { q: "How do architects get leads for house plans?", a: "List free, add your naksha and 3D elevation prices and designs with plot size and facing. Plot owners searching your city, or any city if you work online, send enquiries directly." },
      { q: "Naksha designer free listing kaise kare?", a: "Awasio par free profile banayein, services (2D naksha, 3D elevation, naksha pass) aur rate daalein, plot size ke hisaab se designs jodein. Grahak seedhe call ya enquiry karte hain." },
    ],
    guides: [
      {
        heading: "Free architect listing and naksha designer listing",
        paragraphs: [
          "Looking for a free architect listing site? Awasio gives architects, architecture firms, civil engineers, structural engineers and naksha designers a free listing with no fee to list and no commission on projects. Whether you want an architect listing, a naksha listing or a house plan designer listing, it takes about five minutes.",
          "Your free listing shows naksha and 3D elevation packages per sq.ft or at a fixed price, house plans by plot size such as 30×40 or 40×60, facing (east, west, north, south), floors and vastu. Plot owners searching for a house naksha, building plan or map approval drawings find you and send leads directly.",
        ],
      },
      {
        heading: "Architect leads, naksha leads and civil engineer leads",
        paragraphs: [
          "The hardest part of running a design practice is finding clients. Awasio sends leads for architects, naksha leads for designers and civil engineer leads from people who have just bought a plot and want to build. Each enquiry includes the plot size, facing, floors, BHK and the services they need.",
          "Turn on online delivery and you appear in every city, so a naksha designer in one town can get house plan leads from across India.",
        ],
      },
      {
        heading: "नक्शा डिज़ाइनर और आर्किटेक्ट फ्री लिस्टिंग",
        lang: "hi",
        paragraphs: [
          "Awasio पर घर का नक्शा बनाने वाले, आर्किटेक्ट, सिविल इंजीनियर और नक्शा डिज़ाइनर फ्री में लिस्टिंग कर सकते हैं। 2D नक्शा, 3D एलिवेशन, स्ट्रक्चरल ड्रॉइंग और नक्शा पास कराने की सेवाएं और दाम जोड़ें।",
          "प्लॉट खरीदने वाले लोग अपने प्लॉट साइज़ और दिशा के हिसाब से नक्शा ढूंढते हैं और सीधे आपसे संपर्क करते हैं।",
        ],
      },
    ],
    cityHeading: "Architects & naksha designers by city",
    cityPath: (c) => `/architects/${c}`,
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
  "property", "project", "flatmate", "interior", "stay", "construction", "architect", "pandit", "advisor",
];
