import type { ReactNode } from "react"
import { listingMetadata } from "@/lib/seo/metadata"

export const metadata = listingMetadata({
  title: "Find Anime by Mood — Mood-Based Discovery",
  description: "Tell us how you feel and we'll find the anime to match — cozy, intense, melancholic, uplifting, and more. AI mood-based anime discovery, free on Kaiveron.",
  path: "/mood",
  keywords: ["anime by mood", "anime for every mood", "what anime should i watch", "cozy anime", "anime recommendations by feeling"],
})

export default function MoodLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
