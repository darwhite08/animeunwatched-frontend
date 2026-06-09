import type { ReactNode } from "react"
import { listingMetadata } from "@/lib/seo/metadata"

export const metadata = listingMetadata({
  title: "Anime Genres — Browse Every Genre",
  description: "Browse anime by genre — action, romance, isekai, fantasy, comedy, and more. Find the best anime in every genre, ranked by score and ready to track on Kaiveron.",
  path: "/genres",
  keywords: ["anime genres", "anime by genre", "best action anime", "best romance anime", "best isekai anime"],
})

export default function GenresLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
