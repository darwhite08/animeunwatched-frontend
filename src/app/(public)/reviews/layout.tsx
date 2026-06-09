import type { ReactNode } from "react"
import { listingMetadata } from "@/lib/seo/metadata"

export const metadata = listingMetadata({
  title: "Anime Reviews from the Community",
  description: "Honest anime reviews and ratings from real fans. Read what the community thinks before you watch — then write your own on Kaiveron.",
  path: "/reviews",
  keywords: ["anime reviews", "anime ratings", "best anime reviews", "anime opinions", "should i watch"],
})

export default function ReviewsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
