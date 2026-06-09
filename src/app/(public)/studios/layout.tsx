import type { ReactNode } from "react"
import { listingMetadata } from "@/lib/seo/metadata"

export const metadata = listingMetadata({
  title: "Anime Studios — Browse Anime by Studio",
  description: "Browse anime by production studio — MAPPA, ufotable, Kyoto Animation, Madhouse, Studio Ghibli, and more. Every studio's catalog ranked by score on Kaiveron.",
  path: "/studios",
  keywords: ["anime studios", "anime by studio", "mappa anime", "ufotable anime", "kyoto animation anime", "studio ghibli anime"],
})

export default function StudiosLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
