// Category landing pages for posting a property (/rent-out-flat, /list-plot-for-sale, …). Each one targets its own
// searches with its own copy and opens the same listing form pre-set to that category (`preset`).
// Merged into LISTING_SEO in listingSeo.ts; rendered by app/post-property-free/PropertyListingLanding.tsx.
import type { ListingSeo } from "./listingSeo";

export type PropertyCategoryKey =
  | "rentFlat"
  | "sellProperty"
  | "plot"
  | "commercial"
  | "coworking"
  | "pgHostel"
  | "rentHouse"
  | "office"
  | "shop"
  | "warehouse"
  | "builderFloor"
  | "farmhouse"
  | "studio1rk"
  | "industrial";

/** Order of the category links ("List by property type") on every property listing page. */
export const PROPERTY_CATEGORY_ORDER: PropertyCategoryKey[] = [
  "rentFlat", "sellProperty", "rentHouse", "builderFloor", "studio1rk", "pgHostel", "plot", "farmhouse",
  "commercial", "office", "coworking", "shop", "warehouse", "industrial",
];

const rentCity = (c: string) => `/rent/${c}`;
const buyCity = (c: string) => `/buy/${c}`;
const commercialCity = (c: string) => `/commercial/${c}`;
const plotCity = (c: string) => `/plot/${c}`;
const pgCity = (c: string) => `/pg/${c}`;

const FREE_BENEFIT = { title: "Free to list", text: "No listing fee, 0% commission to Awasio, and 1,000 free credits on signup." };
const DIRECT_BENEFIT = { title: "Direct enquiries, no broker", text: "Phone-verified people contact you directly on call, WhatsApp or chat." };

