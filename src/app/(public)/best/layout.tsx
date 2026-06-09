import type { ReactNode } from "react"
import { listingMetadata } from "@/lib/seo/metadata"

export const metadata = listingMetadata({
  title: "Best Anime of All Time — Top-Rated, Ranked",
  description: "The best anime of all time, ranked by community score. From timeless classics to modern masterpieces — find your next favorite and track it on Kaiveron.",
  path: "/best",
  keywords: ["best anime", "best anime of all time", "top anime", "highest rated anime", "must watch anime"],
})

export default function BestLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
