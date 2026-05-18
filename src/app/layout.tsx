import "./globals.css"
import ToastContainer from "@/components/layout/ToastContainer"
import BackToTop from "@/components/ui/BackToTop"
import KeyboardShortcutsOverlay from "@/components/ui/KeyboardShortcutsOverlay"
import MobileNav from "@/components/layout/MobileNav"
import { QueryProvider } from "@/providers/QueryProvider"
import { KeyboardShortcuts } from "@/providers/KeyboardShortcuts"
import { SessionProvider } from "@/components/layout/SessionProvider"
import { LenisProvider } from "@/providers/LenisProvider"

export const metadata = {
  title: { default: "AnimeUnwatched — Neural Archive", template: "%s | AnimeUnwatched" },
  description: "Track, rate, and discover anime that deserves more hype. AI-powered recommendations for true enthusiasts.",
  keywords: ["anime", "manga", "watchlist", "tracker", "ai discover", "anime list"],
  openGraph: {
    type: "website",
    siteName: "AnimeUnwatched",
    title: "AnimeUnwatched — Neural Archive",
    description: "Track, rate, and discover anime that deserves more hype.",
  },
  twitter: { card: "summary_large_image", title: "AnimeUnwatched" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
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
