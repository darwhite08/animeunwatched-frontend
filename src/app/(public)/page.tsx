import HeroSection from "../../components/layout/HeroSection";
import LandingFeatures from "@/components/layout/LandingFeatures";
import CommunityPulse from "@/components/layout/CommunityPulse";
import FinalCTA from "@/components/layout/FinalCTA";
import FAQ from "@/components/layout/FAQ";
export default function HomePage() {
  return (
    <main>
      <HeroSection />
    <LandingFeatures/>
    <FinalCTA/>
    <CommunityPulse/>
    <FAQ/>
    </main>
  );
}