export const PROPERTY_CATEGORY_PAGES: Record<PropertyCategoryKey, ListingSeo> = {
  rentFlat: {
    key: "rentFlat",
    path: "/rent-out-flat",
    ctaHref: "/rent-out-flat",
    ctaLabel: "Post flat for rent free",
    navLabel: "Rent out flat / apartment",
    preset: { listingType: "RENT", resCom: "RESIDENTIAL", propertySubTypeSlug: "apartment" },
    title: "Rent Out Your Flat Free: Apartment & Rental Listing, No Broker",
    description:
      "Post your flat or apartment for rent free. Free rental listing for 1, 2, 3 BHK with rent, deposit and photos; tenants call you directly. फ्लैट किराये पर दें।",
    keywords: [
      "rent out flat", "flat listing", "free flat listing", "apartment listing", "apartment for rent listing", "rental listing",
      "free rental listing", "post flat for rent", "list flat for rent free", "rent my flat", "rent out apartment online",
      "1 bhk for rent listing", "2 bhk for rent listing", "3 bhk for rent listing", "flat for rent by owner", "tenant without broker",
      "फ्लैट किराये पर दें", "फ्लैट किराये पर देना है", "flat kiraye par dena hai",
    ],
    h1: "Rent Out Your Flat or Apartment Free: No Brokerage",
    intro:
      "Post a free flat listing or apartment listing for rent on Awasio. Add the BHK, rent, deposit, furnishing and photos, and verified tenants in your city contact you directly. No listing fee and no brokerage for you or your tenant.",
    steps: [
      { title: "Add flat details", text: "Society or locality, BHK, floor, carpet area, furnishing and parking." },
      { title: "Set rent and tenant preference", text: "Monthly rent, deposit, maintenance, available-from date and family, bachelor or company lease." },
      { title: "Add photos and go live", text: "Photos of every room, the kitchen and bathrooms. Tenants start contacting you directly." },
    ],
    benefits: [
      FREE_BENEFIT,
      DIRECT_BENEFIT,
      { title: "Find the right tenant", text: "Say who you prefer (family, bachelors, working professionals) so you get relevant enquiries." },
      { title: "Agreement and receipts", text: "Make a rental agreement and rent receipts with Awasio's free tools once you find a tenant." },
    ],
    audience: "Flat and apartment owners, landlords and NRIs renting out a 1 RK to 5 BHK flat anywhere in India.",
    faqs: [
      { q: "How do I rent out my flat without a broker?", a: "Post a free rental listing on Awasio with the rent, deposit and photos. Tenants contact you directly by call or WhatsApp, so neither you nor the tenant pays brokerage." },
      { q: "Is apartment listing for rent free on Awasio?", a: "Yes. Posting a flat or apartment for rent is free and Awasio takes 0% commission." },
      { q: "What should I add to get more tenant enquiries?", a: "Clear photos of every room, the exact society or locality, rent and deposit, furnishing, parking and the date the flat is available from." },
      { q: "Can I choose between family and bachelor tenants?", a: "Yes. Set your preferred tenants (family, bachelors, working professionals or company lease) on the listing." },
      { q: "फ्लैट किराये पर कैसे दें?", a: "Awasio पर फ्री लिस्टिंग बनाएं: BHK, किराया, डिपॉजिट और फोटो डालें। किरायेदार सीधे आपसे संपर्क करेंगे, कोई ब्रोकरेज नहीं।" },
    ],
    guides: [
      {
        heading: "Writing a flat listing that gets tenants",
        paragraphs: [
          "Tenants filter by locality, BHK, budget and furnishing first, so fill these in exactly. Mention the society name, floor, lift, power backup, water supply and parking. Listings with 8 or more clear photos get far more calls.",
          "Price close to similar flats in your society. If your flat is semi-furnished or fully furnished, list what is included (wardrobes, AC, geyser, modular kitchen) so tenants can compare.",
        ],
      },
      {
        heading: "फ्लैट या अपार्टमेंट किराये पर दें: फ्री रेंटल लिस्टिंग",
        lang: "hi",
        paragraphs: [
          "Awasio पर 1 BHK, 2 BHK या 3 BHK फ्लैट किराये पर देने के लिए फ्री लिस्टिंग बनाएं। किराया, सिक्योरिटी डिपॉजिट, फर्निशिंग और किरायेदार की पसंद (फैमिली या बैचलर) डालें। वेरिफाइड किरायेदार सीधे आपको कॉल करेंगे।",
        ],
      },
    ],
    cityHeading: "Flats for rent by city",
    cityPath: rentCity,
    citySlugs: "property",
  },

  sellProperty: {
    key: "sellProperty",
    path: "/sell-property-online",
    ctaHref: "/sell-property-online",
    ctaLabel: "Post property for sale free",
    navLabel: "Sell flat / house",
    preset: { listingType: "SELL", resCom: "RESIDENTIAL" },
    title: "Sell Property Online Free: Sell Your Flat or House Without Broker",
    description:
      "Sell your flat, house or villa online with a free sell listing. Buyers contact you directly, 0% commission. मकान या फ्लैट बेचें, बिना ब्रोकर।",
    keywords: [
      "sell property online", "sell listing", "property sell listing", "sell my flat", "sell my house online", "sell house without broker",
      "sell flat by owner", "post property for sale free", "list property for sale", "free property sale listing", "resale flat listing",
      "sell apartment online", "sell villa", "मकान बेचना है", "फ्लैट बेचना है", "प्रॉपर्टी बेचें", "makan bechna hai", "property bechni hai",
    ],
    h1: "Sell Your Property Online Free: Flat, House or Villa",
    intro:
      "Create a free sell listing for your flat, apartment, independent house, villa or builder floor. Add the expected price, area, age and photos, and genuine buyers contact you directly. Awasio charges 0% commission on the sale.",
    steps: [
      { title: "Add property details", text: "Property type, society or locality, BHK, carpet and super area, floor and facing." },
      { title: "Set your price", text: "Expected price, price per sq ft, ownership, age of property and whether it's resale or new." },
      { title: "Add photos and publish", text: "Buyers searching your city and locality see your listing and contact you directly." },
    ],
    benefits: [
      FREE_BENEFIT,
      DIRECT_BENEFIT,
      { title: "Serious buyers", text: "Enquiries come from phone-verified buyers searching your locality and budget." },
      { title: "Price guidance", text: "Check locality price trends on Awasio before you set your expected price." },
    ],
    audience: "Owners selling a resale flat, apartment, independent house, villa or builder floor, and brokers with sale mandates.",
    faqs: [
      { q: "How do I sell my house or flat online without a broker?", a: "Post a free sell listing on Awasio with the expected price, area and photos. Buyers contact you directly, so there is no brokerage on Awasio." },
      { q: "Is a property sell listing free?", a: "Yes. Listing a property for sale is free and Awasio takes 0% commission on the deal." },
      { q: "How do I decide the selling price?", a: "Compare recent prices of similar flats in your society or locality. Awasio's price trends page shows average rates by locality." },
      { q: "Which documents do buyers usually ask for?", a: "Sale deed or allotment letter, previous chain of documents, approved building plan, occupancy certificate, property tax receipts and a no-dues certificate from the society." },
      { q: "मकान या फ्लैट ऑनलाइन कैसे बेचें?", a: "Awasio पर फ्री सेल लिस्टिंग बनाएं, कीमत, एरिया और फोटो डालें। खरीदार सीधे आपसे संपर्क करेंगे, कोई कमीशन नहीं।" },
    ],
    guides: [
      {
        heading: "How to sell your flat or house faster",
        paragraphs: [
          "Buyers compare price per sq ft first, so state the carpet area and super area clearly and price close to recent deals in your locality. Mention the age of the building, approvals, parking, and whether there is a loan on the property.",
          "Keep documents ready: sale deed, approved plan, occupancy certificate, tax receipts and society NOC. Use Awasio's stamp duty calculator to tell buyers their registration cost up front.",
        ],
      },
      {
        heading: "मकान या फ्लैट बेचना है? फ्री सेल लिस्टिंग बनाएं",
        lang: "hi",
        paragraphs: [
          "Awasio पर अपना फ्लैट, मकान, कोठी या विला बेचने के लिए फ्री लिस्टिंग बनाएं। कीमत, एरिया, फोटो और लोकेशन डालें। खरीदार सीधे आपसे बात करेंगे और Awasio कोई कमीशन नहीं लेता।",
        ],
      },
    ],
    cityHeading: "Property for sale by city",
    cityPath: buyCity,
    citySlugs: "property",
  },

  plot: {
    key: "plot",
    path: "/list-plot-for-sale",
    ctaHref: "/list-plot-for-sale",
    ctaLabel: "Post plot free",
    navLabel: "Plot / land (sell or lease)",
    preset: { listingType: "SELL", resCom: "RESIDENTIAL", propertySubTypeSlug: "plot-land-res" },
    title: "Free Plot Listing: Sell or Lease Residential & Commercial Plots",
    description:
      "List your residential or commercial plot free, for sale or lease. Add size, facing and road width; buyers call you directly. प्लॉट बेचें या लीज़ पर दें।",
    keywords: [
      "plot listing", "free plot listing", "sell plot online", "land listing", "sell land online", "plot for sale by owner",
      "residential plot for sale listing", "commercial plot listing", "commercial plot for sale", "commercial land for lease",
      "plot for lease", "land for lease listing", "lease land online", "industrial plot listing", "post plot for sale",
      "list land for sale free", "sell plot without broker",
      "प्लॉट बेचें", "प्लॉट बेचना है", "जमीन बेचनी है", "जमीन लीज़ पर दें", "कमर्शियल प्लॉट", "plot bechna hai", "zameen lease par deni hai",
    ],
    h1: "Free Plot Listing: Sell or Lease Your Residential or Commercial Plot",
    intro:
      "List a residential plot, commercial plot or land on Awasio for free, for sale or on lease. Add the plot area, dimensions, facing, road width and approvals so buyers and businesses can shortlist it, and they contact you directly with no brokerage.",
    steps: [
      { title: "Choose sale or lease", text: "Pick Sell or Rent / Lease, then Residential or Commercial. The plot stays selected." },
      { title: "Add plot details", text: "Plot area (sq ft, sq yd or gaj), length × breadth, facing, road width, open sides and approvals." },
      { title: "Set price and publish", text: "Sale price, or lease rent with tenure and deposit. Buyers and businesses contact you directly." },
    ],
    benefits: [
      FREE_BENEFIT,
      DIRECT_BENEFIT,
      { title: "Residential or commercial", text: "Colony and society plots, or commercial and industrial land on main roads." },
      { title: "Sale or lease", text: "Sell outright, or lease the land long-term to a business, petrol pump, school or warehouse." },
    ],
    audience: "Plot and land owners, colonisers and brokers selling or leasing residential or commercial plots.",
    faqs: [
      { q: "Is plot listing free on Awasio?", a: "Yes. Listing a residential or commercial plot for sale or lease is free, with 0% commission to Awasio." },
      { q: "Can I list a commercial plot?", a: "Yes. On the first step choose Commercial; the plot stays selected as a commercial plot / land." },
      { q: "Can I give my plot or land on lease?", a: "Yes. Choose Rent / Lease instead of Sell and add the monthly or yearly rent, lease tenure, lock-in and deposit." },
      { q: "What details should a plot listing have?", a: "Plot area and dimensions, facing, road width, open sides, boundary wall, approvals (authority or RERA), land use (residential, commercial or industrial), ownership type and the price or lease rent." },
      { q: "Which area units can I use?", a: "Square feet, square yards (gaj), square metres, acres and other common local units. Use the area converter to switch between them." },
      { q: "प्लॉट या जमीन बेचें या लीज़ पर कैसे दें?", a: "Awasio पर फ्री प्लॉट लिस्टिंग बनाएं: बेचना है या लीज़ पर देना है चुनें, आवासीय या कमर्शियल चुनें, फिर साइज़, फेसिंग, सड़क की चौड़ाई और कीमत डालें। खरीदार सीधे आपसे संपर्क करेंगे।" },
    ],
    guides: [
      {
        heading: "Residential plot listing: what buyers check",
        paragraphs: [
          "Buyers shortlist residential plots by location, size, facing and price. East and north facing plots, corner plots and plots on wider roads usually sell faster, so state these clearly. Mention whether the plot is in an approved colony or a RERA-registered project, and keep the title chain, mutation and encumbrance certificate ready.",
        ],
      },
      {
        heading: "Commercial plot and land for sale or lease",
        paragraphs: [
          "Commercial plots on main roads, highways and in industrial areas are bought or leased by retailers, petrol pumps, schools, hospitals, warehouses and factories. State the frontage, road width, land use or zoning, conversion status and power availability. For lease, add the tenure, rent, yearly escalation and lock-in.",
        ],
      },
      {
        heading: "प्लॉट या जमीन बेचें या लीज़ पर दें",
        lang: "hi",
        paragraphs: [
          "Awasio पर आवासीय प्लॉट, कमर्शियल प्लॉट या जमीन फ्री में बेचने या लीज़ पर देने के लिए लिस्ट करें। प्लॉट का साइज़ (गज या sq ft), फेसिंग, सड़क की चौड़ाई, अप्रूवल और कीमत या किराया डालें। खरीदार और बिज़नेस सीधे आपसे बात करेंगे, कोई ब्रोकरेज नहीं।",
        ],
      },
    ],
    cityHeading: "Plots for sale by city",
    cityPath: plotCity,
    citySlugs: "property",
  },

  commercial: {
    key: "commercial",
    path: "/list-commercial-property",
    ctaHref: "/list-commercial-property",
    ctaLabel: "Post commercial property free",
    navLabel: "Commercial property",
    preset: { listingType: "RENT", resCom: "COMMERCIAL" },
    title: "Free Commercial Property Listing: Office, Shop & Warehouse",
    description:
      "List office space, shops, showrooms, warehouses or commercial plots free, for rent, lease or sale. Businesses contact you directly. दुकान, ऑफिस किराये पर दें।",
    keywords: [
      "commercial property listing", "free commercial property listing", "commercial space listing", "list commercial property",
      "commercial space for rent listing", "commercial property for sale listing", "lease commercial property", "office shop warehouse listing",
      "post commercial property free", "commercial property by owner",
      "दुकान किराये पर दें", "ऑफिस किराये पर दें", "कमर्शियल प्रॉपर्टी किराये पर", "dukan kiraye par deni hai",
    ],
    h1: "Free Commercial Property Listing: Office, Shop, Showroom & Warehouse",
    intro:
      "Post a free commercial property listing on Awasio for office space, co-working space, shops, showrooms, warehouses, godowns, industrial sheds and commercial plots, for rent, lease or sale. Businesses and investors contact you directly with no brokerage.",
    steps: [
      { title: "Pick the space type", text: "Office, retail shop or showroom, storage, industry, hospitality or commercial plot." },
      { title: "Add business details", text: "Carpet area, floor, frontage, washrooms, parking, power load, fire safety and suitable businesses." },
      { title: "Set rent or price", text: "Monthly rent, lock-in, escalation and deposit, or the sale price. Then publish." },
    ],
    benefits: [
      FREE_BENEFIT,
      DIRECT_BENEFIT,
      { title: "Every commercial type", text: "Offices, co-working, shops, showrooms, warehouses, godowns, industrial sheds and commercial land." },
      { title: "Lease terms included", text: "Show lock-in period, rent escalation and deposit so businesses can decide quickly." },
    ],
    audience: "Owners and brokers renting, leasing or selling offices, shops, showrooms, warehouses, industrial property and commercial land.",
    faqs: [
      { q: "Is commercial property listing free on Awasio?", a: "Yes. Listing any commercial property for rent, lease or sale is free, with 0% commission to Awasio." },
      { q: "Which commercial properties can I list?", a: "Ready-to-move and bare-shell offices, co-working spaces, shops, showrooms, warehouses and godowns, industrial property, hospitality property and commercial plots." },
      { q: "Can I list a property on lease with lock-in?", a: "Yes. Add the lock-in period, yearly rent escalation and security deposit on the pricing step." },
      { q: "What do businesses look for in a commercial listing?", a: "Exact location and frontage, carpet area, floor, washrooms, parking, power load and backup, fire NOC and which businesses the space suits." },
      { q: "दुकान या ऑफिस किराये पर कैसे दें?", a: "Awasio पर फ्री कमर्शियल लिस्टिंग बनाएं: एरिया, किराया, लॉक-इन और फोटो डालें। बिज़नेस सीधे आपसे संपर्क करेंगे।" },
    ],
    guides: [
      {
        heading: "Office, retail, storage and industrial: list any commercial space",
        paragraphs: [
          "Offices: list ready-to-move, bare-shell or co-working space with seats, cabins and meeting rooms. Retail: list shops and showrooms with frontage, footfall and main-road access. Storage and industry: list warehouses, godowns and sheds with clear height, floor load and truck access.",
          "Commercial plots and land can be listed for sale or long lease with road width, zoning and approvals.",
        ],
      },
      {
        heading: "दुकान, ऑफिस, शोरूम या गोदाम किराये पर दें",
        lang: "hi",
        paragraphs: [
          "Awasio पर अपनी दुकान, ऑफिस, शोरूम, गोदाम या कमर्शियल प्लॉट फ्री में किराये, लीज़ या बिक्री के लिए लिस्ट करें। एरिया, किराया, लॉक-इन और फोटो डालें। बिज़नेस और निवेशक सीधे आपसे संपर्क करेंगे।",
        ],
      },
    ],
    cityHeading: "Commercial property by city",
    cityPath: commercialCity,
    citySlugs: "property",
  },

  coworking: {
    key: "coworking",
    path: "/list-coworking-space",
    ctaHref: "/list-coworking-space",
    ctaLabel: "List coworking space free",
    navLabel: "Co-working space",
    preset: { listingType: "RENT", resCom: "COMMERCIAL", propertySubTypeSlug: "office", propertySubCategorySlug: "co-working-office-space" },
    title: "List Your Coworking Space Free: Get Startup & Team Enquiries",
    description:
      "List your coworking space free: hot desks, dedicated desks, private cabins and meeting rooms. Startups and teams contact you directly.",
    keywords: [
      "list coworking space", "coworking space listing", "free coworking listing", "co-working space for rent", "list co-working office",
      "coworking space owner", "shared office space listing", "hot desk listing", "private cabin for rent", "managed office listing",
      "coworking space in india list", "को-वर्किंग स्पेस",
    ],
    h1: "List Your Coworking Space Free: Desks, Cabins & Meeting Rooms",
    intro:
      "Coworking operators and office owners can list a coworking space on Awasio for free. Show your seats, private cabins, meeting rooms, amenities and monthly price per seat, and startups, freelancers and growing teams contact you directly.",
    steps: [
      { title: "Add the centre", text: "Building, locality, floor, total seats, cabins and meeting rooms." },
      { title: "Add amenities and pricing", text: "Wi-Fi, power backup, pantry, parking, access hours, and price per seat or cabin per month." },
      { title: "Publish and get teams", text: "Teams searching for office space in your city contact you directly." },
    ],
    benefits: [
      FREE_BENEFIT,
      DIRECT_BENEFIT,
      { title: "Seats to full floors", text: "Fill single desks, private cabins or a whole managed floor from one listing." },
      { title: "B2B enquiries", text: "Reach startups, SMEs and companies looking for flexible office space." },
    ],
    audience: "Coworking operators, managed-office providers and office owners offering shared or flexible workspace.",
    faqs: [
      { q: "Is listing a coworking space free?", a: "Yes. Listing a coworking or managed office space on Awasio is free, with 0% commission." },
      { q: "Can I list desks and private cabins separately?", a: "List the centre once with total seats, cabins and meeting rooms, and mention per-seat and per-cabin pricing in the details." },
      { q: "What do teams look for in a coworking listing?", a: "Location and metro access, price per seat, private cabins, meeting rooms, internet speed, power backup, access hours, parking and a GST invoice." },
      { q: "Can I list a managed or ready-to-move office too?", a: "Yes. Choose Commercial → Office and pick ready-to-move, bare shell or co-working." },
    ],
    guides: [
      {
        heading: "Make your coworking listing stand out",
        paragraphs: [
          "Show real photos of the desks, cabins, meeting rooms and pantry. State the monthly price per seat and per cabin, what's included (internet, electricity, housekeeping, tea and coffee) and the minimum lock-in. Mention access hours, metro distance and parking.",
        ],
      },
      {
        heading: "को-वर्किंग स्पेस फ्री में लिस्ट करें",
        lang: "hi",
        paragraphs: [
          "Awasio पर अपना को-वर्किंग स्पेस फ्री में लिस्ट करें। सीटें, केबिन, मीटिंग रूम और प्रति सीट किराया डालें। स्टार्टअप और कंपनियां सीधे आपसे संपर्क करेंगी।",
        ],
      },
    ],
    cityHeading: "Office and commercial space by city",
    cityPath: commercialCity,
    citySlugs: "property",
  },

  pgHostel: {
    key: "pgHostel",
    path: "/list-pg-hostel",
    ctaHref: "/list-pg-hostel",
    ctaLabel: "List PG / hostel free",
    navLabel: "PG / hostel",
    preset: { listingType: "PG", resCom: "RESIDENTIAL" },
    title: "Free PG Listing: List Your PG or Hostel and Fill Beds Faster",
    description:
      "List your PG, hostel or student rooms free. Add sharing, rent per bed, food and rules; students and professionals call you directly. पीजी फ्री में लिस्ट करें।",
    keywords: [
      "pg listing", "free pg listing", "list pg online", "hostel listing", "list hostel free", "pg owner listing", "post pg for rent",
      "boys pg listing", "girls pg listing", "co-living listing", "student room listing", "paying guest listing",
      "पीजी लिस्टिंग", "पीजी किराये पर", "हॉस्टल लिस्टिंग", "pg kiraye par",
    ],
    h1: "Free PG Listing: List Your PG, Hostel or Co-living Rooms",
    intro:
      "PG, hostel and co-living owners can list rooms and beds on Awasio for free. Add single, double or triple sharing, rent per bed, food, electricity, curfew and gender, and students and working professionals contact you directly.",
    steps: [
      { title: "Add PG details", text: "Boys, girls or co-ed, sharing types, total beds, and private or shared rooms." },
      { title: "Food, rules and rent", text: "Meals included, electricity charges, curfew, deposit and rent per bed or room." },
      { title: "Photos and go live", text: "Photos of rooms, washrooms and common areas. Tenants contact you directly." },
    ],
    benefits: [
      FREE_BENEFIT,
      DIRECT_BENEFIT,
      { title: "Built for PGs", text: "Sharing types, meals, electricity, curfew and gender: what PG seekers filter by." },
      { title: "Fill beds faster", text: "Reach students and working professionals searching PGs near colleges and offices." },
    ],
    audience: "PG owners, hostel operators, co-living brands and landlords renting student rooms or beds.",
    faqs: [
      { q: "Is PG listing free on Awasio?", a: "Yes. Listing a PG, hostel or co-living property is free, with 0% commission." },
      { q: "Can I list rent per bed?", a: "Yes. Choose bed-wise or room-wise pricing and add the rent for single, double, triple or 4+ sharing." },
      { q: "Can I mention food and electricity charges?", a: "Yes. Choose meals included, optional mess or self-cooking, and whether electricity is included, sub-metered or a fixed monthly charge." },
      { q: "Looking for a flatmate instead?", a: "To share your own flat with a flatmate, use Post Flatmate instead of a PG listing." },
      { q: "पीजी या हॉस्टल कैसे लिस्ट करें?", a: "Awasio पर फ्री पीजी लिस्टिंग बनाएं: शेयरिंग, प्रति बेड किराया, खाना, नियम और फोटो डालें। छात्र और नौकरीपेशा लोग सीधे आपसे संपर्क करेंगे।" },
    ],
    guides: [
      {
        heading: "What PG seekers check before calling",
        paragraphs: [
          "PG seekers filter by distance to their college or office, rent per bed, sharing type, food and gender. State the meals (breakfast, dinner or all three), Wi-Fi, laundry, housekeeping, AC, curfew time and deposit clearly, with photos of rooms and washrooms.",
        ],
      },
      {
        heading: "पीजी, हॉस्टल या स्टूडेंट रूम फ्री में लिस्ट करें",
        lang: "hi",
        paragraphs: [
          "Awasio पर बॉयज़ पीजी, गर्ल्स पीजी, हॉस्टल या स्टूडेंट रूम फ्री में लिस्ट करें। सिंगल, डबल या ट्रिपल शेयरिंग, प्रति बेड किराया, खाना और नियम डालें।",
        ],
      },
    ],
    cityHeading: "PGs by city",
    cityPath: pgCity,
    citySlugs: "property",
  },

  rentHouse: {
    key: "rentHouse",
    path: "/rent-out-house",
    ctaHref: "/rent-out-house",
    ctaLabel: "Post house for rent free",
    navLabel: "Rent out house / villa",
    preset: { listingType: "RENT", resCom: "RESIDENTIAL", propertySubTypeSlug: "independent-house-villa" },
    title: "Rent Out Your House Free: Independent House & Villa Listing",
    description:
      "Post your independent house, kothi or villa for rent free. Add rent, floors and photos; tenants contact you directly, no brokerage. मकान किराये पर दें।",
    keywords: [
      "rent out house", "house for rent listing", "independent house for rent listing", "villa for rent listing", "kothi for rent",
      "post house for rent free", "list house for rent", "rent my house", "house rental listing", "house for rent by owner",
      "मकान किराये पर दें", "मकान किराये पर देना है", "कोठी किराये पर", "makan kiraye par dena hai",
    ],
    h1: "Rent Out Your House, Kothi or Villa Free",
    intro:
      "List an independent house, kothi or villa for rent on Awasio for free. Rent out the whole house or a single floor, add rent, deposit, parking and photos, and families and companies contact you directly with no brokerage.",
    steps: [
      { title: "Add house details", text: "Locality, plot size, floors, bedrooms, which floor is for rent, parking and garden." },
      { title: "Set rent and terms", text: "Monthly rent, deposit, maintenance, available-from date and preferred tenants." },
      { title: "Add photos and publish", text: "Photos of every room and the exterior. Tenants contact you directly." },
    ],
    benefits: [
      FREE_BENEFIT,
      DIRECT_BENEFIT,
      { title: "Whole house or one floor", text: "Rent out the entire house or a single floor of your kothi." },
      { title: "Family and company tenants", text: "Reach families and companies looking for independent homes." },
    ],
    audience: "Owners renting out an independent house, kothi, villa or a floor of their house.",
    faqs: [
      { q: "Can I rent out only one floor of my house?", a: "Yes. List the floor you are renting (for example ground or first floor) with its own rent. For a separate builder floor, use the builder floor listing." },
      { q: "Is listing a house for rent free?", a: "Yes. House and villa rental listings are free, with 0% commission to Awasio." },
      { q: "Which details matter most for house tenants?", a: "Locality, number of bedrooms and bathrooms, which floor, parking, water supply, power backup, pets policy and the rent and deposit." },
      { q: "मकान किराये पर कैसे दें?", a: "Awasio पर फ्री लिस्टिंग बनाएं: कमरे, फ्लोर, किराया, डिपॉजिट और फोटो डालें। किरायेदार सीधे आपसे संपर्क करेंगे।" },
    ],
    guides: [
      {
        heading: "Renting out an independent house or villa",
        paragraphs: [
          "Mention whether the whole house or a single floor is for rent, separate entry, parking for cars and bikes, terrace or garden access, water and power backup, and whether pets are allowed. Families value nearby schools and markets, so name them.",
        ],
      },
      {
        heading: "मकान या कोठी किराये पर दें: फ्री लिस्टिंग",
        lang: "hi",
        paragraphs: [
          "Awasio पर अपना पूरा मकान, कोठी, विला या एक फ्लोर किराये पर देने के लिए फ्री लिस्टिंग बनाएं। किराया, डिपॉजिट, पार्किंग और फोटो डालें। परिवार और कंपनियां सीधे आपसे संपर्क करेंगी।",
        ],
      },
    ],
    cityHeading: "Houses for rent by city",
    cityPath: rentCity,
    citySlugs: "property",
  },

  office: {
    key: "office",
    path: "/list-office-space",
    ctaHref: "/list-office-space",
    ctaLabel: "List office space free",
    navLabel: "Office space",
    preset: { listingType: "RENT", resCom: "COMMERCIAL", propertySubTypeSlug: "office" },
    title: "List Office Space Free: Office for Rent, Lease or Sale",
    description:
      "List office space free: ready-to-move, furnished, bare-shell or co-working, for rent, lease or sale. Companies contact you directly. ऑफिस किराये पर दें।",
    keywords: [
      "list office space", "office space listing", "office space for rent listing", "office for lease listing", "office for sale listing",
      "furnished office for rent", "ready to move office space", "bare shell office space", "commercial office listing",
      "post office space free", "office space by owner", "ऑफिस किराये पर दें", "ऑफिस स्पेस किराये पर",
    ],
    h1: "List Your Office Space Free: Rent, Lease or Sale",
    intro:
      "Post a free office space listing on Awasio for ready-to-move, furnished, bare-shell or co-working offices, in IT parks, business centres, commercial complexes or standalone buildings. Companies and startups contact you directly.",
    steps: [
      { title: "Add the office", text: "Building or IT park, floor, carpet area, ready-to-move or bare shell." },
      { title: "Add the fit-out", text: "Workstations, cabins, meeting rooms, pantry, washrooms, parking and power backup." },
      { title: "Set rent and publish", text: "Rent per month or per sq ft, deposit, lock-in and escalation, or the sale price." },
    ],
    benefits: [
      FREE_BENEFIT,
      DIRECT_BENEFIT,
      { title: "Any office type", text: "Ready-to-move, furnished, bare shell, co-working and managed offices." },
      { title: "Business-ready details", text: "Workstations, cabins, power load, fire NOC and parking: what companies ask first." },
    ],
    audience: "Owners and brokers renting, leasing or selling office space in IT parks, business centres and commercial buildings.",
    faqs: [
      { q: "Is office space listing free?", a: "Yes. Listing office space for rent, lease or sale on Awasio is free, with 0% commission." },
      { q: "Can I list a bare-shell office?", a: "Yes. Choose Office → Bare shell office space and add the carpet area, floor and possible fit-out." },
      { q: "What do companies check in an office listing?", a: "Location and metro access, carpet area, workstations and cabins, power load and backup, parking, lock-in, escalation and fire NOC." },
      { q: "ऑफिस किराये पर कैसे दें?", a: "Awasio पर फ्री ऑफिस लिस्टिंग बनाएं: एरिया, वर्कस्टेशन, केबिन, किराया और फोटो डालें। कंपनियां सीधे आपसे संपर्क करेंगी।" },
    ],
    guides: [
      {
        heading: "Ready-to-move vs bare-shell office listings",
        paragraphs: [
          "For a ready-to-move or furnished office, list the workstations, cabins, conference rooms, pantry and AC. For a bare-shell office, list the carpet area, floor plate, ceiling height, power load and whether the landlord offers fit-out support. Both should state rent per sq ft, lock-in and escalation.",
        ],
      },
      {
        heading: "ऑफिस स्पेस किराये या बिक्री के लिए लिस्ट करें",
        lang: "hi",
        paragraphs: [
          "Awasio पर रेडी-टू-मूव, फर्निश्ड या बेयर-शेल ऑफिस फ्री में लिस्ट करें। एरिया, वर्कस्टेशन, केबिन, किराया और लॉक-इन डालें।",
        ],
      },
    ],
    cityHeading: "Office and commercial space by city",
    cityPath: commercialCity,
    citySlugs: "property",
  },

  shop: {
    key: "shop",
    path: "/list-shop-for-rent",
    ctaHref: "/list-shop-for-rent",
    ctaLabel: "List shop free",
    navLabel: "Shop / showroom",
    preset: { listingType: "RENT", resCom: "COMMERCIAL", propertySubTypeSlug: "retail", propertySubCategorySlug: "commercial-shops" },
    title: "List Your Shop or Showroom Free: Shop for Rent or Sale",
    description:
      "List your shop or showroom for rent or sale free. Add frontage, area and rent; retailers and brands contact you directly. दुकान किराये पर दें।",
    keywords: [
      "shop listing", "shop for rent listing", "list shop for rent", "shop for sale listing", "showroom for rent", "showroom listing",
      "retail space listing", "commercial shop for rent", "post shop for rent free", "shop for rent by owner",
      "दुकान किराये पर दें", "दुकान किराये पर देनी है", "दुकान बेचनी है", "dukan kiraye par deni hai",
    ],
    h1: "List Your Shop or Showroom Free: Rent or Sale",
    intro:
      "Post a free listing for a shop or showroom in a market, high street, mall or commercial complex. Add frontage, carpet area, floor and rent, and retailers, brands and franchises contact you directly with no brokerage.",
    steps: [
      { title: "Add the shop", text: "Market, mall or complex, floor, carpet area, frontage and main-road access." },
      { title: "Add business details", text: "Suitable businesses, washroom, parking, power load and footfall." },
      { title: "Set rent and publish", text: "Monthly rent, deposit and lock-in, or the sale price." },
    ],
    benefits: [
      FREE_BENEFIT,
      DIRECT_BENEFIT,
      { title: "Shops and showrooms", text: "Small shops, large showrooms and retail spaces in malls or on high streets." },
      { title: "Reach retailers and brands", text: "Enquiries from shopkeepers, franchises and brands looking for retail space." },
    ],
    audience: "Owners and brokers renting or selling shops, showrooms and retail space.",
    faqs: [
      { q: "Is shop listing free?", a: "Yes. Listing a shop or showroom for rent or sale is free, with 0% commission to Awasio." },
      { q: "What should a shop listing include?", a: "Exact market or road, frontage in feet, carpet area, floor, suitable businesses, parking, washroom and the rent, deposit and lock-in." },
      { q: "Can I list a showroom in a mall?", a: "Yes. Choose Retail → Commercial showroom and set 'located inside' to Mall." },
      { q: "दुकान किराये पर कैसे दें?", a: "Awasio पर फ्री लिस्टिंग बनाएं: मार्केट, एरिया, फ्रंटेज, किराया और फोटो डालें। दुकानदार और ब्रांड सीधे आपसे संपर्क करेंगे।" },
    ],
    guides: [
      {
        heading: "Shop listings that get the right tenants",
        paragraphs: [
          "Retailers decide on location, frontage and footfall. Say which market or road the shop is on, the frontage width, whether it's ground floor, nearby anchor stores, and which businesses suit it (pharmacy, clothing, food, salon). Add photos from the road.",
        ],
      },
      {
        heading: "दुकान या शोरूम किराये पर दें या बेचें",
        lang: "hi",
        paragraphs: [
          "Awasio पर अपनी दुकान या शोरूम फ्री में लिस्ट करें। मार्केट, फ्रंटेज, एरिया और किराया डालें। दुकानदार, ब्रांड और फ्रैंचाइज़ी सीधे आपसे संपर्क करेंगे।",
        ],
      },
    ],
    cityHeading: "Shops and commercial space by city",
    cityPath: commercialCity,
    citySlugs: "property",
  },

  warehouse: {
    key: "warehouse",
    path: "/list-warehouse-godown",
    ctaHref: "/list-warehouse-godown",
    ctaLabel: "List warehouse free",
    navLabel: "Warehouse / godown",
    preset: { listingType: "RENT", resCom: "COMMERCIAL", propertySubTypeSlug: "storage" },
    title: "List Warehouse or Godown for Rent Free: Storage Space Listing",
    description:
      "List your warehouse, godown or storage space for rent or lease free. Add area, height and truck access; businesses call you directly. गोदाम किराये पर दें।",
    keywords: [
      "warehouse listing", "warehouse for rent listing", "list warehouse", "godown for rent listing", "godown listing",
      "storage space for rent", "warehouse for lease", "post warehouse free", "cold storage listing", "warehouse by owner",
      "गोदाम किराये पर दें", "गोदाम किराये पर", "godown kiraye par",
    ],
    h1: "List Your Warehouse or Godown Free: Rent or Lease",
    intro:
      "List a warehouse, godown or storage space on Awasio for free. Add the area, clear height, flooring, docks and truck access, and logistics, e-commerce and trading businesses contact you directly.",
    steps: [
      { title: "Add the warehouse", text: "Location, covered and open area, clear height, flooring and number of docks." },
      { title: "Access and compliance", text: "Road width, truck access, power load, fire safety and approvals." },
      { title: "Set rent and publish", text: "Rent per sq ft or per month, deposit and lock-in." },
    ],
    benefits: [
      FREE_BENEFIT,
      DIRECT_BENEFIT,
      { title: "Warehouse-specific details", text: "Clear height, docks, floor load and truck access: what logistics tenants check." },
      { title: "Long-lease tenants", text: "Reach logistics, e-commerce, FMCG and trading companies looking for storage." },
    ],
    audience: "Owners and brokers renting or leasing warehouses, godowns and storage space.",
    faqs: [
      { q: "Is warehouse listing free?", a: "Yes. Listing a warehouse or godown for rent or lease is free, with 0% commission." },
      { q: "What details do warehouse tenants need?", a: "Covered area, clear height, floor load, docks, road width and truck access, power load, fire NOC and distance to the highway." },
      { q: "गोदाम किराये पर कैसे दें?", a: "Awasio पर फ्री लिस्टिंग बनाएं: एरिया, ऊंचाई, ट्रक की पहुंच और किराया डालें। बिज़नेस सीधे आपसे संपर्क करेंगे।" },
    ],
    guides: [
      {
        heading: "Listing a warehouse for logistics and e-commerce",
        paragraphs: [
          "State the covered and open area, clear height at the eaves, flooring type and load capacity, number of docks, and whether 40-ft trucks can reach the gate. Distance to the nearest highway, ring road or industrial area matters to every logistics tenant.",
        ],
      },
      {
        heading: "गोदाम या वेयरहाउस किराये पर दें",
        lang: "hi",
        paragraphs: [
          "Awasio पर अपना गोदाम या वेयरहाउस फ्री में लिस्ट करें। एरिया, ऊंचाई, ट्रक की पहुंच और किराया डालें। लॉजिस्टिक्स और ट्रेडिंग कंपनियां सीधे आपसे संपर्क करेंगी।",
        ],
      },
    ],
    cityHeading: "Commercial property by city",
    cityPath: commercialCity,
    citySlugs: "property",
  },

  builderFloor: {
    key: "builderFloor",
    path: "/list-builder-floor",
    ctaHref: "/list-builder-floor",
    ctaLabel: "List builder floor free",
    navLabel: "Builder floor",
    preset: { listingType: "RENT", resCom: "RESIDENTIAL", propertySubTypeSlug: "independent-builder-floor" },
    title: "List Builder Floor Free: Builder Floor for Rent or Sale",
    description:
      "List your builder floor for rent or sale free. Add floor, BHK, stilt parking and lift; tenants and buyers contact you directly. बिल्डर फ्लोर लिस्ट करें।",
    keywords: [
      "builder floor listing", "builder floor for rent", "builder floor for sale", "independent floor for rent", "list builder floor",
      "builder floor by owner", "stilt plus 4 builder floor", "post builder floor free", "बिल्डर फ्लोर किराये पर", "बिल्डर फ्लोर बेचें",
    ],
    h1: "List Your Builder Floor Free: Rent or Sale",
    intro:
      "List a builder floor or independent floor on Awasio for free, for rent or sale. Add the floor, BHK, stilt parking, lift and plot size, and tenants and buyers contact you directly with no brokerage.",
    steps: [
      { title: "Add the floor", text: "Locality, which floor, BHK, carpet area and plot size." },
      { title: "Building details", text: "Stilt parking, lift, power backup, roof rights and age of the building." },
      { title: "Price and publish", text: "Rent and deposit, or the sale price. Then add photos and publish." },
    ],
    benefits: [
      FREE_BENEFIT,
      DIRECT_BENEFIT,
      { title: "Rent or sale", text: "Switch between rent and sale on the first step of the form." },
      { title: "Floor-specific details", text: "Stilt parking, lift and roof rights: what builder floor buyers compare." },
    ],
    audience: "Owners and builders renting or selling builder floors and independent floors.",
    faqs: [
      { q: "Can I list a builder floor for sale instead of rent?", a: "Yes. The form opens on rent; switch to Sell on the first step." },
      { q: "Is builder floor listing free?", a: "Yes. Listing a builder floor for rent or sale is free, with 0% commission." },
      { q: "What details matter for builder floors?", a: "Which floor, stilt parking, lift, plot size, roof rights, age of construction, and registry or GPA status." },
      { q: "बिल्डर फ्लोर कैसे लिस्ट करें?", a: "Awasio पर फ्री लिस्टिंग बनाएं: फ्लोर, BHK, पार्किंग, लिफ्ट और कीमत डालें। किरायेदार और खरीदार सीधे आपसे संपर्क करेंगे।" },
    ],
    guides: [
      {
        heading: "Builder floor listings: what to mention",
        paragraphs: [
          "Buyers and tenants compare builder floors on the floor number, lift, stilt parking, plot size and the width of the road. For sale listings, mention whether the floor has a separate registry and any roof rights.",
        ],
      },
      {
        heading: "बिल्डर फ्लोर किराये पर दें या बेचें",
        lang: "hi",
        paragraphs: [
          "Awasio पर अपना बिल्डर फ्लोर फ्री में किराये या बिक्री के लिए लिस्ट करें। फ्लोर, BHK, पार्किंग, लिफ्ट और कीमत डालें।",
        ],
      },
    ],
    cityHeading: "Property for rent by city",
    cityPath: rentCity,
    citySlugs: "property",
  },

  farmhouse: {
    key: "farmhouse",
    path: "/list-farmhouse",
    ctaHref: "/list-farmhouse",
    ctaLabel: "List farmhouse free",
    navLabel: "Farmhouse",
    preset: { listingType: "SELL", resCom: "RESIDENTIAL", propertySubTypeSlug: "farmhouse" },
    title: "List Your Farmhouse Free: Farmhouse for Sale or Rent",
    description:
      "List your farmhouse for sale or rent free. Add land area, built-up area, lawns and access road; buyers contact you directly. फार्महाउस बेचें।",
    keywords: [
      "farmhouse listing", "farmhouse for sale listing", "farmhouse for rent", "list farmhouse", "sell farmhouse", "farm house for sale by owner",
      "farmland with house for sale", "post farmhouse free", "फार्महाउस बेचें", "फार्म हाउस किराये पर",
    ],
    h1: "List Your Farmhouse Free: Sale or Rent",
    intro:
      "List a farmhouse on Awasio for free, for sale or long-term rent. Add the land area, built-up area, rooms, lawns, pool, boundary and access road, and buyers contact you directly with no brokerage.",
    steps: [
      { title: "Add the farmhouse", text: "Location, total land, built-up area, rooms and floors." },
      { title: "Outdoor and access", text: "Lawn, pool, trees, boundary wall, water source and the access road." },
      { title: "Price and publish", text: "Sale price or monthly rent. Then add photos and publish." },
    ],
    benefits: [
      FREE_BENEFIT,
      DIRECT_BENEFIT,
      { title: "Sale or rent", text: "Switch between sale and rent on the first step of the form." },
      { title: "Premium buyers", text: "Reach buyers looking for weekend homes and farm properties near cities." },
    ],
    audience: "Farmhouse owners and brokers selling or renting out farmhouses near cities.",
    faqs: [
      { q: "Is farmhouse listing free?", a: "Yes. Listing a farmhouse for sale or rent is free, with 0% commission." },
      { q: "What should a farmhouse listing include?", a: "Total land and built-up area, rooms, lawn and pool, water source, boundary wall, access road width, distance from the city and land-use status." },
      { q: "फार्महाउस कैसे बेचें?", a: "Awasio पर फ्री लिस्टिंग बनाएं: जमीन, बना हुआ एरिया, कमरे, कीमत और फोटो डालें। खरीदार सीधे आपसे संपर्क करेंगे।" },
    ],
    guides: [
      {
        heading: "Selling or renting a farmhouse",
        paragraphs: [
          "Farmhouse buyers want the total land area, built-up area, distance and drive time from the city, the access road, water and power, and the land-use status. Drone or wide photos of the lawn, pool and approach road help a lot.",
        ],
      },
      {
        heading: "फार्महाउस बेचें या किराये पर दें",
        lang: "hi",
        paragraphs: [
          "Awasio पर अपना फार्महाउस फ्री में लिस्ट करें। जमीन, बना हुआ एरिया, लॉन, पूल, सड़क और कीमत डालें। खरीदार सीधे आपसे बात करेंगे।",
        ],
      },
    ],
    cityHeading: "Property for sale by city",
    cityPath: buyCity,
    citySlugs: "property",
  },

  studio1rk: {
    key: "studio1rk",
    path: "/list-1rk-studio",
    ctaHref: "/list-1rk-studio",
    ctaLabel: "List 1 RK / studio free",
    navLabel: "1 RK / studio",
    preset: { listingType: "RENT", resCom: "RESIDENTIAL", propertySubTypeSlug: "1rk-studio-apartment" },
    title: "List 1 RK or Studio Apartment for Rent Free: No Broker",
    description:
      "List your 1 RK, single room or studio apartment for rent free. Students and working professionals contact you directly. 1 RK किराये पर दें।",
    keywords: [
      "1 rk for rent listing", "list 1 rk", "studio apartment listing", "studio apartment for rent", "single room for rent listing",
      "1 rk flat for rent by owner", "post 1 rk free", "room for rent listing", "1 RK किराये पर", "कमरा किराये पर दें", "kamra kiraye par",
    ],
    h1: "List Your 1 RK or Studio Apartment for Rent Free",
    intro:
      "List a 1 RK, single room with kitchen or studio apartment for rent on Awasio for free. Add rent, deposit, furnishing and photos, and students and working professionals contact you directly with no brokerage.",
    steps: [
      { title: "Add the room", text: "Locality, floor, carpet area, kitchen and attached bathroom." },
      { title: "Rent and furnishing", text: "Rent, deposit, electricity, furnishing and tenant preference." },
      { title: "Photos and publish", text: "Tenants nearby contact you directly." },
    ],
    benefits: [
      FREE_BENEFIT,
      DIRECT_BENEFIT,
      { title: "Fast-moving rentals", text: "1 RK and studio flats are in demand near colleges, offices and metro stations." },
      { title: "Agreement and receipts", text: "Make a rental agreement and rent receipts free on Awasio." },
    ],
    audience: "Owners renting out 1 RK units, single rooms with kitchen and studio apartments.",
    faqs: [
      { q: "Is listing a 1 RK free?", a: "Yes. Listing a 1 RK or studio apartment for rent is free, with 0% commission." },
      { q: "1 RK or PG: which should I choose?", a: "Use 1 RK / studio for a self-contained unit rented as a whole. Use PG listing if you rent beds or rooms with shared facilities and services." },
      { q: "1 RK किराये पर कैसे दें?", a: "Awasio पर फ्री लिस्टिंग बनाएं: किराया, डिपॉजिट, फर्निशिंग और फोटो डालें। किरायेदार सीधे आपसे संपर्क करेंगे।" },
    ],
    guides: [
      {
        heading: "Renting out a 1 RK or studio apartment",
        paragraphs: [
          "Single tenants filter by rent, distance to work or college, and furnishing. Mention whether electricity is separate, if the kitchen has a gas connection, whether the bathroom is attached, and the nearest metro or bus stop.",
        ],
      },
      {
        heading: "1 RK या कमरा किराये पर दें",
        lang: "hi",
        paragraphs: [
          "Awasio पर अपना 1 RK, स्टूडियो या किचन वाला कमरा फ्री में किराये पर लिस्ट करें। किराया, डिपॉजिट और फोटो डालें।",
        ],
      },
    ],
    cityHeading: "Rentals by city",
    cityPath: rentCity,
    citySlugs: "property",
  },

  industrial: {
    key: "industrial",
    path: "/list-industrial-property",
    ctaHref: "/list-industrial-property",
    ctaLabel: "List industrial property free",
    navLabel: "Industrial / factory",
    preset: { listingType: "RENT", resCom: "COMMERCIAL", propertySubTypeSlug: "industry" },
    title: "List Industrial Property Free: Factory & Shed for Rent or Sale",
    description:
      "List your factory or industrial shed for rent, lease or sale free. Add area, power load and approvals; manufacturers call you directly. फैक्ट्री किराये पर दें।",
    keywords: [
      "industrial property listing", "factory for rent listing", "industrial shed for rent", "factory for sale listing", "list factory",
      "industrial building for lease", "shed for rent", "post industrial property free", "फैक्ट्री किराये पर", "शेड किराये पर",
    ],
    h1: "List Your Factory or Industrial Shed Free: Rent, Lease or Sale",
    intro:
      "List a factory, industrial shed or industrial building on Awasio for free. Add the covered and open area, power load, height, approvals and access, and manufacturers and businesses contact you directly.",
    steps: [
      { title: "Add the property", text: "Industrial area, plot and covered area, height and floors." },
      { title: "Power and approvals", text: "Sanctioned power load, water, effluent treatment, fire NOC and pollution approvals." },
      { title: "Price and publish", text: "Rent, lease terms or sale price." },
    ],
    benefits: [
      FREE_BENEFIT,
      DIRECT_BENEFIT,
      { title: "Industry details", text: "Power load, crane, height and approvals: what manufacturers ask first." },
      { title: "Rent, lease or sale", text: "List for monthly rent, long lease or outright sale." },
    ],
    audience: "Owners and brokers renting, leasing or selling factories, sheds and industrial buildings.",
    faqs: [
      { q: "Is industrial property listing free?", a: "Yes. Listing a factory or industrial shed is free, with 0% commission." },
      { q: "What should an industrial listing include?", a: "Industrial area name, plot and covered area, height, sanctioned power load, water, approvals, and road width with truck access." },
      { q: "फैक्ट्री या शेड किराये पर कैसे दें?", a: "Awasio पर फ्री लिस्टिंग बनाएं: एरिया, बिजली लोड, अप्रूवल और किराया डालें। कंपनियां सीधे आपसे संपर्क करेंगी।" },
    ],
    guides: [
      {
        heading: "Listing a factory or industrial shed",
        paragraphs: [
          "Manufacturers shortlist by industrial area, covered area, height, sanctioned power load and approvals. Mention cranes, loading bays, office space within the unit and labour availability nearby.",
        ],
      },
      {
        heading: "फैक्ट्री या इंडस्ट्रियल शेड किराये पर दें या बेचें",
        lang: "hi",
        paragraphs: [
          "Awasio पर अपनी फैक्ट्री या शेड फ्री में लिस्ट करें। एरिया, बिजली लोड, अप्रूवल और किराया डालें।",
        ],
      },
    ],
    cityHeading: "Commercial property by city",
    cityPath: commercialCity,
    citySlugs: "property",
  },
};
