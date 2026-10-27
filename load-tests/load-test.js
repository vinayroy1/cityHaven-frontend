import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Dedicated trend metrics per API endpoint
const trends = {
  platformConfig: new Trend('duration_platform_config'),
  billingPlans: new Trend('duration_billing_plans'),
  citiesPopular: new Trend('duration_cities_popular'),
  searchSuggestions: new Trend('duration_search_suggestions'),
  propertySearch: new Trend('duration_property_search'),
  projectsList: new Trend('duration_projects_list'),
  flatmatesList: new Trend('duration_flatmates_list'),
};

const totalRequests = new Counter('total_api_requests');
const failureRate = new Rate('api_failure_rate');

export const options = {
  stages: [
    { duration: '15s', target: 20 }, // Fast warm-up
    { duration: '30s', target: 40 }, // High traffic
    { duration: '30s', target: 50 }, // Sustained peak
    { duration: '15s', target: 0 },  // Cool down
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],       // < 2% total HTTP failures
    http_req_duration: ['p(95)<3000'],    // 95% of all requests under 3.0s over WAN
    'duration_platform_config': ['p(95)<2000'],
    'duration_billing_plans': ['p(95)<2000'],
    'duration_cities_popular': ['p(95)<2000'],
    'duration_search_suggestions': ['p(95)<2500'],
    'duration_property_search': ['p(95)<2500'],
    'duration_projects_list': ['p(95)<3500'],
    'duration_flatmates_list': ['p(95)<3500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://awasio.com/api/v1';

const HEADERS = {
  'Accept': 'application/json',
  'User-Agent': 'k6-load-test/1.0 (Awasio-LoadTesting)',
};

const CITIES = ['Delhi', 'Noida', 'Gurgaon', 'Bangalore', 'Mumbai', 'Pune'];
const QUERY_TERMS = ['Noida', 'Sector', 'Delhi', 'Rent', 'Apartment', 'Villa', '2BHK'];

export default function () {
  const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
  const randomQuery = QUERY_TERMS[Math.floor(Math.random() * QUERY_TERMS.length)];

  // Scenario selection based on realistic user weights
  const rand = Math.random();

  if (rand < 0.35) {
    // 35% Property Search (most frequent query)
    const listingTypes = ['RENT', 'SELL', 'PG'];
    const listingType = listingTypes[Math.floor(Math.random() * listingTypes.length)];
    const res = http.get(
      `${BASE_URL}/propertyListing/search?pageSize=10&cityName=${encodeURIComponent(randomCity)}&listingType=${listingType}`,
      { headers: HEADERS, tags: { endpoint: 'property-search' } }
    );
    trends.propertySearch.add(res.timings.duration);
    totalRequests.add(1);
    const ok = check(res, { 'property search ok': (r) => r.status === 200 });
    failureRate.add(!ok);

  } else if (rand < 0.60) {
    // 25% Location / Search Suggestions
    const res = http.get(
      `${BASE_URL}/search/suggestions?q=${encodeURIComponent(randomQuery)}`,
      { headers: HEADERS, tags: { endpoint: 'search-suggestions' } }
    );
    trends.searchSuggestions.add(res.timings.duration);
    totalRequests.add(1);
    const ok = check(res, { 'suggestions ok': (r) => r.status === 200 });
    failureRate.add(!ok);

  } else if (rand < 0.75) {
    // 15% Flatmates Search
    const res = http.get(
      `${BASE_URL}/flatmates?pageSize=10&city=${encodeURIComponent(randomCity)}`,
      { headers: HEADERS, tags: { endpoint: 'flatmates-list' } }
    );
    trends.flatmatesList.add(res.timings.duration);
    totalRequests.add(1);
    const ok = check(res, { 'flatmates ok': (r) => r.status === 200 || r.status === 404 });
    failureRate.add(!ok);

  } else if (rand < 0.85) {
    // 10% Real Estate Projects
    const res = http.get(
      `${BASE_URL}/projects?pageSize=10`,
      { headers: HEADERS, tags: { endpoint: 'projects-list' } }
    );
    trends.projectsList.add(res.timings.duration);
    totalRequests.add(1);
    const ok = check(res, { 'projects ok': (r) => r.status === 200 });
    failureRate.add(!ok);

  } else if (rand < 0.93) {
    // 8% Billing Plans & Pricing
    const res = http.get(
      `${BASE_URL}/billing/plans`,
      { headers: HEADERS, tags: { endpoint: 'billing-plans' } }
    );
    trends.billingPlans.add(res.timings.duration);
    totalRequests.add(1);
    const ok = check(res, { 'billing plans ok': (r) => r.status === 200 });
    failureRate.add(!ok);

  } else {
    // 7% Platform Config / Cities
    const resConfig = http.get(
      `${BASE_URL}/billing/platform-config`,
      { headers: HEADERS, tags: { endpoint: 'platform-config' } }
    );
    trends.platformConfig.add(resConfig.timings.duration);
    totalRequests.add(1);
    const okConfig = check(resConfig, { 'platform config ok': (r) => r.status === 200 });
    failureRate.add(!okConfig);

    const resCities = http.get(
      `${BASE_URL}/cities?popular=true`,
      { headers: HEADERS, tags: { endpoint: 'cities-popular' } }
    );
    trends.citiesPopular.add(resCities.timings.duration);
    totalRequests.add(1);
    const okCities = check(resCities, { 'cities ok': (r) => r.status === 200 });
    failureRate.add(!okCities);
  }

  // Realistic user pacing between interactions (100ms - 800ms)
  sleep(0.3 + Math.random() * 0.5);
}
