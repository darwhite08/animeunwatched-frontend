"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { SmoothScroll } from "@/providers/SmoothScroll";
import { usePathname } from "next/navigation";
import { PageTransition } from "@/components/layout/PageTransition";
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
    // Skip the first-time onboarding ("what type of watcher are you") on phones —
    // it only runs on tablet/desktop widths (Tailwind md breakpoint = 768px).
    const isPhone = window.matchMedia("(max-width: 767px)").matches;
    if (!alreadyOnboarded && isAuth && !isPhone) setShowOnboarding(true);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("aw_onboarded", "1");
    setShowOnboarding(false);
  };

  // App shell (sidebar + topbar) for EVERYONE on app pages — guests browse the
  // real signed-in experience (with write actions gated by the sign-in wall) so
  // they're nudged to convert. The landing page "/" keeps the marketing hero for
  // guests; signed-in users get the shell there too.
  const isLanding = pathname === "/";
  const useAppShell = !isLanding || (sessionReady && isAuthenticated);
  if (useAppShell) {
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
      <PageTransition>{children}</PageTransition>
      <Footer />
      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
    </SmoothScroll>
  );
}
