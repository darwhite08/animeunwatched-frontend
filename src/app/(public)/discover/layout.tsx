import type { ReactNode } from "react"
import { listingMetadata } from "@/lib/seo/metadata"

export const metadata = listingMetadata({
  title: "Discover New Anime to Watch",
  description: "Find your next anime obsession — discover new and underrated shows tailored to your taste with AI-powered recommendations, free on Kaiveron.",
  path: "/discover",
  keywords: ["discover anime", "new anime to watch", "find anime", "anime recommendations", "underrated anime"],
})

export default function DiscoverLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
