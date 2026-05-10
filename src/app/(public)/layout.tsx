"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { SmoothScroll } from "@/providers/SmoothScroll";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { getMockUser } from "@/lib/mockAuth";
import AnnouncementBanner from "@/components/ui/AnnouncementBanner";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const alreadyOnboarded = localStorage.getItem("aw_onboarded") === "1";
    const user = getMockUser();
    if (!alreadyOnboarded && user !== null) setShowOnboarding(true);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("aw_onboarded", "1");
    setShowOnboarding(false);
  };

  return (
    <SmoothScroll>
      <AnnouncementBanner
        message="Watch Party feature launching Q3 2026 — get early access"
        href="/watch-party"
        linkLabel="Learn more →"
        type="new"
      />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <Footer />
      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
    </SmoothScroll>
  );
}
