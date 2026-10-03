export interface MetroCluster {
  id: string;
  name: string;
  countryCode: string; // ISO 2-letter: IN, AE, US, GB, etc.
  primaryCity: string;
  regionalCities: string[]; // Ordered by market popularity / proximity
  popularSubTypes?: {
    residential: string[];
    commercial: string[];
  };
}

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  defaultClusterId: string;
  clusters: MetroCluster[];
}

export const REGIONAL_CONFIG: Record<string, CountryConfig> = {
  IN: {
    code: "IN",
    name: "India",
    currency: "INR",
    currencySymbol: "₹",
    defaultClusterId: "delhi-ncr",
    clusters: [
      {
        id: "delhi-ncr",
        name: "Delhi-NCR",
        countryCode: "IN",
        primaryCity: "Delhi",
        regionalCities: ["Delhi", "Gurugram", "Noida", "Ghaziabad", "Faridabad", "Greater Noida"],
        popularSubTypes: {
          residential: ["Apartments", "Builder Floor", "House", "Villas", "Studio"],
          commercial: ["Office Space", "Shop", "Showroom", "Commercial Land"],
        },
      },
      {
        id: "mumbai-mmr",
        name: "Mumbai Metropolitan Region",
        countryCode: "IN",
        primaryCity: "Mumbai",
        regionalCities: ["Mumbai", "Thane", "Navi Mumbai", "Mira Bhayandar", "Kalyan"],
        popularSubTypes: {
          residential: ["Apartments", "Penthouse", "Studio", "Sea-facing Flat"],
          commercial: ["Office Space", "Retail Shop", "Co-working Space"],
        },
      },
      {
        id: "bengaluru-urban",
        name: "Bengaluru Tech Corridor",
        countryCode: "IN",
        primaryCity: "Bengaluru",
        regionalCities: ["Bengaluru", "Whitefield", "Electronic City", "Sarjapur", "Hebbal"],
        popularSubTypes: {
          residential: ["Apartments", "Gated Villa", "Penthouse", "Plot"],
          commercial: ["Tech Park Office", "Retail Space", "Commercial Building"],
        },
      },
      {
        id: "hyderabad-metro",
        name: "Hyderabad Metropolitan",
        countryCode: "IN",
        primaryCity: "Hyderabad",
        regionalCities: ["Hyderabad", "Gachibowli", "Hitec City", "Madhapur", "Secunderabad"],
        popularSubTypes: {
          residential: ["High-rise Apartments", "Gated Villa", "Independent House"],
          commercial: ["IT Office", "Commercial Plot"],
        },
      },
      {
        id: "pune-metro",
        name: "Pune Metropolitan",
        countryCode: "IN",
        primaryCity: "Pune",
        regionalCities: ["Pune", "Hinjawadi", "Wakad", "Baner", "Kharadi", "Pimpri-Chinchwad"],
        popularSubTypes: {
          residential: ["Apartments", "Row House", "Township Flat"],
          commercial: ["IT Space", "Commercial Shop"],
        },
      },
      {
        id: "kolkata-metro",
        name: "Kolkata & Greater Bengal",
        countryCode: "IN",
        primaryCity: "Kolkata",
        regionalCities: ["Kolkata", "Howrah", "Salt Lake", "New Town", "Rajarhat", "Durgapur", "Siliguri"],
        popularSubTypes: {
          residential: ["Apartments", "Heritage House", "Duplex", "Bungalow"],
          commercial: ["Office Space", "Commercial Complex"],
        },
      },
      {
        id: "patna-bihar",
        name: "Patna & Bihar Region",
        countryCode: "IN",
        primaryCity: "Patna",
        regionalCities: ["Patna", "Danapur", "Bihta", "Muzaffarpur", "Gaya", "Bhagalpur", "Darbhanga"],
        popularSubTypes: {
          residential: ["Apartments", "Independent House", "Residential Plot"],
          commercial: ["Commercial Shop", "Office Space", "Showroom"],
        },
      },
      {
        id: "ranchi-jharkhand",
        name: "Ranchi & Jharkhand Region",
        countryCode: "IN",
        primaryCity: "Ranchi",
        regionalCities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh"],
        popularSubTypes: {
          residential: ["Apartments", "Independent House", "Duplex Villa"],
          commercial: ["Commercial Space", "Office", "Retail Shop"],
        },
      },
      {
        id: "lucknow-up",
        name: "Lucknow & Uttar Pradesh",
        countryCode: "IN",
        primaryCity: "Lucknow",
        regionalCities: ["Lucknow", "Kanpur", "Varanasi", "Prayagraj", "Agra", "Meerut", "Gorakhpur", "Ayodhya"],
        popularSubTypes: {
          residential: ["Villas", "Builder Floor", "Apartments", "Gated Township"],
          commercial: ["Showroom", "Commercial Space", "Retail Shop"],
        },
      },
      {
        id: "chandigarh-tricity",
        name: "Chandigarh Tricity & Punjab",
        countryCode: "IN",
        primaryCity: "Chandigarh",
        regionalCities: ["Chandigarh", "Mohali", "Panchkula", "Zirakpur", "Kharar", "Ludhiana", "Amritsar", "Jalandhar"],
        popularSubTypes: {
          residential: ["Builder Floor", "Luxury Kothi", "Gated Apartments", "Plots"],
          commercial: ["SCO / SCF", "Commercial Booth", "Office Suites"],
        },
      },
      {
        id: "ahmedabad-gujarat",
        name: "Ahmedabad & Gujarat Region",
        countryCode: "IN",
        primaryCity: "Ahmedabad",
        regionalCities: ["Ahmedabad", "Gandhinagar", "Surat", "Vadodara", "Rajkot", "Gift City"],
        popularSubTypes: {
          residential: ["Apartments", "Tenement", "Bungalows", "Penthouses"],
          commercial: ["Corporate Offices", "Showrooms", "Commercial Offices"],
        },
      },
      {
        id: "jaipur-rajasthan",
        name: "Jaipur & Rajasthan Region",
        countryCode: "IN",
        primaryCity: "Jaipur",
        regionalCities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bhiwadi"],
        popularSubTypes: {
          residential: ["Villas", "Luxury Floors", "Township Plots", "Apartments"],
          commercial: ["Heritage Commercial", "Retail Shops", "Offices"],
        },
      },
      {
        id: "indore-mp",
        name: "Indore & Madhya Pradesh",
        countryCode: "IN",
        primaryCity: "Indore",
        regionalCities: ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain"],
        popularSubTypes: {
          residential: ["Row Houses", "Apartments", "Bungalows"],
          commercial: ["Commercial Complex", "Shops", "Offices"],
        },
      },
      {
        id: "chennai-tn",
        name: "Chennai & Tamil Nadu",
        countryCode: "IN",
        primaryCity: "Chennai",
        regionalCities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
        popularSubTypes: {
          residential: ["Apartments", "Individual Villa", "Beachfront Flat"],
          commercial: ["IT Park Space", "Commercial Building"],
        },
      },
      {
        id: "kochi-kerala",
        name: "Kochi & Kerala Region",
        countryCode: "IN",
        primaryCity: "Kochi",
        regionalCities: ["Kochi", "Ernakulam", "Thiruvananthapuram", "Kozhikode", "Thrissur"],
        popularSubTypes: {
          residential: ["Waterfront Apartments", "Kerala Style Villas", "Independent House"],
          commercial: ["Commercial Complex", "IT Office"],
        },
      },
      {
        id: "bhubaneswar-odisha",
        name: "Bhubaneswar & Odisha",
        countryCode: "IN",
        primaryCity: "Bhubaneswar",
        regionalCities: ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"],
        popularSubTypes: {
          residential: ["Apartments", "Duplex", "Residential Plots"],
          commercial: ["Commercial Space", "Office Suites"],
        },
      },
      {
        id: "dehradun-uk",
        name: "Dehradun & Uttarakhand",
        countryCode: "IN",
        primaryCity: "Dehradun",
        regionalCities: ["Dehradun", "Mussoorie", "Rishikesh", "Haridwar", "Haldwani"],
        popularSubTypes: {
          residential: ["Valley View Cottages", "Villas", "Apartments"],
          commercial: ["Commercial Space", "Resort Plots"],
        },
      },
      {
        id: "goa-coastal",
        name: "Goa Coastal Region",
        countryCode: "IN",
        primaryCity: "Goa",
        regionalCities: ["Panaji", "North Goa", "South Goa", "Margao", "Candolim", "Calangute", "Mapusa"],
        popularSubTypes: {
          residential: ["Portuguese Villas", "Holiday Homes", "Studio Flats", "Sea View Apartments"],
          commercial: ["Commercial Boutique", "Boutique Resort Space"],
        },
      },
    ],
  },
  AE: {
    code: "AE",
    name: "United Arab Emirates",
    currency: "AED",
    currencySymbol: "AED ",
    defaultClusterId: "dubai-metro",
    clusters: [
      {
        id: "dubai-metro",
        name: "Dubai",
        countryCode: "AE",
        primaryCity: "Dubai",
        regionalCities: ["Dubai", "Downtown Dubai", "Dubai Marina", "Palm Jumeirah", "Business Bay", "Jumeirah Village Circle"],
        popularSubTypes: {
          residential: ["Luxury Apartments", "Penthouses", "Waterfront Villas", "Townhouses"],
          commercial: ["Fitted Offices", "Retail Outlets"],
        },
      },
      {
        id: "abu-dhabi-metro",
        name: "Abu Dhabi",
        countryCode: "AE",
        primaryCity: "Abu Dhabi",
        regionalCities: ["Abu Dhabi", "Yas Island", "Saadiyat Island", "Al Reem Island"],
        popularSubTypes: {
          residential: ["Luxury Apartments", "Beachfront Villas"],
          commercial: ["Commercial Towers", "Offices"],
        },
      },
    ],
  },
  US: {
    code: "US",
    name: "United States",
    currency: "USD",
    currencySymbol: "$",
    defaultClusterId: "ny-metro",
    clusters: [
      {
        id: "ny-metro",
        name: "New York Tri-State",
        countryCode: "US",
        primaryCity: "New York",
        regionalCities: ["New York", "Manhattan", "Brooklyn", "Queens", "Jersey City", "Hoboken"],
        popularSubTypes: {
          residential: ["Condos", "Co-ops", "Townhouses", "Brownstones"],
          commercial: ["Office Space", "Retail Storefront"],
        },
      },
      {
        id: "bay-area",
        name: "San Francisco Bay Area",
        countryCode: "US",
        primaryCity: "San Francisco",
        regionalCities: ["San Francisco", "San Jose", "Sunnyvale", "Mountain View", "Palo Alto", "Oakland"],
        popularSubTypes: {
          residential: ["Single Family Homes", "Condos", "Townhomes"],
          commercial: ["Tech Campus", "Office Suites"],
        },
      },
    ],
  },
  GB: {
    code: "GB",
    name: "United Kingdom",
    currency: "GBP",
    currencySymbol: "£",
    defaultClusterId: "london-metro",
    clusters: [
      {
        id: "london-metro",
        name: "Greater London",
        countryCode: "GB",
        primaryCity: "London",
        regionalCities: ["London", "Westminster", "Camden", "Canary Wharf", "Kensington", "Islington"],
        popularSubTypes: {
          residential: ["Flats", "Terraced Houses", "Mews Houses", "Penthouses"],
          commercial: ["Offices", "Retail Units"],
        },
      },
    ],
  },
};

