import type { ReactNode } from "react"
import { listingMetadata } from "@/lib/seo/metadata"

export const metadata = listingMetadata({
  title: "Anime Rankings — Top-Rated by Score",
  description: "The complete anime rankings, ordered by community score. See where every show lands and track the top-rated anime on Kaiveron.",
  path: "/rankings",
  keywords: ["anime rankings", "anime ranked by score", "top rated anime", "anime leaderboard"],
})

export default function RankingsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
