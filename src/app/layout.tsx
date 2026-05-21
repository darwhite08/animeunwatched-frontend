import "./globals.css"
import PageLoader from "@/components/ui/PageLoader"
import CookieConsent from "@/components/ui/CookieConsent"
import ToastContainer from "@/components/layout/ToastContainer"
import BackToTop from "@/components/ui/BackToTop"
import KeyboardShortcutsOverlay from "@/components/ui/KeyboardShortcutsOverlay"
import MobileNav from "@/components/layout/MobileNav"
import { QueryProvider } from "@/providers/QueryProvider"
import { KeyboardShortcuts } from "@/providers/KeyboardShortcuts"
import { SessionProvider } from "@/components/layout/SessionProvider"
import { LenisProvider } from "@/providers/LenisProvider"
import FeedbackButton from "@/components/ui/FeedbackButton"

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
          {/* Register service worker for PWA offline support */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js').catch(function(){}); }); }`,
          }}
        />
        {/* Google Fonts — loaded as <link> to avoid CSS @import order issues with Tailwind v4 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Bowlby+One+SC&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Special+Elite&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-white antialiased">
        <PageLoader />
        <QueryProvider>
          <SessionProvider>
            <LenisProvider>
              <KeyboardShortcuts>
                {children}
                <ToastContainer />
                <BackToTop />
                <KeyboardShortcutsOverlay />
                <MobileNav />
                <CookieConsent />
                <FeedbackButton />
              </KeyboardShortcuts>
            </LenisProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
