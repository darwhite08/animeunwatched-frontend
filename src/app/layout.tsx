import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AnimeUnwatched",
  description:
    "Discover anime you haven't watched yet. Track hidden gems, explore underrated series, and build your next binge list.",
  metadataBase: new URL("https://animeunwatched.com"),
  openGraph: {
    title: "AnimeUnwatched",
    description:
      "Find your next anime obsession. Discover underrated gems and track what you've missed.",
    url: "https://animeunwatched.com",
    siteName: "AnimeUnwatched",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-black font-sans text-white antialiased">
        <div className="flex min-h-screen flex-col">
          <Navbar />

          <main className="flex-1">
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}