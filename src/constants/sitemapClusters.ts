/**
 * Validated clusters of active properties & flatmates across top 59 Indian cities.
 * Generated from production PostgreSQL inventory to guarantee:
 * 1) Every single (intent, city, locality) combination has >= 1 active property/listing.
 * 2) Zero empty landing pages in sitemap.xml.
 */

export interface SitemapCluster {
  intent: "buy" | "rent" | "commercial" | "plot" | "pg" | "flatmate";
  city: string;
  locality: string;
  count: number;
}

export const SITEMAP_CLUSTERS: SitemapCluster[] = [
  {
    "intent": "buy",
    "city": "Agra",
    "locality": "Fatehabad Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Ahmedabad",
    "locality": "Chandkheda",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Ahmedabad",
    "locality": "Satellite",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Ahmedabad",
    "locality": "Zundal",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Amritsar",
    "locality": "Airport Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Bengaluru",
    "locality": "Cheemasandra",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Bengaluru",
    "locality": "HSR Layout",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Bengaluru",
    "locality": "Jigani",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Bengaluru",
    "locality": "Medahalli",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Bengaluru",
    "locality": "Whitefield",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Bhagalpur",
    "locality": "Zero Mile",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Bhopal",
    "locality": "Hoshangabad Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Bhopal",
    "locality": "Huzur",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Bhopal",
    "locality": "Kokta",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Bhopal",
    "locality": "Narila Shankari Bhawani Dham Society",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Bhubaneswar",
    "locality": "Saheed Nagar",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Bokaro Steel City",
    "locality": "City Centre",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Chandigarh",
    "locality": "Ludhiana - Chandigarh State Highway",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Chandigarh",
    "locality": "Sector 38 West",
    "count": 3
  },
  {
    "intent": "buy",
    "city": "Chandigarh",
    "locality": "Sector 8",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Chennai",
    "locality": "Avadi",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Chennai",
    "locality": "ECR",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Chennai",
    "locality": "Kovilancheri",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Chennai",
    "locality": "Sevvapet",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Coimbatore",
    "locality": "Gandhipuram",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Cuttack",
    "locality": "Link Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Darbhanga",
    "locality": "Darbhanga Tower",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Dehradun",
    "locality": "Chakrata Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Delhi",
    "locality": "Dwarka",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Deoghar",
    "locality": "Baidyanath Dham",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Dhanbad",
    "locality": "Bank More",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Durgapur",
    "locality": "Fuljhor",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Faridabad",
    "locality": "Greenfield Colony",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Gaya",
    "locality": "AP Colony",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Ghaziabad",
    "locality": "Indirapuram",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Ghaziabad",
    "locality": "Raj Nagar Extension",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Ghaziabad",
    "locality": "Vasundhara",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Greater Noida",
    "locality": "Alpha 2",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Gurugram",
    "locality": "Gwal Pahari",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Gurugram",
    "locality": "Sector 57",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Gurugram",
    "locality": "Sector 67A",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Gurugram",
    "locality": "Sector 99A",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Guwahati",
    "locality": "Zoo Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Hazaribagh",
    "locality": "Korrah",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Howrah",
    "locality": "Salkia",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Hyderabad",
    "locality": "Attapur",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Hyderabad",
    "locality": "Bandlaguda",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Hyderabad",
    "locality": "Gachibowli",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Hyderabad",
    "locality": "Jadcherla",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Hyderabad",
    "locality": "Kuntloor Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Hyderabad",
    "locality": "Serilingampally",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Indore",
    "locality": "AB Bypass Road",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Indore",
    "locality": "Bhawarkua",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Indore",
    "locality": "Mahalaxmi Nagar",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Indore",
    "locality": "Rau Circle",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Indore",
    "locality": "Vijay Nagar",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Jaipur",
    "locality": "C Scheme",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Jaipur",
    "locality": "Hathod",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Jaipur",
    "locality": "Jaisinghpura",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Jaipur",
    "locality": "Sector 12",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Jaipur",
    "locality": "Vaishali Nagar",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Jamshedpur",
    "locality": "Sonari",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Jodhpur",
    "locality": "Ratanada",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Kanpur",
    "locality": "Civil Lines",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Kochi",
    "locality": "Palarivattom",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Kochi",
    "locality": "Panampilly Nagar",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Kochi",
    "locality": "Vytila",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Kolkata",
    "locality": "Mukundapur",
    "count": 3
  },
  {
    "intent": "buy",
    "city": "Kolkata",
    "locality": "New Town",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Kolkata",
    "locality": "Picnic Garden",
    "count": 3
  },
  {
    "intent": "buy",
    "city": "Kolkata",
    "locality": "Sodpur",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Lucknow",
    "locality": "Alambagh",
    "count": 5
  },
  {
    "intent": "buy",
    "city": "Lucknow",
    "locality": "Hazratganj",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Lucknow",
    "locality": "Vrindavan",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Ludhiana",
    "locality": "Civil Lines",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Mangaluru",
    "locality": "Kankanady",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Mumbai",
    "locality": "Juhu",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Mumbai",
    "locality": "Nahur West",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Mumbai",
    "locality": "New Panvel",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Mumbai",
    "locality": "Virar West",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Muzaffarpur",
    "locality": "Kalambagh Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Mysuru",
    "locality": "Vijayanagar 2nd Stage",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Nagpur",
    "locality": "Wardha Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Navi Mumbai",
    "locality": "Kharghar",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Navi Mumbai",
    "locality": "Rabale",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Navi Mumbai",
    "locality": "Seawoods",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Navi Mumbai",
    "locality": "Taloja Panchanand",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "New Delhi",
    "locality": "Hauz Khas",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "New Delhi",
    "locality": "Pansoli",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "New Delhi",
    "locality": "Saket",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "New Delhi",
    "locality": "Uttam Nagar",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Noida",
    "locality": "Bisrakh",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Noida",
    "locality": "Ecotech III",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Noida",
    "locality": "Mukundapur",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Noida",
    "locality": "Noida Extension",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Noida",
    "locality": "Sector 1 Noida extension",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Noida",
    "locality": "Sector 62",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Noida",
    "locality": "Swaran Nagri",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Patna",
    "locality": "Kankarbagh",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Patna",
    "locality": "Udaini",
    "count": 7
  },
  {
    "intent": "buy",
    "city": "Prayagraj",
    "locality": "Jhalwa",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Pune",
    "locality": "Charholi",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Pune",
    "locality": "Hadapsar",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Pune",
    "locality": "Hinjewadi Rajiv Gandhi Infotech Park Phase 3",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Pune",
    "locality": "Lohegaon",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Pune",
    "locality": "Undri",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Pune",
    "locality": "Vishrant Wadi",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Pune",
    "locality": "Wakad",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Puri",
    "locality": "VIP Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Purnia",
    "locality": "Bhatta Bazar",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Rajkot",
    "locality": "Yagnik Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Ranchi",
    "locality": "Morabadi",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Siliguri",
    "locality": "Sevoke Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Surat",
    "locality": "Adajan",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Surat",
    "locality": "Bhestan",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Surat",
    "locality": "Gauravpath Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Thane",
    "locality": "Ghopbunder Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Thane",
    "locality": "Kasarvadavli",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Thane",
    "locality": "Kasheli",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Thane",
    "locality": "Naupada",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Thiruvananthapuram",
    "locality": "Vellayambalam",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Udaipur",
    "locality": "Bhuwana",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Vadodara",
    "locality": "Ajwa Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Vadodara",
    "locality": "Baranpura",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Vadodara",
    "locality": "Old Padra Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Vadodara",
    "locality": "Waghodia Road",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Varanasi",
    "locality": "Banaras Hindu University",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Varanasi",
    "locality": "Cantonment",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Varanasi",
    "locality": "Chitaipur",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Varanasi",
    "locality": "Shukulpur",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Vijayawada",
    "locality": "Gollapudi",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Visakhapatnam",
    "locality": "Lawsons Bay Colony",
    "count": 1
  },
  {
    "intent": "buy",
    "city": "Visakhapatnam",
    "locality": "Pedda Waltair",
    "count": 2
  },
  {
    "intent": "buy",
    "city": "Visakhapatnam",
    "locality": "Siripuram",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Agra",
    "locality": "Kamla Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Agra",
    "locality": "Sikandra",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Ahmedabad",
    "locality": "Ashram Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Ahmedabad",
    "locality": "Chandkheda Village",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Ahmedabad",
    "locality": "Chimanlal Girdharlal Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Ahmedabad",
    "locality": "Ghodasar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Ahmedabad",
    "locality": "Lambha",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Ahmedabad",
    "locality": "Navrangpura",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Ahmedabad",
    "locality": "Nikol",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Ahmedabad",
    "locality": "SG Highway",
    "count": 3
  },
  {
    "intent": "commercial",
    "city": "Ahmedabad",
    "locality": "Satellite Anand Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Ahmedabad",
    "locality": "Vastrapur",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Amritsar",
    "locality": "GT Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Amritsar",
    "locality": "Ranjit Avenue",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bengaluru",
    "locality": "Abbaiah Reddy Layout",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bengaluru",
    "locality": "BTM Layout",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Bengaluru",
    "locality": "Brigade Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bengaluru",
    "locality": "Herohalli",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bengaluru",
    "locality": "Infantry Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bengaluru",
    "locality": "Kanaka Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bengaluru",
    "locality": "Koramangala",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bengaluru",
    "locality": "Rajiv Nagar Stage 1",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bengaluru",
    "locality": "Thavarekere",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bengaluru",
    "locality": "Ulsoor",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bengaluru",
    "locality": "Vittal Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bengaluru",
    "locality": "Whitefield",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Bhagalpur",
    "locality": "Aliganj",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bhagalpur",
    "locality": "Barari",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bhopal",
    "locality": "Ayodhya Bypass",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bhopal",
    "locality": "Bawaria Kalan",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bhopal",
    "locality": "Bhopal Ganj",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bhopal",
    "locality": "Hoshangabad Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bhopal",
    "locality": "Jumerati",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bhopal",
    "locality": "MP Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bhopal",
    "locality": "New Market tt Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bhopal",
    "locality": "TT Nagar New Market",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bhubaneswar",
    "locality": "Chandrasekharpur",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Bokaro Steel City",
    "locality": "Chas",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Bokaro Steel City",
    "locality": "City Centre",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Chandigarh",
    "locality": "Ambala Chandigarh Expressway",
    "count": 4
  },
  {
    "intent": "commercial",
    "city": "Chandigarh",
    "locality": "Daria",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Chandigarh",
    "locality": "Preet Colony",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Chandigarh",
    "locality": "Sector 17",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Chandigarh",
    "locality": "Sector 35",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Chandigarh",
    "locality": "Sector 40C",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Chandigarh",
    "locality": "Sector 41D",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Chandigarh",
    "locality": "Sector 45C",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Chandigarh",
    "locality": "Sector 7C",
    "count": 4
  },
  {
    "intent": "commercial",
    "city": "Chandigarh",
    "locality": "Sector 8C",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Chennai",
    "locality": "Adyar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Chennai",
    "locality": "Ambattur",
    "count": 3
  },
  {
    "intent": "commercial",
    "city": "Chennai",
    "locality": "Anna Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Chennai",
    "locality": "Chennai Central",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Chennai",
    "locality": "East Coast Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Chennai",
    "locality": "OMR",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Chennai",
    "locality": "Rajakilpakkam",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Coimbatore",
    "locality": "Gandhipuram",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Coimbatore",
    "locality": "Saravanampatti",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Cuttack",
    "locality": "Badambadi",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Cuttack",
    "locality": "Mahanadi Vihar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Darbhanga",
    "locality": "Allalpatti",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Darbhanga",
    "locality": "Benta Chowk",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Dehradun",
    "locality": "Chakrata Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Dehradun",
    "locality": "Haridwar Bypass",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Deoghar",
    "locality": "Baidyanath Dham",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Dhanbad",
    "locality": "Dhirajganj",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Dhanbad",
    "locality": "Govindpur Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Durgapur",
    "locality": "Fuljhor",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Durgapur",
    "locality": "Muchipara",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Faridabad",
    "locality": "Neharpar Sector 82",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Faridabad",
    "locality": "Sector 15",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Gaya",
    "locality": "AP Colony",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Gaya",
    "locality": "Medical College Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Ghaziabad",
    "locality": "Indirapuram",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Ghaziabad",
    "locality": "Raj Nagar Extension",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Greater Noida",
    "locality": "Alpha 2",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Greater Noida",
    "locality": "Pari Chowk",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Gurugram",
    "locality": "Devilal Colony",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Gurugram",
    "locality": "Golf Course Extn Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Gurugram",
    "locality": "Golf Course Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Gurugram",
    "locality": "Islampur",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Gurugram",
    "locality": "Krishna Colony",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Gurugram",
    "locality": "Sector 37",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Gurugram",
    "locality": "Sector 67A",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Gurugram",
    "locality": "Sector 81",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Gurugram",
    "locality": "Sohna Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Gurugram",
    "locality": "Udyog Vihar Phase 3",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Gurugram",
    "locality": "Udyog Vihar Phase 4",
    "count": 3
  },
  {
    "intent": "commercial",
    "city": "Guwahati",
    "locality": "Beltola",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Guwahati",
    "locality": "GS Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Hazaribagh",
    "locality": "Canary Hill Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Hazaribagh",
    "locality": "Lake Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Howrah",
    "locality": "Mandirtala",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Howrah",
    "locality": "Salkia",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Hyderabad",
    "locality": "Aziz Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Hyderabad",
    "locality": "Begumpet",
    "count": 3
  },
  {
    "intent": "commercial",
    "city": "Hyderabad",
    "locality": "Dilsukh Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Hyderabad",
    "locality": "ECIL",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Hyderabad",
    "locality": "Jubilee Hills",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Hyderabad",
    "locality": "Lakdikapool",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Hyderabad",
    "locality": "Madhapur",
    "count": 5
  },
  {
    "intent": "commercial",
    "city": "Hyderabad",
    "locality": "Nagaram",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Hyderabad",
    "locality": "Raidurgam",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Indore",
    "locality": "AB Bypass Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Indore",
    "locality": "Dwarkapuri",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Indore",
    "locality": "Khajuri Bazar",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Indore",
    "locality": "Mahalaxmi Nagar",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Indore",
    "locality": "Malharganj",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Indore",
    "locality": "New Palasiya",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Indore",
    "locality": "Nipania",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Indore",
    "locality": "Vijay Nagar",
    "count": 8
  },
  {
    "intent": "commercial",
    "city": "Indore",
    "locality": "Yn Road",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Jaipur",
    "locality": "Ajmer Road",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Jaipur",
    "locality": "Jagatpura",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Jaipur",
    "locality": "Jhotwara",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Jaipur",
    "locality": "Malviya Nagar",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Jaipur",
    "locality": "Vaishali Nagar",
    "count": 5
  },
  {
    "intent": "commercial",
    "city": "Jamshedpur",
    "locality": "Bistupur",
    "count": 3
  },
  {
    "intent": "commercial",
    "city": "Jodhpur",
    "locality": "Shastri Nagar",
    "count": 3
  },
  {
    "intent": "commercial",
    "city": "Kanpur",
    "locality": "Kalyanpur",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Kanpur",
    "locality": "Swaroop Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Kochi",
    "locality": "Alangad",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Kochi",
    "locality": "Edappally",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Kochi",
    "locality": "Kochi MG Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Kochi",
    "locality": "Lissie Junction",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Kochi",
    "locality": "MG Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Kochi",
    "locality": "Palluruthy",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Kochi",
    "locality": "Panampilly Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Kochi",
    "locality": "Vyttila",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Kolkata",
    "locality": "Ballygunge",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Kolkata",
    "locality": "Bhatpara",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Kolkata",
    "locality": "Chinar Park",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Kolkata",
    "locality": "EM Bypass - Ruby",
    "count": 3
  },
  {
    "intent": "commercial",
    "city": "Kolkata",
    "locality": "Kasba",
    "count": 4
  },
  {
    "intent": "commercial",
    "city": "Kolkata",
    "locality": "Konnagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Kolkata",
    "locality": "Mukundapur",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Kolkata",
    "locality": "Newtown - Action Area I",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Kolkata",
    "locality": "Newtown - Action Area II",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Kolkata",
    "locality": "Rabindrapally",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Kolkata",
    "locality": "Thakurpukur",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Lucknow",
    "locality": "Alambagh",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Lucknow",
    "locality": "Aliganj",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Lucknow",
    "locality": "Balaganj",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Lucknow",
    "locality": "Gomti Nagar",
    "count": 4
  },
  {
    "intent": "commercial",
    "city": "Lucknow",
    "locality": "Hazratganj",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Lucknow",
    "locality": "Krishna Nagar Colony",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Lucknow",
    "locality": "Malak",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Lucknow",
    "locality": "Rajajipuram",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Lucknow",
    "locality": "Sushant Golf City",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Lucknow",
    "locality": "Yahiyaganj",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Ludhiana",
    "locality": "Pakhowal Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Ludhiana",
    "locality": "Sarabha Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Mangaluru",
    "locality": "Bejai",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Mangaluru",
    "locality": "Kankanady",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Mumbai",
    "locality": "Andheri East",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Mumbai",
    "locality": "Bombay Motor Chauraha",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Mumbai",
    "locality": "Chembur",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Mumbai",
    "locality": "Goregaon East",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Mumbai",
    "locality": "Juhu",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Mumbai",
    "locality": "Kopar Khairane",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Mumbai",
    "locality": "Kurla East",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Mumbai",
    "locality": "MIDC Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Mumbai",
    "locality": "Malad West",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Mumbai",
    "locality": "Mira Road East",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Mumbai",
    "locality": "Powai",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Mumbai",
    "locality": "Vasai East",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Mumbai",
    "locality": "Virar East",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Muzaffarpur",
    "locality": "Kalambagh Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Muzaffarpur",
    "locality": "Zero Mile",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Mysuru",
    "locality": "Jayalakshmipuram",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Mysuru",
    "locality": "Kuvempunagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Nagpur",
    "locality": "Civil Lines",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Nagpur",
    "locality": "Manish Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Navi Mumbai",
    "locality": "Airoli",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Navi Mumbai",
    "locality": "CBD Belapur",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Navi Mumbai",
    "locality": "Kharghar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Navi Mumbai",
    "locality": "Kopar Khairane",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Navi Mumbai",
    "locality": "Mahape",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Navi Mumbai",
    "locality": "Navghar Village",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Navi Mumbai",
    "locality": "Vashi",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "New Delhi",
    "locality": "Defence Colony",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "New Delhi",
    "locality": "Janakpuri",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "New Delhi",
    "locality": "Kirti Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "New Delhi",
    "locality": "Lajpat Nagar 2",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "New Delhi",
    "locality": "Nehru Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "New Delhi",
    "locality": "Omaxe City",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "New Delhi",
    "locality": "Rajpur Khurd Extension",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "New Delhi",
    "locality": "South Extension",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "New Delhi",
    "locality": "Subhash Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "New Delhi",
    "locality": "Vasant Vihar",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Noida",
    "locality": "Anna Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Noida",
    "locality": "Begumpet",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Noida",
    "locality": "Noida Expressway",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Noida",
    "locality": "Sector 1 Noida extension",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Noida",
    "locality": "Sector 16",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Noida",
    "locality": "Sector 3",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Noida",
    "locality": "Sector 4",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Noida",
    "locality": "Sector 62",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Noida",
    "locality": "Sector 75",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Noida",
    "locality": "Sector 8",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Noida",
    "locality": "Sector 9",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Noida",
    "locality": "Sonari No 2",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Patna",
    "locality": "Boring Chauraha",
    "count": 4
  },
  {
    "intent": "commercial",
    "city": "Patna",
    "locality": "Changar",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Patna",
    "locality": "Chiriyatand Chauraha",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Patna",
    "locality": "Dak Bungalow Chauraha",
    "count": 3
  },
  {
    "intent": "commercial",
    "city": "Patna",
    "locality": "Kankarbagh",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Patna",
    "locality": "Phulwari Sharif",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Patna",
    "locality": "Ramnagar",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Patna",
    "locality": "Sadiqpur",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Prayagraj",
    "locality": "Jhalwa",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Pune",
    "locality": "Aundh",
    "count": 3
  },
  {
    "intent": "commercial",
    "city": "Pune",
    "locality": "Baner",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Pune",
    "locality": "Baner Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Pune",
    "locality": "Bhosari MIDC",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Pune",
    "locality": "Hadapsar",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Pune",
    "locality": "Kalyani Nagar",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Pune",
    "locality": "Koregaon Park",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Pune",
    "locality": "MG Road",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Pune",
    "locality": "Nigdi",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Pune",
    "locality": "Shivaji Nagar",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Pune",
    "locality": "Wakad",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Pune",
    "locality": "Warje",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Puri",
    "locality": "Grand Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Puri",
    "locality": "VIP Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Purnia",
    "locality": "Madhubani",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Purnia",
    "locality": "Rambagh",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Rajkot",
    "locality": "Kalawad Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Rajkot",
    "locality": "University Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Ranchi",
    "locality": "Ashok Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Ranchi",
    "locality": "Bariatu",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Siliguri",
    "locality": "Hakim Para",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Siliguri",
    "locality": "Sevoke Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Surat",
    "locality": "Adajan",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Surat",
    "locality": "Adajan Patia",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Surat",
    "locality": "Jahangir Pura",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Surat",
    "locality": "Pal",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Surat",
    "locality": "Rustampura",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Surat",
    "locality": "Vesu",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Thane",
    "locality": "Hiranandani Estate",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Thane",
    "locality": "Lodha Upper Thane",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Thane",
    "locality": "Majiwada",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Thane",
    "locality": "Naupada",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Thane",
    "locality": "Teen Hath Naka",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Thane",
    "locality": "Thane West",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Thane",
    "locality": "Vartak Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Thiruvananthapuram",
    "locality": "Pattom",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Thiruvananthapuram",
    "locality": "Sasthamangalam",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Udaipur",
    "locality": "Fatehpura",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Udaipur",
    "locality": "Sukher",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Vadodara",
    "locality": "Alkapuri",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Vadodara",
    "locality": "Gotri Sevasi Road",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Vadodara",
    "locality": "Kathak Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Vadodara",
    "locality": "New Sama",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Vadodara",
    "locality": "Nilamber Circle",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Vadodara",
    "locality": "Vasna Road",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Vadodara",
    "locality": "Vasna-Bhayli Road",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Varanasi",
    "locality": "Nai Basti Near Panaria Bazar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Varanasi",
    "locality": "Pandeypur",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Varanasi",
    "locality": "Ram Nagar",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Varanasi",
    "locality": "Sigra",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Varanasi",
    "locality": "Varanasi",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Varanasi",
    "locality": "Varanasi Cantonment",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Vijayawada",
    "locality": "Benz Circle",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Vijayawada",
    "locality": "Kanuru",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Visakhapatnam",
    "locality": "Adarsh Nagar Colony",
    "count": 1
  },
  {
    "intent": "commercial",
    "city": "Visakhapatnam",
    "locality": "Beach Road",
    "count": 2
  },
  {
    "intent": "commercial",
    "city": "Visakhapatnam",
    "locality": "Dwarka Nagar",
    "count": 3
  },
  {
    "intent": "flatmate",
    "city": "Ahmedabad",
    "locality": "Bodakdev",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Ahmedabad",
    "locality": "Navrangpura",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Ahmedabad",
    "locality": "Prahlad Nagar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Ahmedabad",
    "locality": "SG Highway",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Ahmedabad",
    "locality": "Satellite",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Ahmedabad",
    "locality": "Vastrapur",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Bengaluru",
    "locality": "Bellandur",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Bengaluru",
    "locality": "Electronic City Phase 1",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Bengaluru",
    "locality": "HSR Layout",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Bengaluru",
    "locality": "HSR Layout Sector 7",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Bengaluru",
    "locality": "Indiranagar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Bengaluru",
    "locality": "Koramangala",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Bengaluru",
    "locality": "Marathahalli",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Bengaluru",
    "locality": "Whitefield",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Bhopal",
    "locality": "Arera Colony",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Bhopal",
    "locality": "Hoshangabad Road",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Bhopal",
    "locality": "Kolar Road",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Bhopal",
    "locality": "MP Nagar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Bhopal",
    "locality": "Shahpura",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Bhopal",
    "locality": "TT Nagar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Chandigarh",
    "locality": "Mohali Phase 7",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Chandigarh",
    "locality": "Mohali Sector 70",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Chandigarh",
    "locality": "Sector 15",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Chandigarh",
    "locality": "Sector 22",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Chandigarh",
    "locality": "Sector 35",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Chandigarh",
    "locality": "Sector 43",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Chennai",
    "locality": "Adyar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Chennai",
    "locality": "Anna Nagar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Chennai",
    "locality": "Nungambakkam",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Chennai",
    "locality": "Perungudi",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Chennai",
    "locality": "Sholinganallur",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Chennai",
    "locality": "Thoraipakkam",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Chennai",
    "locality": "Velachery",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Gurugram",
    "locality": "Cyber City Corridor",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Gurugram",
    "locality": "DLF Phase 3",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Gurugram",
    "locality": "DLF Phase 5",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Gurugram",
    "locality": "Golf Course Road",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Gurugram",
    "locality": "Sector 23",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Gurugram",
    "locality": "Sector 43",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Gurugram",
    "locality": "Sector 56",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Gurugram",
    "locality": "Sohna Road",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Hyderabad",
    "locality": "Financial District",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Hyderabad",
    "locality": "Gachibowli",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Hyderabad",
    "locality": "Hitec City",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Hyderabad",
    "locality": "Jubilee Hills",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Hyderabad",
    "locality": "Kondapur",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Hyderabad",
    "locality": "Kukatpally",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Hyderabad",
    "locality": "Madhapur",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Hyderabad",
    "locality": "Manikonda",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Indore",
    "locality": "AB Road",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Indore",
    "locality": "Bhawar Kuan",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Indore",
    "locality": "New Palasia",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Indore",
    "locality": "Rau",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Indore",
    "locality": "Super Corridor",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Indore",
    "locality": "Vijay Nagar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Jaipur",
    "locality": "C-Scheme",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Jaipur",
    "locality": "Jagatpura",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Jaipur",
    "locality": "Malviya Nagar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Jaipur",
    "locality": "Mansarovar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Jaipur",
    "locality": "Raja Park",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Jaipur",
    "locality": "Vaishali Nagar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Kochi",
    "locality": "Edappally",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Kochi",
    "locality": "Infopark Phase 1",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Kochi",
    "locality": "Kakkanad",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Kochi",
    "locality": "Kaloor",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Kochi",
    "locality": "Marine Drive",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Kochi",
    "locality": "Palarivattom",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Kolkata",
    "locality": "Ballygunge",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Kolkata",
    "locality": "Jadavpur",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Kolkata",
    "locality": "New Town",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Kolkata",
    "locality": "Park Street",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Kolkata",
    "locality": "Rajarhat",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Kolkata",
    "locality": "Salt Lake Sector V",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Lucknow",
    "locality": "Aliganj",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Lucknow",
    "locality": "Gomti Nagar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Lucknow",
    "locality": "Hazratganj",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Lucknow",
    "locality": "Indira Nagar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Lucknow",
    "locality": "Mahanagar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Lucknow",
    "locality": "Sushant Golf City",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Mumbai",
    "locality": "Andheri West",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Mumbai",
    "locality": "Bandra West",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Mumbai",
    "locality": "Goregaon East",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Mumbai",
    "locality": "Kandivali East",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Mumbai",
    "locality": "Lower Parel",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Mumbai",
    "locality": "Malad West",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Mumbai",
    "locality": "Powai",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Mumbai",
    "locality": "Santacruz West",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Navi Mumbai",
    "locality": "CBD Belapur",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Navi Mumbai",
    "locality": "Kharghar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Navi Mumbai",
    "locality": "Kopar Khairane",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Navi Mumbai",
    "locality": "Nerul",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Navi Mumbai",
    "locality": "Seawoods",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Navi Mumbai",
    "locality": "Vashi",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "New Delhi",
    "locality": "Chhatarpur",
    "count": 3
  },
  {
    "intent": "flatmate",
    "city": "New Delhi",
    "locality": "Dwarka Sector 12",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "New Delhi",
    "locality": "Greater Kailash 1",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "New Delhi",
    "locality": "Hauz Khas",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "New Delhi",
    "locality": "Lajpat Nagar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "New Delhi",
    "locality": "Malviya Nagar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "New Delhi",
    "locality": "Saket",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "New Delhi",
    "locality": "Vasant Kunj",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Noida",
    "locality": "Sector 128",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Noida",
    "locality": "Sector 137",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Noida",
    "locality": "Sector 143",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Noida",
    "locality": "Sector 18",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Noida",
    "locality": "Sector 50",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Noida",
    "locality": "Sector 62",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Noida",
    "locality": "Sector 75",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Noida",
    "locality": "Sector 76",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Patna",
    "locality": "Bailey Road",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Patna",
    "locality": "Boring Road",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Patna",
    "locality": "Kankarbagh",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Patna",
    "locality": "Patliputra Colony",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Patna",
    "locality": "Rajendra Nagar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Patna",
    "locality": "Saguna More",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Pune",
    "locality": "Balewadi",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Pune",
    "locality": "Baner",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Pune",
    "locality": "Hinjewadi Phase 1",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Pune",
    "locality": "Kharadi",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Pune",
    "locality": "Koregaon Park",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Pune",
    "locality": "Magarpatta City",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Pune",
    "locality": "Viman Nagar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Pune",
    "locality": "Wakad",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Thane",
    "locality": "Ghodbunder Road",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Thane",
    "locality": "Kolshet Road",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Thane",
    "locality": "Majiwada",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Thane",
    "locality": "Naupada",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Thane",
    "locality": "Vasant Vihar",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Vadodara",
    "locality": "Akota",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Vadodara",
    "locality": "Alkapuri",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Vadodara",
    "locality": "Fatehgunj",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Vadodara",
    "locality": "Gotri",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Vadodara",
    "locality": "Manjalpur",
    "count": 1
  },
  {
    "intent": "flatmate",
    "city": "Vadodara",
    "locality": "Vasna-Bhayli Road",
    "count": 1
  },
  {
    "intent": "pg",
    "city": "Bengaluru",
    "locality": "BTM Layout",
    "count": 1
  },
  {
    "intent": "pg",
    "city": "Bengaluru",
    "locality": "BTM Layout Stage 4",
    "count": 1
  },
  {
    "intent": "pg",
    "city": "Bengaluru",
    "locality": "Basaveshvara Nagar Stage 3",
    "count": 1
  },
  {
    "intent": "pg",
    "city": "Bengaluru",
    "locality": "Vijaya Bank Colony",
    "count": 1
  },
  {
    "intent": "pg",
    "city": "Dhanwar",
    "locality": "Karitand",
    "count": 1
  },
  {
    "intent": "pg",
    "city": "Gurugram",
    "locality": "Sector 17 / IFFCO Chowk",
    "count": 3
  },
  {
    "intent": "pg",
    "city": "Gurugram",
    "locality": "Sector 39",
    "count": 6
  },
  {
    "intent": "pg",
    "city": "Gurugram",
    "locality": "Sector 45",
    "count": 2
  },
  {
    "intent": "pg",
    "city": "Gurugram",
    "locality": "Sector 46",
    "count": 6
  },
  {
    "intent": "pg",
    "city": "Gurugram",
    "locality": "Sector 55",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Agra",
    "locality": "Sikandra",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Ahmedabad",
    "locality": "Chandkheda",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Ahmedabad",
    "locality": "Chandkheda Village",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Ahmedabad",
    "locality": "Dahegam",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Ahmedabad",
    "locality": "Satellite",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Ahmedabad",
    "locality": "Zundal",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Amritsar",
    "locality": "GT Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Bengaluru",
    "locality": "Adityanagar",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Bengaluru",
    "locality": "Annapurneshwari",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Bengaluru",
    "locality": "Dasarahalli Main Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Bengaluru",
    "locality": "Devanahalli",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Bengaluru",
    "locality": "Indiranagar",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Bengaluru",
    "locality": "JP Nagar Phase 1",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Bengaluru",
    "locality": "Rajarajeshwari Nagar",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Bengaluru",
    "locality": "Sarjapur Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Bengaluru",
    "locality": "Thippasandra",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Bhagalpur",
    "locality": "Tilka Manjhi",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Bhopal",
    "locality": "Ayodhya Bypass",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Bhopal",
    "locality": "Golden City",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Bhopal",
    "locality": "Kolar Road",
    "count": 3
  },
  {
    "intent": "plot",
    "city": "Bhubaneswar",
    "locality": "Saheed Nagar",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Bokaro Steel City",
    "locality": "Chas",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Chandigarh",
    "locality": "Kurali Chandigarh Rd",
    "count": 3
  },
  {
    "intent": "plot",
    "city": "Chandigarh",
    "locality": "Madhya Marg",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Chandigarh",
    "locality": "Patiala Road",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Chandigarh",
    "locality": "Shimla Bypass Road",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Chennai",
    "locality": "ECR",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Chennai",
    "locality": "Redhills",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Chennai",
    "locality": "T Nagar",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Chennai",
    "locality": "Tiruvottiyur Manickam Nagar",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Coimbatore",
    "locality": "Avinashi Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Cuttack",
    "locality": "Link Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Darbhanga",
    "locality": "Laheriasarai",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Dehradun",
    "locality": "GMS Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Deoghar",
    "locality": "Kunda",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Dhanbad",
    "locality": "Dhirajganj",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Durgapur",
    "locality": "Benachity",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Faridabad",
    "locality": "Neharpar Sector 82",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Gaya",
    "locality": "Bodhgaya Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Ghaziabad",
    "locality": "Vasundhara",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Greater Noida",
    "locality": "Pari Chowk",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Gurugram",
    "locality": "Badsa",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Gurugram",
    "locality": "DLF Phase 5",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Gurugram",
    "locality": "Dhankot",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Gurugram",
    "locality": "Gurgaon-Faridabad Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Gurugram",
    "locality": "Jharsa",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Gurugram",
    "locality": "Maruti Kunj",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Gurugram",
    "locality": "New Gurgaon",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Gurugram",
    "locality": "Sohna",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Guwahati",
    "locality": "GS Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Hazaribagh",
    "locality": "Nawabganj",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Howrah",
    "locality": "Kona Expressway",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Hyderabad",
    "locality": "Adibatla",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Hyderabad",
    "locality": "Bibinagar",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Hyderabad",
    "locality": "Indresham",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Hyderabad",
    "locality": "Jubilee Hills",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Hyderabad",
    "locality": "Rhoda Mistri Nagar",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Hyderabad",
    "locality": "Sadasivpet",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Hyderabad",
    "locality": "Shankarpalli",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Hyderabad",
    "locality": "Tolichowki",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Hyderabad",
    "locality": "Tukkuguda",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Indore",
    "locality": "Bhorasla",
    "count": 4
  },
  {
    "intent": "plot",
    "city": "Indore",
    "locality": "Rau Circle",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Indore",
    "locality": "Super Corridor",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Indore",
    "locality": "Vijay Nagar",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Jaipur",
    "locality": "C Scheme",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Jaipur",
    "locality": "Doctors Colony",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Jaipur",
    "locality": "Mansarovar",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Jaipur",
    "locality": "Nari Ka Bas",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Jaipur",
    "locality": "Shree Puram Colony",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Jaipur",
    "locality": "Vaishali Nagar",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Jamshedpur",
    "locality": "Circuit House Area",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Jodhpur",
    "locality": "Ratanada",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Kanpur",
    "locality": "Kakadeo",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Kochi",
    "locality": "Edapally",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Kochi",
    "locality": "Kakkanad",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Kochi",
    "locality": "Panampilly Nagar",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Kolkata",
    "locality": "Barrackpore",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Kolkata",
    "locality": "Belghoria Expressway",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Kolkata",
    "locality": "DUMDUM",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Kolkata",
    "locality": "Eco Park Newtown",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Kolkata",
    "locality": "Maslandapur",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Kolkata",
    "locality": "North Dum Dum",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Kolkata",
    "locality": "Salt Lake Sector 5",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Kolkata",
    "locality": "Tollygunge",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Lucknow",
    "locality": "Alambagh",
    "count": 5
  },
  {
    "intent": "plot",
    "city": "Lucknow",
    "locality": "Gomti Nagar Extension",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Lucknow",
    "locality": "Sarojini Nagar",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Lucknow",
    "locality": "Shanti Nagar",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Ludhiana",
    "locality": "Pakhowal Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Mangaluru",
    "locality": "Kodialbail",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Mumbai",
    "locality": "Bokadvira Village",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Mumbai",
    "locality": "Karjat",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Mumbai",
    "locality": "Mumbai - Nasik Highway",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Mumbai",
    "locality": "Panvel",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Mumbai",
    "locality": "Peddapur",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Mumbai",
    "locality": "Sadasivpet",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Mumbai",
    "locality": "Vindhane",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Mumbai",
    "locality": "Worli",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Muzaffarpur",
    "locality": "Zero Mile",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Mysuru",
    "locality": "Saraswathipuram",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Nagpur",
    "locality": "Dharampeth",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Navi Mumbai",
    "locality": "Bokadvira Village",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Navi Mumbai",
    "locality": "Khalapur",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Navi Mumbai",
    "locality": "Vashi",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Navi Mumbai",
    "locality": "Vindhane",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "New Delhi",
    "locality": "Chirag Delhi",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "New Delhi",
    "locality": "Delhi Gate",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "New Delhi",
    "locality": "Delhi Gymkhana Club",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "New Delhi",
    "locality": "Delhi Road",
    "count": 3
  },
  {
    "intent": "plot",
    "city": "New Delhi",
    "locality": "Dwarka Sector 11",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "New Delhi",
    "locality": "New Ashok Nagar",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Noida",
    "locality": "Dadri Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Noida",
    "locality": "Defence Colony",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Noida",
    "locality": "Dhoom Manikpur",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Noida",
    "locality": "Neelagiri",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Noida",
    "locality": "Sahastradhara Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Noida",
    "locality": "Sector 150",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Noida",
    "locality": "Tilpata Karanwas",
    "count": 3
  },
  {
    "intent": "plot",
    "city": "Patna",
    "locality": "Ashiana Nagar",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Patna",
    "locality": "Ibrahimpur",
    "count": 4
  },
  {
    "intent": "plot",
    "city": "Patna",
    "locality": "Kankarbagh",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Patna",
    "locality": "Khuraitha",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Prayagraj",
    "locality": "Civil Lines",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Pune",
    "locality": "Ghotawade",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Pune",
    "locality": "Mahalunge",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Pune",
    "locality": "Pimple Gurav",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Pune",
    "locality": "Sanaswadi",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Pune",
    "locality": "Tathawade",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Pune",
    "locality": "Thergaon",
    "count": 2
  },
  {
    "intent": "plot",
    "city": "Pune",
    "locality": "Wakad",
    "count": 3
  },
  {
    "intent": "plot",
    "city": "Puri",
    "locality": "Grand Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Purnia",
    "locality": "Rambagh",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Rajkot",
    "locality": "Yagnik Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Ranchi",
    "locality": "Harmu Housing Colony",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Siliguri",
    "locality": "Pradhan Nagar",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Surat",
    "locality": "Adajan",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Surat",
    "locality": "Bhestan",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Surat",
    "locality": "Mota Varachha",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Surat",
    "locality": "Shehabi Colony",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Surat",
    "locality": "Velanja",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Thane",
    "locality": "Naupada",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Thane",
    "locality": "Shahapur Thane District",
    "count": 3
  },
  {
    "intent": "plot",
    "city": "Thiruvananthapuram",
    "locality": "Sasthamangalam",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Udaipur",
    "locality": "Bhuwana",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Vadodara",
    "locality": "Ankhol",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Vadodara",
    "locality": "Jalor B",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Vadodara",
    "locality": "Kalandipuram",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Vadodara",
    "locality": "Ramangamdi",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Vadodara",
    "locality": "Vasna-Bhayli Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Varanasi",
    "locality": "Cantonment",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Varanasi",
    "locality": "Chhota Chuppepur",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Varanasi",
    "locality": "Oragadam",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Varanasi",
    "locality": "Pandeypur Colony",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Varanasi",
    "locality": "Ram Nagar",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Vijayawada",
    "locality": "Kanuru",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Visakhapatnam",
    "locality": "Beach Road",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Visakhapatnam",
    "locality": "Duvvada",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Visakhapatnam",
    "locality": "Dwarka Nagar",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Visakhapatnam",
    "locality": "Koppaka",
    "count": 1
  },
  {
    "intent": "plot",
    "city": "Visakhapatnam",
    "locality": "Lankela Palem",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Agra",
    "locality": "Fatehabad Road",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Ahmedabad",
    "locality": "Chandkheda",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Ahmedabad",
    "locality": "Naranpura",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Ahmedabad",
    "locality": "SG Highway",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Ahmedabad",
    "locality": "Shilaj",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Ahmedabad",
    "locality": "Vaishno Devi",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Amritsar",
    "locality": "GT Road",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Bengaluru",
    "locality": "HSR Layout",
    "count": 5
  },
  {
    "intent": "rent",
    "city": "Bengaluru",
    "locality": "Koramangala",
    "count": 4
  },
  {
    "intent": "rent",
    "city": "Bengaluru",
    "locality": "Madivala",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Bengaluru",
    "locality": "Sarjapur Road",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Bengaluru",
    "locality": "Whitefield",
    "count": 4
  },
  {
    "intent": "rent",
    "city": "Bhagalpur",
    "locality": "Tilkamanjhi Chowk",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Bhopal",
    "locality": "Arera Colony",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Bhopal",
    "locality": "Kolar Road",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Bhubaneswar",
    "locality": "Khandagiri",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Bokaro Steel City",
    "locality": "Cooperative Colony",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Chandigarh",
    "locality": "Ambala Chandigarh Expressway",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Chandigarh",
    "locality": "Kurali Chandigarh Rd",
    "count": 3
  },
  {
    "intent": "rent",
    "city": "Chandigarh",
    "locality": "Madhya Marg",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Chandigarh",
    "locality": "VIP Road",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Chennai",
    "locality": "Adyar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Chennai",
    "locality": "Kilpauk Kelleys",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Chennai",
    "locality": "Pallavaram",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Chennai",
    "locality": "Parrys",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Chennai",
    "locality": "Perambur Jamaliya Nagar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Coimbatore",
    "locality": "Saravanampatti",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Cuttack",
    "locality": "Mahanadi Vihar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Darbhanga",
    "locality": "Benta Chowk",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Dehradun",
    "locality": "Rajpur Road",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Deoghar",
    "locality": "Baidyanath Dham",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Dhanbad",
    "locality": "Saraidhela",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Durgapur",
    "locality": "Fuljhor",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Faridabad",
    "locality": "Sector 21C",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Gaya",
    "locality": "AP Colony",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Ghaziabad",
    "locality": "Vasundhara",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Greater Noida",
    "locality": "Omega 1",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Gurugram",
    "locality": "DLF Phase 5",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Gurugram",
    "locality": "Gwal Pahari",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Gurugram",
    "locality": "Sector 21",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Gurugram",
    "locality": "Sector 67A",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Guwahati",
    "locality": "Beltola",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Hazaribagh",
    "locality": "Korrah",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Howrah",
    "locality": "Salkia",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Hyderabad",
    "locality": "Buddha Nagar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Hyderabad",
    "locality": "Gachibowli",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Hyderabad",
    "locality": "Gajulramaram",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Hyderabad",
    "locality": "Madhapur",
    "count": 4
  },
  {
    "intent": "rent",
    "city": "Indore",
    "locality": "Mahalaxmi Nagar",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Indore",
    "locality": "Super Corridor",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Indore",
    "locality": "Vijay Nagar",
    "count": 8
  },
  {
    "intent": "rent",
    "city": "Jaipur",
    "locality": "Doctors Colony",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Jaipur",
    "locality": "Kamla Nehru Nagar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Jaipur",
    "locality": "Mahadev Nagar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Jaipur",
    "locality": "Malviya Nagar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Jaipur",
    "locality": "Vaishali Nagar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Jamshedpur",
    "locality": "Sonari",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Jodhpur",
    "locality": "Shastri Nagar",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Kanpur",
    "locality": "Civil Lines",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Kochi",
    "locality": "Edappally",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Kochi",
    "locality": "Kakkanad",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Kochi",
    "locality": "Palarivattom",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Kochi",
    "locality": "Panampilly Nagar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Kolkata",
    "locality": "Alipore",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Kolkata",
    "locality": "Chinar Park",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Kolkata",
    "locality": "Mukundapur",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Kolkata",
    "locality": "Rajarhat Main Road",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Kolkata",
    "locality": "VIP Bazar",
    "count": 3
  },
  {
    "intent": "rent",
    "city": "Lucknow",
    "locality": "Gomti Nagar Extension",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Lucknow",
    "locality": "Kamta",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Lucknow",
    "locality": "Murli Nagar",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Lucknow",
    "locality": "Tiwariganj",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Lucknow",
    "locality": "Virat Khand",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Ludhiana",
    "locality": "Civil Lines",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Mangaluru",
    "locality": "Bejai",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Mumbai",
    "locality": "Bandra Kurla Complex",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Mumbai",
    "locality": "Bandra West",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Mumbai",
    "locality": "Dadar East",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Mumbai",
    "locality": "Kopar Khairane",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Mumbai",
    "locality": "Ushma Nagar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Muzaffarpur",
    "locality": "Brahmpura",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Mysuru",
    "locality": "Gokulam",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Nagpur",
    "locality": "Dharampeth",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Navi Mumbai",
    "locality": "Ghansoli",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Navi Mumbai",
    "locality": "Kopar Khairane",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Navi Mumbai",
    "locality": "Taloja",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Navi Mumbai",
    "locality": "Ulwe",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Navi Mumbai",
    "locality": "Vashi Sector 17",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "New Delhi",
    "locality": "Dwarka",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "New Delhi",
    "locality": "Saket",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "New Delhi",
    "locality": "Shastri Nagar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "New Delhi",
    "locality": "South Extension",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Noida",
    "locality": "Ace Divino",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Noida",
    "locality": "BTM Layout",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Noida",
    "locality": "Greater Noida West Sector 4",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Noida",
    "locality": "Koramangala",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Noida",
    "locality": "Noida Expressway",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Noida",
    "locality": "Noida Extension",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Noida",
    "locality": "Sector ETA II",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Noida",
    "locality": "Yamuna Expressway",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Patna",
    "locality": "Boring Road",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Patna",
    "locality": "Chamdoria",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Patna",
    "locality": "Postal Park",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Patna",
    "locality": "Rajendra Nagar",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Patna",
    "locality": "Samanpura",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Prayagraj",
    "locality": "Jhalwa",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Pune",
    "locality": "Dhanori Vishrant Wadi",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Pune",
    "locality": "Hadapsar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Pune",
    "locality": "Kalyani Nagar",
    "count": 3
  },
  {
    "intent": "rent",
    "city": "Pune",
    "locality": "Kharadi",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Pune",
    "locality": "Tathawade",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Pune",
    "locality": "Yerwada",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Puri",
    "locality": "Chakratirtha Road",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Purnia",
    "locality": "Rambagh",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Rajkot",
    "locality": "Amin Marg",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Ranchi",
    "locality": "Kanke Road",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Siliguri",
    "locality": "Matigara",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Surat",
    "locality": "Adajan",
    "count": 2
  },
  {
    "intent": "rent",
    "city": "Surat",
    "locality": "Adjan South",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Surat",
    "locality": "Pal",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Thane",
    "locality": "Dhokali",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Thane",
    "locality": "Ghopbunder Road",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Thane",
    "locality": "Kasarvadavli",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Thane",
    "locality": "Waghbil",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Thiruvananthapuram",
    "locality": "Sasthamangalam",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Udaipur",
    "locality": "Saheli Nagar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Vadodara",
    "locality": "Alkapuri",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Vadodara",
    "locality": "Hari Nagar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Vadodara",
    "locality": "Sama Savli Road",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Vadodara",
    "locality": "Tulsi Dham Chowk",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Vadodara",
    "locality": "Waghodia Road",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Varanasi",
    "locality": "Nagwa",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Varanasi",
    "locality": "Shukulpur",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Varanasi",
    "locality": "Sigra",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Varanasi",
    "locality": "Tammiraju Nagar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Vijayawada",
    "locality": "Benz Circle",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Visakhapatnam",
    "locality": "Beach Road",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Visakhapatnam",
    "locality": "Dwarka Nagar",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Visakhapatnam",
    "locality": "Panduranga Puram",
    "count": 1
  },
  {
    "intent": "rent",
    "city": "Visakhapatnam",
    "locality": "Pendurthi",
    "count": 1
  }
] as const;
