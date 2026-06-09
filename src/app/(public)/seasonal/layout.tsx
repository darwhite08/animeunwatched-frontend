import type { ReactNode } from "react"
import { listingMetadata, currentYear } from "@/lib/seo/metadata"

export const metadata = listingMetadata({
  title: `Seasonal Anime ${currentYear()} — This Season's New Releases`,
  description: `Every anime airing this season, ${currentYear()}. New episodes, premieres, and ongoing shows — ranked, with air dates and one-tap tracking. Never miss a release on Kaiveron.`,
  path: "/seasonal",
  keywords: ["seasonal anime", `anime ${currentYear()}`, "new anime this season", "currently airing anime", "anime premieres"],
})

export default function SeasonalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
