import http from 'k6/http';
import { check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom Metrics
const rpsCounter = new Counter('actual_rps_count');
const errorRate = new Rate('stress_error_rate');
const latencyTrend = new Trend('stress_latency');

export const options = {
  scenarios: {
    stress_5000_rps: {
      executor: 'ramping-arrival-rate',
      startRate: 100,
      timeUnit: '1s',
      preAllocatedVUs: 1000,
      maxVUs: 6000,
      stages: [
        { duration: '10s', target: 500 },   // Warm-up to 500 req/s
        { duration: '15s', target: 1500 },  // Ramp to 1,500 req/s
        { duration: '15s', target: 3000 },  // Ramp to 3,000 req/s
        { duration: '20s', target: 5000 },  // Peak target: 5,000 req/s
        { duration: '10s', target: 5000 },  // Sustain peak load
        { duration: '10s', target: 0 },     // Graceful ramp-down
      ],
    },
  },
  thresholds: {
    // We observe degradation point rather than terminating early
    stress_error_rate: ['rate<0.50'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://awasio.com/api/v1';

const HEADERS = {
  'Accept': 'application/json',
  'User-Agent': 'k6-stress-5000rps/1.0',
  'Host': __ENV.HOST_HEADER || 'awasio.com',
};

// Weighted endpoints: mix of fast config/cities, plans, and property search
const ENDPOINTS = [
  { url: `${BASE_URL}/billing/platform-config`, weight: 0.35, tag: 'platform-config' },
  { url: `${BASE_URL}/cities?popular=true`, weight: 0.25, tag: 'cities' },
  { url: `${BASE_URL}/billing/plans`, weight: 0.20, tag: 'plans' },
  { url: `${BASE_URL}/propertyListing/search?pageSize=5&cityName=Delhi&listingType=RENT`, weight: 0.20, tag: 'search' },
];

export default function () {
  const rand = Math.random();
  let selected = ENDPOINTS[0];
  let accumulated = 0;

  for (const ep of ENDPOINTS) {
    accumulated += ep.weight;
    if (rand <= accumulated) {
      selected = ep;
      break;
    }
  }

  const res = http.get(selected.url, {
    headers: HEADERS,
    tags: { endpoint: selected.tag },
    timeout: '5s', // Short timeout so slow requests don't exhaust worker threads indefinitely
  });

  rpsCounter.add(1);
  latencyTrend.add(res.timings.duration);

  const isSuccess = res.status >= 200 && res.status < 400;
  errorRate.add(!isSuccess);

  check(res, {
    'status is 2xx/3xx': (r) => r.status >= 200 && r.status < 400,
  });
}
