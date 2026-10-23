/**
 * Standalone Force-Crawl Script for Awasio
 * Pushes top SEO category, city, and locality URLs to IndexNow (Bing, Yandex, etc.)
 * Usage: node scripts/force-crawl.mjs
 */

const INDEXNOW_KEY = "a0c7e5b29f1d43a88b6c4e09f5127d3e";
const HOST = "awasio.com";
const SITE_URL = "https://awasio.com";

async function generateUrls() {
  try {
    const res = await fetch("https://awasio.com/sitemap.xml");
    if (res.ok) {
      const xml = await res.text();
      const locMatches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
      if (locMatches.length > 0) {
        return locMatches;
      }
    }
  } catch {
    // fallback to core top routes
  }

  return [
    `${SITE_URL}/`,
    `${SITE_URL}/about`,
    `${SITE_URL}/contact`,
    `${SITE_URL}/agents`,
    `${SITE_URL}/blog`,
    `${SITE_URL}/new-projects`,
    `${SITE_URL}/price-trends`,
    `${SITE_URL}/pricing`,
    `${SITE_URL}/policies`,
    `${SITE_URL}/privacy`,
    `${SITE_URL}/terms`,
    `${SITE_URL}/buy`,
    `${SITE_URL}/rent`,
    `${SITE_URL}/pg`,
    `${SITE_URL}/flatmate`,
  ];
}

async function main() {
  const urls = await generateUrls();
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
