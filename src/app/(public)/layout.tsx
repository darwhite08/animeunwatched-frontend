"use client";

import { useState, useEffect } from "react";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { usePathname } from "next/navigation";
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
  // they're nudged to convert. The landing page "/" is a self-contained
  // marketing page for guests; signed-in users get the shell there too (then
  // LandingGate bounces them into /shots).
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

  // Guest landing "/" — KaiveronLanding brings its own nav, footer, fonts and
  // atmospheric chrome, so render it bare (no AppShell, Navbar, Footer or
  // SmoothScroll, which would double up the chrome or fight its scroll logic).
  return <>{children}</>;
}
