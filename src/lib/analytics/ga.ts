"use client"

import { isAdminHost, getConsent } from "./consent"

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

/**
 * Public helper — fire a custom GA4 event. No-op when:
 *   - SSR
 *   - admin subdomain (we never want admin actions skewing product metrics)
 *   - no GA measurement ID configured
 *   - user has not consented to analytics
 *
 * Standardized event names match GA4 recommendations where possible
 * (sign_up, login, search, share) and use snake_case otherwise
 * (post_created, list_add, follow_user).
 */
export function track(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return
  if (!MEASUREMENT_ID || isAdminHost()) return
  if (getConsent() !== "accepted")     return
  if (typeof window.gtag !== "function") return

  window.gtag("event", event, params)
}

/**
 * Send a page_view explicitly. Next.js App Router doesn't auto-fire on
 * client-side navigations, so the GoogleAnalytics component listens to
 * route changes and calls this.
 */
export function trackPageView(path: string): void {
  if (typeof window === "undefined") return
  if (!MEASUREMENT_ID || isAdminHost()) return
  if (getConsent() !== "accepted")     return
  if (typeof window.gtag !== "function") return

  window.gtag("event", "page_view", {
    page_path:     path,
    page_location: window.location.href,
    page_title:    document.title,
  })
}
