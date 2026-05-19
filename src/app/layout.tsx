import "./globals.css"
import PageLoader from "@/components/ui/PageLoader"
import ToastContainer from "@/components/layout/ToastContainer"
import BackToTop from "@/components/ui/BackToTop"
import KeyboardShortcutsOverlay from "@/components/ui/KeyboardShortcutsOverlay"
import MobileNav from "@/components/layout/MobileNav"
import { QueryProvider } from "@/providers/QueryProvider"
import { KeyboardShortcuts } from "@/providers/KeyboardShortcuts"
import { SessionProvider } from "@/components/layout/SessionProvider"
import { LenisProvider } from "@/providers/LenisProvider"

export const metadata = {
  title: { default: "Kaiveron — Neural Anime Archive", template: "%s | Kaiveron" },
  description: "Track, rate, and discover anime that deserves more hype. AI-powered recommendations for true enthusiasts.",
  keywords: ["anime", "manga", "watchlist", "tracker", "ai discover", "anime list", "kaiveron"],
  openGraph: {
    type: "website",
    siteName: "Kaiveron",
    title: "Kaiveron — Neural Anime Archive",
    description: "Track, rate, and discover anime that deserves more hype.",
  },
  twitter: { card: "summary_large_image", title: "Kaiveron" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
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
              </KeyboardShortcuts>
            </LenisProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
