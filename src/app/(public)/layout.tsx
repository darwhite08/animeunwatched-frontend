"use client";

import { useState, useEffect } from "react";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { AppShell } from "@/components/layout/app/AppShell";

/**
 * Guest-gated sections — the social/community layer. Logged-out visitors hitting
 * these are bounced to /login. Everything NOT listed stays public for guests:
 * the landing, the blog, the whole anime catalog (bestanimelist, /anime, genres,
 * studios, seasonal, calendar, rankings, trailers, mood, recommendations,
 * collections, discover, search) and the AI Oracle (/ai-discover), plus legal /
 * info pages. (The (dashboard)/(user) groups gate themselves separately.)
 */
const GUEST_GATED = [
  "/community", "/shots", "/posts", "/threads", "/clubs",
  "/reviews", "/poll", "/leaderboard", "/trending",
  "/watch", "/watch-party", "/users", "/u", "/lists", "/rate", "/quiz",
];
function isGuestGated(path: string): boolean {
  return GUEST_GATED.some((p) => path === p || path.startsWith(p + "/"));
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
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

  // Guest gate: logged-out visitors can browse the catalog/blog/AI Oracle, but
  // the social layer requires sign-in. Wait for SessionProvider (sessionReady)
  // before deciding so we never wrongly bounce an authed user.
  const isLanding = pathname === "/";
  const gated = !isLanding && isGuestGated(pathname);
  const isGuest = sessionReady && !isAuthenticated;

  useEffect(() => {
    if (gated && isGuest) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [gated, isGuest, pathname, router]);

  // On a gated route, show a loader until we know the visitor is allowed —
  // prevents the members-only surface from flashing for guests / crawlers.
  if (gated && (!sessionReady || isGuest)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
      </div>
    );
  }

  // App shell (sidebar + topbar) for EVERYONE on app pages — guests browse the
  // real signed-in experience (with write actions gated by the sign-in wall) so
  // they're nudged to convert. The landing page "/" is a self-contained
  // marketing page for guests; signed-in users get the shell there too (then
  // LandingGate bounces them into /shots).
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
