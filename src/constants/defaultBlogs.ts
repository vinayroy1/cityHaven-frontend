import type { BlogPost, BlogCategory, BlogTag, BlogListResponse } from "@/types/blog.types";

export const DEFAULT_CATEGORIES: BlogCategory[] = [
  {
    "id": 1,
    "name": "Buying Guide",
    "slug": "buying-guide",
    "description": "Essential checklists and insights for home buyers across India.",
    "color": "#f43f5e"
  },
  {
    "id": 2,
    "name": "Rental & Flatmates",
    "slug": "rental-flatmates",
    "description": "Smart advice for tenants, flatmates, and co-living.",
    "color": "#6366f1"
  },
  {
    "id": 3,
    "name": "Neighborhood Intel",
    "slug": "neighborhood-intel",
    "description": "Locality trends, connectivity, infrastructure and price forecasts.",
    "color": "#0ea5e9"
  },
  {
    "id": 4,
    "name": "Legal & RERA",
    "slug": "legal-rera",
    "description": "Clear breakdowns of property laws, agreements, and compliance.",
    "color": "#10b981"
  },
  {
    "id": 5,
    "name": "Market Trends",
    "slug": "market-trends",
    "description": "Quarterly rate benchmarks, supply-demand shifts and forecasts.",
    "color": "#f59e0b"
  },
  {
    "id": 6,
    "name": "New Projects",
    "slug": "new-projects",
    "description": "RERA verification, launch analysis, and pre-booking checklists.",
    "color": "#7c3aed"
  },
  {
    "id": 7,
    "name": "Investment",
    "slug": "investment",
    "description": "Net rental yields, ROI calculations, and asset selection frameworks.",
    "color": "#059669"
  },
  {
    "id": 8,
    "name": "Flatmates",
    "slug": "flatmates",
    "description": "Compatibility scripts, move-in budgets, and shared living etiquette.",
    "color": "#f59e0b"
  },
  {
    "id": 9,
    "name": "PG & Co-Living",
    "slug": "pg-coliving",
    "description": "Curfew rules, hidden fees, meal reviews, and co-living inspections.",
    "color": "#8b5cf6"
  },
  {
    "id": 10,
    "name": "Commercial Property",
    "slug": "commercial-property",
    "description": "Office leasing, retail site visits, fit-out budgets, and zoning checks.",
    "color": "#0891b2"
  },
  {
    "id": 11,
    "name": "Renting",
    "slug": "renting",
    "description": "Tenant rights, commute premiums, inventory checklists, and leases.",
    "color": "#0ea5e9"
  }
];

export const DEFAULT_TAGS: BlogTag[] = [
  {
    "id": 1,
    "name": "Bengaluru",
    "slug": "bengaluru"
  },
  {
    "id": 2,
    "name": "Gurugram",
    "slug": "gurugram"
  },
  {
    "id": 3,
    "name": "Home Loans",
    "slug": "home-loans"
  },
  {
    "id": 4,
    "name": "RERA Checklist",
    "slug": "rera-checklist"
  },
  {
    "id": 5,
    "name": "A-Khata",
    "slug": "a-khata"
  },
  {
    "id": 6,
    "name": "Co-living",
    "slug": "co-living"
  },
  {
    "id": 7,
    "name": "Rental Agreement",
    "slug": "rental-agreement"
  },
  {
    "id": 8,
    "name": "Hyderabad",
    "slug": "hyderabad"
  },
  {
    "id": 9,
    "name": "Price Trends",
    "slug": "price-trends"
  },
  {
    "id": 10,
    "name": "Investment",
    "slug": "investment"
  },
  {
    "id": 11,
    "name": "Home inspection",
    "slug": "home-inspection"
  },
  {
    "id": 12,
    "name": "Home buying",
    "slug": "home-buying"
  },
  {
    "id": 13,
    "name": "Due diligence",
    "slug": "due-diligence"
  },
  {
    "id": 14,
    "name": "Pre-launch",
    "slug": "pre-launch"
  },
  {
    "id": 15,
    "name": "RERA",
    "slug": "rera"
  },
  {
    "id": 16,
    "name": "New projects",
    "slug": "new-projects"
  },
  {
    "id": 17,
    "name": "Renting",
    "slug": "renting"
  },
  {
    "id": 18,
    "name": "Commute",
    "slug": "commute"
  },
  {
    "id": 19,
    "name": "Locality guide",
    "slug": "locality-guide"
  },
  {
    "id": 20,
    "name": "Rental yield",
    "slug": "rental-yield"
  },
  {
    "id": 21,
    "name": "Landlords",
    "slug": "landlords"
  },
  {
    "id": 22,
    "name": "Flatmates",
    "slug": "flatmates"
  },
  {
    "id": 23,
    "name": "Shared living",
    "slug": "shared-living"
  },
  {
    "id": 24,
    "name": "Safety",
    "slug": "safety"
  },
  {
    "id": 25,
    "name": "Shared expenses",
    "slug": "shared-expenses"
  },
  {
    "id": 26,
    "name": "Moving checklist",
    "slug": "moving-checklist"
  },
  {
    "id": 27,
    "name": "Move-in checklist",
    "slug": "move-in-checklist"
  },
  {
    "id": 28,
    "name": "Tenant guide",
    "slug": "tenant-guide"
  },
  {
    "id": 29,
    "name": "PG",
    "slug": "pg"
  },
  {
    "id": 30,
    "name": "Student housing",
    "slug": "student-housing"
  },
  {
    "id": 31,
    "name": "Tenant safety",
    "slug": "tenant-safety"
  },
  {
    "id": 32,
    "name": "Commercial property",
    "slug": "commercial-property"
  },
  {
    "id": 33,
    "name": "Office lease",
    "slug": "office-lease"
  },
  {
    "id": 34,
    "name": "Retail space",
    "slug": "retail-space"
  },
  {
    "id": 35,
    "name": "Business location",
    "slug": "business-location"
  }
];

