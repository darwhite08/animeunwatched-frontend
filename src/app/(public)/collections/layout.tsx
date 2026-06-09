import type { ReactNode } from "react"
import { listingMetadata } from "@/lib/seo/metadata"

export const metadata = listingMetadata({
  title: "Anime Collections — Curated Lists",
  description: "Hand-picked anime collections — themed lists curated by the Kaiveron community. Discover your next binge and build your own collections free.",
  path: "/collections",
  keywords: ["anime collections", "curated anime lists", "anime list ideas", "themed anime lists"],
})

export default function CollectionsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
