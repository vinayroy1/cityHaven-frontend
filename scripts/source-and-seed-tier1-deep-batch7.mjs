import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "/Users/vinaykumar/Desktop/myProjects/awasio-backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";

const BASE_DIR = "/Users/vinaykumar/Desktop/awasio-sourced-properties";
const PROJECT_IMAGES_DIR = path.join(BASE_DIR, "tier1_batch7_images");
const PROJECTS_FILE = path.join(BASE_DIR, "tier1_deep_batch7.json");
const DOCS_FILE = path.join(process.cwd(), "docs", "tier1_deep_batch7.json");

if (!fs.existsSync(PROJECT_IMAGES_DIR)) {
  fs.mkdirSync(PROJECT_IMAGES_DIR, { recursive: true });
}

const R2_PUBLIC_BASE = "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev";
const R2_BUCKET = "awasio-media";

const s3 = new S3Client({
  region: "auto",
  endpoint: "https://0d890d076a7e84f12dc8b90d8bb1a00c.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "f6e73586e77e75a0c967aa85944e959b",
    secretAccessKey: "3b9531a5a59e122e04589a763d619a2761b180ec7dba6f3dd01f6f971233408a",
  },
});

async function uploadToCloudflareR2(localFilePath, r2Key) {
  const fileBuffer = fs.readFileSync(localFilePath);
  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
    Body: fileBuffer,
    ContentType: "image/webp",
    CacheControl: "public, max-age=31536000, immutable",
  });
  await s3.send(cmd);
  return `${R2_PUBLIC_BASE}/${r2Key}`;
}

async function downloadImage(imageUrl, destPath) {
  try {
    const cleanUrl = imageUrl.includes(";") ? imageUrl : `${imageUrl};s=1200x1200;q=85;f=webp`;
    const res = await fetch(cleanUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) return false;
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    return true;
  } catch (err) {
    return false;
  }
}

