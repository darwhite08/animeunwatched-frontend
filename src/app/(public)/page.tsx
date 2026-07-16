import { Metadata } from "next"
import KaiveronLanding from "@/components/home/KaiveronLanding"
import { LandingGate } from "@/components/home/LandingGate"

// Homepage uses the default title from layout (no override here so the
// layout's "default" wins). The canonical is inherited from layout
// (= "/" relative to metadataBase). Lore stays in body copy; metadata
// uses the actual searchable terms.
export const metadata: Metadata = {
  description: "Kaiveron is a free anime tracker with AI mood-based discovery, episode tracking, ratings, streaks, and a social community of 12,000+ members. Track your anime universe.",
  openGraph: {
    title: "Kaiveron — Track, Rate & Discover Anime",
    description: "AI-powered anime tracking, ratings, streaks, and community. Free forever.",
    // Next replaces (not merges) the parent openGraph when a page defines one,
    // so re-declare the social card here or the homepage share loses its image.
    images: [{ url: "/og", width: 1200, height: 630, alt: "Kaiveron" }],
  },
}

export default function HomePage() {
  return (
    <LandingGate>
      <KaiveronLanding />
    </LandingGate>
  )
}
