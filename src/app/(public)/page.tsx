import HeroSection from "../../components/layout/HeroSection";
import LandingFeatures from "@/components/layout/LandingFeatures";
import Showcase from "@/components/layout/Showcase";
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
    <Showcase/>
    <FAQ/>
    </main>
  );
}