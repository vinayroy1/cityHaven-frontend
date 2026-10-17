/**
 * Standalone Force-Crawl Script for Awasio
 * Pushes top SEO category, city, and locality URLs to IndexNow (Bing, Yandex, etc.)
 * Usage: node scripts/force-crawl.mjs
 */

const INDEXNOW_KEY = "a0c7e5b29f1d43a88b6c4e09f5127d3e";
const HOST = "awasio.com";
const SITE_URL = "https://awasio.com";

const SEO_SEARCH_INTENTS = ["rent", "buy", "flatmate", "pg", "commercial", "plot"];
const SEO_CITIES = ["bengaluru", "delhi", "gurugram", "noida", "mumbai", "pune", "hyderabad"];

const SEO_TOP_LOCALITIES = {
  bengaluru: ["koramangala", "hsr-layout", "indiranagar", "whitefield", "bellandur", "electronic-city", "marathahalli", "jayanagar", "sarjapur-road"],
  gurugram: ["dlf-phase-5", "golf-course-road", "sohna-road", "dlf-phase-1", "sector-56", "cyber-city"],
  delhi: ["dwarka", "saket", "south-delhi", "rohini", "greater-kailash", "connaught-place", "janakpuri", "vasant-kunj"],
  noida: ["sector-62", "sector-18", "noida-extension", "sector-137", "sector-76"],
  mumbai: ["bandra-west", "andheri-west", "powai", "worli", "juhu", "thane-west"],
  pune: ["hinjewadi", "baner", "wakad", "viman-nagar", "kothrud"],
  hyderabad: ["hitech-city", "gachibowli", "kondapur", "madhapur", "jubilee-hills"],
};

function generateUrls() {
  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/about`,
    `${SITE_URL}/contact`,
    `${SITE_URL}/agents`,
    `${SITE_URL}/new-projects`,
    `${SITE_URL}/price-trends`,
    `${SITE_URL}/pricing`,
    `${SITE_URL}/policies`,
    `${SITE_URL}/privacy`,
    `${SITE_URL}/terms`,
  ];

  // Intents
  for (const intent of SEO_SEARCH_INTENTS) {
    urls.push(`${SITE_URL}/${intent}`);
  }

  // City pages
  for (const intent of SEO_SEARCH_INTENTS) {
    for (const city of SEO_CITIES) {
      urls.push(`${SITE_URL}/${intent}/${city}`);
    }
  }

  // Locality pages
  for (const intent of ["rent", "flatmate", "pg", "buy"]) {
    for (const [city, localities] of Object.entries(SEO_TOP_LOCALITIES)) {
      for (const loc of localities) {
        urls.push(`${SITE_URL}/${intent}/${city}/${loc}`);
      }
    }
  }

  return Array.from(new Set(urls));
}

async function main() {
  const urls = generateUrls();
  console.log(`\n========================================`);
  console.log(`  AWASIO SEO FORCE CRAWLER & INDEXER   `);
  console.log(`========================================`);
  console.log(`[INFO] Generated ${urls.length} top canonical URLs.`);

  console.log(`\nSample Landing Pages:`);
  console.log(` - ${urls[0]}`);
  console.log(` - ${SITE_URL}/rent/bengaluru`);
  console.log(` - ${SITE_URL}/flatmate/bengaluru`);
  console.log(` - ${SITE_URL}/rent/bengaluru/koramangala`);
  console.log(` - ${SITE_URL}/flatmate/bengaluru/koramangala`);
  console.log(` - ${SITE_URL}/pg/bengaluru/hsr-layout`);
  console.log(` - ${SITE_URL}/buy/gurugram/dlf-phase-5`);

  console.log(`\n[1/2] Submitting ${urls.length} URLs to IndexNow (Bing / Yandex / Seznam / Naver)...`);
  try {
    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    };

    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (res.status === 200 || res.status === 202) {
      console.log(`[SUCCESS] IndexNow accepted ${urls.length} URLs (HTTP ${res.status}). Crawlers dispatched!`);
    } else if (res.status === 403) {
      console.log(`[NOTICE] IndexNow returned 403 (Forbidden).`);
      console.log(`         Make sure public/${INDEXNOW_KEY}.txt is deployed to production before running.`);
    } else {
      console.log(`[RESPONSE] IndexNow returned HTTP ${res.status}`);
    }
  } catch (err) {
    console.error(`[ERROR] IndexNow request failed:`, err.message);
  }

  console.log(`\n[2/2] Google Search Console Priority Indexing:`);
  console.log(`  To push to Google Indexing API, provide a Google Service Account key in:`);
  console.log(`  ./google-service-account.json and run 'npm run seo:google'`);
  console.log(`========================================\n`);
}

main().catch(console.error);
