import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom trends for per-endpoint visibility
const configTrend = new Trend('trend_platform_config');
const plansTrend = new Trend('trend_billing_plans');
const citiesTrend = new Trend('trend_cities');
const suggestTrend = new Trend('trend_suggestions');
const searchTrend = new Trend('trend_property_search');
const projectsTrend = new Trend('trend_projects');
const flatmatesTrend = new Trend('trend_flatmates');

const errorRate = new Rate('api_error_rate');

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'], // Under 5% failures allowed
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete under 2s
    api_error_rate: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://awasio.com/api/v1';

export default function () {
  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'k6-load-test-smoke/1.0',
  };

  // 1. Platform Config
  {
    const res = http.get(`${BASE_URL}/billing/platform-config`, {
      headers,
      tags: { endpoint: 'platform-config' },
    });
    configTrend.add(res.timings.duration);
    const passed = check(res, {
      'platform-config status 200': (r) => r.status === 200,
    });
    errorRate.add(!passed);
  }

  // 2. Billing Plans
  {
    const res = http.get(`${BASE_URL}/billing/plans`, {
      headers,
      tags: { endpoint: 'billing-plans' },
    });
    plansTrend.add(res.timings.duration);
    const passed = check(res, {
      'billing-plans status 200': (r) => r.status === 200,
    });
    errorRate.add(!passed);
  }

  // 3. Popular Cities
  {
    const res = http.get(`${BASE_URL}/cities?popular=true`, {
      headers,
      tags: { endpoint: 'cities-popular' },
    });
    citiesTrend.add(res.timings.duration);
    const passed = check(res, {
      'cities status 200': (r) => r.status === 200,
    });
    errorRate.add(!passed);
  }

  // 4. Location / Search Suggestions
  {
    const res = http.get(`${BASE_URL}/search/suggestions?q=Noida`, {
      headers,
      tags: { endpoint: 'search-suggestions' },
    });
    suggestTrend.add(res.timings.duration);
    const passed = check(res, {
      'suggestions status 200': (r) => r.status === 200,
    });
    errorRate.add(!passed);
  }

  // 5. Property Search
  {
    const res = http.get(`${BASE_URL}/propertyListing/search?pageSize=10&cityName=Delhi&listingType=RENT`, {
      headers,
      tags: { endpoint: 'property-search' },
    });
    searchTrend.add(res.timings.duration);
    const passed = check(res, {
      'property search status 200': (r) => r.status === 200,
    });
    errorRate.add(!passed);
  }

  // 6. Real Estate Projects
  {
    const res = http.get(`${BASE_URL}/projects?pageSize=10`, {
      headers,
      tags: { endpoint: 'projects-list' },
    });
    projectsTrend.add(res.timings.duration);
    const passed = check(res, {
      'projects status 200': (r) => r.status === 200,
    });
    errorRate.add(!passed);
  }

  // 7. Flatmates
  {
    const res = http.get(`${BASE_URL}/flatmates?pageSize=10`, {
      headers,
      tags: { endpoint: 'flatmates-list' },
    });
    flatmatesTrend.add(res.timings.duration);
    const passed = check(res, {
      'flatmates status 200': (r) => r.status === 200,
    });
    errorRate.add(!passed);
  }

  sleep(1);
}
