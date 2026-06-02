"use client"

import { useEffect } from "react"
import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { useConsent } from "@/lib/analytics/consent"
import { trackPageView } from "@/lib/analytics/ga"

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

/**
 * Google Analytics 4 loader, gated by:
 *   1. NEXT_PUBLIC_GA_MEASUREMENT_ID env var — without it, nothing loads
 *   2. user consent (CookieConsent banner) — DPDP §6 requires opt-in for non-essential cookies
 *
 * GA is loaded lazily after consent so the marketing site stays fast for
 * the first paint. Once loaded, route changes are tracked manually because
 * App Router doesn't trigger gtag's auto page_view.
 *
 * The admin dashboard at admin-dashboard.kaiveron.com is a separate Vercel
 * project — it never loads this component, so admin sessions never feed
 * product analytics.
 */
export function GoogleAnalytics() {
  const consent  = useConsent()
  const pathname = usePathname()
  const search   = useSearchParams()

  const enabled = !!MEASUREMENT_ID && consent === "accepted"

  useEffect(() => {
    if (!enabled) return
    const qs = search?.toString()
    trackPageView(pathname + (qs ? `?${qs}` : ""))
  }, [enabled, pathname, search])

  if (!enabled) return null

  return (
    <>
      <Script
        id="ga-loader"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${MEASUREMENT_ID}', {
            anonymize_ip: true,
            send_page_view: false,
            cookie_flags: 'SameSite=Lax;Secure',
          });
        `}
      </Script>
    </>
  )
}