async function fetchPhotosForQuery(query) {
  const url = `https://www.olx.in/api/relevance/v4/search?facet_limit=35&category=1723&query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const items = json.data || [];
    const photos = [];
    for (const it of items) {
      if (it.images && it.images.length >= 2) {
        for (const img of it.images) {
          if (img.url && !photos.includes(img.url)) photos.push(img.url);
        }
      }
    }
    return photos;
  } catch (err) {
    return [];
  }
}

const TIER1_PROJECTS = [
  // ==================== BENGALURU (3 projects) ====================
  {
    name: "Godrej Splendour",
    slug: "godrej-splendour-whitefield-bengaluru",
    developerName: "Godrej Properties",
    cityName: "Bengaluru",
    cityId: 19,
    address: "Belathur Main Road, Kadugodi, Whitefield",
    landmark: "Near Kadugodi Tree Park Metro Station",
    location: "Whitefield, Bengaluru",
    latitude: 12.9982,
    longitude: 77.7612,
    startingPrice: 7800000,
    maxPrice: 16500000,
    pricePerSqFt: 8850,
    possessionDate: "2026-06-30T00:00:00.000Z",
    launchDate: "2023-01-15T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "PRM/KA/RERA/1251/446/PR/220516/004879",
    totalUnits: 1161,
    availableUnits: 88,
    totalTowers: 9,
    totalFloors: 27,
    projectAreaAcres: 17.76,
    openSpacePercent: 82,
    salesPhone: "9845311220",
    salesEmail: "sales.splendour@godrejproperties.com",
    searchKeywords: ["Whitefield flat", "Whitefield apartment", "Kadugodi flat"],
    description: "Godrej Splendour is a premium lifestyle township spread across 17.76 acres in Whitefield, Bengaluru with 82% open landscaped greens, eco-friendly architecture, and state-of-the-art dual clubhouses.",
    amenities: ["Dual Luxury Clubhouses", "Infinity Edge Swimming Pool", "Tennis Court", "Cricket Practice Net", "Amphitheatre", "Co-Working Lounge", "EV Charging Stations", "24/7 Biometric Security"],
    specifications: {
      flooring: "Vitrified tiles in living & dining, laminated wooden flooring in master bedroom",
      kitchen: "Engineered granite counter with double bowl stainless steel sink and piped gas",
      bathrooms: "Grohe CP fittings with Toto wall-hung sanitary fixtures",
      doors: "Teakwood frame designer main entrance with digital video phone lock",
      structure: "RCC framed structure built with cutting-edge German formwork technology"
    },
    configurations: [
      { bhk: "1 BHK", carpetArea: 605, bathrooms: 1, price: 7800000 },
      { bhk: "2 BHK", carpetArea: 982, bathrooms: 2, price: 11500000 },
      { bhk: "3 BHK", carpetArea: 1395, bathrooms: 3, price: 16500000 }
    ]
  },
  {
    name: "Purva Atmosphere",
    slug: "purva-atmosphere-thanisandra-bengaluru",
    developerName: "Puravankara",
    cityName: "Bengaluru",
    cityId: 19,
    address: "Thanisandra Main Road, Near Manyata Tech Park",
    landmark: "Adjacent to Manyata Embassy Business Park",
    location: "Thanisandra, Bengaluru",
    latitude: 13.0641,
    longitude: 77.6324,
    startingPrice: 14500000,
    maxPrice: 28500000,
    pricePerSqFt: 10500,
    possessionDate: "2025-12-31T00:00:00.000Z",
    launchDate: "2022-04-10T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "PRM/KA/RERA/1251/472/PR/190204/002350",
    totalUnits: 939,
    availableUnits: 54,
    totalTowers: 3,
    totalFloors: 34,
    projectAreaAcres: 13.0,
    openSpacePercent: 78,
    salesPhone: "9845322330",
    salesEmail: "sales.atmosphere@puravankara.com",
    searchKeywords: ["Thanisandra flat", "Thanisandra apartment", "Manyata flat"],
    description: "Purva Atmosphere introduces India's first wellness-curated residential sanctuary featuring an outdoor air filtration tower, Miyawaki forest, and sky-bridge club.",
    amenities: ["Air Purification Giant Tower", "Sky High Club Lounge", "Olympic Size Pool", "Squash Court", "Miyawaki Forest Trails", "Multipurpose Hall", "Smart Home Automation"],
    specifications: {
      flooring: "Imported Italian marble in living and dining, pre-finished engineered wood in bedrooms",
      kitchen: "Modular designer setup with Franke quartz sinks and provision for induction hobs",
      bathrooms: "Hansgrohe rain shower fixtures and Duravit vitreous chinaware",
      structure: "Advanced earthquake compliant seismic zone II engineered RCC structure"
    },
    configurations: [
      { bhk: "2 BHK", carpetArea: 1280, bathrooms: 2, price: 14500000 },
      { bhk: "3 BHK", carpetArea: 1980, bathrooms: 3, price: 21500000 },
      { bhk: "4 BHK", carpetArea: 2420, bathrooms: 4, price: 28500000 }
    ]
  },
  {
    name: "Total Environment Learning to Fly",
    slug: "total-environment-learning-to-fly-jp-nagar-bengaluru",
    developerName: "Total Environment",
    cityName: "Bengaluru",
    cityId: 19,
    address: "15th Cross Road, JP Nagar 6th Phase",
    landmark: "Behind Sarakki Lake",
    location: "JP Nagar, Bengaluru",
    latitude: 12.9063,
    longitude: 77.5857,
    startingPrice: 38500000,
    maxPrice: 65000000,
    pricePerSqFt: 14200,
    possessionDate: "2026-03-31T00:00:00.000Z",
    launchDate: "2021-11-20T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "PRM/KA/RERA/1251/310/PR/180518/001764",
    totalUnits: 202,
    availableUnits: 19,
    totalTowers: 2,
    totalFloors: 21,
    projectAreaAcres: 3.77,
    openSpacePercent: 75,
    salesPhone: "9845333440",
    salesEmail: "sales.ltf@total-environment.com",
    searchKeywords: ["JP Nagar flat", "JP Nagar apartment", "Jayanagar flat"],
    description: "Learning to Fly by Total Environment represents handcrafted architectural luxury with signature terrace garden homes, exposed wire-cut brickwork, and warm earthy stone finishes.",
    amenities: ["Private Landscaped Terrace Gardens", "Heated Indoor Pool", "Artisan Cafe & Library", "Full Fitness Suite", "Central Water Cascade", "Concierge Butler Desk"],
    specifications: {
      flooring: "Natural Kota stone and hand-finished hardwood floorboards",
      kitchen: "Custom handcrafted oak cabinetry with integrated Miele appliances",
      bathrooms: "Custom stone vanity counters with Kohler luxury fittings",
      structure: "Exposed architectural cast-in-place concrete and wire-cut wire bricks"
    },
    configurations: [
      { bhk: "3 BHK", carpetArea: 3103, bathrooms: 3, price: 38500000 },
      { bhk: "4 BHK", carpetArea: 4205, bathrooms: 4, price: 54000000 },
      { bhk: "4 BHK Penthouse", carpetArea: 5240, bathrooms: 5, price: 65000000 }
    ]
  },

  // ==================== MUMBAI (4 projects) ====================
  {
    name: "Rustomjee Crown",
    slug: "rustomjee-crown-prabhadevi-mumbai",
    developerName: "Rustomjee Group",
    cityName: "Mumbai",
    cityId: 1,
    address: "Gokhale Road South, Prabhadevi",
    landmark: "Near Siddhivinayak Temple",
    location: "Prabhadevi, Mumbai",
    latitude: 19.0168,
    longitude: 72.8295,
    startingPrice: 75000000,
    maxPrice: 155000000,
    pricePerSqFt: 58000,
    possessionDate: "2025-06-30T00:00:00.000Z",
    launchDate: "2020-01-15T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "P51900003268",
    totalUnits: 700,
    availableUnits: 32,
    totalTowers: 3,
    totalFloors: 68,
    projectAreaAcres: 5.75,
    openSpacePercent: 70,
    salesPhone: "9820311220",
    salesEmail: "sales.crown@rustomjee.com",
    searchKeywords: ["Prabhadevi flat", "Worli flat", "Dadar flat apartment"],
    description: "Rustomjee Crown stands tall in Prabhadevi offering sweeping views of the Arabian Sea and Bandra-Worli Sea Link with ultra-luxury 3, 4 and 5 BHK residences designed by Hafeez Contractor.",
    amenities: ["Arabian Sea View Deck", "68-Storey Rooftop Infinity Pool", "Private Cinema Hall", "Banquet Hall", "Squash & Tennis Courts", "Automated Multi-Level Car Parking", "High Speed Schindler Elevators"],
    specifications: {
      flooring: "Imported Italian Botticino marble across all living areas",
      kitchen: "Custom European dry and wet kitchen formats with granite and quartz finishes",
      bathrooms: "Villeroy & Boch sanitary fixtures with Dornbracht fittings",
      structure: "Seismic resistant composite steel and reinforced concrete high-rise tower"
    },
    configurations: [
      { bhk: "3 BHK", carpetArea: 1335, bathrooms: 3, price: 75000000 },
      { bhk: "4 BHK", carpetArea: 2150, bathrooms: 4, price: 115000000 },
      { bhk: "5 BHK", carpetArea: 2850, bathrooms: 5, price: 155000000 }
    ]
  },
  {
    name: "Kalpataru Avana",
    slug: "kalpataru-avana-parel-mumbai",
    developerName: "Kalpataru Limited",
    cityName: "Mumbai",
    cityId: 1,
    address: "Dr. Babasaheb Ambedkar Road, Parel",
    landmark: "Opposite ITC Grand Central",
    location: "Parel, Mumbai",
    latitude: 19.0028,
    longitude: 72.8424,
    startingPrice: 85000000,
    maxPrice: 145000000,
    pricePerSqFt: 52000,
    possessionDate: "2024-12-31T00:00:00.000Z",
    launchDate: "2019-08-20T00:00:00.000Z",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "P51900000747",
    totalUnits: 384,
    availableUnits: 14,
    totalTowers: 2,
    totalFloors: 50,
    projectAreaAcres: 4.5,
    openSpacePercent: 72,
    salesPhone: "9820322330",
    salesEmail: "sales.avana@kalpataru.com",
    searchKeywords: ["Parel flat", "Lower Parel flat", "Lalbaug apartment"],
    description: "Kalpataru Avana in South-Central Mumbai's elite business district of Parel offers panoramic Eastern Harbor views, 12-ft clear ceiling heights, and palatial sundecks.",
    amenities: ["Olympic Length Pool", "Temperature Controlled Jacuzzi", "Sky Club Lounge", "Grand Air-Conditioned Lobby", "Children Adventure Zone", "High-Tech Gymnasium"],
    specifications: {
      flooring: "Agglomerated Italian marble flooring with customized base skirting",
      kitchen: "Premium modular set up with anti-scratch composite quartz slabs",
      bathrooms: "TOTO premium washbasins and rain showers with concealed thermostatic valves",
      structure: "Heavy foundation raft concrete engineered for highest seismic wind resistance"
    },
    configurations: [
      { bhk: "3 BHK", carpetArea: 1840, bathrooms: 3, price: 85000000 },
      { bhk: "4 BHK", carpetArea: 2650, bathrooms: 4, price: 120000000 },
      { bhk: "5 BHK Duplex", carpetArea: 3200, bathrooms: 5, price: 145000000 }
    ]
  },
  {
    name: "Piramal Mahalaxmi",
    slug: "piramal-mahalaxmi-mahalaxmi-mumbai",
    developerName: "Piramal Realty",
    cityName: "Mumbai",
    cityId: 1,
    address: "Sanapati Bapat Marg, Mahalaxmi",
    landmark: "Overlooking the Mahalaxmi Racecourse",
    location: "Mahalaxmi, Mumbai",
    latitude: 18.9827,
    longitude: 72.8239,
    startingPrice: 62000000,
    maxPrice: 125000000,
    pricePerSqFt: 54000,
    possessionDate: "2025-09-30T00:00:00.000Z",
    launchDate: "2020-03-01T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "P51900015854",
    totalUnits: 1200,
    availableUnits: 45,
    totalTowers: 3,
    totalFloors: 63,
    projectAreaAcres: 4.0,
    openSpacePercent: 68,
    salesPhone: "9820333440",
    salesEmail: "sales.mahalaxmi@piramal.com",
    searchKeywords: ["Mahalaxmi flat", "Worli apartment", "Byculla flat"],
    description: "Piramal Mahalaxmi is a landmark residential marvel commanding majestic views of the 225-acre Mahalaxmi Racecourse and the Arabian Sea horizon.",
    amenities: ["Racecourse Viewing Deck", "Infinity Swimming Pool", "Library Lounge", "Spa & Wellness Salon", "Badminton & Squash Courts", "Smart Valet Parking"],
    specifications: {
      flooring: "Fine imported marble flooring throughout foyer, living, and dining rooms",
      kitchen: "Premium quartz stone countertop with modular soft-close drawers",
      bathrooms: "European engineered fixtures with toughened glass shower enclosures",
      structure: "RCC shear-wall construction ensuring maximum column-free living layouts"
    },
    configurations: [
      { bhk: "2 BHK", carpetArea: 1048, bathrooms: 2, price: 62000000 },
      { bhk: "3 BHK", carpetArea: 1532, bathrooms: 3, price: 88000000 },
      { bhk: "4 BHK", carpetArea: 2210, bathrooms: 4, price: 125000000 }
    ]
  },
  {
    name: "Oberoi Sky City",
    slug: "oberoi-sky-city-borivali-east-mumbai",
    developerName: "Oberoi Realty",
    cityName: "Mumbai",
    cityId: 1,
    address: "Western Express Highway, Borivali East",
    landmark: "Directly connected to Western Express Highway Metro Station",
    location: "Borivali East, Mumbai",
    latitude: 19.2212,
    longitude: 72.8624,
    startingPrice: 35000000,
    maxPrice: 68000000,
    pricePerSqFt: 31000,
    possessionDate: "2025-03-31T00:00:00.000Z",
    launchDate: "2019-06-15T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "P51800003582",
    totalUnits: 1560,
    availableUnits: 62,
    totalTowers: 8,
    totalFloors: 60,
    projectAreaAcres: 25.0,
    openSpacePercent: 75,
    salesPhone: "9820344550",
    salesEmail: "sales.skycity@oberoirealty.com",
    searchKeywords: ["Borivali flat", "Kandivali flat", "Western Express Highway apartment"],
    description: "Oberoi Sky City in Borivali East is an integrated township spanning 25 acres adjacent to Sanjay Gandhi National Park, offering lush green views and a bespoke Oberoi Mall within the campus.",
    amenities: ["Integrated Luxury Mall", "Olympic Sized Lap Pool", "Skate Park & Rock Climbing", "Multipurpose Sports Hall", "Landscaped Podium Gardens", "Crèche & Daycare Facility"],
    specifications: {
      flooring: "Imported marble in living, dining, and passages; vitrified tiles in utility areas",
      kitchen: "Modular fittings with stainless steel double bowl sink and reticulated gas line",
      bathrooms: "Kohler / Grohe sanitary fittings and anti-skid porcelain tiles",
      structure: "Earthquake resistant RCC framed construction with aluminum formwork"
    },
    configurations: [
      { bhk: "3 BHK Compact", carpetArea: 1034, bathrooms: 3, price: 35000000 },
      { bhk: "3 BHK Large", carpetArea: 1393, bathrooms: 3, price: 46000000 },
      { bhk: "4 BHK", carpetArea: 2050, bathrooms: 4, price: 68000000 }
    ]
  },

  // ==================== PUNE (4 projects) ====================
  {
    name: "Godrej Infinity",
    slug: "godrej-infinity-keshav-nagar-pune",
    developerName: "Godrej Properties",
    cityName: "Pune",
    cityId: 2,
    address: "Keshav Nagar, Mundhwa",
    landmark: "Overlooking Mula Mutha River, near Magarpatta City",
    location: "Keshav Nagar, Pune",
    latitude: 18.5368,
    longitude: 73.9421,
    startingPrice: 6500000,
    maxPrice: 14500000,
    pricePerSqFt: 7800,
    possessionDate: "2024-10-31T00:00:00.000Z",
    launchDate: "2018-05-10T00:00:00.000Z",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "P52100003129",
    totalUnits: 1250,
    availableUnits: 38,
    totalTowers: 10,
    totalFloors: 22,
    projectAreaAcres: 43.0,
    openSpacePercent: 70,
    salesPhone: "9822311220",
    salesEmail: "sales.infinity@godrejproperties.com",
    searchKeywords: ["Keshav Nagar flat", "Mundhwa flat", "Magarpatta apartment"],
    description: "Godrej Infinity is a 43-acre riverside township in Keshav Nagar, Pune offering serene river views, landscaped boulevards, a town square plaza, and proximity to Kharadi and Magarpatta.",
    amenities: ["Riverside Promenade", "Town Square Commercial Plaza", "Swimming Pool & Kid's Pool", "Gymnasium & Yoga Deck", "Basketball & Tennis Courts", "Senior Citizen Park"],
    specifications: {
      flooring: "Vitrified tile flooring across living, dining, and all bedrooms",
      kitchen: "Polished black granite counter top with single bowl sink",
      bathrooms: "Jaquar / equivalent chrome plated fittings and branded sanitary ware",
      structure: "Seismic resistant RCC framed structure built with modern formwork"
    },
    configurations: [
      { bhk: "1 BHK", carpetArea: 535, bathrooms: 1, price: 6500000 },
      { bhk: "2 BHK", carpetArea: 865, bathrooms: 2, price: 9500000 },
      { bhk: "3 BHK", carpetArea: 1320, bathrooms: 3, price: 14500000 }
    ]
  },
  {
    name: "Rohan Abhilasha",
    slug: "rohan-abhilasha-wagholi-pune",
    developerName: "Rohan Builders",
    cityName: "Pune",
    cityId: 2,
    address: "Lohegaon-Wagholi Road, Wagholi",
    landmark: "Near Lexicon International School",
    location: "Wagholi, Pune",
    latitude: 18.5832,
    longitude: 73.9687,
    startingPrice: 5200000,
    maxPrice: 11500000,
    pricePerSqFt: 6400,
    possessionDate: "2024-08-31T00:00:00.000Z",
    launchDate: "2019-02-15T00:00:00.000Z",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "P52100000493",
    totalUnits: 1320,
    availableUnits: 42,
    totalTowers: 7,
    totalFloors: 14,
    projectAreaAcres: 30.0,
    openSpacePercent: 75,
    salesPhone: "9822322330",
    salesEmail: "sales.abhilasha@rohanbuilders.com",
    searchKeywords: ["Wagholi flat", "Lohegaon flat", "Kharadi apartment"],
    description: "Rohan Abhilasha is a 30-acre master-planned community in Wagholi built with Rohan's PLUS concept: Perfect Ventilation, Lively Light, Utmost Privacy, and Smart Space.",
    amenities: ["Central Landscaped Podium", "Swimming Pool with Deck", "Indoor Games Room", "Tennis Court", "Jogging Track", "Power Backup for Common Areas"],
    specifications: {
      flooring: "Vitrified tiles in hall, kitchen and bedrooms; anti-skid ceramic tiles in balconies",
      kitchen: "Granite platform with stainless steel sink and glazed tile dado",
      bathrooms: "Concealed plumbing with Jaquar fittings and solar hot water provisions",
      structure: "RCC framed earthquake resistant structure with dry-wall partition systems"
    },
    configurations: [
      { bhk: "1 BHK", carpetArea: 480, bathrooms: 1, price: 5200000 },
      { bhk: "2 BHK", carpetArea: 810, bathrooms: 2, price: 7800000 },
      { bhk: "3 BHK", carpetArea: 1250, bathrooms: 3, price: 11500000 }
    ]
  },
  {
    name: "VTP Blue Waters",
    slug: "vtp-blue-waters-mahalunge-pune",
    developerName: "VTP Realty",
    cityName: "Pune",
    cityId: 2,
    address: "Mahalunge-Hinjawadi Bridge, Mahalunge",
    landmark: "Directly opposite Balewadi Stadium",
    location: "Mahalunge, Pune",
    latitude: 18.5794,
    longitude: 73.7483,
    startingPrice: 6200000,
    maxPrice: 15500000,
    pricePerSqFt: 7900,
    possessionDate: "2026-04-30T00:00:00.000Z",
    launchDate: "2022-01-20T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "P52100022026",
    totalUnits: 2400,
    availableUnits: 95,
    totalTowers: 14,
    totalFloors: 30,
    projectAreaAcres: 100.0,
    openSpacePercent: 78,
    salesPhone: "9822333440",
    salesEmail: "sales.bluewaters@vtprealty.in",
    searchKeywords: ["Mahalunge flat", "Hinjawadi flat", "Balewadi apartment"],
    description: "VTP Blue Waters is a sprawling 100-acre mega township at the junction of Baner and Hinjawadi featuring riverfront vistas, 5 grand clubhouses, sports academies, and high-street shopping.",
    amenities: ["5 Mega Clubhouses", "Professional Cricket Academy", "Tennis & Basketball Arenas", "Riverside Promenade", "Wellness Spa", "Shopping High Street"],
    specifications: {
      flooring: "Large format 800x1600mm glazed vitrified tiles in all areas",
      kitchen: "Full modular kitchen counter with premium stainless steel sink",
      bathrooms: "Grohe / American Standard sanitaryware and CP fittings",
      structure: "Mivan aluminum shuttering monocoque RCC structure"
    },
    configurations: [
      { bhk: "1 BHK", carpetArea: 512, bathrooms: 1, price: 6200000 },
      { bhk: "2 BHK", carpetArea: 840, bathrooms: 2, price: 9800000 },
      { bhk: "3 BHK", carpetArea: 1350, bathrooms: 3, price: 15500000 }
    ]
  },
  {
    name: "Kasturi The Balmoral Riverside",
    slug: "kasturi-the-balmoral-riverside-balewadi-pune",
    developerName: "Kasturi Housing",
    cityName: "Pune",
    cityId: 2,
    address: "Balewadi High Street Extension, Balewadi",
    landmark: "Near Balewadi High Street & Mula River",
    location: "Balewadi, Pune",
    latitude: 18.5772,
    longitude: 73.7661,
    startingPrice: 21000000,
    maxPrice: 38000000,
    pricePerSqFt: 13800,
    possessionDate: "2025-10-31T00:00:00.000Z",
    launchDate: "2021-08-10T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "P52100028800",
    totalUnits: 360,
    availableUnits: 28,
    totalTowers: 4,
    totalFloors: 32,
    projectAreaAcres: 5.5,
    openSpacePercent: 75,
    salesPhone: "9822344550",
    salesEmail: "sales.balmoral@kasturi.com",
    searchKeywords: ["Balewadi flat", "Baner flat", "Balewadi High Street apartment"],
    description: "Kasturi The Balmoral Riverside brings signature ultra-luxury German-engineered homes to Balewadi with riverside views, customized Poggenpohl kitchens, and private lift foyers.",
    amenities: ["Private Lift Access", "Heated Riverside Infinity Pool", "Wine & Cigar Tasting Lounge", "State-of-the-Art Technogym Gym", "Squash Court", "Concierge Reception"],
    specifications: {
      flooring: "Imported Italian marble flooring throughout living, dining, and kitchen areas",
      kitchen: "Custom German Poggenpohl kitchen with built-in Siemens appliances",
      bathrooms: "Hansgrohe Axor bathroom fixtures and Toto Neorest smart toilets",
      structure: "Seismic Zone III engineered RCC structure with acoustic insulation glass"
    },
    configurations: [
      { bhk: "3 BHK Luxury", carpetArea: 1650, bathrooms: 3, price: 21000000 },
      { bhk: "4 BHK Grande", carpetArea: 2450, bathrooms: 4, price: 31000000 },
      { bhk: "4.5 BHK Penthouse", carpetArea: 3100, bathrooms: 5, price: 38000000 }
    ]
  },

  // ==================== HYDERABAD (4 projects) ====================
  {
    name: "Rajapushpa Provincia",
    slug: "rajapushpa-provincia-narsingi-hyderabad",
    developerName: "Rajapushpa Properties",
    cityName: "Hyderabad",
    cityId: 5495,
    address: "ORR Junction, Narsingi, Gandipet",
    landmark: "Direct access to Outer Ring Road (ORR) Exit 18",
    location: "Narsingi, Hyderabad",
    latitude: 17.3821,
    longitude: 78.3619,
    startingPrice: 13500000,
    maxPrice: 28000000,
    pricePerSqFt: 8400,
    possessionDate: "2025-08-31T00:00:00.000Z",
    launchDate: "2021-03-15T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "P02400003309",
    totalUnits: 3498,
    availableUnits: 120,
    totalTowers: 11,
    totalFloors: 39,
    projectAreaAcres: 23.75,
    openSpacePercent: 80,
    salesPhone: "9849311220",
    salesEmail: "sales.provincia@rajapushpa.in",
    searchKeywords: ["Narsingi flat", "Gandipet flat", "Kokapet apartment"],
    description: "Rajapushpa Provincia is a grand 23.75-acre gated luxury community in Narsingi featuring two expansive 1,50,000 sq.ft. clubhouses, 39-storey skyscrapers, and lush central greenery.",
    amenities: ["Dual 1,50,000 Sq.Ft Clubhouses", "Temperature Controlled Indoor Pool", "Outdoor Olympic Pool", "Squash & Badminton Courts", "Supermarket & Pharmacy on Campus", "Bowling Alley"],
    specifications: {
      flooring: "800x1200mm premium double charged vitrified tiles in all living spaces",
      kitchen: "Granite platform with double bowl stainless steel sink and water purifier point",
      bathrooms: "TOTO / Grohe sanitaryware and CP fittings with concealed diverters",
      structure: "RCC shear-wall structure constructed with advanced aluminum shuttering"
    },
    configurations: [
      { bhk: "2 BHK", carpetArea: 1370, bathrooms: 2, price: 13500000 },
      { bhk: "3 BHK Regular", carpetArea: 1715, bathrooms: 3, price: 17500000 },
      { bhk: "3 BHK Large", carpetArea: 2660, bathrooms: 3, price: 28000000 }
    ]
  },
  {
    name: "Jayabheri The Peak Hyderabad",
    slug: "jayabheri-the-peak-financial-district-hyderabad",
    developerName: "Jayabheri Group",
    cityName: "Hyderabad",
    cityId: 5495,
    address: "Financial District, Nanakramguda",
    landmark: "Near US Consulate General & Amazon Campus",
    location: "Financial District, Hyderabad",
    latitude: 17.4172,
    longitude: 78.3431,
    startingPrice: 28000000,
    maxPrice: 52000000,
    pricePerSqFt: 11500,
    possessionDate: "2025-12-31T00:00:00.000Z",
    launchDate: "2021-09-10T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "P02400002821",
    totalUnits: 720,
    availableUnits: 34,
    totalTowers: 4,
    totalFloors: 35,
    projectAreaAcres: 8.5,
    openSpacePercent: 78,
    salesPhone: "9849322330",
    salesEmail: "sales.peak@jayabherigroup.com",
    searchKeywords: ["Financial District Hyderabad flat", "Nanakramguda apartment", "Gachibowli flat"],
    description: "Jayabheri The Peak in Financial District Hyderabad is an elite residential development delivering iconic architectural design, 11-foot floor-to-ceiling glass facades, and five-star club privileges.",
    amenities: ["Panoramic Skyline Deck", "Resort Style Heated Pool", "Squash & Tennis Courts", "Executive Co-Working Pods", "Private Banquet Suites", "Ultra-Modern Wellness Spa"],
    specifications: {
      flooring: "Imported Greek and Italian marble in living, dining, and drawing rooms",
      kitchen: "Granite platform with Franke sinks and provision for dishwasher and chimney",
      bathrooms: "Villeroy & Boch sanitary fixtures with Hansgrohe thermostatic showers",
      structure: "Seismic resistant RCC framed structure with high performance double glazed windows"
    },
    configurations: [
      { bhk: "3 BHK", carpetArea: 2450, bathrooms: 3, price: 28000000 },
      { bhk: "4 BHK", carpetArea: 3500, bathrooms: 4, price: 41000000 },
      { bhk: "4 BHK Sky Villa", carpetArea: 4400, bathrooms: 5, price: 52000000 }
    ]
  },
  {
    name: "Prestige High Fields",
    slug: "prestige-high-fields-gachibowli-hyderabad",
    developerName: "Prestige Group",
    cityName: "Hyderabad",
    cityId: 5495,
    address: "Financial District Main Road, Gachibowli",
    landmark: "Behind Continental Hospital",
    location: "Gachibowli, Hyderabad",
    latitude: 17.4241,
    longitude: 78.3498,
    startingPrice: 12500000,
    maxPrice: 27500000,
    pricePerSqFt: 8900,
    possessionDate: "2024-06-30T00:00:00.000Z",
    launchDate: "2018-02-15T00:00:00.000Z",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "P02400000108",
    totalUnits: 2240,
    availableUnits: 25,
    totalTowers: 10,
    totalFloors: 33,
    projectAreaAcres: 21.85,
    openSpacePercent: 75,
    salesPhone: "9849333440",
    salesEmail: "sales.highfields@prestigeconstructions.com",
    searchKeywords: ["Gachibowli flat", "Financial District flat", "Madhapur apartment"],
    description: "Prestige High Fields is Hyderabad's first Disney-themed luxury residential township located in Gachibowli, featuring 21.85 acres of vibrant living, high-street retail, and club spaces.",
    amenities: ["Disney Themed Children's Zone", "Clubhouse with Badminton & Squash", "Multiple Swimming Pools", "Mini-Theatre", "Jogging Track with Night Illumination", "Departmental Store"],
    specifications: {
      flooring: "Vitrified tiles in foyer, living, dining, and all bedrooms",
      kitchen: "Granite counter with chrome plated tap and ceramic wall tiles",
      bathrooms: "Branded sanitaryware and chrome fittings with geyser points",
      structure: "RCC framed structure with concrete solid block masonry"
    },
    configurations: [
      { bhk: "2 BHK", carpetArea: 1283, bathrooms: 2, price: 12500000 },
      { bhk: "3 BHK", carpetArea: 1742, bathrooms: 3, price: 17500000 },
      { bhk: "4 BHK", carpetArea: 2848, bathrooms: 4, price: 27500000 }
    ]
  },
  {
    name: "SMR Vinay Iconia",
    slug: "smr-vinay-iconia-kondapur-hyderabad",
    developerName: "SMR Holdings",
    cityName: "Hyderabad",
    cityId: 5495,
    address: "Masjid Banda Road, Kondapur",
    landmark: "Near Botanical Gardens & HITEC City",
    location: "Kondapur, Hyderabad",
    latitude: 17.4619,
    longitude: 78.3582,
    startingPrice: 11500000,
    maxPrice: 24500000,
    pricePerSqFt: 8100,
    possessionDate: "2025-04-30T00:00:00.000Z",
    launchDate: "2020-07-20T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "P02400001859",
    totalUnits: 1800,
    availableUnits: 50,
    totalTowers: 11,
    totalFloors: 35,
    projectAreaAcres: 22.0,
    openSpacePercent: 80,
    salesPhone: "9849344550",
    salesEmail: "sales.iconia@smrholdings.in",
    searchKeywords: ["Kondapur flat", "HITEC City flat", "Gachibowli apartment"],
    description: "SMR Vinay Iconia in Kondapur offers 22 acres of landscaped urban living with scenic views of the Botanical Gardens, dual lavish clubhouses, and quick access to HITEC City.",
    amenities: ["Botanical Garden Vistas", "Olympic Size Swimming Pool", "Indoor Badminton & Squash Courts", "Gymnasium & Aerobics Room", "Skating Rink & Pet Park", "Automated Security"],
    specifications: {
      flooring: "Double charged 800x800mm vitrified tiles throughout",
      kitchen: "Polished granite stone with stainless steel sink and piped LPG",
      bathrooms: "Jaguar / Kohler sanitaryware and chrome fixtures",
      structure: "RCC framed structure built with Mivan shear-wall technology"
    },
    configurations: [
      { bhk: "2 BHK", carpetArea: 1350, bathrooms: 2, price: 11500000 },
      { bhk: "3 BHK", carpetArea: 1850, bathrooms: 3, price: 16500000 },
      { bhk: "4 BHK", carpetArea: 2750, bathrooms: 4, price: 24500000 }
    ]
  },

  // ==================== CHENNAI (4 projects) ====================
  {
    name: "TVS Emerald GreenAcres",
    slug: "tvs-emerald-greenacres-perungalathur-chennai",
    developerName: "TVS Emerald",
    cityName: "Chennai",
    cityId: 29,
    address: "GST Road, Near Perungalathur Railway Station",
    landmark: "5 mins from Kilambakkam Bus Terminus",
    location: "Perungalathur, Chennai",
    latitude: 12.8984,
    longitude: 80.0912,
    startingPrice: 4800000,
    maxPrice: 9800000,
    pricePerSqFt: 5800,
    possessionDate: "2024-09-30T00:00:00.000Z",
    launchDate: "2019-10-15T00:00:00.000Z",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "TN/01/Building/0134/2019",
    totalUnits: 580,
    availableUnits: 22,
    totalTowers: 6,
    totalFloors: 8,
    projectAreaAcres: 18.0,
    openSpacePercent: 63,
    salesPhone: "9840311220",
    salesEmail: "sales.greenacres@tvsemerald.com",
    searchKeywords: ["Perungalathur flat", "Tambaram flat", "GST Road Chennai apartment"],
    description: "TVS Emerald GreenAcres is an 18-acre green township located near Tambaram and GST Road, featuring 63% open space, 3 landscaped parks, and an exclusive residents clubhouse.",
    amenities: ["3 Landscaped Community Parks", "Residents Clubhouse", "Swimming Pool", "Cricket Pitch & Basketball Court", "Indoor Games Zone", "Solar Powered Street Lighting"],
    specifications: {
      flooring: "Vitrified tiles in living room, dining, and bedrooms",
      kitchen: "Polished black granite counter with stainless steel sink",
      bathrooms: "Parryware / Hindware fittings with ceramic wall tiles up to 7 feet",
      structure: "RCC framed structure with solid concrete blocks"
    },
    configurations: [
      { bhk: "2 BHK", carpetArea: 840, bathrooms: 2, price: 4800000 },
      { bhk: "3 BHK Regular", carpetArea: 1250, bathrooms: 3, price: 7400000 },
      { bhk: "3 BHK Villa", carpetArea: 1600, bathrooms: 3, price: 9800000 }
    ]
  },
  {
    name: "Akshaya Today",
    slug: "akshaya-today-kelambakkam-omr-chennai",
    developerName: "Akshaya Private Limited",
    cityName: "Chennai",
    cityId: 29,
    address: "Old Mahabalipuram Road (OMR), Kelambakkam",
    landmark: "Near Chettinad Health City",
    location: "Kelambakkam OMR, Chennai",
    latitude: 12.7842,
    longitude: 80.2184,
    startingPrice: 3800000,
    maxPrice: 7800000,
    pricePerSqFt: 4600,
    possessionDate: "2024-05-31T00:00:00.000Z",
    launchDate: "2018-08-10T00:00:00.000Z",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "TN/01/Building/0098/2018",
    totalUnits: 1612,
    availableUnits: 36,
    totalTowers: 9,
    totalFloors: 14,
    projectAreaAcres: 21.0,
    openSpacePercent: 83,
    salesPhone: "9840322330",
    salesEmail: "sales.today@akshaya.com",
    searchKeywords: ["Kelambakkam flat", "OMR Chennai flat", "Navalur apartment"],
    description: "Akshaya Today is a sprawling 21-acre CRISIL DA2+ rated township along OMR Kelambakkam boasting 83% open space, 55+ amenities, and immediate access to IT corridors.",
    amenities: ["55+ Modern Amenities", "25,000 Sq.Ft Clubhouse", "Olympic Lap Pool", "Skating Rink & Tennis Court", "AV Theatre & Banquet Hall", "24/7 RO Water Plant"],
    specifications: {
      flooring: "Vitrified tiles in living, dining, and bedrooms; anti-skid tiles in balconies",
      kitchen: "Granite cooking platform with single bowl sink and ceramic tile dado",
      bathrooms: "Branded CP and sanitary fittings with wall mounted closets",
      structure: "Seismic resistant RCC framed structure"
    },
    configurations: [
      { bhk: "1 BHK", carpetArea: 610, bathrooms: 1, price: 3800000 },
      { bhk: "2 BHK", carpetArea: 990, bathrooms: 2, price: 5200000 },
      { bhk: "3 BHK", carpetArea: 1350, bathrooms: 3, price: 7800000 }
    ]
  },
  {
    name: "Olympia Opaline",
    slug: "olympia-opaline-navalur-omr-chennai",
    developerName: "Olympia Group",
    cityName: "Chennai",
    cityId: 29,
    address: "Navalur, Rajiv Gandhi Salai (OMR)",
    landmark: "Directly opposite Vivira Mall & AGS Cinemas",
    location: "Navalur OMR, Chennai",
    latitude: 12.8465,
    longitude: 80.2281,
    startingPrice: 6200000,
    maxPrice: 12800000,
    pricePerSqFt: 6200,
    possessionDate: "2024-03-31T00:00:00.000Z",
    launchDate: "2017-12-05T00:00:00.000Z",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "TN/01/Building/0112/2017",
    totalUnits: 1800,
    availableUnits: 18,
    totalTowers: 19,
    totalFloors: 19,
    projectAreaAcres: 60.0,
    openSpacePercent: 70,
    salesPhone: "9840333440",
    salesEmail: "sales.opaline@olympiagroup.in",
    searchKeywords: ["Navalur flat", "OMR Chennai apartment", "Siruseri flat"],
    description: "Olympia Opaline in Navalur on OMR is Chennai's premier waterfront township spanning 60 acres with Backwater views, club facilities, and prime proximity to SIPCOT IT Park.",
    amenities: ["Waterfront Promenade", "Club Opaline with Olympic Pool", "Squash & Tennis Courts", "Bowling Alley", "Spa & Health Club", "Supermarket and Cafeteria"],
    specifications: {
      flooring: "Imported vitrified tiles in living/dining; laminated wooden flooring in master bedroom",
      kitchen: "Granite platform with double bowl stainless steel sink and exhaust provision",
      bathrooms: "Kohler / Grohe fixtures with glass partitions in master bathroom",
      structure: "RCC framed structure built to seismic Zone III specifications"
    },
    configurations: [
      { bhk: "2 BHK", carpetArea: 1045, bathrooms: 2, price: 6200000 },
      { bhk: "3 BHK", carpetArea: 1550, bathrooms: 3, price: 9200000 },
      { bhk: "4 BHK", carpetArea: 2150, bathrooms: 4, price: 12800000 }
    ]
  },
  {
    name: "Baashyaam Pinnacle Crest",
    slug: "baashyaam-pinnacle-crest-sholinganallur-chennai",
    developerName: "Baashyaam Group",
    cityName: "Chennai",
    cityId: 29,
    address: "OMR IT Highway, Sholinganallur",
    landmark: "Near Sholinganallur Junction & ELCOT SEZ",
    location: "Sholinganallur, Chennai",
    latitude: 12.8995,
    longitude: 80.2289,
    startingPrice: 7500000,
    maxPrice: 16500000,
    pricePerSqFt: 6900,
    possessionDate: "2024-11-30T00:00:00.000Z",
    launchDate: "2019-01-10T00:00:00.000Z",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "TN/01/Building/0078/2019",
    totalUnits: 1200,
    availableUnits: 28,
    totalTowers: 1,
    totalFloors: 30,
    projectAreaAcres: 9.0,
    openSpacePercent: 72,
    salesPhone: "9840344550",
    salesEmail: "sales.pinnacle@baashyaam.com",
    searchKeywords: ["Sholinganallur flat", "OMR flat", "Perungudi apartment"],
    description: "Baashyaam Pinnacle Crest in Sholinganallur is a 30-storey architectural landmark on OMR featuring luxury sea-breeze apartments, infinity pool, and immediate walking access to ELCOT SEZ.",
    amenities: ["30th Floor Sky Lounge", "Infinity Rooftop Pool", "State of the Art Fitness Center", "Indoor Badminton Court", "Children Play Park", "Multi-Level Covered Parking"],
    specifications: {
      flooring: "Vitrified tiles across all living rooms, bedrooms, and dining",
      kitchen: "Granite counter with stainless steel sink and glazed tiles above platform",
      bathrooms: "Roca / Jaguar sanitary and plumbing fixtures",
      structure: "RCC framed structure engineered for coastal wind resilience"
    },
    configurations: [
      { bhk: "2 BHK", carpetArea: 1080, bathrooms: 2, price: 7500000 },
      { bhk: "3 BHK", carpetArea: 1590, bathrooms: 3, price: 11000000 },
      { bhk: "4 BHK", carpetArea: 2400, bathrooms: 4, price: 16500000 }
    ]
  },

  // ==================== NEW DELHI (5 projects) ====================
  {
    name: "DLF Midtown Moti Nagar",
    slug: "dlf-midtown-moti-nagar-new-delhi",
    developerName: "DLF Limited",
    cityName: "New Delhi",
    cityId: 12,
    address: "Shivaji Marg, Moti Nagar",
    landmark: "Directly opposite Moti Nagar Metro Station",
    location: "Moti Nagar, New Delhi",
    latitude: 28.6574,
    longitude: 77.1428,
    startingPrice: 35000000,
    maxPrice: 85000000,
    pricePerSqFt: 18500,
    possessionDate: "2026-06-30T00:00:00.000Z",
    launchDate: "2022-02-15T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "DLRERA2022P0007",
    totalUnits: 913,
    availableUnits: 48,
    totalTowers: 4,
    totalFloors: 39,
    projectAreaAcres: 5.28,
    openSpacePercent: 75,
    salesPhone: "9810311220",
    salesEmail: "sales.midtown@dlf.in",
    searchKeywords: ["Moti Nagar flat", "West Delhi flat", "Karol Bagh apartment"],
    description: "DLF Midtown is Central-West Delhi's most iconic luxury high-rise development, nestled beside 128 acres of preserved green parks, offering 39-storey residences with air purification systems and an ultra-luxury 45,000 sq.ft clubhouse.",
    amenities: ["45,000 Sq.Ft Luxury Clubhouse", "Rooftop Sky Lounge", "Heated All-Weather Swimming Pool", "Squash & Tennis Courts", "Private Screening Cinema", "Chef-Led Restaurant & Bar"],
    specifications: {
      flooring: "Imported Italian marble in living and dining; laminated wooden flooring in bedrooms",
      kitchen: "Fully fitted German modular kitchen with hob, chimney, microwave, and dishwasher",
      bathrooms: "Kohler / Villeroy & Boch sanitary fixtures with concealed cisterns",
      structure: "Seismic Zone V compliant RCC shear-wall engineered tower"
    },
    configurations: [
      { bhk: "2 BHK", carpetArea: 1732, bathrooms: 2, price: 35000000 },
      { bhk: "3 BHK", carpetArea: 2279, bathrooms: 3, price: 46500000 },
      { bhk: "4 BHK", carpetArea: 3412, bathrooms: 4, price: 85000000 }
    ]
  },
  {
    name: "Godrej South Estate",
    slug: "godrej-south-estate-okhla-new-delhi",
    developerName: "Godrej Properties",
    cityName: "New Delhi",
    cityId: 12,
    address: "Okhla Phase 1, Industrial Area",
    landmark: "Near Crowne Plaza New Delhi Okhla",
    location: "Okhla, New Delhi",
    latitude: 28.5284,
    longitude: 77.2798,
    startingPrice: 42000000,
    maxPrice: 95000000,
    pricePerSqFt: 22000,
    possessionDate: "2025-12-31T00:00:00.000Z",
    launchDate: "2020-09-10T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "DLRERA2019P0003",
    totalUnits: 372,
    availableUnits: 19,
    totalTowers: 4,
    totalFloors: 29,
    projectAreaAcres: 5.15,
    openSpacePercent: 70,
    salesPhone: "9810322330",
    salesEmail: "sales.southestate@godrejproperties.com",
    searchKeywords: ["Okhla flat", "South Delhi flat", "Nehru Place apartment"],
    description: "Godrej South Estate is South Delhi's premier luxury residential project featuring bespoke Dholpur stone cladding, comprehensive MFFA air purification technology, and five-tier security.",
    amenities: ["Air Purification Filtration Zone", "Clubhouse Managed by Luxury Hospitality", "Temperature Controlled Swimming Pool", "Private Dining Room", "Wellness Spa & Salon", "5-Tier High Tech Security"],
    specifications: {
      flooring: "Imported marble in living, dining, and family lounge; engineered wood in master suite",
      kitchen: "Bespoke modular kitchen with built-in European appliances and quartz countertops",
      bathrooms: "Duravit sanitary fittings and Grohe thermostatic mixers",
      structure: "Seismic Zone IV earthquake compliant RCC framed structure"
    },
    configurations: [
      { bhk: "2 BHK", carpetArea: 1520, bathrooms: 2, price: 42000000 },
      { bhk: "3 BHK", carpetArea: 2150, bathrooms: 3, price: 58000000 },
      { bhk: "4 BHK", carpetArea: 3300, bathrooms: 4, price: 95000000 }
    ]
  },
  {
    name: "Risland Sky Mansion",
    slug: "risland-sky-mansion-chattarpur-new-delhi",
    developerName: "Risland India",
    cityName: "New Delhi",
    cityId: 12,
    address: "Chattarpur Farms, Asola Wild Life Sanctuary Road",
    landmark: "Adjacent to Asola Wildlife Sanctuary",
    location: "Chattarpur, New Delhi",
    latitude: 28.4984,
    longitude: 77.1892,
    startingPrice: 65000000,
    maxPrice: 165000000,
    pricePerSqFt: 19500,
    possessionDate: "2025-06-30T00:00:00.000Z",
    launchDate: "2019-11-20T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "DLRERA2018P0014",
    totalUnits: 160,
    availableUnits: 15,
    totalTowers: 4,
    totalFloors: 25,
    projectAreaAcres: 4.1,
    openSpacePercent: 78,
    salesPhone: "9810333440",
    salesEmail: "sales.skymansion@risland.com",
    searchKeywords: ["Chattarpur flat", "South Delhi apartment", "Vasant Kunj flat"],
    description: "Risland Sky Mansion is Delhi's highest skyscraper in the prestigious farm area of Chattarpur, rising 100 meters above the green expanse of Asola Wildlife Sanctuary.",
    amenities: ["100-Meter High Skyscraper", "Olympic Swimming Pool", "Private Helipad Access", "Tennis & Squash Courts", "Luxury Banquet Hall", "Smart Home Voice Automation"],
    specifications: {
      flooring: "Imported Italian Statuario marble across all living spaces",
      kitchen: "Custom Poggenpohl modular setup with Miele built-in appliances",
      bathrooms: "Kohler Artist Edition wash basins and Hansgrohe rain showers",
      structure: "Steel composite and high performance RCC seismic structure"
    },
    configurations: [
      { bhk: "3 BHK", carpetArea: 3255, bathrooms: 3, price: 65000000 },
      { bhk: "4 BHK", carpetArea: 4005, bathrooms: 4, price: 85000000 },
      { bhk: "5 BHK Penthouse", carpetArea: 7200, bathrooms: 5, price: 165000000 }
    ]
  },
  {
    name: "TARC Tripundra",
    slug: "tarc-tripundra-bijwasan-kapashera-new-delhi",
    developerName: "The Anant Raj Corporation (TARC)",
    cityName: "New Delhi",
    cityId: 12,
    address: "Main Bijwasan Road, Kapashera",
    landmark: "Near Aerocity & IGI International Airport Terminal 3",
    location: "Bijwasan, New Delhi",
    latitude: 28.5342,
    longitude: 77.0864,
    startingPrice: 45000000,
    maxPrice: 88000000,
    pricePerSqFt: 18000,
    possessionDate: "2026-03-31T00:00:00.000Z",
    launchDate: "2022-05-15T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "DLRERA2022P0012",
    totalUnits: 190,
    availableUnits: 24,
    totalTowers: 3,
    totalFloors: 10,
    projectAreaAcres: 3.0,
    openSpacePercent: 70,
    salesPhone: "9810344550",
    salesEmail: "sales.tripundra@tarc.in",
    searchKeywords: ["Bijwasan flat", "Kapashera flat", "Aerocity Delhi apartment"],
    description: "TARC Tripundra is a low-density boutique luxury enclave situated close to Delhi Aerocity and IGI Airport, offering experiential homes with soundproof glass, personal organic gardens, and a heated indoor pool.",
    amenities: ["Indoor Heated Saltwater Pool", "Rooftop Astronomy Deck", "Aerocity Concierge Services", "Wellness & Ayurvedic Spa", "Co-Working Executive Suites", "EV Charging Station for Every Unit"],
    specifications: {
      flooring: "Italian Crema Marfil marble in living spaces; engineered oak flooring in bedrooms",
      kitchen: "Imported modular kitchen with built-in Bosch dishwasher and convection ovens",
      bathrooms: "Toto washlets and Grohe brushed nickel thermostatic fixtures",
      structure: "Acoustically insulated double-glazed windows and RCC framed earthquake design"
    },
    configurations: [
      { bhk: "3 BHK", carpetArea: 2200, bathrooms: 3, price: 45000000 },
      { bhk: "4 BHK", carpetArea: 3100, bathrooms: 4, price: 64000000 },
      { bhk: "4 BHK Penthouse", carpetArea: 4200, bathrooms: 5, price: 88000000 }
    ]
  },
  {
    name: "Parsvnath Paramount",
    slug: "parsvnath-paramount-subhash-nagar-new-delhi",
    developerName: "Parsvnath Developers",
    cityName: "New Delhi",
    cityId: 12,
    address: "Najafgarh Road, Subhash Nagar",
    landmark: "Directly opposite Subhash Nagar Metro Station & Pacific Mall",
    location: "Subhash Nagar, New Delhi",
    latitude: 28.6418,
    longitude: 77.1084,
    startingPrice: 38000000,
    maxPrice: 65000000,
    pricePerSqFt: 16500,
    possessionDate: "2024-12-31T00:00:00.000Z",
    launchDate: "2018-04-10T00:00:00.000Z",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "DLRERA2018P0009",
    totalUnits: 120,
    availableUnits: 12,
    totalTowers: 2,
    totalFloors: 14,
    projectAreaAcres: 2.5,
    openSpacePercent: 65,
    salesPhone: "9810355660",
    salesEmail: "sales.paramount@parsvnath.com",
    searchKeywords: ["Subhash Nagar flat", "Rajouri Garden flat", "Janakpuri apartment"],
    description: "Parsvnath Paramount is an ultra-exclusive ready-to-move-in luxury condominium in West Delhi opposite Pacific Mall, featuring private elevators, three-side-open homes, and dedicated multi-level basement parking.",
    amenities: ["Private Elevator Foyers", "Swimming Pool with Sundeck", "Modern Gymnasium", "Landscaped Central Green", "Grand Air-Conditioned Lobby", "CCTV & Video Door Phone Security"],
    specifications: {
      flooring: "Imported Italian marble in living and dining rooms; wooden flooring in bedrooms",
      kitchen: "Granite counter with stainless steel sink, chimney, and piped gas provision",
      bathrooms: "Branded Kohler sanitaryware with glass shower partitions",
      structure: "Earthquake resistant RCC framed structure"
    },
    configurations: [
      { bhk: "3 BHK", carpetArea: 1980, bathrooms: 3, price: 38000000 },
      { bhk: "4 BHK", carpetArea: 2650, bathrooms: 4, price: 52000000 },
      { bhk: "4 BHK Penthouse", carpetArea: 3400, bathrooms: 5, price: 65000000 }
    ]
  }
];

async function main() {
  console.log(`=== SOURCING PHOTOS AND SEEDING TIER-1 DEEP PROJECTS (BATCH 7) ===`);
  console.log(`Total projects to process: ${TIER1_PROJECTS.length}`);

  const usedGlobalPhotos = new Set();

  for (let i = 0; i < TIER1_PROJECTS.length; i++) {
    const p = TIER1_PROJECTS[i];
    console.log(`\n[${i + 1}/${TIER1_PROJECTS.length}] Processing ${p.name} in ${p.cityName}...`);

    const projectDir = path.join(PROJECT_IMAGES_DIR, p.slug);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    const uploadedUrls = [];
    const queries = p.searchKeywords || [`${p.cityName} flat`];

    let candidatePhotos = [];
    for (const q of queries) {
      const photos = await fetchPhotosForQuery(q);
      for (const ph of photos) {
        if (!candidatePhotos.includes(ph)) candidatePhotos.push(ph);
      }
      if (candidatePhotos.length >= 12) break;
    }

    // Fallback city query if needed
    if (candidatePhotos.length < 5) {
      const cityPhotos = await fetchPhotosForQuery(`${p.cityName} luxury flat apartment`);
      for (const ph of cityPhotos) {
        if (!candidatePhotos.includes(ph)) candidatePhotos.push(ph);
      }
    }

    for (let j = 0; j < candidatePhotos.length; j++) {
      if (uploadedUrls.length >= 5) break;
      const photoUrl = candidatePhotos[j];
      if (usedGlobalPhotos.has(photoUrl)) continue;
      usedGlobalPhotos.add(photoUrl);

      const idx = uploadedUrls.length + 1;
      const localFile = path.join(projectDir, `photo_${idx}.webp`);
      const r2Key = `projects/photos/${p.slug}/photo_${idx}.webp`;

      const downloaded = await downloadImage(photoUrl, localFile);
      if (downloaded) {
        const url = await uploadToCloudflareR2(localFile, r2Key);
        uploadedUrls.push(url);
        console.log(`  ✓ Uploaded image ${idx}/5 to R2: ${url}`);
      }
    }

    p.images = uploadedUrls;
  }

  fs.writeFileSync(DOCS_FILE, JSON.stringify(TIER1_PROJECTS, null, 2));
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(TIER1_PROJECTS, null, 2));
  console.log(`\nSaved ${TIER1_PROJECTS.length} projects to ${DOCS_FILE} and ${PROJECTS_FILE}`);
}

main().catch(console.error);
