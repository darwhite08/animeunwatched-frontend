import type { ReactNode } from "react"
import { listingMetadata } from "@/lib/seo/metadata"

export const metadata = listingMetadata({
  title: "Trending Anime Right Now",
  description: "What everyone's watching right now — the most popular and fastest-rising anime, ranked live. Discover trending shows and track them free on Kaiveron.",
  path: "/trending",
  keywords: ["trending anime", "popular anime now", "most popular anime", "what to watch anime"],
})

export default function TrendingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
