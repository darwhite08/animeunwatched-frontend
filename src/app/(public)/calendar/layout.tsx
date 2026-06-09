import type { ReactNode } from "react"
import { listingMetadata } from "@/lib/seo/metadata"

export const metadata = listingMetadata({
  title: "Anime Calendar — Episode Air Dates & Schedule",
  description: "The anime release calendar — when every show airs new episodes, by day and week. Never miss a premiere or a new episode. Track your schedule on Kaiveron.",
  path: "/calendar",
  keywords: ["anime calendar", "anime schedule", "anime air dates", "when does anime air", "anime episode schedule"],
})

export default function CalendarLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
