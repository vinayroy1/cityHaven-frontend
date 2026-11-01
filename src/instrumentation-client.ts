import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  // Session Replay is added after the page is idle (see loadReplayWhenIdle) so
  // its ~130 KB is kept out of the critical path. Sample rates still apply.
  integrations: [],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Only send events if DSN is defined
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});

const REPLAY_DELAY_MS = 3000;

function loadReplayWhenIdle() {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  const load = () => {
    // Served from our own bundle as a separate chunk (not the Sentry CDN), so
    // ad-blockers and a future CSP cannot break it.
    import("@sentry/replay")
      .then(({ replayIntegration }) => {
        Sentry.addIntegration(
          replayIntegration({
            maskAllText: false,
            blockAllMedia: true,
          }),
        );
      })
      .catch(() => {
        // Replay is best-effort; error monitoring keeps working without it.
      });
  };

  const schedule = () => {
    window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(load, { timeout: 5000 });
      } else {
        load();
      }
    }, REPLAY_DELAY_MS);
  };

  if (document.readyState === "complete") {
    schedule();
  } else {
    window.addEventListener("load", schedule, { once: true });
  }
}

loadReplayWhenIdle();

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
