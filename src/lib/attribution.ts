/**
 * First-touch signup attribution. On the first visit we remember where the visitor came from
 * (UTM tags, external referrer, landing page). Logged-out API calls carry it in the
 * `X-Awasio-Attr` header so the backend can stamp new accounts with it.
 */
const KEY = "awasio_first_touch";
const UTM: [string, string][] = [
  ["utm_source", "utmSource"],
  ["utm_medium", "utmMedium"],
  ["utm_campaign", "utmCampaign"],
  ["utm_term", "utmTerm"],
  ["utm_content", "utmContent"],
];

type FirstTouch = Record<string, string>;

function read(): FirstTouch | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FirstTouch) : null;
  } catch {
    return null;
  }
}

/** Call once per page load. Keeps the first visit; a later visit with UTM tags replaces one without. */
export function captureFirstTouch() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const utm: FirstTouch = {};
    for (const [q, k] of UTM) {
      const v = params.get(q);
      if (v) utm[k] = v.slice(0, 200);
    }
    const existing = read();
    if (existing && (existing.utmSource || !utm.utmSource)) return;
    let referrer = "";
    try {
      if (document.referrer && new URL(document.referrer).host !== window.location.host) referrer = document.referrer.slice(0, 300);
    } catch {
      /* ignore */
    }
    const touch: FirstTouch = {
      ...utm,
      ...(referrer ? { referrer } : {}),
      landingPage: (window.location.pathname + window.location.search).slice(0, 300),
      firstSeenAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(touch));
  } catch {
    /* storage blocked */
  }
}

/** Header value (base64 JSON) with the first touch plus the current page and intended destination. */
export function attributionHeader(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const data: FirstTouch = {
      ...(read() ?? {}),
      signupPage: window.location.pathname.slice(0, 200),
    };
    const intent = params.get("redirect") || params.get("next") || params.get("returnUrl");
    if (intent) data.intent = intent.slice(0, 200);
    const json = JSON.stringify(data);
    return btoa(String.fromCharCode(...new TextEncoder().encode(json)));
  } catch {
    return null;
  }
}
