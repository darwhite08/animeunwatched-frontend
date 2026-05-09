import HeroSection from "../../components/layout/HeroSection";
import NeuralDiscovery from "@/components/layout/NeuralDiscovery";
import DojoLeaderboard from "@/components/layout/DojoLeaderboard";
import CommunityPulse from "@/components/layout/CommunityPulse";
import FinalCTA from "@/components/layout/FinalCTA";
import FAQ from "@/components/layout/FAQ";
import LandingFeatures from "@/components/layout/LandingFeatures";
import AiringNow from "@/components/layout/AiringNow";

export const metadata = {
  title: "AnimeUnwatched — Track. Rate. Discover.",
  description: "The neural anime tracking platform. AI-powered discovery, social lists, streaks, and a community of 12,000+ Shinobi.",
  openGraph: {
    title: "AnimeUnwatched — Track. Rate. Discover.",
    description: "The neural anime tracking platform built for true enthusiasts.",
  },
}

export default function HomePage() {
  return (
    <main className="bg-black">
      <HeroSection />
      <AiringNow />
      <NeuralDiscovery />
      <LandingFeatures />
      <DojoLeaderboard />
      <CommunityPulse />
      <FinalCTA />
      <FAQ />
    </main>
  );
}