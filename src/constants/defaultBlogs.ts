import type { BlogPost, BlogCategory, BlogTag, BlogListResponse } from "@/types/blog.types";

export const DEFAULT_CATEGORIES: BlogCategory[] = [
  { id: 1, name: "Buying Guide", slug: "buying-guide", description: "Essential checklists and insights for home buyers across India.", color: "#f43f5e" },
  { id: 2, name: "Rental & Flatmates", slug: "rental-flatmates", description: "Smart advice for tenants, flatmates, and co-living.", color: "#6366f1" },
  { id: 3, name: "Neighborhood Intel", slug: "neighborhood-intel", description: "Locality trends, connectivity, infrastructure and price forecasts.", color: "#0ea5e9" },
  { id: 4, name: "Legal & RERA", slug: "legal-rera", description: "Clear breakdowns of property laws, agreements, and compliance.", color: "#10b981" },
  { id: 5, name: "Market Trends", slug: "market-trends", description: "Quarterly rate benchmarks, supply-demand shifts and forecasts.", color: "#f59e0b" },
];

export const DEFAULT_TAGS: BlogTag[] = [
  { id: 1, name: "Bengaluru", slug: "bengaluru" },
  { id: 2, name: "Gurugram", slug: "gurugram" },
  { id: 3, name: "Home Loans", slug: "home-loans" },
  { id: 4, name: "RERA Checklist", slug: "rera-checklist" },
  { id: 5, name: "A-Khata", slug: "a-khata" },
  { id: 6, name: "Co-living", slug: "co-living" },
  { id: 7, name: "Rental Agreement", slug: "rental-agreement" },
  { id: 8, name: "Hyderabad", slug: "hyderabad" },
  { id: 9, name: "Price Trends", slug: "price-trends" },
  { id: 10, name: "Investment", slug: "investment" },
];

