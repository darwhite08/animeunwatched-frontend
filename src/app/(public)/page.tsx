import { Metadata } from "next"
import CinematicHomepage from "@/components/home/CinematicHomepage"

export const metadata: Metadata = {
  title: "AnimeUnwatched — Track. Rate. Discover.",
  description: "The neural anime tracking platform. AI-powered discovery, social lists, streaks, and a community of 12,000+ Shinobi.",
  openGraph: {
    title: "AnimeUnwatched — Track. Rate. Discover.",
    description: "The neural anime tracking platform built for true enthusiasts.",
  },
}

export default function HomePage() {
  return <CinematicHomepage />
}
