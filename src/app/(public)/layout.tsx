"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { SmoothScroll } from "@/providers/SmoothScroll";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import AnnouncementBanner from "@/components/ui/AnnouncementBanner";
import { useAuthStore } from "@/stores/auth.store";
import { AppShell } from "@/components/layout/app/AppShell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const sessionReady = useAuthStore((s) => s.sessionReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const alreadyOnboarded = localStorage.getItem("aw_onboarded") === "1";
    const isAuth = useAuthStore.getState().isAuthenticated;
    if (!alreadyOnboarded && isAuth) setShowOnboarding(true);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("aw_onboarded", "1");
    setShowOnboarding(false);
  };

  // Logged-in users browse inside the app shell (sidebar + topbar), so the
  // experience is consistent with the rest of the app instead of the marketing
  // topbar. Logged-out visitors keep the marketing chrome below (unchanged).
  if (sessionReady && isAuthenticated) {
    return (
      <AppShell publicMode>
        {children}
        <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
      </AppShell>
    );
  }

  return (
    <SmoothScroll>
      {/* Single fixed container keeps banner + navbar stacked without overlap */}
      <div className="fixed top-0 left-0 right-0 z-[100]">
        <AnnouncementBanner
          message="Watch Party feature launching Q3 2026 — get early access"
          href="/watch-party"
          linkLabel="Learn more →"
          type="new"
        />
        <Navbar />
      </div>
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