export const DEFAULT_POSTS: BlogPost[] = [
  {
    id: 101,
    slug: "bengaluru-apartment-buying-guide-2026",
    title: "The Ultimate Guide to Buying an Apartment in Bengaluru (2026 Edition)",
    excerpt: "Everything you need before putting down a token: A-Khata vs B-Khata verification, RERA legal checks, hidden registration fees, and the top high-yield micro-markets.",
    status: "PUBLISHED",
    isFeatured: true,
    featuredOrder: 1,
    coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80",
    coverImageAlt: "Modern residential high-rise building in Bengaluru",
    readingMinutes: 6,
    viewCount: 1420,
    createdAt: "2026-10-10T10:00:00.000Z",
    updatedAt: "2026-10-15T12:00:00.000Z",
    publishedAt: "2026-10-10T10:00:00.000Z",
    seoTitle: "Buying an Apartment in Bengaluru: 2026 Guide & Checklist",
    seoDescription: "Step-by-step checklist for buying flats in Bangalore: RERA verification, Khata distinction, registration charges, and high-growth micro-markets.",
    category: DEFAULT_CATEGORIES[0],
    author: { id: 1, name: "Rohan Varma", profileImage: null },
    tags: [
      { tag: DEFAULT_TAGS[0] },
      { tag: DEFAULT_TAGS[2] },
      { tag: DEFAULT_TAGS[3] },
      { tag: DEFAULT_TAGS[4] },
    ],
    content: [
      {
        type: "paragraph",
        text: "Navigating Bengaluru's dynamic real estate landscape requires more than just browsing floor plans. Whether you are eyeing an upcoming corridor near the Metro extension or an established enclave in Indiranagar, carrying out methodical due diligence is the single highest-return activity you will undertake.",
      },
      {
        type: "heading",
        level: 2,
        text: "1. The Non-Negotiable Document: RERA & Approvals",
      },
      {
        type: "paragraph",
        text: "Before paying any booking token, verify that the project is registered with Karnataka RERA (K-RERA). Cross-check the approved master plan, completion timeline commitments, and escrow bank details directly on the official portal.",
      },
      {
        type: "callout",
        tone: "warning",
        title: "Beware of Pre-Launch Pitfalls",
      },
      {
        type: "paragraph",
        text: "Never invest in 'soft-launch' or 'expression of interest' proposals that do not possess an active K-RERA registration number. It is unlawful under Section 3 of RERA for promoters to market or invite bookings prior to registration.",
      },
      {
        type: "heading",
        level: 2,
        text: "2. Decoding Khata: A-Khata vs B-Khata",
      },
      {
        type: "paragraph",
        text: "In BBMP jurisdiction, the type of Khata directly determines legal ownership and resale viability:",
      },
      {
        type: "list",
        style: "bullet",
        items: [
          "A-Khata: Fully compliant property with sanctioned building plan, occupancy certificate (OC), and direct access to bank home loans.",
          "B-Khata: Temporary tax-paying register entry acknowledging unauthorized construction or zoning deviations. Major national banks do not finance B-Khata apartments.",
          "Occupancy Certificate (OC): An absolute must for ready-to-move projects. Never take physical possession without the builder procuring an OC from BBMP/BDA.",
        ],
      },
      {
        type: "quote",
        text: "A lower price per square foot on an unapproved property is not a bargain—it is a deferred legal liability that compounds every year.",
        attribution: "Awasio Legal Advisory Desk",
      },
      {
        type: "heading",
        level: 2,
        text: "3. Estimating Real Total Cash Outflow",
      },
      {
        type: "paragraph",
        text: "Beyond the base sale price quoted by promoters, factor in statutory stamp duty (approx 5.6%), registration cess (1%), GST (5% on under-construction; 0% on ready properties with OC), plus maintenance corpus deposits, clubhouse amenity charges, and legal drafting costs.",
      },
      {
        type: "cta",
        title: "Find Verified Properties in Bengaluru",
        text: "Explore curated homes with verified RERA certificates, clear titles, and zero brokerage options.",
        label: "Search Bengaluru Homes",
        url: "/buy/bengaluru",
      },
    ],
  },
  {
    id: 102,
    slug: "flatmate-etiquette-rental-agreements-guide",
    title: "Flatmate Etiquette & Digital Rental Agreements: The Co-Living Playbook",
    excerpt: "Avoid awkward house disputes with our proven framework: splitting utility bills fairly, draft clauses for early exits, and making digital rent agreements legally bulletproof.",
    status: "PUBLISHED",
    isFeatured: false,
    featuredOrder: 2,
    coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80",
    coverImageAlt: "Group of friends and flatmates relaxing in modern apartment living room",
    readingMinutes: 4,
    viewCount: 980,
    createdAt: "2026-10-12T14:30:00.000Z",
    updatedAt: "2026-10-16T09:00:00.000Z",
    publishedAt: "2026-10-12T14:30:00.000Z",
    seoTitle: "Flatmate Guide: Co-Living Rules & Rental Agreements",
    seoDescription: "How to live with flatmates without friction: bill splitting, quiet hours, deposit returns, and digital rental agreement templates.",
    category: DEFAULT_CATEGORIES[1],
    author: { id: 2, name: "Meera Singhania", profileImage: null },
    tags: [
      { tag: DEFAULT_TAGS[5] },
      { tag: DEFAULT_TAGS[6] },
      { tag: DEFAULT_TAGS[0] },
      { tag: DEFAULT_TAGS[1] },
    ],
    content: [
      {
        type: "paragraph",
        text: "Shared housing is often the smartest financial move when relocating to cities like Bengaluru, Gurugram, or Pune. But roommate relationships frequently fracture over small, preventable misunderstandings regarding utilities, guest policies, or cleaning responsibilities.",
      },
      {
        type: "heading",
        level: 2,
        text: "The Three Essential House Rules",
      },
      {
        type: "list",
        style: "numbered",
        items: [
          "Automate All Shared Expenses: Use dedicated bill-splitting apps connected to UPI immediately on month start. Do not let power or maid salaries linger uncollected.",
          "Establish Quiet Hours & Work-from-Home Zones: Agree on hours when common areas remain noise-free, especially for hybrid tech teams handling client meetings.",
          "Guest and Significant Other Protocols: Set clear expectations on overnight visitor durations to respect each flatmate's personal comfort.",
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Pro Tip: Separate Security Deposit Allocation",
      },
      {
        type: "paragraph",
        text: "Ensure the owner's rental agreement explicitly names each occupant with individual deposit contributions and notice period provisions. That way, if one person transfers cities, the remaining tenants are not burdened with refunding the deposit out of pocket.",
      },
      {
        type: "cta",
        title: "Looking for Verified Roommates?",
        text: "Browse verified working professionals and student flatmate listings with lifestyle match scoring.",
        label: "Find Flatmates Now",
        url: "/flatmates",
      },
    ],
  },
  {
    id: 103,
    slug: "gurugram-vs-noida-rental-comparison-2026",
    title: "Gurugram vs Noida: Where Should NCR Professionals Rent in 2026?",
    excerpt: "An objective comparison across rentals, metro connectivity, social infrastructure, power backup reliability, and safety for single professionals and families.",
    status: "PUBLISHED",
    isFeatured: false,
    featuredOrder: 3,
    coverImage: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1600&q=80",
    coverImageAlt: "Modern urban expressway and skyscrapers at sunset",
    readingMinutes: 5,
    viewCount: 1840,
    createdAt: "2026-10-14T08:00:00.000Z",
    updatedAt: "2026-10-18T11:00:00.000Z",
    publishedAt: "2026-10-14T08:00:00.000Z",
    seoTitle: "Gurugram vs Noida Rent Comparison 2026 | Awasio Insights",
    seoDescription: "Compare Gurugram and Noida rentals, metro access, corporate proximity, and cost of living to find the best place to rent in Delhi NCR.",
    category: DEFAULT_CATEGORIES[2],
    author: { id: 3, name: "Aarav Kapoor", profileImage: null },
    tags: [
      { tag: DEFAULT_TAGS[1] },
      { tag: DEFAULT_TAGS[8] },
      { tag: DEFAULT_TAGS[9] },
    ],
    content: [
      {
        type: "paragraph",
        text: "The choice between Gurugram (Millennium City) and Noida (the planned industrial hub) remains the defining decision for newcomers to the National Capital Region. Both offer world-class corporate towers and gated townships, but their day-to-day realities differ significantly.",
      },
      {
        type: "heading",
        level: 2,
        text: "Rental Yields and Affordability",
      },
      {
        type: "paragraph",
        text: "Noida generally offers approximately 20% to 35% more carpet area for the same monthly rental outlay compared to prime Gurugram sectors (such as DLF Phase 5 or Golf Course Extension). A 2 BHK in Noida Sector 75 or 137 averages ₹24,000–₹32,000/month, whereas equivalent specifications in Gurugram command ₹36,000–₹55,000/month.",
      },
      {
        type: "heading",
        level: 2,
        text: "Infrastructure and Commute",
      },
      {
        type: "list",
        style: "bullet",
        items: [
          "Metro Network: Noida enjoys expansive connectivity via the DMRC Blue Line and Aqua Line with minimal transfers into central Delhi.",
          "Corporate Proximity: If your employer is anchored in DLF Cyber City or Horizon Center, living in Noida means a grueling 70+ minute cross-NCR commute.",
          "Power & Water Security: Large integrated townships in both cities deliver 100% DG power backup, which is vital during NCR's peak summer months.",
        ],
      },
      {
        type: "cta",
        title: "Explore PG & Flat Shares in Gurugram",
        text: "Find verified private rooms and co-living beds near Cyber Hub, Sector 48, and Golf Course Road.",
        label: "View Gurugram PG Listings",
        url: "/pg/gurugram",
      },
    ],
  },
  {
    id: 104,
    slug: "property-title-verification-legal-checklist",
    title: "10 Legal Checks Every Indian Home Buyer Must Conduct Before Signing",
    excerpt: "From 30-year Encumbrance Certificates to Mother Deeds and mutation records, here is the exact paperwork review protocol used by top conveyancing lawyers.",
    status: "PUBLISHED",
    isFeatured: false,
    featuredOrder: 4,
    coverImage: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1600&q=80",
    coverImageAlt: "Legal deeds and stamp papers on an office desk",
    readingMinutes: 7,
    viewCount: 2210,
    createdAt: "2026-10-15T09:00:00.000Z",
    updatedAt: "2026-10-19T10:30:00.000Z",
    publishedAt: "2026-10-15T09:00:00.000Z",
    seoTitle: "Property Title Verification Checklist for Home Buyers in India",
    seoDescription: "Complete legal verification checklist for buying property in India: EC, Mother Deed, NOCs, zoning approvals, and land records.",
    category: DEFAULT_CATEGORIES[3],
    author: { id: 1, name: "Rohan Varma", profileImage: null },
    tags: [
      { tag: DEFAULT_TAGS[3] },
      { tag: DEFAULT_TAGS[4] },
      { tag: DEFAULT_TAGS[2] },
    ],
    content: [
      {
        type: "paragraph",
        text: "A home is the largest capital commitment most families will ever make. While banks conduct title searches for loan underwriting, remember that bank verification only checks whether the property can serve as loan security—it does not substitute for your own independent legal due diligence.",
      },
      {
        type: "heading",
        level: 2,
        text: "The Essential Document Stack",
      },
      {
        type: "list",
        style: "numbered",
        items: [
          "Mother Deed (Title Trace): Unbroken chain of ownership tracing back at least 30 years to verify how the current vendor acquired legal title.",
          "Encumbrance Certificate (EC - Form 15): Proof that the property is free of legal mortgages, court attachments, or financial charges during the specified period.",
          "Conversion Certificate & Zoning Clearance: Proof that agricultural land was lawfully converted for residential non-agricultural (NA) use by the District Collector.",
          "Sanctioned Building Plan & Commencement Certificate (CC): Official civic authorization confirming the building matches approved floor-space indices (FSI).",
          "Tax Receipts & Mutation Records: Proof that current local property taxes are fully discharged without outstanding municipal penalties.",
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Consult an Independent Property Advocate",
      },
      {
        type: "paragraph",
        text: "Always hire an independent advocate who has no commercial affiliation with the builder or marketing broker. A comprehensive title clearance report costs a fraction of 1% of the property value and provides lifelong peace of mind.",
      },
    ],
  },
];

export function getDefaultBlogListResponse(params?: {
  q?: string;
  category?: string;
  tag?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}): BlogListResponse {
  const q = (params?.q || "").toLowerCase().trim();
  const categorySlug = (params?.category || "").toLowerCase().trim();
  const tagSlug = (params?.tag || "").toLowerCase().trim();
  const sort = params?.sort || "latest";
  const page = Math.max(1, params?.page || 1);
  const pageSize = params?.pageSize || 12;

  let items = [...DEFAULT_POSTS];

  if (q) {
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q)
    );
  }

  if (categorySlug) {
    items = items.filter((p) => p.category?.slug.toLowerCase() === categorySlug);
  }

  if (tagSlug) {
    items = items.filter((p) => p.tags.some((t) => t.tag.slug.toLowerCase() === tagSlug));
  }

  if (sort === "popular") {
    items.sort((a, b) => b.viewCount - a.viewCount);
  } else if (sort === "oldest") {
    items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else {
    items.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  }

  const total = items.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const paginatedItems = items.slice(start, start + pageSize);

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    totalPages,
    facets: {
      categories: DEFAULT_CATEGORIES,
      tags: DEFAULT_TAGS,
    },
  };
}
