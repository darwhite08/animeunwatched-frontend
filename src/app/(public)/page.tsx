// src/app/(public)/page.tsx
import HeroSection from "../../components/layout/HeroSection";
import NeuralDiscovery from "@/components/layout/NeuralDiscovery";
import DojoLeaderboard from "@/components/layout/DojoLeaderboard";
import CommunityPulse from "@/components/layout/CommunityPulse";
import FinalCTA from "@/components/layout/FinalCTA";
import FAQ from "@/components/layout/FAQ";
import LandingFeatures from "@/components/layout/LandingFeatures";

export default function HomePage() {
  return (
    <main className="bg-black">
      <HeroSection />
      <NeuralDiscovery /> {/* AI/Prompt Search */}
      <LandingFeatures/>
      <DojoLeaderboard /> {/* Competition/Hall of Fame */}
      <CommunityPulse />
      <FinalCTA />
      <FAQ />
    </main>
  );
}