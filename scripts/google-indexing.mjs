/**
 * Google Indexing API Force Crawler
 * Automatically submits URLs to Google's Indexing API using a Service Account JSON.
 *
 * Setup:
 * 1. Create a Service Account in Google Cloud Console with 'Indexing API' enabled.
 * 2. Download service account key JSON as 'google-service-account.json' in this repo.
 * 3. Add the service account email (e.g. crawler@project.iam.gserviceaccount.com)
 *    as an Owner in Google Search Console for 'awasio.com'.
 * 4. Run: node scripts/google-indexing.mjs
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

const KEY_FILE = path.resolve(process.cwd(), "google-service-account.json");
const SITE_URL = "https://awasio.com";

const TOP_PRIORITY_URLS = [
  `${SITE_URL}/`,
  `${SITE_URL}/rent/bengaluru`,
  `${SITE_URL}/flatmate/bengaluru`,
  `${SITE_URL}/buy/bengaluru`,
  `${SITE_URL}/pg/bengaluru`,
  `${SITE_URL}/rent/bengaluru/koramangala`,
  `${SITE_URL}/flatmate/bengaluru/koramangala`,
  `${SITE_URL}/rent/bengaluru/hsr-layout`,
  `${SITE_URL}/flatmate/bengaluru/hsr-layout`,
  `${SITE_URL}/rent/bengaluru/indiranagar`,
  `${SITE_URL}/flatmate/bengaluru/indiranagar`,
  `${SITE_URL}/rent/bengaluru/whitefield`,
  `${SITE_URL}/flatmate/bengaluru/whitefield`,
  `${SITE_URL}/rent/delhi`,
  `${SITE_URL}/flatmate/delhi`,
  `${SITE_URL}/rent/gurugram`,
  `${SITE_URL}/flatmate/gurugram`,
  `${SITE_URL}/rent/mumbai`,
  `${SITE_URL}/flatmate/mumbai`,
  `${SITE_URL}/rent/pune`,
  `${SITE_URL}/flatmate/pune`,
  `${SITE_URL}/rent/hyderabad`,
  `${SITE_URL}/flatmate/hyderabad`,
  `${SITE_URL}/agents`,
  `${SITE_URL}/about`,
];

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getGoogleAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaimSet = base64url(JSON.stringify(claimSet));
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signatureInput);
  const signature = signer.sign(credentials.private_key, "base64");
  const encodedSignature = signature.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwt = `${signatureInput}.${encodedSignature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google OAuth error: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function publishUrl(token, url) {
  const endpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      type: "URL_UPDATED",
    }),
  });

  const body = await res.json();
  return { status: res.status, body };
}

async function main() {
  console.log(`\n========================================`);
  console.log(`  GOOGLE INDEXING API FORCE SUBMISSION  `);
  console.log(`========================================\n`);

  if (!fs.existsSync(KEY_FILE)) {
    console.log(`[INFO] Key file '${KEY_FILE}' not found.`);
    console.log(`\nTo enable automated 1-click Google Indexing:`);
    console.log(`1. In Google Cloud Console, enable 'Web Search Indexing API'.`);
    console.log(`2. Create a Service Account, generate a JSON Key, and save it as:`);
    console.log(`   ${KEY_FILE}`);
    console.log(`3. In Google Search Console -> Settings -> Users and permissions:`);
    console.log(`   Add the Service Account's email as 'Owner'.`);
    console.log(`4. Re-run 'npm run seo:google' to push all URLs directly to Googlebot!`);
    console.log(`\nIn the meantime, submit these top URLs via Search Console URL Inspection:`);
    TOP_PRIORITY_URLS.forEach((u) => console.log(` - ${u}`));
    console.log(`\n========================================\n`);
    return;
  }

  const credentials = JSON.parse(fs.readFileSync(KEY_FILE, "utf-8"));
  console.log(`[AUTH] Authenticating Service Account: ${credentials.client_email}`);

  const token = await getGoogleAccessToken(credentials);
  console.log(`[AUTH] Google OAuth access token acquired successfully.`);

  console.log(`\n[SUBMIT] Submitting ${TOP_PRIORITY_URLS.length} high-priority URLs to Google Indexing API...`);

  for (const url of TOP_PRIORITY_URLS) {
    try {
      const result = await publishUrl(token, url);
      if (result.status === 200) {
        console.log(` [✓] 200 OK: ${url}`);
      } else {
        console.log(` [x] ${result.status}: ${url} -> ${JSON.stringify(result.body)}`);
      }
    } catch (err) {
      console.error(` [x] Error submitting ${url}:`, err.message);
    }
  }

  console.log(`\n[DONE] All high-priority URLs submitted to Google Indexing API!`);
  console.log(`========================================\n`);
}

main().catch(console.error);
