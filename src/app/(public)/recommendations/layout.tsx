import type { ReactNode } from "react"
import { listingMetadata } from "@/lib/seo/metadata"

export const metadata = listingMetadata({
  title: "Anime Recommendations — Personalized Picks",
  description: "Get anime recommendations tuned to your taste. AI-powered picks based on what you've watched and loved — find your next favorite free on Kaiveron.",
  path: "/recommendations",
  keywords: ["anime recommendations", "anime suggestions", "what anime to watch next", "personalized anime", "similar anime"],
})

export default function RecommendationsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
