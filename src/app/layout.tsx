import "./globals.css"
import { lazy, Suspense } from "react"
import { QueryProvider } from "@/providers/QueryProvider"
import { KeyboardShortcuts } from "@/providers/KeyboardShortcuts"
import { SessionProvider } from "@/components/layout/SessionProvider"
import { LastVisitTracker } from "@/components/layout/LastVisitTracker"
import { AuthPromptModal } from "@/components/auth/AuthPromptModal"
import { LenisProvider } from "@/providers/LenisProvider"
import { ThemeProvider } from "@/providers/ThemeProvider"
// PageLoader and ToastContainer are critical — always eagerly loaded
import PageLoader from "@/components/ui/PageLoader"
import ToastContainer from "@/components/layout/ToastContainer"
import { JsonLd, SITE_JSONLD } from "@/components/seo/JsonLd"

// Non-critical UI — lazy-loaded so they don't block the first paint
const KeyboardShortcutsOverlay = lazy(() => import("@/components/ui/KeyboardShortcutsOverlay"))
const CookieConsent        = lazy(() => import("@/components/ui/CookieConsent"))
const MessagesButton       = lazy(() => import("@/components/ui/MessagesButton"))
const InstallPrompt        = lazy(() => import("@/components/pwa/InstallPrompt"))
const NotificationPrompt   = lazy(() => import("@/components/notifications/NotificationPrompt"))
const GoogleAnalytics      = lazy(() =>
  import("@/components/analytics/GoogleAnalytics").then(m => ({ default: m.GoogleAnalytics }))
)
const PageviewPinger       = lazy(() =>
  import("@/components/analytics/PageviewPinger").then(m => ({ default: m.PageviewPinger }))
)

export const viewport = {
  // Real hex (a CSS var is invalid in the theme-color meta and gets ignored).
  // Dark base for a cohesive, native-feeling status bar in standalone mode.
  themeColor: "#020202",
  width: "device-width",
  initialScale: 1,
  // Lock zoom for an app-like feel (note: this reduces pinch-zoom a11y).
  maximumScale: 1,
  userScalable: false,
  // Extend under the notch / home indicator; paired with safe-area padding in CSS.
  viewportFit: "cover",
}

const SITE_URL = "https://kaiveron.com"

// Searchable terms first; lore stays in body copy. Title template means
// child pages provide ONLY their own title and get " | Kaiveron" appended,
// so we never get "Foo | Kaiveron | Kaiveron" duplicates.
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Kaiveron — Track, Rate & Discover Anime", template: "%s | Kaiveron" },
  description: "Kaiveron is a free anime tracking platform with AI mood-based discovery, episode tracking, ratings, streaks, and a social community. Track your anime universe.",
  keywords: [
    "anime tracker", "anime list", "anime ratings", "watch anime", "anime watchlist",
    "ai anime recommendations", "anime by mood", "anime calendar", "seasonal anime",
    "myanimelist alternative", "anilist alternative", "anime community", "anime social",
    "best anime", "top anime", "track anime", "kaiveron",
  ],
  authors: [{ name: "Kaiveron" }],
  creator: "Kaiveron",
  publisher: "Kaiveron",
  category: "Entertainment",
  // iOS standalone ("Add to Home Screen") behavior. black-translucent lets the
  // status bar overlay content, which pairs with viewport-fit=cover + safe-area
  // padding. apple-touch-icon is emitted automatically from src/app/apple-icon.png.
  appleWebApp: {
    capable: true,
    title: "Kaiveron",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    siteName: "Kaiveron",
    title: "Kaiveron — Track, Rate & Discover Anime",
    description: "AI-powered anime tracking, ratings, streaks, and community. Free forever.",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaiveron — Track, Rate & Discover Anime",
    description: "AI-powered anime tracking, ratings, streaks, and community.",
    creator: "@kaiveron",
    site: "@kaiveron",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  // Self-referencing canonical at the homepage; child pages override with
  // their own path. metadataBase resolves "/" to https://kaiveron.com/.
  alternates: { canonical: "/" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* PWA: register service worker after page load — non-blocking.
            Skip on localhost so a stopped dev server doesn't get hijacked
            by the SW into the offline fallback (and aggressively unregister
            any stale SW that may have been installed from a prior visit). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker'in navigator){var h=location.hostname;if(h==='localhost'||h==='127.0.0.1'){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister()})});if(window.caches){caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k)})})}}else{var refreshing=false;if(navigator.serviceWorker.controller){navigator.serviceWorker.addEventListener('controllerchange',function(){if(refreshing)return;refreshing=true;location.reload()})}window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').then(function(reg){if(reg&&reg.update)reg.update()}).catch(function(){})})}}`,
          }}
        />
        {/* Preconnect to font CDNs before the stylesheet request fires */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          display=swap: text renders immediately with system font, swaps when custom font loads.
          Only the weights actually used in the UI are requested (500–800) to minimize payload.
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Bowlby+One+SC&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,500;1,600&family=Special+Elite&display=swap"
          rel="stylesheet"
        />
        {/* Site-wide schema.org: Organization + WebSite (with SearchAction)
            + WebApplication. Required for Google rich results and one of the
            strongest signals for ChatGPT / Perplexity / Gemini citation. */}
        {SITE_JSONLD.map((d, i) => <JsonLd key={i} data={d} />)}
      </head>
      <body className="bg-background text-foreground antialiased">
        {/* Critical: renders immediately on every page */}
        <PageLoader />
        <QueryProvider>
          <ThemeProvider>
          <SessionProvider>
            <LenisProvider>
              <KeyboardShortcuts>
                {children}
                {/* Remembers the last page so users resume there after re-login */}
                <LastVisitTracker />
                {/* Sign-in wall for guests attempting a gated action */}
                <AuthPromptModal />
                {/* Critical: toasts appear on user actions — must always be ready */}
                <ToastContainer />

                {/*
                  Non-critical overlays: lazy-loaded in separate JS chunks.
                  Suspense fallback is null — these components have no visible loading state.
                  This removes ~40kB from the initial JS bundle.
                */}
                <Suspense fallback={null}>
                  <KeyboardShortcutsOverlay />
                </Suspense>
                <Suspense fallback={null}>
                  <CookieConsent />
                </Suspense>
                <Suspense fallback={null}>
                  <MessagesButton />
                </Suspense>
                {/* PWA "Add to home screen" pill — only shows when installable */}
                <Suspense fallback={null}>
                  <InstallPrompt />
                </Suspense>
                {/* Post-install nudge to enable push (gesture-bound; can't auto-enable) */}
                <Suspense fallback={null}>
                  <NotificationPrompt />
                </Suspense>
                {/* Loads + runs ONLY when NEXT_PUBLIC_GA_MEASUREMENT_ID is set
                    AND the user has accepted the cookie banner */}
                <Suspense fallback={null}>
                  <GoogleAnalytics />
                </Suspense>
                {/* Self-hosted pageview ping → backend in-memory analytics →
                    drives the admin dashboard's realtime visitor tile */}
                <Suspense fallback={null}>
                  <PageviewPinger />
                </Suspense>
              </KeyboardShortcuts>
            </LenisProvider>
          </SessionProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