export const DEFAULT_COUNTRY = "IN";

/**
 * Resolves the matching MetroCluster given a city name and optional country code.
 * Performs case-insensitive matching across primary and regional cities.
 */
export function resolveMetroCluster(cityName?: string | null, countryCode: string = DEFAULT_COUNTRY): MetroCluster {
  const normCountry = (countryCode || DEFAULT_COUNTRY).toUpperCase();
  const country = REGIONAL_CONFIG[normCountry] ?? REGIONAL_CONFIG[DEFAULT_COUNTRY];

  if (!cityName || !cityName.trim()) {
    return (
      country.clusters.find((c) => c.id === country.defaultClusterId) ??
      country.clusters[0] ??
      REGIONAL_CONFIG[DEFAULT_COUNTRY].clusters[0]
    );
  }

  const query = cityName.trim().toLowerCase();

  // 1. Direct match in selected country
  for (const cluster of country.clusters) {
    if (
      cluster.primaryCity.toLowerCase() === query ||
      cluster.regionalCities.some((c) => c.toLowerCase() === query || query.includes(c.toLowerCase()) || c.toLowerCase().includes(query))
    ) {
      return cluster;
    }
  }

  // 2. Global search across all countries if not found in requested country
  for (const cCode of Object.keys(REGIONAL_CONFIG)) {
    const cObj = REGIONAL_CONFIG[cCode];
    for (const cluster of cObj.clusters) {
      if (
        cluster.primaryCity.toLowerCase() === query ||
        cluster.regionalCities.some((c) => c.toLowerCase() === query || query.includes(c.toLowerCase()) || c.toLowerCase().includes(query))
      ) {
        return cluster;
      }
    }
  }

  // 3. Fallback to default cluster
  return (
    country.clusters.find((c) => c.id === country.defaultClusterId) ??
    country.clusters[0] ??
    REGIONAL_CONFIG[DEFAULT_COUNTRY].clusters[0]
  );
}

/**
 * Returns prioritized regional cities for autocomplete recommendations.
 */
export function getClusterCities(cluster: MetroCluster, max: number = 6): string[] {
  const cities = [cluster.primaryCity, ...cluster.regionalCities.filter((c) => c !== cluster.primaryCity)];
  return Array.from(new Set(cities)).slice(0, max);
}