const catMap = new Map(DEFAULT_CATEGORIES.map((c) => [c.slug, c]));
const tagMap = new Map(DEFAULT_TAGS.map((t) => [t.slug, t]));

export const DEFAULT_POSTS: BlogPost[] = [
  {
    id: 105,
    slug: "45-minute-home-visit-verification-plan",
    title: "The 45-Minute Home Visit: A Room-by-Room Verification Plan",
    excerpt: "Turn a rushed property visit into a repeatable inspection covering light, water, noise, documents, maintenance and the questions photographs cannot answer.",
    status: "PUBLISHED",
    isFeatured: true,
    featuredOrder: 1,
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    coverImageAlt: "Bright living room during home inspection visit",
    readingMinutes: 3,
    viewCount: 650,
    createdAt: "2026-10-20T04:30:00.000Z",
    updatedAt: "2026-10-20T04:30:00.000Z",
    publishedAt: "2026-10-20T04:30:00.000Z",
    seoTitle: "Property Visit Checklist: Inspect a Home in 45 Minutes",
    seoDescription: "A practical room-by-room property visit checklist for Indian homebuyers and renters, including documents, water, noise and maintenance checks.",
    category: catMap.get("buying-guide") || null,
    author: {"id":1,"name":"Awasio Editorial","profileImage":null},
    tags: [{ tag: tagMap.get("home-inspection")! }, { tag: tagMap.get("home-buying")! }, { tag: tagMap.get("due-diligence")! }],
    content: [
      {
            "type": "paragraph",
            "text": "A polished listing can help you shortlist a home, but it cannot reveal weak water pressure at peak hour, lift queues, traffic noise with the windows closed or a repair that has only been painted over. The best visit is not the longest one. It is the one conducted in a consistent order."
      },
      {
            "type": "callout",
            "tone": "tip",
            "title": "Before you leave home",
            "text": "Save the listing, carry a phone charger, a measuring tape and this checklist. Ask for the exact unit number and the name of the person showing it. Never transfer a token merely to secure a viewing."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Minutes 0–8: inspect the building before the flat"
      },
      {
            "type": "list",
            "style": "bullet",
            "items": [
                  "Check the approach road, street lighting and safe walking access.",
                  "Note the condition and capacity of lifts, stairs and fire exits.",
                  "Look for water marks in the basement and parking ramps.",
                  "Ask the guard or a resident about water supply, power backup and visitor rules.",
                  "Confirm that the parking slot being discussed actually belongs to the unit."
            ]
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Minutes 8–25: test, do not just look"
      },
      {
            "type": "paragraph",
            "text": "Open every tap for a few seconds, flush toilets, switch on exhaust fans and inspect the ceiling corners below bathrooms. Open and close windows, balcony doors and cupboards. Plug your charger into sockets in different rooms. Stand quietly for one minute with the windows closed, then open them and compare the noise."
      },
      {
            "type": "list",
            "style": "numbered",
            "items": [
                  "Living room: daylight, usable wall space and mobile signal.",
                  "Kitchen: ventilation, sink drainage, cylinder or piped-gas arrangement and appliance points.",
                  "Bedrooms: privacy, heat direction, wardrobe depth and external noise.",
                  "Bathrooms: pressure, drainage slope, geyser point and signs of seepage.",
                  "Balcony or utility: safety rails, drain outlets and adjacent construction."
            ]
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Minutes 25–35: calculate the real monthly cost"
      },
      {
            "type": "paragraph",
            "text": "Ask for the recurring maintenance bill and what it includes. Add parking, club charges, backup-power rates and likely commuting cost. For a rental, record the deposit, notice period, lock-in, painting deduction and brokerage in writing. For a purchase, separate the base price from parking, floor-rise, maintenance corpus, registration and fit-out costs."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Minutes 35–45: verify the claim trail"
      },
      {
            "type": "list",
            "style": "bullet",
            "items": [
                  "Match the owner or authorised representative to the documents shown.",
                  "For an under-construction project, verify the registration on the relevant state RERA portal.",
                  "For a resale, request the title chain, latest tax receipt, sanctioned plan and society dues position for legal review.",
                  "Photograph meter numbers and existing damage only with permission.",
                  "Do not treat a brochure, chat message or verbal promise as an approval."
            ]
      },
      {
            "type": "callout",
            "tone": "warning",
            "title": "A visit is screening, not legal due diligence",
            "text": "This checklist helps identify questions and visible risks. Use an independent lawyer and qualified engineer where the value or condition of the property justifies it."
      },
      {
            "type": "cta",
            "title": "Put the checklist to work",
            "text": "Shortlist verified homes and compare the details that matter before scheduling a visit.",
            "label": "Explore properties",
            "url": "/propertySearch"
      }
],
  },
  {
    id: 106,
    slug: "pre-launch-property-questions-before-reserving",
    title: "Pre-Launch Without the Pressure: 12 Questions Before You Reserve",
    excerpt: "A calm decision framework for comparing early-stage projects, checking permissions and understanding what a refundable expression of interest really means.",
    status: "PUBLISHED",
    isFeatured: false,
    featuredOrder: 0,
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    coverImageAlt: "Modern skyscraper tower under construction",
    readingMinutes: 2,
    viewCount: 735,
    createdAt: "2026-10-19T05:00:00.000Z",
    updatedAt: "2026-10-19T05:00:00.000Z",
    publishedAt: "2026-10-19T05:00:00.000Z",
    seoTitle: "Pre-Launch Property Checklist: 12 Questions Before Booking",
    seoDescription: "Considering a pre-launch home? Ask these 12 questions about RERA, approvals, payment milestones, refunds, delivery and total cost before paying.",
    category: catMap.get("new-projects") || null,
    author: {"id":1,"name":"Awasio Editorial","profileImage":null},
    tags: [{ tag: tagMap.get("pre-launch")! }, { tag: tagMap.get("rera")! }, { tag: tagMap.get("new-projects")! }],
    content: [
      {
            "type": "paragraph",
            "text": "Early access, a preferred unit and an introductory price can make a pre-launch conversation feel urgent. Urgency is precisely why you need a fixed process. Your objective is not to predict whether the project will be successful; it is to understand what exists today, what is promised for later and what happens to your money if the plan changes."
      },
      {
            "type": "callout",
            "tone": "warning",
            "title": "Registration comes before marketing confidence",
            "text": "Confirm the applicable RERA registration and inspect the regulator’s project page yourself. A brand name, channel-partner message or expression-of-interest form is not a substitute for statutory information."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "The 12 questions"
      },
      {
            "type": "list",
            "style": "numbered",
            "items": [
                  "What is the project’s RERA registration number and registered phase?",
                  "Does the tower and unit being offered fall inside that registered phase?",
                  "Which land title and development rights support the project?",
                  "Which approvals are already received, and which are pending?",
                  "Is this payment a booking amount, application fee or expression of interest?",
                  "Is it refundable, by when, and after which deductions?",
                  "What is the all-inclusive cost, not merely the advertised rate?",
                  "Which area definition is used for pricing and comparison?",
                  "What construction milestones trigger each instalment?",
                  "What completion date and grace provisions appear in the agreement?",
                  "Which amenities belong to this phase, and when are they due?",
                  "Can you review the draft agreement before paying a non-refundable amount?"
            ]
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Compare promises in three columns"
      },
      {
            "type": "paragraph",
            "text": "Create three columns called Verified now, Contractual later and Marketing only. Put every claim into one of them. A registration detail or sanctioned plan belongs in the first. A possession date written into the agreement belongs in the second. A future view, proposed road or verbal upgrade without a document belongs in the third."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Model delay, not only appreciation"
      },
      {
            "type": "paragraph",
            "text": "Stress-test your budget for overlapping rent and pre-EMI, an interest-rate change, delayed possession and interior costs. If the purchase only works when every optimistic assumption is true, the price advantage may not be a real advantage for you."
      },
      {
            "type": "callout",
            "tone": "tip",
            "title": "Keep a decision folder",
            "text": "Save the dated cost sheet, payment receipt, application terms, regulator page, floor plan and every written clarification. Name files consistently so you can compare projects without relying on memory."
      },
      {
            "type": "cta",
            "title": "Compare registered new projects",
            "text": "Review project details and shortlist options without losing your decision criteria.",
            "label": "Browse new projects",
            "url": "/new-projects"
      }
],
  },
  {
    id: 107,
    slug: "rent-near-work-or-outskirts-commute-premium",
    title: "Rent Near Work or Save on the Outskirts? Calculate the Commute Premium",
    excerpt: "A better location decision adds rent, travel money, travel time and schedule risk instead of comparing monthly rent alone.",
    status: "PUBLISHED",
    isFeatured: false,
    featuredOrder: 0,
    coverImage: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1600&q=80",
    coverImageAlt: "City transit skyline and expressway at dusk",
    readingMinutes: 2,
    viewCount: 820,
    createdAt: "2026-10-18T05:00:00.000Z",
    updatedAt: "2026-10-18T05:00:00.000Z",
    publishedAt: "2026-10-18T05:00:00.000Z",
    seoTitle: "Rent Near Work vs Outskirts: Calculate Your Real Cost",
    seoDescription: "Compare city-centre and suburban rentals using commute cost, time, flexibility and monthly rent—not rent alone.",
    category: catMap.get("renting") || null,
    author: {"id":1,"name":"Awasio Editorial","profileImage":null},
    tags: [{ tag: tagMap.get("renting")! }, { tag: tagMap.get("commute")! }, { tag: tagMap.get("locality-guide")! }],
    content: [
      {
            "type": "paragraph",
            "text": "The cheaper home is not always the lower-cost home. A distant apartment may save rent while consuming money and hours through fuel, cabs, tolls, parking and unpredictable peak traffic. A central home can cost more while buying back time. The right answer depends on your work pattern, not a universal rule."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Start with the monthly cash difference"
      },
      {
            "type": "paragraph",
            "text": "For each home, add rent, maintenance and the realistic cost of all office journeys in a month. Include first- and last-mile travel, not only the longest train or bus leg. If you drive, account for fuel, tolls and parking. Use an ordinary month rather than your best possible week."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Then price the time difference"
      },
      {
            "type": "paragraph",
            "text": "Calculate round-trip minutes multiplied by office days. Do not automatically convert every minute into salary; instead ask what those hours displace. Sleep, exercise, childcare, study and a side project may have more personal value than a simplistic hourly rate."
      },
      {
            "type": "callout",
            "tone": "info",
            "title": "A simple commute premium",
            "text": "Commute premium = extra rent for the closer home minus the travel money it saves. Divide that figure by the hours saved each month. The result is what you are paying to recover one hour."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Test the worst ordinary day"
      },
      {
            "type": "list",
            "style": "bullet",
            "items": [
                  "Can you still reach work during rain or a transport disruption?",
                  "Is a late-evening return safe and reasonably priced?",
                  "How many transfers or uncertain waits does the route require?",
                  "Would a job or office-location change remove the home’s main advantage?",
                  "Does the closer locality force you into a much smaller or poorly ventilated home?"
            ]
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Use a trial journey before signing"
      },
      {
            "type": "paragraph",
            "text": "Travel from the building to work at the time you expect to commute, then repeat in the evening. Map estimates often understate lift waits, walking inside large campuses, parking exits and the time needed to find an auto. One real journey can correct an entire spreadsheet."
      },
      {
            "type": "cta",
            "title": "Compare homes by locality",
            "text": "Select nearby localities and compare rent, furnishing and availability together.",
            "label": "Search rental homes",
            "url": "/rent"
      }
],
  },
  {
    id: 108,
    slug: "net-rental-yield-real-cost-worksheet",
    title: "Rental Yield That Survives Reality: A Net Income Worksheet",
    excerpt: "Move beyond annual rent divided by purchase price by including vacancy, maintenance, repairs and acquisition costs in one practical calculation.",
    status: "PUBLISHED",
    isFeatured: false,
    featuredOrder: 0,
    coverImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80",
    coverImageAlt: "Modern residential building architecture in sunlight",
    readingMinutes: 2,
    viewCount: 905,
    createdAt: "2026-10-17T05:00:00.000Z",
    updatedAt: "2026-10-17T05:00:00.000Z",
    publishedAt: "2026-10-17T05:00:00.000Z",
    seoTitle: "How to Calculate Net Rental Yield on Property in India",
    seoDescription: "Calculate a more realistic net rental yield after vacancy, maintenance, repairs and buying costs with this practical worksheet.",
    category: catMap.get("investment") || null,
    author: {"id":1,"name":"Awasio Editorial","profileImage":null},
    tags: [{ tag: tagMap.get("rental-yield")! }, { tag: tagMap.get("investment")! }, { tag: tagMap.get("landlords")! }],
    content: [
      {
            "type": "paragraph",
            "text": "Gross rental yield is useful for a quick comparison, but it is not the return that reaches your account. Two homes with the same price and rent can produce very different outcomes once vacancy, society charges, furnishing replacement and acquisition costs are included."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Step 1: estimate collected rent"
      },
      {
            "type": "paragraph",
            "text": "Start with expected monthly rent multiplied by occupied months, not automatically twelve. Use a vacancy assumption that reflects tenant turnover and demand in that exact micro-market. Add other dependable income only when it is contractually and practically collectable."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Step 2: subtract owner-paid operating costs"
      },
      {
            "type": "list",
            "style": "bullet",
            "items": [
                  "Society maintenance or sinking-fund contributions paid by the owner.",
                  "Property tax and insurance.",
                  "Routine repairs and an annual reserve for larger replacements.",
                  "Brokerage or tenant-acquisition expense spread across the tenancy.",
                  "Professional management, legal documentation and inspection costs.",
                  "Utilities paid during vacancy."
            ]
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Step 3: use the capital actually committed"
      },
      {
            "type": "paragraph",
            "text": "For an unleveraged comparison, the denominator can include purchase price plus stamp duty, registration, brokerage, immediately required repairs and furnishing. Keep financing analysis separate: loan interest and principal affect cash flow differently and depend on your borrowing terms."
      },
      {
            "type": "callout",
            "tone": "info",
            "title": "Core formula",
            "text": "Net rental yield = annual collected rent minus annual operating costs, divided by total acquisition cost, multiplied by 100."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Run three scenarios"
      },
      {
            "type": "list",
            "style": "numbered",
            "items": [
                  "Base case: normal vacancy and maintenance.",
                  "Stress case: longer vacancy plus one material repair.",
                  "Improvement case: justified rent increase after a targeted upgrade."
            ]
      },
      {
            "type": "paragraph",
            "text": "Yield is only one dimension. Liquidity, tenant depth, building condition, legal clarity and concentration of your wealth matter too. Tax treatment is personal and can change; use current official guidance and a qualified tax adviser rather than copying an old online calculation."
      },
      {
            "type": "cta",
            "title": "Study live asking rents",
            "text": "Compare rental listings around a prospective investment before setting your assumptions.",
            "label": "Explore rental supply",
            "url": "/rent"
      }
],
  },
  {
    id: 109,
    slug: "flatmate-compatibility-before-paying-deposit",
    title: "Flatmate Compatibility Before the Deposit: A 20-Minute Conversation",
    excerpt: "A respectful script for discussing money, guests, cleaning, food, work schedules and boundaries before two people commit to sharing a home.",
    status: "PUBLISHED",
    isFeatured: true,
    featuredOrder: 1,
    coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80",
    coverImageAlt: "Flatmates conversing and sharing coffee in apartment",
    readingMinutes: 2,
    viewCount: 990,
    createdAt: "2026-10-16T05:00:00.000Z",
    updatedAt: "2026-10-16T05:00:00.000Z",
    publishedAt: "2026-10-16T05:00:00.000Z",
    seoTitle: "Flatmate Compatibility Checklist Before Paying a Deposit",
    seoDescription: "Discuss rent, cleaning, guests, food, work schedules, pets and safety with a potential flatmate before paying a deposit.",
    category: catMap.get("flatmates") || null,
    author: {"id":1,"name":"Awasio Editorial","profileImage":null},
    tags: [{ tag: tagMap.get("flatmates")! }, { tag: tagMap.get("shared-living")! }, { tag: tagMap.get("safety")! }],
    content: [
      {
            "type": "paragraph",
            "text": "A pleasant chat is not the same as a compatibility check. Good shared homes are built when expectations are stated early, especially around money and privacy. The goal is not to find someone identical to you; it is to discover whether your differences can be managed without daily friction."
      },
      {
            "type": "callout",
            "tone": "warning",
            "title": "Verify the room and the right to offer it",
            "text": "Meet safely, visit the exact home, confirm who owns or lawfully rents it and understand whether flatmate occupancy is permitted. Never send a deposit only because someone creates urgency online."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "First five minutes: money and commitment"
      },
      {
            "type": "list",
            "style": "bullet",
            "items": [
                  "Exact rent share, deposit and one-time setup costs.",
                  "How utilities, groceries and household help are divided.",
                  "Who receives the money and what receipt or agreement is provided.",
                  "Move-in date, lock-in, notice period and replacement-flatmate process.",
                  "How damage to shared and private items is handled."
            ]
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Next ten minutes: the ordinary week"
      },
      {
            "type": "list",
            "style": "bullet",
            "items": [
                  "Work-from-home days, calls and quiet hours.",
                  "Sleep times, alarms and use of common rooms late at night.",
                  "Cooking frequency, dietary boundaries and shared utensils.",
                  "Cleaning standard, chores and household-help timing.",
                  "Guests, partners, overnight stays and advance notice.",
                  "Smoking, alcohol, pets and allergies.",
                  "Air-conditioning, geyser and other high-use utilities."
            ]
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Final five minutes: boundaries and conflict"
      },
      {
            "type": "paragraph",
            "text": "Ask how each person prefers to raise a problem. Agree that private rooms, belongings and messages remain private. Decide where shared decisions will be recorded. A short written house agreement is not unfriendly; it protects the relationship from different memories later."
      },
      {
            "type": "callout",
            "tone": "tip",
            "title": "Notice the quality of the answer",
            "text": "Compatibility is not only what someone prefers. It is whether they can discuss an awkward topic clearly, listen to your boundary and make a fair compromise."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Green flags and reasons to pause"
      },
      {
            "type": "paragraph",
            "text": "Clear cost details, willingness to show the home and documents, respectful disagreement and consistent answers are useful signals. Pressure to pay immediately, refusal to meet safely, changing financial terms or dismissing boundaries are reasons to slow down or leave."
      },
      {
            "type": "cta",
            "title": "Find a lifestyle match",
            "text": "Discover people and rooms using preferences that go beyond rent alone.",
            "label": "Explore flatmates",
            "url": "/flatmate"
      }
],
  },
  {
    id: 110,
    slug: "flatmate-move-in-money-plan",
    title: "The Flatmate Move-In Money Plan: Split Costs Without Awkward Surprises",
    excerpt: "A practical way to divide deposits, rent, utilities, groceries and shared purchases before the first payment is made.",
    status: "PUBLISHED",
    isFeatured: false,
    featuredOrder: 0,
    coverImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=80",
    coverImageAlt: "Roommates organizing move-in budget and apartment keys",
    readingMinutes: 2,
    viewCount: 1075,
    createdAt: "2026-10-20T22:30:00.000Z",
    updatedAt: "2026-10-20T22:30:00.000Z",
    publishedAt: "2026-10-20T22:30:00.000Z",
    seoTitle: "How Flatmates Should Split Rent, Deposit and Shared Bills",
    seoDescription: "Set up a fair flatmate money plan for rent, deposits, utilities, groceries, repairs and move-out settlements before moving in.",
    category: catMap.get("flatmates") || null,
    author: {"id":1,"name":"Awasio Editorial","profileImage":null},
    tags: [{ tag: tagMap.get("flatmates")! }, { tag: tagMap.get("shared-expenses")! }, { tag: tagMap.get("moving-checklist")! }],
    content: [
      {
            "type": "paragraph",
            "text": "Shared-home disputes often begin with small assumptions: one person thought internet was included, another expected equal grocery sharing, and nobody recorded who paid the larger deposit. A simple money plan turns those assumptions into decisions before they become resentments."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Separate fixed costs from usage costs"
      },
      {
            "type": "list",
            "style": "bullet",
            "items": [
                  "Fixed: rent, society maintenance, internet and household help.",
                  "Usage-based: electricity, gas, water or paid parking where consumption differs.",
                  "Personal: food preferences, private-room appliances, subscriptions and individual deliveries.",
                  "Occasional: repairs, pest control, cleaning supplies and replacement of shared items."
            ]
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Equal is not always the same as fair"
      },
      {
            "type": "paragraph",
            "text": "Equal rent works when bedrooms and benefits are comparable. If one room has an attached bathroom, balcony, air-conditioner or much more space, agree on a room premium together. Write down the final amount rather than reopening the comparison every month."
      },
      {
            "type": "callout",
            "tone": "tip",
            "title": "Keep one shared ledger",
            "text": "Use a shared sheet or expense app with the date, amount, payer, category and receipt. Settle on the same day each month so balances do not quietly grow."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Record the deposit properly"
      },
      {
            "type": "list",
            "style": "numbered",
            "items": [
                  "Confirm the total deposit in the rental agreement or written acknowledgment.",
                  "Record exactly how much each flatmate contributed.",
                  "Agree how deductions for damage will be attributed.",
                  "Define what happens when one person leaves before the others.",
                  "Do not hand a deposit to an incoming flatmate without verifying the owner or lawful tenant and the replacement arrangement."
            ]
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Make move-out boring"
      },
      {
            "type": "paragraph",
            "text": "Create a dated photo inventory at move-in, keep receipts for shared purchases and decide whether items will be sold, transferred or taken away. A predictable exit process is one of the best signs that the household agreement is fair."
      },
      {
            "type": "callout",
            "tone": "warning",
            "title": "Pause when the payment trail is unclear",
            "text": "Changing account details, cash-only pressure, refusal to issue a receipt or a request to pay before seeing the home are reasons to stop and verify."
      },
      {
            "type": "cta",
            "title": "Find compatible flatmates",
            "text": "Compare lifestyle preferences and room requirements before discussing the deposit.",
            "label": "Browse flatmates",
            "url": "/flatmate"
      }
],
  },
  {
    id: 111,
    slug: "rental-handover-checklist-before-moving-in",
    title: "Rental Handover Day: What to Record Before You Move In",
    excerpt: "A renter-friendly handover checklist for meter readings, existing damage, keys, appliances, payments and the first maintenance request.",
    status: "PUBLISHED",
    isFeatured: true,
    featuredOrder: 1,
    coverImage: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=1600&q=80",
    coverImageAlt: "Tenant inspecting keys during rental move-in handover",
    readingMinutes: 2,
    viewCount: 1160,
    createdAt: "2026-10-20T22:00:00.000Z",
    updatedAt: "2026-10-20T22:00:00.000Z",
    publishedAt: "2026-10-20T22:00:00.000Z",
    seoTitle: "Rental Property Handover Checklist for Tenants in India",
    seoDescription: "Use this rental move-in checklist to record property condition, meters, keys, appliances, payments and maintenance responsibilities.",
    category: catMap.get("renting") || null,
    author: {"id":1,"name":"Awasio Editorial","profileImage":null},
    tags: [{ tag: tagMap.get("renting")! }, { tag: tagMap.get("move-in-checklist")! }, { tag: tagMap.get("tenant-guide")! }],
    content: [
      {
            "type": "paragraph",
            "text": "The agreement may be signed, but the tenancy becomes real on handover day. This is when the actual condition of the home, the meter readings and the items supplied should be recorded. Twenty careful minutes now can prevent a confusing deduction months later."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Walk through before unloading"
      },
      {
            "type": "list",
            "style": "bullet",
            "items": [
                  "Photograph every room in daylight, including walls, floors, ceilings and windows.",
                  "Capture existing stains, cracks, chipped fittings and damaged furniture closely and from context.",
                  "Test taps, flushes, drains, lights, fans, geysers, air-conditioners and supplied appliances.",
                  "Check locks, keys, access cards, parking tags and mailbox access.",
                  "Record electricity, gas and water meter readings where applicable."
            ]
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Build a signed inventory"
      },
      {
            "type": "paragraph",
            "text": "List furniture, appliances, remotes and keys with their visible condition. Both sides should retain the same dated version. Send the photo folder and defect list through an agreed written channel so there is a clear timestamp."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Close the payment loop"
      },
      {
            "type": "list",
            "style": "numbered",
            "items": [
                  "Collect receipts or acknowledgments for deposit and advance rent.",
                  "Confirm the monthly due date and payment account.",
                  "Note which maintenance and utility charges are tenant-paid.",
                  "Record the process for emergency and routine repair approval.",
                  "Save the owner or authorised manager’s contact details separately from chat history."
            ]
      },
      {
            "type": "callout",
            "tone": "tip",
            "title": "Send the first defect report immediately",
            "text": "If something does not work, report it before using the home for several days. Include a photo or short video and ask who will arrange the repair and by when."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Keep your own move-in folder"
      },
      {
            "type": "paragraph",
            "text": "Store the signed agreement, payment proof, inventory, photographs, society forms and important contact details together. Local documentation and registration requirements vary, so confirm current rules with the appropriate authority or a qualified professional."
      },
      {
            "type": "cta",
            "title": "Shortlist your next rental",
            "text": "Compare rent, furnishing, deposit and locality before scheduling a visit.",
            "label": "Search rental homes",
            "url": "/rent"
      }
],
  },
  {
    id: 112,
    slug: "pg-coliving-questions-before-booking",
    title: "PG or Co-Living? 18 Questions to Ask Before Paying the Booking Amount",
    excerpt: "Look beyond the furnished room and compare food, electricity, curfew, visitors, refunds, security and the real monthly bill.",
    status: "PUBLISHED",
    isFeatured: false,
    featuredOrder: 0,
    coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80",
    coverImageAlt: "Modern co-living space with individual study desks",
    readingMinutes: 2,
    viewCount: 1245,
    createdAt: "2026-10-20T21:30:00.000Z",
    updatedAt: "2026-10-20T21:30:00.000Z",
    publishedAt: "2026-10-20T21:30:00.000Z",
    seoTitle: "PG and Co-Living Checklist: 18 Questions Before Booking",
    seoDescription: "Compare PG and co-living options using 18 practical questions about rent, food, electricity, deposits, curfew, guests and refunds.",
    category: catMap.get("pg-coliving") || null,
    author: {"id":1,"name":"Awasio Editorial","profileImage":null},
    tags: [{ tag: tagMap.get("pg")! }, { tag: tagMap.get("co-living")! }, { tag: tagMap.get("student-housing")! }, { tag: tagMap.get("tenant-safety")! }],
    content: [
      {
            "type": "paragraph",
            "text": "A PG can look inexpensive because furniture, housekeeping or meals appear bundled into one figure. The actual experience depends on the rules and exclusions behind that figure. Ask the same questions at every property so a bright lobby does not outweigh a poor contract or an overcrowded room."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Money and cancellation"
      },
      {
            "type": "list",
            "style": "numbered",
            "items": [
                  "What is the final monthly amount for this exact bed or room?",
                  "Which services are included and which are charged separately?",
                  "How is electricity calculated: included, fixed or metered?",
                  "What deposit and booking amount are required?",
                  "Which payments are refundable and under what timeline?",
                  "What are the lock-in, notice period and early-exit deductions?"
            ]
      },
      {
            "type": "heading",
            "level": 2,
            "text": "The room you will actually receive"
      },
      {
            "type": "list",
            "style": "numbered",
            "items": [
                  "Is the shown room the allocated room or only a sample?",
                  "How many occupants share the bedroom and bathroom?",
                  "Is the bed, mattress, wardrobe and study space individually assigned?",
                  "Does the room have ventilation, mobile signal and enough charging points?",
                  "How often are common spaces and bathrooms cleaned?"
            ]
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Food, access and daily rules"
      },
      {
            "type": "list",
            "style": "numbered",
            "items": [
                  "Can you see a current meal menu and serving timings?",
                  "What happens when you miss a meal or travel for several days?",
                  "Are outside food, induction cooking or refrigerators allowed?",
                  "What are the entry, curfew and late-arrival rules?",
                  "What is the guest and visitor policy?",
                  "How are complaints, repairs and roommate changes handled?",
                  "Are CCTV, guards and fire exits present and maintained?"
            ]
      },
      {
            "type": "callout",
            "tone": "warning",
            "title": "Do not book a category; verify a specific allocation",
            "text": "Get the room or bed type, occupancy, price, inclusions and move-in date in writing. If allocation may change, ask what equivalent means and what refund applies if it is unavailable."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Spend ten minutes with current residents"
      },
      {
            "type": "paragraph",
            "text": "When appropriate, ask a current resident about food consistency, water, internet at peak hours, deposit refunds and response time for repairs. One calm conversation often reveals the gap between the tour and ordinary life."
      },
      {
            "type": "cta",
            "title": "Compare PG options clearly",
            "text": "Review pricing basis, occupancy, food and facilities before contacting the operator.",
            "label": "Explore PG listings",
            "url": "/pg"
      }
],
  },
  {
    id: 113,
    slug: "commercial-property-site-visit-checklist",
    title: "Commercial Property Site Visit: A Practical Checklist for Small Businesses",
    excerpt: "Evaluate access, permitted use, power, parking, fit-out costs and lease terms before an attractive office or shop becomes an expensive mismatch.",
    status: "PUBLISHED",
    isFeatured: false,
    featuredOrder: 0,
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    coverImageAlt: "Contemporary open commercial office space with glass partitions",
    readingMinutes: 2,
    viewCount: 1330,
    createdAt: "2026-10-20T21:00:00.000Z",
    updatedAt: "2026-10-20T21:00:00.000Z",
    publishedAt: "2026-10-20T21:00:00.000Z",
    seoTitle: "Commercial Property Site Visit Checklist for Office and Retail",
    seoDescription: "Inspect an office, shop or commercial space for access, permitted use, power, parking, fit-out costs and lease obligations before committing.",
    category: catMap.get("commercial-property") || null,
    author: {"id":1,"name":"Awasio Editorial","profileImage":null},
    tags: [{ tag: tagMap.get("commercial-property")! }, { tag: tagMap.get("office-lease")! }, { tag: tagMap.get("retail-space")! }, { tag: tagMap.get("business-location")! }],
    content: [
      {
            "type": "paragraph",
            "text": "A commercial space has to work as infrastructure, not merely look impressive. A shop without practical loading access or an office with insufficient power can cost more to correct than the rent saved. Visit with your operating plan, not only your furniture plan."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Confirm that your activity belongs there"
      },
      {
            "type": "paragraph",
            "text": "Describe the intended business clearly and confirm permitted use, building rules, signage conditions and relevant approvals before negotiating interiors. Requirements vary by activity and location; use qualified legal, technical and regulatory advisers for verification."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Test customer and employee access"
      },
      {
            "type": "list",
            "style": "bullet",
            "items": [
                  "Walk from public transport and the likely parking area.",
                  "Check lift capacity, waiting time and accessibility.",
                  "Visit during the hours your customers or employees will arrive.",
                  "Confirm visitor entry, delivery and loading procedures.",
                  "For retail, observe visibility and genuine footfall at more than one time of day."
            ]
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Measure operational capacity"
      },
      {
            "type": "list",
            "style": "bullet",
            "items": [
                  "Sanctioned electrical load and backup-power coverage.",
                  "Internet-provider availability and mobile reception.",
                  "Air-conditioning responsibility and operating hours.",
                  "Water, washrooms, drainage and pantry feasibility.",
                  "Fire exits, alarms, extinguishers and evacuation access.",
                  "Floor loading, ceiling height and service access where relevant."
            ]
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Price the fit-out before pricing the lease"
      },
      {
            "type": "paragraph",
            "text": "Record the delivered condition and obtain realistic estimates for wiring, partitions, flooring, air-conditioning, fire compliance, signage and restoration. Ask which alterations need approval and whether any rent-free fit-out period is offered. A low rent can hide a large upfront conversion bill."
      },
      {
            "type": "callout",
            "tone": "info",
            "title": "Compare effective occupancy cost",
            "text": "Add rent, maintenance, taxes payable by the occupier, parking, utilities, fit-out amortisation and expected annual escalation. Compare spaces using the same usable-area and time-period assumptions."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Put negotiation points in the term sheet"
      },
      {
            "type": "list",
            "style": "numbered",
            "items": [
                  "Lease term, lock-in, notice and renewal options.",
                  "Deposit, escalation and payment commencement.",
                  "Fit-out access and rent-free period.",
                  "Maintenance scope and repair responsibility.",
                  "Signage, parking and common-area rights.",
                  "Exit restoration and deposit-return process."
            ]
      },
      {
            "type": "cta",
            "title": "Find a space built for business",
            "text": "Compare offices, shops and other commercial listings by location and operating needs.",
            "label": "Search commercial property",
            "url": "/commercial"
      }
],
  },
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
    category: catMap.get("buying-guide") || null,
    author: {"id":1,"name":"Rohan Varma","profileImage":null},
    tags: [{ tag: tagMap.get("bengaluru")! }, { tag: tagMap.get("home-loans")! }, { tag: tagMap.get("rera-checklist")! }, { tag: tagMap.get("a-khata")! }],
    content: [
      {
            "type": "paragraph",
            "text": "Navigating Bengaluru's dynamic real estate landscape requires more than just browsing floor plans. Whether you are eyeing an upcoming corridor near the Metro extension or an established enclave in Indiranagar, carrying out methodical due diligence is the single highest-return activity you will undertake."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "1. The Non-Negotiable Document: RERA & Approvals"
      },
      {
            "type": "paragraph",
            "text": "Before paying any booking token, verify that the project is registered with Karnataka RERA (K-RERA). Cross-check the approved master plan, completion timeline commitments, and escrow bank details directly on the official portal."
      },
      {
            "type": "callout",
            "tone": "warning",
            "title": "Beware of Pre-Launch Pitfalls",
            "text": "Never invest in 'soft-launch' or 'expression of interest' proposals that do not possess an active K-RERA registration number. It is unlawful under Section 3 of RERA for promoters to market or invite bookings prior to registration."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "2. Decoding Khata: A-Khata vs B-Khata"
      },
      {
            "type": "paragraph",
            "text": "In BBMP jurisdiction, the type of Khata directly determines legal ownership and resale viability:"
      },
      {
            "type": "list",
            "style": "bullet",
            "items": [
                  "A-Khata: Fully compliant property with sanctioned building plan, occupancy certificate (OC), and direct access to bank home loans.",
                  "B-Khata: Temporary tax-paying register entry acknowledging unauthorized construction or zoning deviations. Major national banks do not finance B-Khata apartments.",
                  "Occupancy Certificate (OC): An absolute must for ready-to-move projects. Never take physical possession without the builder procuring an OC from BBMP/BDA."
            ]
      },
      {
            "type": "quote",
            "text": "A lower price per square foot on an unapproved property is not a bargain—it is a deferred legal liability that compounds every year.",
            "attribution": "Awasio Legal Advisory Desk"
      },
      {
            "type": "heading",
            "level": 2,
            "text": "3. Estimating Real Total Cash Outflow"
      },
      {
            "type": "paragraph",
            "text": "Beyond the base sale price quoted by promoters, factor in statutory stamp duty (approx 5.6%), registration cess (1%), GST (5% on under-construction; 0% on ready properties with OC), plus maintenance corpus deposits, clubhouse amenity charges, and legal drafting costs."
      },
      {
            "type": "cta",
            "title": "Find Verified Properties in Bengaluru",
            "text": "Explore curated homes with verified RERA certificates, clear titles, and zero brokerage options.",
            "label": "Search Bengaluru Homes",
            "url": "/buy/bengaluru"
      }
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
    category: catMap.get("rental-flatmates") || null,
    author: {"id":2,"name":"Meera Singhania","profileImage":null},
    tags: [{ tag: tagMap.get("co-living")! }, { tag: tagMap.get("rental-agreement")! }, { tag: tagMap.get("bengaluru")! }, { tag: tagMap.get("gurugram")! }],
    content: [
      {
            "type": "paragraph",
            "text": "Shared housing is often the smartest financial move when relocating to cities like Bengaluru, Gurugram, or Pune. But roommate relationships frequently fracture over small, preventable misunderstandings regarding utilities, guest policies, or cleaning responsibilities."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "The Three Essential House Rules"
      },
      {
            "type": "list",
            "style": "numbered",
            "items": [
                  "Automate All Shared Expenses: Use dedicated bill-splitting apps connected to UPI immediately on month start. Do not let power or maid salaries linger uncollected.",
                  "Establish Quiet Hours & Work-from-Home Zones: Agree on hours when common areas remain noise-free, especially for hybrid tech teams handling client meetings.",
                  "Guest and Significant Other Protocols: Set clear expectations on overnight visitor durations to respect each flatmate's personal comfort."
            ]
      },
      {
            "type": "callout",
            "tone": "tip",
            "title": "Pro Tip: Separate Security Deposit Allocation",
            "text": "Ensure the owner's rental agreement explicitly names each occupant with individual deposit contributions and notice period provisions. That way, if one person transfers cities, the remaining tenants are not burdened with refunding the deposit out of pocket."
      },
      {
            "type": "cta",
            "title": "Looking for Verified Roommates?",
            "text": "Browse verified working professionals and student flatmate listings with lifestyle match scoring.",
            "label": "Find Flatmates Now",
            "url": "/flatmates"
      }
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
    category: catMap.get("neighborhood-intel") || null,
    author: {"id":3,"name":"Aarav Kapoor","profileImage":null},
    tags: [{ tag: tagMap.get("gurugram")! }, { tag: tagMap.get("price-trends")! }, { tag: tagMap.get("investment")! }],
    content: [
      {
            "type": "paragraph",
            "text": "The choice between Gurugram (Millennium City) and Noida (the planned industrial hub) remains the defining decision for newcomers to the National Capital Region. Both offer world-class corporate towers and gated townships, but their day-to-day realities differ significantly."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Rental Yields and Affordability"
      },
      {
            "type": "paragraph",
            "text": "Noida generally offers approximately 20% to 35% more carpet area for the same monthly rental outlay compared to prime Gurugram sectors (such as DLF Phase 5 or Golf Course Extension). A 2 BHK in Noida Sector 75 or 137 averages ₹24,000–₹32,000/month, whereas equivalent specifications in Gurugram command ₹36,000–₹55,000/month."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "Infrastructure and Commute"
      },
      {
            "type": "list",
            "style": "bullet",
            "items": [
                  "Metro Network: Noida enjoys expansive connectivity via the DMRC Blue Line and Aqua Line with minimal transfers into central Delhi.",
                  "Corporate Proximity: If your employer is anchored in DLF Cyber City or Horizon Center, living in Noida means a grueling 70+ minute cross-NCR commute.",
                  "Power & Water Security: Large integrated townships in both cities deliver 100% DG power backup, which is vital during NCR's peak summer months."
            ]
      },
      {
            "type": "cta",
            "title": "Explore PG & Flat Shares in Gurugram",
            "text": "Find verified private rooms and co-living beds near Cyber Hub, Sector 48, and Golf Course Road.",
            "label": "View Gurugram PG Listings",
            "url": "/pg/gurugram"
      }
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
    category: catMap.get("legal-rera") || null,
    author: {"id":1,"name":"Rohan Varma","profileImage":null},
    tags: [{ tag: tagMap.get("rera-checklist")! }, { tag: tagMap.get("a-khata")! }, { tag: tagMap.get("home-loans")! }],
    content: [
      {
            "type": "paragraph",
            "text": "A home is the largest capital commitment most families will ever make. While banks conduct title searches for loan underwriting, remember that bank verification only checks whether the property can serve as loan security—it does not substitute for your own independent legal due diligence."
      },
      {
            "type": "heading",
            "level": 2,
            "text": "The Essential Document Stack"
      },
      {
            "type": "list",
            "style": "numbered",
            "items": [
                  "Mother Deed (Title Trace): Unbroken chain of ownership tracing back at least 30 years to verify how the current vendor acquired legal title.",
                  "Encumbrance Certificate (EC - Form 15): Proof that the property is free of legal mortgages, court attachments, or financial charges during the specified period.",
                  "Conversion Certificate & Zoning Clearance: Proof that agricultural land was lawfully converted for residential non-agricultural (NA) use by the District Collector.",
                  "Sanctioned Building Plan & Commencement Certificate (CC): Official civic authorization confirming the building matches approved floor-space indices (FSI).",
                  "Tax Receipts & Mutation Records: Proof that current local property taxes are fully discharged without outstanding municipal penalties."
            ]
      },
      {
            "type": "callout",
            "tone": "info",
            "title": "Consult an Independent Property Advocate",
            "text": "Always hire an independent advocate who has no commercial affiliation with the builder or marketing broker. A comprehensive title clearance report costs a fraction of 1% of the property value and provides lifelong peace of mind."
      }
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
    items = items.filter((p) => p.tags.some((t) => t.tag?.slug.toLowerCase() === tagSlug));
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
