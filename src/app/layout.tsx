import "./globals.css"
import { lazy, Suspense } from "react"
import { QueryProvider } from "@/providers/QueryProvider"
import { KeyboardShortcuts } from "@/providers/KeyboardShortcuts"
import { SessionProvider } from "@/components/layout/SessionProvider"
import { LenisProvider } from "@/providers/LenisProvider"
// PageLoader and ToastContainer are critical — always eagerly loaded
import PageLoader from "@/components/ui/PageLoader"
import ToastContainer from "@/components/layout/ToastContainer"

// Non-critical UI — lazy-loaded so they don't block the first paint
const BackToTop            = lazy(() => import("@/components/ui/BackToTop"))
const KeyboardShortcutsOverlay = lazy(() => import("@/components/ui/KeyboardShortcutsOverlay"))
const MobileNav            = lazy(() => import("@/components/layout/MobileNav"))
const CookieConsent        = lazy(() => import("@/components/ui/CookieConsent"))
const MessagesButton       = lazy(() => import("@/components/ui/MessagesButton"))

export const viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

const SITE_URL = "https://kaiveron.app"

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Kaiveron — Neural Anime Archive", template: "%s | Kaiveron" },
  description: "Track, rate, and discover anime that deserves more hype. AI-powered recommendations, social clubs, spoiler-safe community — for true enthusiasts.",
  keywords: [
    "anime", "manga", "watchlist", "anime tracker", "ai anime recommend",
    "anime list", "kaiveron", "anime community", "anime social", "anime ratings",
    "anime schedule", "seasonal anime", "best anime", "top anime",
  ],
  authors: [{ name: "Kaiveron" }],
  creator: "Kaiveron",
  publisher: "Kaiveron",
  category: "Entertainment",
  openGraph: {
    type: "website",
    siteName: "Kaiveron",
    title: "Kaiveron — Neural Anime Archive",
    description: "Track, rate, and discover anime that deserves more hype. AI-powered. Spoiler-safe. Community-first.",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaiveron — Neural Anime Archive",
    description: "Track, rate, and discover anime with AI-powered discovery and a premium community.",
    creator: "@kaiveron",
    site: "@kaiveron",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: SITE_URL },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* PWA: register service worker after page load — non-blocking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}`,
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
          href="https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Bowlby+One+SC&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Special+Elite&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-white antialiased">
        {/* Critical: renders immediately on every page */}
        <PageLoader />
        <QueryProvider>
          <SessionProvider>
            <LenisProvider>
              <KeyboardShortcuts>
                {children}
                {/* Critical: toasts appear on user actions — must always be ready */}
                <ToastContainer />

                {/*
                  Non-critical overlays: lazy-loaded in separate JS chunks.
                  Suspense fallback is null — these components have no visible loading state.
                  This removes ~40kB from the initial JS bundle.
                */}
                <Suspense fallback={null}>
                  <BackToTop />
                </Suspense>
                <Suspense fallback={null}>
                  <KeyboardShortcutsOverlay />
                </Suspense>
                <Suspense fallback={null}>
                  <MobileNav />
                </Suspense>
                <Suspense fallback={null}>
                  <CookieConsent />
                </Suspense>
                <Suspense fallback={null}>
                  <MessagesButton />
                </Suspense>
              </KeyboardShortcuts>
            </LenisProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
