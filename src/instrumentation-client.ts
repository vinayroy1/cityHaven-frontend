/**
 * Sentry is loaded after the page's `load` event, not in the critical path: the browser SDK is
 * ~130 KB gzipped and was the largest script on every page, costing mobile LCP / PageSpeed.
 * Trade-off: errors thrown before `load` are not reported.
 */
type SentryModule = typeof import("@sentry/nextjs");

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const REPLAY_DELAY_MS = 3000;

let sentry: SentryModule | null = null;

function initSentry() {
  import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.init({
        dsn: DSN,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
        integrations: [],
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
      sentry = Sentry;
      window.setTimeout(loadReplay, REPLAY_DELAY_MS);
    })
    .catch(() => {
      // Monitoring is best-effort.
    });
}

function loadReplay() {
  const load = () => {
    // Served from our own bundle as a separate chunk (not the Sentry CDN), so
    // ad-blockers and a future CSP cannot break it.
    import("@sentry/replay")
      .then(({ replayIntegration }) => {
        sentry?.addIntegration(replayIntegration({ maskAllText: false, blockAllMedia: true }));
      })
      .catch(() => {});
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 5000 });
  else load();
}

if (typeof window !== "undefined" && DSN) {
  const start = () => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(initSentry, { timeout: 4000 });
    else setTimeout(initSentry, 1);
  };
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}

export const onRouterTransitionStart: SentryModule["captureRouterTransitionStart"] = (...args) =>
  sentry?.captureRouterTransitionStart(...args);
