import * as Sentry from "@sentry/nextjs"

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    // Replay integration for client-side error recording
    integrations: [
      Sentry.replayIntegration(),
    ],
    // Capture 10% of transactions for performance monitoring
    tracesSampleRate: 0.1,
    // Capture 10% of sessions for replay
    replaysSessionSampleRate: 0.1,
    // Capture 100% of sessions with errors for replay
    replaysOnErrorSampleRate: 1.0,
    // Only send errors in production
    enabled: process.env.NODE_ENV === "production",
  })
}
