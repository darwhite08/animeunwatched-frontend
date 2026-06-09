import type { ReactNode } from "react"
import { listingMetadata } from "@/lib/seo/metadata"

export const metadata = listingMetadata({
  title: "Anime Lists — Community Watchlists",
  description: "Explore anime watchlists built by the community — top picks, hidden gems, and themed lineups. Build and share your own anime list free on Kaiveron.",
  path: "/lists",
  keywords: ["anime lists", "anime watchlist", "community anime lists", "anime list maker"],
})

export default function ListsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
